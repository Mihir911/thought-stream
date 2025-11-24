import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenSquare, Edit2, Trash2, Eye } from 'lucide-react';
import api from '../utils/api';

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBlogs = async () => {
      try {
        const res = await api.get('/blogs/my-blogs');
        setBlogs(res.data.blogs || []);
      } catch (error) {
        console.error("Error fetching my blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await api.delete(`/blogs/${id}`);
        setBlogs(blogs.filter(b => b._id !== id));
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">My Stories</h1>
          <Link
            to="/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <PenSquare size={18} /> Write New
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="space-y-4">
            {blogs.map(blog => (
              <div key={blog._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6">
                {blog.coverUpload?.thumbnails?.small || blog.coverImage ? (
                  <img
                    src={blog.coverUpload?.thumbnails?.small || blog.coverImage}
                    alt={blog.title}
                    className="w-full md:w-32 h-32 md:h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full md:w-32 h-32 md:h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <PenSquare size={24} />
                  </div>
                )}

                <div className="flex-1">
                  <Link to={`/blogs/${blog._id}`} className="block group">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                      {blog.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Eye size={14} /> {blog.viewsCount || 0} views</span>
                    <span>{blog.likes?.length || 0} likes</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/edit/${blog._id}`}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 mb-4">You haven't published any stories yet.</p>
            <Link to="/create" className="text-primary-600 font-medium hover:underline">Start writing</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBlogs;