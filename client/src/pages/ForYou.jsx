import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Sparkles, Clock, UserPlus, TrendingUp, BookOpen, Users } from 'lucide-react';
import api from '../utils/api';

const ForYou = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState([]);
  const [recommendedAuthors, setRecommendedAuthors] = useState([]);
  const [activeInterest, setActiveInterest] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchFeed = async () => {
      try {
        setLoading(true);
        const [feedRes, trendingRes] = await Promise.all([
          api.get('/blogs/feed/hybrid?limit=12'),
          api.get('/blogs/feed/trending?limit=6')
        ]);

        setBlogs(feedRes.data.blogs || []);
        setTrending(trendingRes.data.blogs || []);
        
        // Mock recommended authors (you can replace with actual API call)
        setRecommendedAuthors([
          { _id: '1', username: 'TechWriter', bio: 'Technology enthusiast' },
          { _id: '2', username: 'StoryTeller', bio: 'Fiction writer' },
          { _id: '3', username: 'CodeMaster', bio: 'Programming expert' },
        ]);
      } catch (error) {
        console.error('Failed to fetch feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [token]);

  const interests = user?.interests?.map(i => i.category) || ['Technology', 'Programming', 'Design', 'Lifestyle'];

  const filteredBlogs = activeInterest 
    ? blogs.filter(blog => blog.categories?.includes(activeInterest))
    : blogs;

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
          {blog.categories?.slice(0, 2).map(category => (
            <span 
              key={category} 
              className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium"
            >
              {category}
            </span>
          ))}
        </div>
        <Link 
          to={`/blogs/${blog._id}`}
          className="block group"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {blog.excerpt || 'Read this amazing story...'}
          </p>
        </Link>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {blog.author?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <span>{blog.author?.username || 'Anonymous'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{blog.readTime || 5} min</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
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

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Personalized Feed</h2>
          <p className="text-gray-600 mb-6">Sign in to see stories tailored just for you</p>
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
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">For You</h1>
                <p className="text-gray-600 mt-1">Stories tailored to your interests and reading habits</p>
              </div>
            </div>
            <Link
              to="/create"
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Write Story
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Interest Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveInterest('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeInterest === '' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                All
              </button>
              {interests.map(interest => (
                <button
                  key={interest}
                  onClick={() => setActiveInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeInterest === interest 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            {/* Blog Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, index) => (
                  <LoadingSkeleton key={index} />
                ))}
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories found</h3>
                <p className="text-gray-600 mb-6">Try selecting different interests or check back later for new content.</p>
                <Link
                  to="/trending"
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Explore Trending
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBlogs.map(blog => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Personalization Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Your Interests</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {interests.map(interest => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
              <Link
                to="/profile"
                className="text-primary-500 hover:text-primary-600 text-sm font-medium"
              >
                Edit interests
              </Link>
            </div>

            {/* Recommended Authors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <UserPlus className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Recommended Authors</h3>
              </div>
              <div className="space-y-4">
                {recommendedAuthors.map(author => (
                  <div key={author._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {author.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{author.username}</div>
                        <div className="text-sm text-gray-500">{author.bio}</div>
                      </div>
                    </div>
                    <button className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Trending Now</h3>
              </div>
              <div className="space-y-4">
                {trending.map(blog => (
                  <Link
                    key={blog._id}
                    to={`/blogs/${blog._id}`}
                    className="block group"
                  >
                    <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {blog.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <Users className="h-4 w-4" />
                      <span>{blog.viewsCount || 0} reads</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForYou;