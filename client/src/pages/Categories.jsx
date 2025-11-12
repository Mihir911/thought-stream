import React from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_CATEGORIES = [
  "Technology", "Programming", "Design", "Lifestyle",
  "Travel", "Food", "Health", "Business", "Education", "Science", "Finance"
];

const Categories = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-6">Categories</h2>
      <p className="text-gray-600 mb-6">Explore posts by categories. Click a category to view posts.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {DEFAULT_CATEGORIES.map(cat => (
          <Link to={`/categories/${encodeURIComponent(cat)}`} key={cat} className="block p-4 rounded-lg bg-white shadow-sm hover:shadow-md">
            <div className="text-lg font-medium text-gray-900">{cat}</div>
            <div className="text-sm text-gray-500 mt-1">Browse {cat} posts</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;