import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

import BookmarkButton from '../components/blog/BookmarkButton';
import ReactionBar from '../components/blog/ReactionBar';
import Comments from '../components/blog/Comments';
import RelatedPosts from '../components/blog/RelatedPosts';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const startRef = useRef(null);
  const accumulated = useRef(0);
  const heartbeatRef = useRef(null);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/blogs/${id}`);
      setBlog(res.data.blog);
    } catch (err) {
      console.error('Fetch blog error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
    // start read timer
    startRef.current = Date.now();
    // periodic heartbeat to record timeSpent every 20s
    heartbeatRef.current = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - (startRef.current || now)) / 1000);
      accumulated.current += diff;
      startRef.current = now;
      // send a lightweight record to server (non-blocking)
      api.post(`/blogs/${id}/view`, { timeSpent: diff }).catch(()=>{});
    }, 20000);

    return () => {
      clearInterval(heartbeatRef.current);
      // on unmount, send remaining time
      const now = Date.now();
      const diff = Math.floor((now - (startRef.current || now)) / 1000);
      const total = accumulated.current + diff;
      if (total > 0) {
        api.post(`/blogs/${id}/view`, { timeSpent: total }).catch(()=>{});
      }
    };
    // eslint-disable-next-line
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto py-12">Loading...</div>;
  if (!blog) return <div className="max-w-4xl mx-auto py-12">Blog not found.</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <article className="bg-white p-6 rounded-lg shadow-sm">
        {blog.coverImage && <img src={blog.coverImage} alt={blog.title} className="w-full h-64 object-cover rounded-md mb-6" />}
        <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div>{blog.author?.username} • {new Date(blog.createdAt).toLocaleDateString()}</div>
          <div>{blog.readTime} min read</div>
        </div>

        <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: blog.content }} />

        <div className="mt-6 flex items-center justify-between">
          <ReactionBar blogId={blog._id} initialReactions={blog.reactions || []} />
          <div className="flex items-center gap-3">
            <BookmarkButton blogId={blog._id} initialBookmarked={false} />
          </div>
        </div>

        <RelatedPosts blogId={blog._id} />
        <Comments blogId={blog._id} comments={blog.comments || []} refresh={fetchBlog} />
      </article>
    </div>
  );
};

export default BlogDetail;