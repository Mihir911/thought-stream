import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, Clock, Calendar, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const CategoryPage = () => {
  const { category } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState(null);

  useEffect(() => {
    const fetchCategoryBlogs = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/blogs/category/${encodeURIComponent(category)}?limit=20`);
        setBlogs(response.data.blogs || []);
        
        // Calculate category stats
        const totalViews = response.data.blogs.reduce((sum, blog) => sum + (blog.viewsCount || 0), 0);
        const totalLikes = response.data.blogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0);
        const avgReadTime = response.data.blogs.length > 0 
          ? Math.round(response.data.blogs.reduce((sum, blog) => sum + (blog.readTime || 5), 0) / response.data.blogs.length)
          : 0;

        setCategoryStats({
          totalStories: response.data.blogs.length,
          totalViews,
          totalLikes,
          avgReadTime
        });
      } catch (error) {
        console.error('Failed to fetch category blogs:', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchCategoryBlogs();
    }
  }, [category]);

  const BlogCard = ({ blog }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {blog.coverImage && (
        <img 
          src={blog.coverImage} 
          alt={blog.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {blog.categories?.slice(0, 3).map(cat => (
            <span 
              key={cat} 
              className={`px-2 py-1 text-xs rounded-full font-medium ${
                cat === category 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {cat}
            </span>
          ))}
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

        <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {blog.author?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <span>{blog.author?.username || 'Anonymous'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{blog.readTime || 5}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="flex gap-2 mb-3">
          <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
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

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <Link
            to="/categories"
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Browse Categories
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
          <Link
            to="/categories"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Categories</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 capitalize">{category}</h1>
              <p className="text-gray-600 mt-2">
                Discover the latest stories and trending topics in {category.toLowerCase()}
              </p>
            </div>
            {categoryStats && (
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">{categoryStats.totalStories} stories</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Stats */}
        {categoryStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
              <BookOpen className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{categoryStats.totalStories}</div>
              <div className="text-sm text-gray-600">Stories</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{categoryStats.totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{categoryStats.totalLikes.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{categoryStats.avgReadTime}m</div>
              <div className="text-sm text-gray-600">Avg Read Time</div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories found</h3>
            <p className="text-gray-600 mb-6">
              There are no stories in the {category} category yet.
            </p>
            <Link
              to="/create"
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Be the first to write about {category}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(blog => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}

        {/* Load More */}
        {blogs.length >= 20 && (
          <div className="text-center mt-12">
            <button className="bg-white text-gray-700 px-8 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition-colors">
              Load More Stories
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;