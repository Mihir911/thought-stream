import React, { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../utils/api';

const BookmarkButton = ({ blogId, initialBookmarked = false, onChange }) => {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    try {
      setLoading(true);
      await api.post(`/blogs/${blogId}/bookmark`);
      setBookmarked(prev => !prev);
      if (onChange) onChange(!bookmarked);
    } catch (err) {
      console.error('Bookmark toggle failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${bookmarked ? 'bg-yellow-50 border-yellow-200' : 'bg-white hover:bg-gray-50'}`}
      title={bookmarked ? 'Remove bookmark' : 'Save for later'}
    >
      <Star className={`h-4 w-4 ${bookmarked ? 'text-yellow-500' : 'text-gray-500'}`} />
      <span className="text-sm text-gray-700">{bookmarked ? 'Saved' : 'Save'}</span>
    </button>
  );
};

export default BookmarkButton;