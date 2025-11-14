import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../components/blog/BlogCard';
import api from '../utils/api';
import Logo from '../components/ui/Logo';
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
    // filter locally for immediate UX (server-side search can be implemented later)
    const q = query.trim().toLowerCase();
    const result = latest.filter(b => {
      const inTitle = b.title && b.title.toLowerCase().includes(q);
      const inContent = b.excerpt && b.excerpt.toLowerCase().includes(q);
      const inCategory = selectedCategory ? (b.categories || []).includes(selectedCategory) : true;
      return (q ? (inTitle || inContent) : true) && inCategory;
    });
    setFiltered(result);
  }, [query, latest, selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <header className="bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Left column */}
            <div className="w-full lg:w-1/2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-1 rounded-md bg-gradient-to-r from-sky-600 to-blue-500">
                  <Logo className="h-10 w-auto" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-500">Welcome to</h2>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                    BlogSpace — Stories that move you
                  </h1>
                </div>
              </div>

              <p className="text-slate-600 text-base md:text-lg mb-6 max-w-xl">
                Discover thoughtful writing, follow topics you care about, and publish
                stories that find the right readers. Personalized feeds and beautiful reading experiences.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-md transition"
                >
                  Get started — it's free
                </Link>
                <ProtectedLink
                  to="/feed"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium shadow-sm hover:shadow-md transition"
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
                    onClick={() => { setSelectedCategory(''); }}
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

            {/* Right column - decorative and featured */}
            <div className="w-full lg:w-1/2">
              <div className="bg-gradient-to-br from-sky-700 to-blue-800 text-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">Featured stories</h3>
                    <p className="mt-2 text-sky-100 text-sm">Handpicked posts chosen by our editors and trending among readers.</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {loading ? (
                    <>
                      <div className="h-28 rounded-lg bg-sky-600 animate-pulse" />
                      <div className="h-28 rounded-lg bg-sky-600 animate-pulse" />
                    </>
                  ) : (
                    (latest.slice(0, 4).map(post => (
                      <Link key={post._id} to={`/blogs/${post._id}`} className="block bg-white/5 p-3 rounded-lg hover:bg-white/10 transition">
                        <h4 className="text-sm font-semibold truncate">{post.title}</h4>
                        <p className="text-xs text-sky-100 mt-1 line-clamp-2">{post.excerpt}</p>
                        <div className="text-xs text-sky-200 mt-3 flex items-center justify-between">
                          <span>{post.author?.username || '—'}</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    )))
                  )}
                </div>

                <div className="mt-6 text-right">
                  <Link to="/trending" className="text-sm text-white/90 hover:text-white underline">See more trending →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Latest section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
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
          <ProtectedLink to="/feed" className="inline-flex items-center px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 shadow">
            Explore personalized feed
          </ProtectedLink>
        </div>
      </section>

      {/* Small footer CTA */}
      <div className="bg-gradient-to-t from-slate-50 to-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600">Start your writing journey — publish your first post today.</div>
          <div className="flex gap-3">
            <Link to="/create" className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50">Write a post</Link>
            <Link to="/about" className="px-4 py-2 text-sm text-slate-700 hover:underline">About</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;