import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import BlogCard from '../components/blog/BlogCard';
import BookmarkButton from '../components/blog/BookmarkButton';
import { Sparkles, Clock, UserPlus } from 'lucide-react';
import ProtectedLink from '../components/auth/ProtectedLinks';


const PAGE_LIMIT = 12;

const ForYou = () => {
  const token = useSelector(state => state.auth?.token) || localStorage.getItem('token');
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [interests, setInterests] = useState([]);
  const [activeInterest, setActiveInterest] = useState('');
  const [trending, setTrending] = useState([]);
  const [recommendedAuthors, setRecommendedAuthors] = useState([]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/user/me');
      const u = res.data.user;
      setInterests((u?.interests || []).map(i => i.category));
    } catch (err) {
      // not blocking
      console.error('Failed to fetch profile', err);
    }
  }, []);

  const fetchFeed = useCallback(async (pageToLoad = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setError(null);
      }

      const res = await api.get(`/blogs/feed/hybrid?page=${pageToLoad}&limit=${PAGE_LIMIT}`);
      const data = res.data.blogs || [];
      if (append) {
        setBlogs(prev => [...prev, ...data]);
      } else {
        setBlogs(data);
      }

      // pagination
      const totalPages = res.data.pagination?.totalPages ?? Math.ceil((res.data.pagination?.totalBlogs || data.length) / PAGE_LIMIT);
      setHasMore(pageToLoad < (totalPages || 1));
    } catch (err) {
      console.error('Failed to fetch feed', err);
      setError('Could not load personalized feed. Try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchExtras = useCallback(async () => {
    try {
      const t = await api.get('/blogs/feed/trending?limit=6');
      setTrending(t.data.blogs || []);
    } catch (err) {
      console.error('Failed to fetch trending', err);
    }

    try {
      // lightweight: pick authors from trending as recommendations
      const r = await api.get('/blogs?limit=8&page=1');
      const authorsMap = {};
      const authors = (r.data.blogs || []).reduce((acc, b) => {
        if (!b.author) return acc;
        const id = b.author._id || b.author;
        if (!authorsMap[id]) {
          authorsMap[id] = true;
          acc.push(b.author);
        }
        return acc;
      }, []);
      setRecommendedAuthors(authors.slice(0, 6));
    } catch (err) {
      console.error('Failed to fetch recommended authors', err);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchProfile();
    fetchFeed(1, false);
    fetchExtras();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // client-side filter by interest (if selected)
  const visibleBlogs = activeInterest
    ? blogs.filter(b => (b.categories || []).includes(activeInterest))
    : blogs;

  const handleLoadMore = async () => {
    const next = page + 1;
    setPage(next);
    await fetchFeed(next, true);
  };

  const handleInterestToggle = (interest) => {
    setActiveInterest(prev => (prev === interest ? '' : interest));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header / Hero small */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-sky-100 text-sky-700 p-3 shadow">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">For you — personalized feed</h1>
                <p className="text-sm text-slate-500 mt-1">We surface posts that match your interests, followed authors, and trending stories.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start lg:justify-end gap-3">
            <button
              onClick={() => { setActiveInterest(''); fetchFeed(1, false); }}
              className="px-4 py-2 rounded-md bg-white border border-slate-200 shadow-sm text-sm hover:shadow-md"
            >
              Refresh
            </button>

            <ProtectedLink to="/create" className="px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700">
              Write
            </ProtectedLink>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main feed */}
          <main className="lg:col-span-2 space-y-6">
            {/* interest filter pill row (mobile) */}
            <div className="flex items-center gap-2 overflow-auto pb-2">
              {(interests.length ? interests : ['Technology','Programming','Design']).slice(0, 10).map(i => (
                <button
                  key={i}
                  onClick={() => handleInterestToggle(i)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm ${activeInterest === i ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {i}
                </button>
              ))}
            </div>

            {/* Feed grid */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-44 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 text-red-700 rounded">{error}</div>
            ) : visibleBlogs.length === 0 ? (
              <div className="p-6 bg-white rounded border text-slate-600">No personalized posts yet — try following some interests or authors.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visibleBlogs.map(blog => (
                  <article key={blog._id} className="relative">
                    <BlogCard blog={blog} />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <BookmarkButton blogId={blog._id} />
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Load more */}
            <div className="text-center mt-4">
              {hasMore ? (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-5 py-2 rounded-md bg-white border border-slate-200 shadow-sm hover:shadow-md"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              ) : (
                <div className="text-sm text-slate-500">You've reached the end of your feed for now.</div>
              )}
            </div>
          </main>

          {/* Right sidebar */}
          <aside className="space-y-6">
            {/* Personalization box */}
            <div className="sticky top-24 bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-600" />
                Your interests
              </h4>
              <p className="text-xs text-slate-500 mt-2">Tweak interests to refine your feed</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {(interests.length ? interests : ['Technology','Programming','Design']).map(i => (
                  <button
                    key={i}
                    onClick={() => handleInterestToggle(i)}
                    className={`px-3 py-1 rounded-full text-sm ${activeInterest === i ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {i}
                  </button>
                ))}
              </div>

              <div className="mt-4 text-right">
                <ProtectedLink to="/profile" className="text-xs text-sky-600 hover:underline">Edit interests</ProtectedLink>
              </div>
            </div>

            {/* Recommended authors */}
            <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-sky-600" />
                Recommended authors
              </h4>
              <div className="mt-3 space-y-3">
                {recommendedAuthors.length === 0 ? (
                  <div className="text-xs text-slate-500">No recommendations yet.</div>
                ) : recommendedAuthors.map(a => (
                  <div key={a._id || a.username} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">{(a.username || 'A')[0].toUpperCase()}</div>
                      <div>
                        <div className="text-sm font-medium">{a.username}</div>
                        <div className="text-xs text-slate-500">Writer</div>
                      </div>
                    </div>
                    <button className="text-xs px-3 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-50">Follow</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending mini-list */}
            <div className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Trending</h4>
              <div className="mt-3 space-y-3">
                {trending.length === 0 ? (
                  <div className="text-xs text-slate-500">No trending posts found.</div>
                ) : trending.map(t => (
                  <Link to={`/blogs/${t._id}`} key={t._id} className="flex items-start gap-3">
                    <div className="h-10 w-12 bg-slate-100 rounded overflow-hidden">
                      {t.coverImage ? <img src={t.coverImage} alt={t.title} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800 truncate">{t.title}</div>
                      <div className="text-xs text-slate-500">{t.author?.username || '—'}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-br from-sky-700 to-blue-700 text-white rounded-lg p-4 shadow-lg">
              <h4 className="text-sm font-semibold">Weekly digest</h4>
              <p className="text-xs mt-2 opacity-90">Get top stories selected for you — delivered weekly.</p>
              <div className="mt-3 flex gap-2">
                <ProtectedLink to="/profile" className="px-3 py-1 bg-white text-sky-700 rounded-md text-sm">Subscribe</ProtectedLink>
                <button className="px-3 py-1 bg-white/10 rounded-md text-sm">Learn</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ForYou;