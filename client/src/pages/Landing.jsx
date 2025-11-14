import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../components/blog/BlogCard';
import api from '../utils/api';
import { Search } from 'lucide-react';
import ProtectedLink from '../components/auth/ProtectedLinks';

const DEFAULT_CATEGORIES = [
  'Technology', 'Programming', 'Design', 'Lifestyle',
  'Travel', 'Food', 'Health', 'Business', 'Education'
];

const Landing = () => {
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/blogs?page=1&limit=9')
      .then(res => {
        if (!mounted) return;
        const list = res.data.blogs || [];
        setLatest(list);
        setFiltered(list);
      })
      .catch(err => {
        console.error('Failed to load latest posts', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    const result = latest.filter(b => {
      const inTitle = b.title && b.title.toLowerCase().includes(q);
      const inExcerpt = b.excerpt && b.excerpt.toLowerCase().includes(q);
      const inCategory = selectedCategory ? (b.categories || []).includes(selectedCategory) : true;
      return (q ? (inTitle || inExcerpt) : true) && inCategory;
    });
    setFiltered(result);
  }, [query, latest, selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: text */}
            <div className="lg:col-span-6">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
                  Write what matters. Read what moves you.
                </h1>
                <p className="text-lg text-slate-600 max-w-xl">
                  A beautiful place to write, discover, and share long-form stories, ideas, and perspectives.
                  Follow topics you care about and build an audience for your voice.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-lg transform hover:-translate-y-0.5 transition"
                  >
                    Get started — it's free
                  </Link>

                  <ProtectedLink
                    to="/feed"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium shadow-sm hover:shadow-md transition"
                  >
                    View personalized feed
                  </ProtectedLink>
                </div>

                <div className="mt-6">
                  <label htmlFor="search" className="sr-only">Search posts</label>
                  <div className="relative max-w-xl">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      id="search"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                      placeholder="Search posts, topics, or authors"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Search posts"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-3 py-1.5 rounded-full text-sm ${selectedCategory === '' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'}`}
                    >
                      All
                    </button>
                    {DEFAULT_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-sm ${selectedCategory === cat ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: decorative illustration + featured preview */}
            <div className="lg:col-span-6">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:-translate-y-1 transition">
                  <div className="bg-gradient-to-br from-sky-700 to-blue-800 text-white p-8 lg:p-10">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">Editor’s picks</h3>
                        <p className="mt-2 text-sky-200 text-sm max-w-md">Selected stories from our community — thoughtful, inspiring, and worth your time.</p>
                      </div>
                      <div className="hidden sm:flex items-center">
                        <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                          <rect width="96" height="96" rx="16" fill="white" opacity="0.06"/>
                          <path d="M32 60c10-6 22-10 30-22 5-7 4-12-1-15-6-3-12 0-18 4-8 6-14 10-22 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
                        </svg>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {loading ? (
                        <>
                          <div className="h-28 rounded-lg bg-white/10 animate-pulse" />
                          <div className="h-28 rounded-lg bg-white/10 animate-pulse" />
                        </>
                      ) : (
                        latest.slice(0, 4).map(post => (
                          <Link key={post._id} to={`/blogs/${post._id}`} className="block bg-white/5 p-3 rounded-lg hover:bg-white/10 transition">
                            <h4 className="text-sm font-semibold truncate">{post.title}</h4>
                            <p className="text-xs text-sky-100 mt-1 line-clamp-2">{post.excerpt}</p>
                            <div className="text-xs text-sky-200 mt-3 flex items-center justify-between">
                              <span>{post.author?.username || '—'}</span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>

                    <div className="mt-6 text-right">
                      <Link to="/trending" className="text-xs text-white/90 hover:text-white underline">See more trending →</Link>
                    </div>
                  </div>
                </div>

                {/* subtle decorative floating card */}
                {/* <div className="absolute -bottom-6 left-6 w-44 bg-white rounded-xl shadow-lg p-3 transform rotate-1 hidden lg:block">
                  <div className="text-xs text-slate-500">Top writer</div>
                  <div className="font-medium text-slate-900 mt-1">A. Smith</div>
                  <div className="text-xs text-slate-400 mt-1">“Short reflections that inspire long thinking.”</div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <h4 className="text-lg font-semibold text-slate-900">Beautiful editor</h4>
            <p className="text-sm text-slate-600 mt-2">Write in a clean, minimal editor with autosave and drafts so your ideas are never lost.</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <h4 className="text-lg font-semibold text-slate-900">Personalized feed</h4>
            <p className="text-sm text-slate-600 mt-2">Your homepage adapts to interests you choose and the authors you follow.</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <h4 className="text-lg font-semibold text-slate-900">Save & resume</h4>
            <p className="text-sm text-slate-600 mt-2">Bookmark posts, track reading progress, and pick up where you left off across devices.</p>
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest posts</h2>
          <Link to="/blogs" className="text-sm text-sky-600 hover:underline">Browse all</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 bg-slate-100 animate-pulse rounded-lg" />
            ))
          ) : filtered.length ? (
            filtered.map(b => <BlogCard key={b._id} blog={b} />)
          ) : (
            <div className="col-span-full text-center text-slate-500 py-12 bg-white rounded-lg">
              No posts found for your search.
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <ProtectedLink to="/feed" className="inline-flex items-center px-5 py-3 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 shadow">
            Explore personalized feed
          </ProtectedLink>
        </div>
      </section>

      {/* Testimonials / community */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold">Join a community of curious writers</h3>
              <p className="text-slate-600 mt-2">People come to BlogSpace to read well-crafted pieces, discover new ideas, and build an audience for their writing.</p>
            </div>
            <div className="flex gap-3 justify-start md:justify-end">
              <img alt="avatar1" src="https://i.pravatar.cc/64?img=12" className="h-12 w-12 rounded-full shadow" />
              <img alt="avatar2" src="https://i.pravatar.cc/64?img=32" className="h-12 w-12 rounded-full shadow" />
              <img alt="avatar3" src="https://i.pravatar.cc/64?img=44" className="h-12 w-12 rounded-full shadow" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold">Ready to share your first story?</h4>
            <p className="text-sm text-slate-600 mt-1">Sign up and publish in minutes — the audience is waiting.</p>
          </div>

          <div className="flex gap-3">
            <Link to="/register" className="px-5 py-3 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700">Create account</Link>
            <ProtectedLink to="/create" className="px-5 py-3 border border-slate-200 rounded-lg">Write a post</ProtectedLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;