import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FileText, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock,
  Plus,
  Archive,
  Eye,
  Search,
  Filter,
  MoreVertical,
  Download
} from 'lucide-react';
import api from '../utils/api';

const Drafts = () => {
  const { token } = useSelector(state => state.auth);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrafts, setSelectedDrafts] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    const fetchDrafts = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await api.get('/drafts');
        setDrafts(response.data.drafts || []);
      } catch (error) {
        console.error('Failed to fetch drafts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [token]);

  const deleteDraft = async (draftId) => {
    if (!window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/drafts/${draftId}`);
      setDrafts(prev => prev.filter(draft => draft._id !== draftId));
      // Remove from selected drafts if it was selected
      setSelectedDrafts(prev => {
        const newSet = new Set(prev);
        newSet.delete(draftId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to delete draft:', error);
      alert('Failed to delete draft. Please try again.');
    }
  };

  const publishDraft = async (draftId) => {
    try {
      const draft = drafts.find(d => d._id === draftId);
      if (!draft) return;

      const blogData = {
        title: draft.title,
        contentBlocks: draft.contentBlocks,
        categories: draft.categories,
        tags: draft.tags,
        coverUpload: draft.coverUpload,
        isPublished: true
      };

      const response = await api.post('/blogs', blogData);
      
      if (response.data.success) {
        // Remove draft after successful publication
        await api.delete(`/drafts/${draftId}`);
        setDrafts(prev => prev.filter(d => d._id !== draftId));
        alert('Draft published successfully!');
        
        // Optionally navigate to the published blog
        // navigate(`/blogs/${response.data.blog._id}`);
      }
    } catch (error) {
      console.error('Failed to publish draft:', error);
      alert('Failed to publish draft. Please try again.');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedDrafts.size === 0) return;

    if (bulkAction === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedDrafts.size} draft(s)? This action cannot be undone.`)) {
        return;
      }
    }

    try {
      const promises = Array.from(selectedDrafts).map(draftId => {
        if (bulkAction === 'delete') {
          return api.delete(`/drafts/${draftId}`);
        }
        // Add more bulk actions here if needed
        return Promise.resolve();
      });

      await Promise.all(promises);
      
      // Refresh drafts list
      const response = await api.get('/drafts');
      setDrafts(response.data.drafts || []);
      setSelectedDrafts(new Set());
      setBulkAction('');
      
      alert(`${selectedDrafts.size} draft(s) ${bulkAction}ed successfully!`);
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Failed to perform bulk action. Please try again.');
    }
  };

  const toggleDraftSelection = (draftId) => {
    setSelectedDrafts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(draftId)) {
        newSet.delete(draftId);
      } else {
        newSet.add(draftId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDrafts.size === filteredDrafts.length) {
      setSelectedDrafts(new Set());
    } else {
      setSelectedDrafts(new Set(filteredDrafts.map(d => d._id)));
    }
  };

  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.contentBlocks?.some(block => 
      block.data?.text?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const DraftCard = ({ draft }) => {
    const wordCount = draft.contentBlocks?.reduce((count, block) => {
      if (block.data?.text) {
        return count + block.data.text.split(/\s+/).length;
      }
      return count;
    }, 0) || 0;

    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedDrafts.has(draft._id)}
                onChange={() => toggleDraftSelection(draft._id)}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
              />
              <div className="flex flex-wrap gap-2">
                {draft.categories?.slice(0, 2).map(category => (
                  <span 
                    key={category} 
                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => publishDraft(draft._id)}
                className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                title="Publish draft"
              >
                <Eye className="h-4 w-4" />
              </button>
              <Link
                to={`/drafts/${draft._id}/edit`}
                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                title="Edit draft"
              >
                <Edit3 className="h-4 w-4" />
              </Link>
              <button
                onClick={() => deleteDraft(draft._id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete draft"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {draft.title || 'Untitled Draft'}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {draft.contentBlocks?.find(block => block.type === 'paragraph')?.data?.text || 
             'No content yet...'}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{readTime}m read</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Last saved {new Date(draft.lastSavedAt || draft.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-600">Draft</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse">
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="flex gap-2">
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
              <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-between">
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your drafts</p>
          <Link
            to="/login"
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Archive className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Drafts</h1>
                <p className="text-gray-600 mt-1">Your unfinished stories waiting to be published</p>
              </div>
            </div>
            <Link
              to="/create"
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Draft</span>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{drafts.length}</div>
                <div className="text-sm text-gray-600">Total Drafts</div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Archive className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {drafts.reduce((sum, draft) => {
                    const wordCount = draft.contentBlocks?.reduce((count, block) => {
                      if (block.data?.text) {
                        return count + block.data.text.split(/\s+/).length;
                      }
                      return count;
                    }, 0) || 0;
                    return sum + wordCount;
                  }, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Words</div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(drafts.flatMap(d => d.categories || [])).size}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Filter className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {drafts.filter(d => d.coverUpload).length}
                </div>
                <div className="text-sm text-gray-600">With Cover</div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions & Search */}
        {(selectedDrafts.size > 0 || drafts.length > 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search drafts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Bulk Actions */}
              {selectedDrafts.size > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedDrafts.size} selected
                  </span>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Bulk Actions</option>
                    <option value="delete">Delete Selected</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="bg-primary-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Selection Info */}
            {selectedDrafts.size > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedDrafts.size === filteredDrafts.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedDrafts.size === filteredDrafts.length ? 'Deselect all' : 'Select all'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDrafts(new Set())}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        )}

        {/* Drafts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-16">
            <Archive className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Drafts Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start writing and save your work as drafts to continue later. Your ideas are safe here until you're ready to publish.
            </p>
            <Link
              to="/create"
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Start Writing</span>
            </Link>
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching drafts</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Drafts ({filteredDrafts.length})
              </h2>
              <div className="text-sm text-gray-500">
                {drafts.length} total • {filteredDrafts.length} shown
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrafts.map(draft => (
                <DraftCard key={draft._id} draft={draft} />
              ))}
            </div>
          </div>
        )}

        {/* Writing Tips */}
        {drafts.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to Publish?</h3>
                <p className="text-yellow-100">
                  Your drafts are waiting to be shared with the world. Don't let great ideas stay hidden - 
                  publish them and connect with readers!
                </p>
              </div>
              <FileText className="h-12 w-12 text-white opacity-80" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drafts;