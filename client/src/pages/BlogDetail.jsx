import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Clock, 
  User, 
  Eye, 
  Calendar, 
  ArrowLeft,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
  ThumbsUp,
  Zap,
  BookOpen,
  Tag,
  Lightbulb
} from 'lucide-react';
import api from '../utils/api';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reacting, setReacting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/blogs/${id}`);
        
        if (response.data.success) {
          const blogData = response.data.blog;
          setBlog(blogData);
          setComments(blogData.comments || []);

          // Check user reaction
          if (token && blogData.reactions) {
            const userReactionObj = blogData.reactions.find(
              r => r.user?._id === user?.id || r.user === user?.id
            );
            setUserReaction(userReactionObj?.type || null);
          }

          // Check if user bookmarked this blog
          if (token) {
            try {
              const bookmarksResponse = await api.get('/user/bookmarks');
              const isBookmarked = bookmarksResponse.data.bookmarks?.some(
                bookmark => bookmark.blog?._id === id
              );
              setIsBookmarked(isBookmarked);
            } catch (error) {
              console.error('Failed to check bookmarks:', error);
            }
          }

          // Record view
          await api.post(`/blogs/${id}/view`, { timeSpent: 0 });
        } else {
          setError('Blog not found');
        }
      } catch (err) {
        console.error('Failed to fetch blog:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, token, user]);

  const handleReaction = async (reactionType) => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (reacting) return; // Prevent multiple clicks

    try {
      setReacting(true);
      
      // If user is clicking the same reaction, remove it (toggle)
      const newReaction = userReaction === reactionType ? null : reactionType;
      
      const response = await api.post(`/blogs/${id}/like-reaction`, { 
        type: newReaction 
      });

      if (response.data.success) {
        setUserReaction(newReaction);
        
        // Update local blog state to reflect reaction changes
        setBlog(prevBlog => {
          if (!prevBlog) return prevBlog;
          
          const updatedReactions = prevBlog.reactions?.filter(r => 
            r.user?._id !== user?.id && r.user !== user?.id
          ) || [];
          
          if (newReaction) {
            updatedReactions.push({
              user: user?.id,
              type: newReaction,
              createdAt: new Date().toISOString()
            });
          }
          
          return {
            ...prevBlog,
            reactions: updatedReactions
          };
        });
      }
    } catch (error) {
      console.error('Failed to react:', error);
    } finally {
      setReacting(false);
    }
  };

  const handleBookmark = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await api.post(`/blogs/${id}/bookmark`);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Failed to bookmark:', error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      return;
    }

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await api.post(`/blogs/${id}/comment`, { 
        text: newComment.trim() 
      });

      if (response.data.success) {
        // Add the new comment to the list
        const newCommentObj = {
          ...response.data.comment,
          user: user // Add current user info to the comment
        };
        setComments(prev => [newCommentObj, ...prev]);
        setNewComment('');
        
        // Update blog comment count
        setBlog(prevBlog => ({
          ...prevBlog,
          comments: [newCommentObj, ...(prevBlog?.comments || [])]
        }));
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderContent = () => {
    if (!blog) return null;

    // If there are contentBlocks, render them
    if (blog.contentBlocks && blog.contentBlocks.length > 0) {
      return blog.contentBlocks.map((block, index) => {
        if (!block) return null;

        switch (block.type) {
          case 'paragraph':
            return (
              <p key={index} className="text-lg text-gray-700 leading-relaxed mb-6">
                {block.data?.text || ''}
              </p>
            );
          case 'heading':
            const level = block.data?.level || 2;
            const HeadingTag = `h${level}`;
            const headingClasses = {
              1: 'text-4xl font-bold text-gray-900 mt-12 mb-6',
              2: 'text-3xl font-bold text-gray-900 mt-10 mb-4',
              3: 'text-2xl font-semibold text-gray-900 mt-8 mb-3',
            };
            return (
              <HeadingTag key={index} className={headingClasses[level] || headingClasses[2]}>
                {block.data?.text || ''}
              </HeadingTag>
            );
          case 'image':
            const imageUrl = block.data?.url || block.data?.file?.url || block.attrs?.src;
            if (!imageUrl) return null;
            return (
              <div key={index} className="my-8">
                <img 
                  src={imageUrl} 
                  alt={block.data?.alt || block.attrs?.alt || 'Blog image'} 
                  className="w-full rounded-xl shadow-lg max-h-96 object-cover"
                />
                {(block.data?.caption || block.attrs?.title) && (
                  <p className="text-center text-gray-600 text-sm mt-3 italic">
                    {block.data?.caption || block.attrs?.title}
                  </p>
                )}
              </div>
            );
          case 'list':
            const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
            const listClass = block.data?.style === 'ordered' 
              ? 'list-decimal list-outside space-y-2 ml-6' 
              : 'list-disc list-outside space-y-2 ml-6';
            return (
              <ListTag key={index} className={`text-lg text-gray-700 mb-6 ${listClass}`}>
                {block.data?.items?.map((item, itemIndex) => (
                  <li key={itemIndex} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ListTag>
            );
          case 'quote':
            return (
              <blockquote key={index} className="border-l-4 border-primary-500 pl-6 py-4 my-8 bg-primary-50 rounded-r-lg">
                <p className="text-xl italic text-gray-700 leading-relaxed">
                  {block.data?.text || ''}
                </p>
                {block.data?.caption && (
                  <footer className="text-gray-600 mt-2">— {block.data.caption}</footer>
                )}
              </blockquote>
            );
          case 'code':
            return (
              <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg my-6 overflow-x-auto">
                <code>{block.data?.code || ''}</code>
              </pre>
            );
          default:
            // Fallback for unknown block types
            if (block.data?.text) {
              return (
                <p key={index} className="text-lg text-gray-700 leading-relaxed mb-6">
                  {block.data.text}
                </p>
              );
            }
            return null;
        }
      });
    }

    // Fallback to regular content if no contentBlocks
    if (blog.content) {
      return (
        <div className="text-lg text-gray-700 leading-relaxed space-y-6">
          {blog.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-8 text-gray-500">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No content available for this blog post.</p>
      </div>
    );
  };

  // Calculate reaction counts
  const reactionCounts = {
    like: blog?.reactions?.filter(r => r.type === 'like').length || 0,
    love: blog?.reactions?.filter(r => r.type === 'love').length || 0,
    clap: blog?.reactions?.filter(r => r.type === 'clap').length || 0,
    insightful: blog?.reactions?.filter(r => r.type === 'insightful').length || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The blog post you are looking for does not exist.'}</p>
          <Link
            to="/"
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to feed</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Share this post"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleBookmark}
                className={`p-2 transition-colors ${
                  isBookmarked ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
              >
                <Bookmark className="h-5 w-5" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.categories?.map(category => (
              <span
                key={category}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700"
              >
                <Tag className="h-3 w-3 mr-1" />
                {category}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between py-6 border-t border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {blog.author?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{blog.author?.username || 'Anonymous'}</div>
                <div className="text-gray-500 text-sm">Author</div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{blog.readTime || 5} min read</span>
              </div>
              {blog.viewsCount > 0 && (
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>{blog.viewsCount} views</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="mb-12">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
          {renderContent()}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reactions */}
        <div className="border-t border-gray-200 py-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleReaction('like')}
                disabled={reacting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  userReaction === 'like'
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                } ${reacting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Like</span>
                <span className="text-sm">{reactionCounts.like}</span>
              </button>

              <button
                onClick={() => handleReaction('love')}
                disabled={reacting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  userReaction === 'love'
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                } ${reacting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className="h-4 w-4" />
                <span>Love</span>
                <span className="text-sm">{reactionCounts.love}</span>
              </button>

              <button
                onClick={() => handleReaction('clap')}
                disabled={reacting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  userReaction === 'clap'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                } ${reacting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Zap className="h-4 w-4" />
                <span>Clap</span>
                <span className="text-sm">{reactionCounts.clap}</span>
              </button>

              <button
                onClick={() => handleReaction('insightful')}
                disabled={reacting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  userReaction === 'insightful'
                    ? 'bg-green-50 border-green-200 text-green-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                } ${reacting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Lightbulb className="h-4 w-4" />
                <span>Insightful</span>
                <span className="text-sm">{reactionCounts.insightful}</span>
              </button>
            </div>

            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">{comments.length} comments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments</h3>

          {/* Add Comment */}
          {token ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                required
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
              <p className="text-gray-600 mb-4">Sign in to join the conversation</p>
              <Link
                to="/login"
                className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment._id} className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{comment.user?.username || 'User'}</div>
                        <div className="text-gray-500 text-sm">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;