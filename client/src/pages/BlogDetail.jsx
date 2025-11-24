import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, Clock, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import api from '../utils/api';
import { fetchUserProfile } from '../redux/slices/authSlice';
import FollowButton from '../components/ui/FollowButton';
import ReactionBar from '../components/blog/ReactionBar';
import Comments from '../components/blog/Comments';
import RelatedPosts from '../components/blog/RelatedPosts';

const BlogDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchBlog = async () => {
    try {
      // Don't set loading to true on refresh to avoid flickering
      if (!blog) setLoading(true);
      const res = await api.get(`/blogs/${id}`);
      setBlog(res.data.blog);

      // Record view
      await api.post(`/blogs/${id}/view`);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load story");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (error || !blog) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Story not found</h2>
      <Link to="/" className="text-primary-600 hover:underline">Go back home</Link>
    </div>
  );

  const isBookmarked = user?.bookmarks?.some(b => b.blog === blog._id || b.blog?._id === blog._id) || false;
  const userReaction = blog.reactions?.find(r => r.user === user?._id || r.user?._id === user?._id)?.type || null;

  const handleBookmark = async () => {
    if (!user) return; // Should probably redirect to login
    try {
      await api.post(`/blogs/${blog._id}/bookmark`);
      dispatch(fetchUserProfile());
    } catch (err) {
      console.error("Error bookmarking:", err);
    }
  };

  const renderContent = () => {
    if (blog.contentBlocks && blog.contentBlocks.length > 0) {
      return blog.contentBlocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={index} className="mb-6 text-lg leading-relaxed text-gray-800">{block.data.text}</p>;
          case 'heading':
            const Tag = `h${block.data.level}`;
            return <Tag key={index} className="font-display font-bold text-gray-900 mt-10 mb-4 text-3xl">{block.data.text}</Tag>;
          case 'image':
            return (
              <figure key={index} className="my-10">
                <img
                  src={block.data.url || block.data.file?.url}
                  alt={block.data.caption}
                  className="w-full rounded-xl shadow-lg"
                />
                {block.data.caption && <figcaption className="text-center text-sm text-gray-500 mt-3">{block.data.caption}</figcaption>}
              </figure>
            );
          case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return (
              <ListTag key={index} className={`mb-6 pl-6 ${block.data.style === 'ordered' ? 'list-decimal' : 'list-disc'}`}>
                {block.data.items.map((item, i) => <li key={i} className="mb-2 text-lg text-gray-800">{item}</li>)}
              </ListTag>
            );
          default:
            return null;
        }
      });
    }
    // Fallback for old content
    return <div className="prose prose-lg max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }} />;
  };

  return (
    <article className="min-h-screen bg-white pb-20">
      {/* Header / Cover */}
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-10">
        <div className="space-y-6 text-center mb-10">
          <div className="flex items-center justify-center gap-2 text-sm text-primary-600 font-medium uppercase tracking-wide">
            {blog.categories.map(cat => <span key={cat}>{cat}</span>)}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
            {blog.title}
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {blog.excerpt}
          </p>
        </div>

        {/* Author & Meta */}
        <div className="flex items-center justify-between py-6 border-y border-gray-100 mb-10">
          <div className="flex items-center gap-4">
            <img
              src={blog.author?.profilePicture || `https://ui-avatars.com/api/?name=${blog.author?.username}&background=random`}
              alt={blog.author?.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">{blog.author?.username}</span>
                <FollowButton
                  userId={blog.author?._id}
                  isFollowing={user?.following?.includes(blog.author?._id)}
                />
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span>{blog.readTime || 5} min read</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 size={20} />
            </button>
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          {renderContent()}
        </div>

        {/* Tags */}
        <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {blog.tags.map(tag => (
              <span key={tag} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Reactions & Comments */}
        <div className="max-w-3xl mx-auto mt-16">
          <ReactionBar
            blogId={blog._id}
            initialReactions={blog.reactions}
            userReaction={userReaction}
            onReactionChange={() => fetchBlog()} // Refresh to get updated reactions
          />
          <Comments
            blogId={blog._id}
            comments={blog.comments}
            refresh={fetchBlog}
          />
        </div>
      </div>

      {/* Related Posts */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <RelatedPosts blogId={blog._id} />
        </div>
      </div>
    </article>
  );
};

export default BlogDetail;