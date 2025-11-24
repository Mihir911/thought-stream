import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import api from '../utils/api';
import BlogCard from '../components/blog/BlogCard';

const ForYou = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get('/blogs/feed/personalized');
        setBlogs(res.data.blogs || []);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Sparkles className="text-primary-600" size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">For You</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500">No personalized stories yet. Try reading more articles!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForYou;