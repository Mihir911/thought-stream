import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import BlogCard from "./BlogCard";

const RelatedPosts = ({ blogId }) => {
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!blogId) return;
        
        const fetchRelated = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get(`/blogs/${blogId}/related`);
                setRelated(res.data.relatedBlogs || []);
            } catch (err) {
                console.error('Related fetch error', err);
                setError('Failed to load related posts');
                setRelated([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [blogId]);

    if (loading) return <div className="text-gray-500">Loading related posts...</div>;
    if (error) return <div className="text-gray-500">Unable to load related posts</div>;
    if (!related.length) return null;

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">More like this</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map(b => <BlogCard key={b._id} blog={b} />)}
            </div>
        </div>
    );
};

export default RelatedPosts;