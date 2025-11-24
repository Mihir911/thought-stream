import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import BlogCard from '../components/blog/BlogCard';

const Landing = () => {
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, latestRes] = await Promise.all([
          api.get('/blogs/feed/trending?limit=3'),
          api.get('/blogs?limit=6')
        ]);
        setTrending(trendingRes.data.blogs || []);
        setLatest(latestRes.data.blogs || []);
      } catch (error) {
        console.error('Error fetching landing data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <section className="relative bg-white border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 tracking-tight mb-6 leading-[1.1]">
              Discover stories that <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">matter.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              A place for writers, thinkers, and creators to share their ideas with the world.
              Join our community of curious minds.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
              >
                Start Reading <ArrowRight size={18} />
              </Link>
              <Link
                to="/create"
                className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-all hover:border-gray-300"
              >
                Write a Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-secondary-100 text-secondary-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900">Trending Now</h2>
          </div>
          <Link to="/trending" className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[400px] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trending.map(blog => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Stories */}
      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                <Sparkles size={20} />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">Latest Stories</h2>
            </div>
            <Link to="/feed" className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[400px] bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latest.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Landing;