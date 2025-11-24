import React, { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import api from '../utils/api';
import BlogCard from '../components/blog/BlogCard';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await api.get('/user/bookmarks');
        // The API returns bookmarks array where each item has a 'blog' field populated
        // We need to map it to just the blog object for BlogCard, or adjust BlogCard
        // BlogCard expects 'blog' object.
        // The structure is [{ blog: { ... }, savedAt: ... }]
        const mapped = (res.data.bookmarks || []).map(b => b.blog).filter(Boolean);
        setBookmarks(mapped);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Bookmark className="text-primary-600" size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Library</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[400px] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarks.map(blog => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full mb-4">
              <Bookmark size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your library is empty</h3>
            <p className="text-gray-500 mb-6">Save stories to read them later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;