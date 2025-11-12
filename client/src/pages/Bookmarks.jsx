import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import BookmarkButton from '../components/blog/BookmarkButton';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/blogs/user/bookmarks?page=1&limit=50');
      setBookmarks(res.data.bookmarks || []);
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <p className="text-center text-gray-500">Loading saved posts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h2 className="text-2xl font-semibold mb-6">Saved posts</h2>
      <div className="space-y-4">
        {bookmarks.length === 0 && <p className="text-gray-600">No saved posts yet.</p>}
        {bookmarks.map((b) => {
          const blog = b.blog || b;
          return (
            <div key={blog._id} className="bg-white rounded-lg p-4 shadow-sm flex items-start justify-between">
              <div className="flex-1 pr-4">
                <Link to={`/blogs/${blog._id}`} className="text-lg font-medium text-gray-900 hover:underline">
                  {blog.title}
                </Link>
                <p className="text-sm text-gray-500 mt-1">{blog.excerpt}</p>
                <div className="text-xs text-gray-400 mt-2">Saved on: {new Date(b.savedAt).toLocaleString()}</div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <BookmarkButton blogId={blog._id} initialBookmarked={true} onChange={() => fetchBookmarks()} />
                <Link to={`/blogs/${blog._id}`} className="text-sm text-blue-600 hover:underline">Resume</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Bookmarks;