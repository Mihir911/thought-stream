import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Flame, Eye, Clock, Calendar, Users, ArrowRight } from 'lucide-react';
import api from '../utils/api';

const Trending = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

  useEffect(() => {
    const fetchTrendingBlogs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/blogs/feed/trending?limit=20');
        setBlogs(response.data.blogs || []);
      } catch (error) {
        console.error('Failed to fetch trending blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingBlogs();
  }, []);

  const BlogCard = ({ blog, index }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {index < 3 && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                index === 0 ? 'bg-yellow-500' : 
                index === 1 ? 'bg-gray-400' : 
                'bg-orange-500'
              }`}>
                {index + 1}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {blog.categories?.slice(0, 2).map(category => (
                <span 
                  key={category} 
                  className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-medium">Trending</span>
          </div>
        </div>

        <Link 
          to={`/blogs/${blog._id}`}
          className="block group mb-4"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-gray-600 line-clamp-3">
            {blog.excerpt || 'Read this trending story...'}
          </p>
        </Link>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {blog.author?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <span>{blog.author?.username || 'Anonymous'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{blog.viewsCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{blog.likes?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{blog.readTime || 5}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex gap-2">
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
              <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div className="w-20 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-between">
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Trending Stories</h1>
                <p className="text-gray-600 mt-1">Most popular stories loved by the community</p>
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
              {[
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'all', label: 'All Time' }
              ].map(range => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range.value
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stories</p>
                <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogs.reduce((sum, blog) => sum + (blog.viewsCount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Users className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Read Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogs.length > 0 
                    ? Math.round(blogs.reduce((sum, blog) => sum + (blog.readTime || 5), 0) / blogs.length) 
                    : 0
                  }m
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Trending Blogs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trending stories yet</h3>
            <p className="text-gray-600 mb-6">Check back later for popular content</p>
            <Link
              to="/feed"
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
            >
              Explore Feed
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <BlogCard key={blog._id} blog={blog} index={index} />
            ))}
          </div>
        )}

        {/* Load More (if needed) */}
        {blogs.length >= 20 && (
          <div className="text-center mt-12">
            <button className="bg-white text-gray-700 px-8 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition-colors">
              Load More Stories
            </button>
          </div>
        )}

        {/* Trending Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'Technology', 'Programming', 'Design', 'Lifestyle', 
              'Travel', 'Food', 'Health', 'Business', 'Education', 
              'Science', 'Finance', 'Entertainment'
            ].map(category => (
              <Link
                key={category}
                to={`/categories/${category}`}
                className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-200 transition-colors">
                  <span className="text-primary-600 font-semibold text-sm">
                    {category[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{category}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;