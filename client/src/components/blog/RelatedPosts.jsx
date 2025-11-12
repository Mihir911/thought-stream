import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import BlogCard from "./BlogCard";

const RelatedPosts = ({ blogId }) => {
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!blogId) return;
        setLoading(true);
        api.get(`/blog/${blogId}/related`).then(res => {
            setRelated(res.data.relatedBlogs || res.data.related || []);
        }).catch(err => {
            console.error('Related fetch error', err);

        }).finally(() => setLoading(false));
    }, [blogId]);

    if (loading) return <div className="text-gray-500">Loading related posts...</div>;
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