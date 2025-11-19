import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Save, 
  Eye, 
  Image as ImageIcon, 
  Type, 
  Clock, 
  Tag,
  X,
  AlertCircle,
  CheckCircle2,
  Upload
} from 'lucide-react';
import api from '../utils/api';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categories: [],
    tags: [],
    coverImage: '',
    isPublished: true
  });

  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);

  const categoriesList = [
    'Technology', 'Programming', 'Design', 'Lifestyle', 'Travel',
    'Food', 'Health', 'Business', 'Education', 'Science',
    'Finance', 'Entertainment', 'Sports', 'Art', 'Music'
  ];

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Calculate word count and read time
    const words = formData.content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setReadTime(Math.max(1, Math.ceil(words.length / 200)));
  }, [formData.content, token, navigate]);

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

    if (!file.type.startsWith('image/')) {
      showAlert('error', 'Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showAlert('error', 'Image size should be less than 10MB');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.upload) {
        handleInputChange('coverImage', response.data.upload.url);
        showAlert('success', 'Cover image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      showAlert('error', 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showAlert('error', 'Please enter a title for your story');
      return false;
    }

    if (formData.title.length < 5) {
      showAlert('error', 'Title should be at least 5 characters long');
      return false;
    }

    if (!formData.content.trim()) {
      showAlert('error', 'Please write some content for your story');
      return false;
    }

    if (wordCount < 50) {
      showAlert('error', 'Your story should be at least 50 words long');
      return false;
    }

    if (formData.categories.length === 0) {
      showAlert('error', 'Please select at least one category');
      return false;
    }

    return true;
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const draftData = { ...formData, isPublished: false };
      await api.post('/drafts', draftData);
      showAlert('success', 'Draft saved successfully!');
    } catch (error) {
      console.error('Save draft failed:', error);
      showAlert('error', 'Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await api.post('/blogs', formData);
      
      if (response.data.success) {
        showAlert('success', 'Your story has been published successfully!');
        setTimeout(() => {
          navigate(`/blogs/${response.data.blog._id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Publish failed:', error);
      showAlert('error', 'Failed to publish story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Type className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to create a story</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
          alert.type === 'success' 
            ? 'bg-green-50 border-green-400 text-green-700' 
            : 'bg-red-50 border-red-400 text-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{alert.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Story</h1>
          <p className="text-gray-600">Share your thoughts, ideas, and stories with the world</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title Input */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Story Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Write a compelling title that captures attention..."
                className="w-full px-4 py-3 text-lg font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={200}
              />
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                <span>This appears in feeds and search results</span>
                <span>{formData.title.length}/200</span>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      !previewMode 
                        ? 'border-primary-500 text-primary-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Write
                  </button>
                  <button
                    onClick={() => setPreviewMode(true)}
                    className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      previewMode 
                        ? 'border-primary-500 text-primary-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              <div className="p-6">
                {!previewMode ? (
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Start writing your story... Share your thoughts, ideas, and experiences. You can use markdown for formatting."
                    rows={20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-sans text-gray-700 leading-relaxed"
                  />
                ) : (
                  <div className="prose prose-lg max-w-none min-h-[400px] p-4 border border-gray-200 rounded-lg">
                    {formData.content ? (
                      <div className="whitespace-pre-wrap">{formData.content}</div>
                    ) : (
                      <p className="text-gray-400 text-center py-20">Start writing to see preview...</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Writing Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">{wordCount}</div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">{readTime}</div>
                  <div className="text-sm text-gray-600">Minutes Read</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">{formData.content.length}</div>
                  <div className="text-sm text-gray-600">Characters</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cover Image
              </label>
              
              {formData.coverImage ? (
                <div className="relative group">
                  <img 
                    src={formData.coverImage} 
                    alt="Cover preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleInputChange('coverImage', '')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-400 transition-colors">
                    <Upload className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">Upload Cover Image</span>
                    <span className="text-xs mt-1">Recommended: 1200×600px</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Categories
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categoriesList.map(category => (
                  <label key={category} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-primary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type a tag and press Enter"
                onKeyDown={handleTagAdd}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Draft</span>
                </button>
                
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>{loading ? 'Publishing...' : 'Publish Story'}</span>
                </button>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Type className="h-4 w-4" />
                    <span>{wordCount} words</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{readTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;