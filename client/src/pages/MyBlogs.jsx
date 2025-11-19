import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FileText, 
  Eye, 
  Heart, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2,
  Plus,
  TrendingUp,
  Users,
  BookOpen,
  Filter,
  Search
} from 'lucide-react';
import api from '../utils/api';

const MyBlogs = () => {
  const { user, token } = useSelector(state => state.auth);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchMyBlogs = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await api.get('/blogs?author=' + user.id + '&limit=50');
        const userBlogs = response.data.blogs || [];
        setBlogs(userBlogs);

        // Calculate stats
        const totalViews = userBlogs.reduce((sum, blog) => sum + (blog.viewsCount || 0), 0);
        const totalLikes = userBlogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0);
        const totalReadTime = userBlogs.reduce((sum, blog) => sum + (blog.readTime || 0), 0);
        const publishedBlogs = userBlogs.filter(blog => blog.isPublished).length;

        setStats({
          totalBlogs: userBlogs.length,
          publishedBlogs,
          draftBlogs: userBlogs.length - publishedBlogs,
          totalViews,
          totalLikes,
          totalReadTime,
          avgReadTime: userBlogs.length > 0 ? Math.round(totalReadTime / userBlogs.length) : 0
        });
      } catch (error) {
        console.error('Failed to fetch user blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBlogs();
  }, [token, user]);

  const deleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/blogs/${blogId}`);
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
      // Update stats after deletion
      if (stats) {
        setStats(prev => ({
          ...prev,
          totalBlogs: prev.totalBlogs - 1,
          publishedBlogs: blogs.find(b => b._id === blogId)?.isPublished 
            ? prev.publishedBlogs - 1 
            : prev.publishedBlogs
        }));
      }
    } catch (error) {
      console.error('Failed to delete blog:', error);
      alert('Failed to delete blog. Please try again.');
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && blog.isPublished) ||
                         (statusFilter === 'drafts' && !blog.isPublished);
    
    return matchesSearch && matchesStatus;
  });

  const BlogCard = ({ blog }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {blog.coverImage && (
        <img 
          src={blog.coverImage} 
          alt={blog.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {blog.categories?.slice(0, 2).map(category => (
              <span 
                key={category} 
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium"
              >
                {category}
              </span>
            ))}
            {!blog.isPublished && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                Draft
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/blogs/${blog._id}/edit`}
              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
              title="Edit blog"
            >
              <Edit3 className="h-4 w-4" />
            </Link>
            <button
              onClick={() => deleteBlog(blog._id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete blog"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Link 
          to={`/blogs/${blog._id}`}
          className="block group mb-3"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {blog.excerpt || 'No description available...'}
          </p>
        </Link>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{blog.viewsCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{blog.likes?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{blog.readTime || 5}m</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className={blog.isPublished ? 'text-green-600' : 'text-yellow-600'}>
              {blog.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-between">
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color = 'primary', subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600 mt-1">{label}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${
          color === 'primary' ? 'bg-primary-100 text-primary-600' :
          color === 'green' ? 'bg-green-100 text-green-600' :
          color === 'orange' ? 'bg-orange-100 text-orange-600' :
          'bg-purple-100 text-purple-600'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to manage your blogs</p>
          <Link
            to="/login"
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Stories</h1>
                <p className="text-gray-600 mt-1">Manage and track your published stories and drafts</p>
              </div>
            </div>
            <Link
              to="/create"
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Story</span>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={FileText} 
              label="Total Stories" 
              value={stats.totalBlogs} 
              color="primary"
              subtitle={`${stats.publishedBlogs} published, ${stats.draftBlogs} drafts`}
            />
            <StatCard 
              icon={Eye} 
              label="Total Views" 
              value={stats.totalViews.toLocaleString()} 
              color="green"
            />
            <StatCard 
              icon={Heart} 
              label="Total Likes" 
              value={stats.totalLikes.toLocaleString()} 
              color="orange"
            />
            <StatCard 
              icon={Clock} 
              label="Avg Read Time" 
              value={`${stats.avgReadTime}m`} 
              color="purple"
            />
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search your stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Stories</option>
                <option value="published">Published Only</option>
                <option value="drafts">Drafts Only</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="flex items-center space-x-2 mt-4">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                  Search: "{searchTerm}"
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  Status: {statusFilter === 'published' ? 'Published' : 'Drafts'}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Blogs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Stories Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start your writing journey by creating your first story. Share your thoughts, ideas, and experiences with the world.
            </p>
            <Link
              to="/create"
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Write Your First Story</span>
            </Link>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching stories</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Stories ({filteredBlogs.length})
              </h2>
              <div className="text-sm text-gray-500">
                Showing {filteredBlogs.length} of {blogs.length} stories
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </div>
        )}

        {/* Performance Tips */}
        {stats && stats.totalBlogs > 0 && (
          <div className="mt-12 bg-gradient-to-r from-primary-500 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Writing Performance</h3>
                <p className="text-primary-100">
                  Your stories have been viewed {stats.totalViews.toLocaleString()} times and received {stats.totalLikes.toLocaleString()} likes.
                  Keep writing to grow your audience!
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-white opacity-80" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBlogs;