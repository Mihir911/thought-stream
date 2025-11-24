import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Save,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import api from '../utils/api';
import RichTextEditor from '../components/editor/RichTextEditor';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '', // Plain text for fallback/search
    contentBlocks: [], // Structured content
    categories: [],
    tags: [],
    coverImage: '',
    coverUpload: null, // ID of the upload
    isPublished: true
  });

  const [tiptapContent, setTiptapContent] = useState(null);

  const categoriesList = [
    'Technology', 'Programming', 'Design', 'Lifestyle', 'Travel',
    'Food', 'Health', 'Business', 'Education', 'Science',
    'Finance', 'Entertainment', 'Sports', 'Art', 'Music'
  ];

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = new FormData();
      data.append('file', file);

      const response = await api.post('/uploads', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.upload) {
        setFormData(prev => ({
          ...prev,
          coverImage: response.data.upload.url,
          coverUpload: response.data.upload._id
        }));
        showAlert('success', 'Cover image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      showAlert('error', 'Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  // Transform Tiptap JSON to Backend Blocks
  const transformContent = (json) => {
    if (!json || !json.content) return [];

    return json.content.map(node => {
      if (node.type === 'paragraph') {
        return {
          type: 'paragraph',
          data: { text: node.content ? node.content.map(c => c.text).join('') : '' }
        };
      }
      if (node.type === 'heading') {
        return {
          type: 'heading',
          data: {
            text: node.content ? node.content.map(c => c.text).join('') : '',
            level: node.attrs.level
          }
        };
      }
      if (node.type === 'image') {
        return {
          type: 'image',
          data: {
            url: node.attrs.src,
            caption: node.attrs.alt || ''
          }
        };
      }
      if (node.type === 'bulletList' || node.type === 'orderedList') {
        return {
          type: 'list',
          data: {
            style: node.type === 'orderedList' ? 'ordered' : 'unordered',
            items: node.content.map(li => li.content[0].content[0].text)
          }
        };
      }
      if (node.type === 'blockquote') {
        return {
          type: 'quote',
          data: { text: node.content[0].content[0].text }
        };
      }
      return null;
    }).filter(Boolean);
  };

  const handleEditorChange = (json) => {
    setTiptapContent(json);
    // Also update plain text content for search/read time
    // This is a simplified extraction
    const plainText = JSON.stringify(json);
    setFormData(prev => ({ ...prev, content: plainText }));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!formData.title.trim()) {
      showAlert('error', 'Title is required');
      return;
    }
    if (!tiptapContent) {
      showAlert('error', 'Content is required');
      return;
    }

    try {
      setLoading(true);
      const blocks = transformContent(tiptapContent);

      // Extract plain text properly for the backend 'content' field (used for search/excerpt)
      // We can use the blocks we just created
      const plainText = blocks.map(b => {
        if (b.type === 'paragraph' || b.type === 'heading' || b.type === 'quote') return b.data.text;
        if (b.type === 'list') return b.data.items.join(' ');
        return '';
      }).join('\n');

      const payload = {
        ...formData,
        content: plainText,
        contentBlocks: blocks,
        isPublished: !isDraft
      };

      const endpoint = isDraft ? '/drafts' : '/blogs';
      const res = await api.post(endpoint, payload);

      if (res.data.success) {
        showAlert('success', isDraft ? 'Draft saved!' : 'Story published!');
        setTimeout(() => {
          navigate(isDraft ? '/drafts' : `/blogs/${res.data.blog._id || res.data.draft._id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Submit error:', error);
      showAlert('error', 'Failed to save story.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      {alert.show && (
        <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 animate-slide-down ${alert.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'
          }`}>
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{alert.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">Write a Story</h1>
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Publishing...' : 'Publish'} <Eye size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Title"
                className="w-full text-4xl font-display font-bold placeholder-gray-300 border-none focus:ring-0 p-0 text-gray-900"
              />
            </div>

            <RichTextEditor
              content={tiptapContent}
              onChange={handleEditorChange}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Cover Image</h3>
              {formData.coverImage ? (
                <div className="relative group rounded-xl overflow-hidden aspect-video">
                  <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: '', coverUpload: null }))}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-3 bg-gray-100 rounded-full group-hover:bg-white transition-colors mb-3">
                      <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-primary-500" />
                    </div>
                    <p className="text-sm text-gray-500 group-hover:text-primary-600 font-medium">Click to upload cover</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryToggle(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.categories.includes(cat)
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="ml-1.5 hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add a tag..."
                onKeyDown={handleTagAdd}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;