import React from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../components/blog/BlogCard';
import api from '../utils/api';
import { useEffect, useState } from 'react';

const Landing = () => {
  const [latest, setLatest] = useState([]);
  useEffect(() => {
    let mounted = true;
    api.get('/blogs?page=1&limit=6').then(res => {
      if (mounted) setLatest(res.data.blogs || []);
    }).catch(console.error);
    return () => { mounted = false; };
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Share Your Stories<br />With the World
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
            A beautiful platform to write, share, and discover amazing blog posts.
            Join our community of passionate writers and readers.
          </p>
          <div className="flex gap-4 justify-center mb-12">
            <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-xl shadow-lg font-semibold">Start Writing</Link>
            <Link to="/feed" className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 font-semibold">For you</Link>
          </div>

          <div className="bg-white rounded-xl p-6 text-gray-900">
            <h3 className="text-xl font-semibold mb-4">Latest posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latest.map(b => <BlogCard key={b._id} blog={b} />)}
            </div>
            <div className="mt-4 text-right">
              <Link to="/blogs" className="text-blue-600 hover:underline">Explore all</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;