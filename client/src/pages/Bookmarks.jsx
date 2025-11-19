import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Bookmark, 
  BookOpen, 
  Clock, 
  Calendar, 
  Eye, 
  Heart, 
  User,
  Tag,
  Search,
  Filter,
  Trash2
} from 'lucide-react';
import api from '../utils/api';

const Bookmarks = () => {
  const { token } = useSelector(state => state.auth);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await api.get('/blogs/user/bookmarks?limit=50');
        setBookmarks(response.data.bookmarks || []);
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [token]);

  const removeBookmark = async (blogId) => {
    try {
      await api.post(`/blogs/${blogId}/bookmark`);
      setBookmarks(prev => prev.filter(b => b.blog._id !== blogId));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const blog = bookmark.blog;
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || blog.categories?.includes(filterCategory);
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(bookmarks.flatMap(b => b.blog.categories || []))];

  const BookmarkCard = ({ bookmark }) => {
    const blog = bookmark.blog;
    
    return (
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
                  <Tag className="h-3 w-3 inline mr-1" />
                  {category}
                </span>
              ))}
            </div>
            <button
              onClick={() => removeBookmark(blog._id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove bookmark"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <Link 
            to={`/blogs/${blog._id}`}
            className="block group mb-3"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
              {blog.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3">
              {blog.excerpt || 'Read this amazing story...'}
            </p>
          </Link>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {blog.author?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <span>{blog.author?.username || 'Anonymous'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{blog.viewsCount || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{blog.likes?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Saved on {new Date(bookmark.savedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{blog.readTime || 5} min read</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
          </div>
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-between">
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your bookmarks</p>
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
                <Bookmark className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Saved Stories</h1>
                <p className="text-gray-600 mt-1">Your personal collection of stories to read later</p>
              </div>
            </div>
            
            {bookmarks.length > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{bookmarks.length}</div>
                <div className="text-sm text-gray-600">Saved stories</div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {bookmarks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{bookmarks.length}</div>
                  <div className="text-sm text-gray-600">Total Saved</div>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Bookmark className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {categories.length}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(bookmarks.reduce((sum, b) => sum + (b.blog.readTime || 5), 0) / 60)}h
                  </div>
                  <div className="text-sm text-gray-600">Total Read Time</div>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {new Set(bookmarks.map(b => b.blog.author?._id)).size}
                  </div>
                  <div className="text-sm text-gray-600">Different Authors</div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {bookmarks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search your bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(searchTerm || filterCategory) && (
              <div className="flex items-center space-x-2 mt-4">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                    Search: "{searchTerm}"
                  </span>
                )}
                {filterCategory && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    Category: {filterCategory}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bookmarks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Bookmarks Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save interesting stories to read later by clicking the bookmark icon on any blog post.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                to="/feed"
                className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-block"
              >
                Explore Stories
              </Link>
              <Link
                to="/trending"
                className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition-colors inline-block"
              >
                View Trending
              </Link>
            </div>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching bookmarks</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
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
                Your Saved Stories ({filteredBookmarks.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookmarks.map(bookmark => (
                <BookmarkCard key={bookmark.blog._id} bookmark={bookmark} />
              ))}
            </div>
          </div>
        )}

        {/* Reading Progress */}
        {bookmarks.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Stories to read</span>
                <span className="font-medium text-gray-900">{bookmarks.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '0%' }} // You can add progress tracking later
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                Start reading to track your progress
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;