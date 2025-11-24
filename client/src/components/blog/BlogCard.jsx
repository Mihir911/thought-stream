import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageCircle } from 'lucide-react';

const BlogCard = ({ blog }) => {
    const coverImage = blog.coverUpload?.thumbnails?.medium || blog.coverImage;

    return (
        <Link
            to={`/blogs/${blog._id}`}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
        >
            {/* Image Container - Only render if image exists */}
            {coverImage && (
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                        src={coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Category Badge */}
                    {blog.categories?.[0] && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md text-xs font-bold text-gray-900 rounded-full shadow-sm">
                            {blog.categories[0]}
                        </span>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="flex flex-col flex-1 p-5">
                {/* Author Info */}
                <div className="flex items-center gap-2 mb-3">
                    <img
                        src={blog.author?.profilePicture || `https://ui-avatars.com/api/?name=${blog.author?.username}&background=random`}
                        alt={blog.author?.username}
                        className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-gray-600">
                        {blog.author?.username}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">
                        {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </div>

                {/* Title & Excerpt */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors font-display">
                    {blog.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {blog.excerpt || "Read this amazing story to learn more..."}
                </p>

                {/* Footer Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <ThumbsUp size={14} />
                            <span>{blog.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageCircle size={14} />
                            <span>{blog.comments?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BlogCard;