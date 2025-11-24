import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit2, Trash2 } from 'lucide-react';
import api from '../utils/api';

const Drafts = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await api.get('/drafts');
        setDrafts(res.data.drafts || []);
      } catch (error) {
        console.error("Error fetching drafts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDrafts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this draft?')) {
      try {
        await api.delete(`/drafts/${id}`);
        setDrafts(drafts.filter(d => d._id !== id));
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">Drafts</h1>
          <Link
            to="/create"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <FileText size={18} /> New Draft
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : drafts.length > 0 ? (
          <div className="space-y-4">
            {drafts.map(draft => (
              <div key={draft._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <Link to={`/create?draft=${draft._id}`} className="block group">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                      {draft.title || "Untitled Draft"}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500">
                    Last edited {new Date(draft.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/create?draft=${draft._id}`}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(draft._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 mb-4">No drafts found.</p>
            <Link to="/create" className="text-primary-600 font-medium hover:underline">Start writing</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drafts;