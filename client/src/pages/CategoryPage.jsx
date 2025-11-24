import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Hash, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import BlogCard from '../components/blog/BlogCard';

const CategoryPage = () => {
  const { category } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    const fetchCategoryBlogs = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/blogs/category/${category}`);
        setBlogs(res.data.blogs || []);
        setStats({ total: res.data.pagination?.totalBlogs || 0 });
      } catch (error) {
        console.error("Error fetching category blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryBlogs();
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        <Link to="/categories" className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Categories
        </Link>

        <div className="flex items-center gap-4 mb-12">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Hash size={32} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900">{category}</h1>
            <p className="text-gray-500 mt-1">{stats.total} stories</p>
          </div>
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
            <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full mb-4">
              <Hash size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No stories yet</h3>
            <p className="text-gray-500 mb-6">Be the first to write about {category}!</p>
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors"
            >
              Write a Story
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;