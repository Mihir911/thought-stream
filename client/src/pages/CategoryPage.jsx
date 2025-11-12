import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import BlogCard from '../components/blog/BlogCard';

const CategoryPage = () => {
  const { category } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/blogs/category/${encodeURIComponent(category)}?page=1&limit=20`)
      .then(res => setBlogs(res.data.blogs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-3">Category: {category}</h2>
      {loading ? <p className="text-gray-500">Loading posts...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {blogs.map(b => <BlogCard key={b._id} blog={b} />)}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;