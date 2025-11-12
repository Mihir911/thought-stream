import React from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

const BlogCard = ({ blog }) => {
    return (
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {blog.coverImage ? (
                <div className="h-44 w-full bg-gray-200">
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                </div>
            ) : null}
            <div className="p-4">
                <Link to={`/blogs/${blog._id}`} className="text-lg font-semibold text-gray-900 hover:underline">
                    {blog.title}
                </Link>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{blog.excerpt}</p>
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        <span>{blog.author?.username || 'Unknown'}</span>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(blog.createdAt).toLocaleDateString()}</div>
                </div>
            </div>
        </article>
    );
};

export default BlogCard;