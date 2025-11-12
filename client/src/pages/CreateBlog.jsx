import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

/**
 * CreateBlog page
 * - Simple rich-ish editor using textarea (keeps dependencies minimal)
 * - Cover image via URL or local file -> base64 preview
 * - Categories / tags as comma-separated inputs
 * - Autosave to localStorage (draft) and manual Save Draft (sends isPublished=false)
 * - Publish button (isPublished=true)
 *
 * Usage:
 * - Route: /create (Header already links to /create)
 * - Requires authentication (server will validate token)
 */

const LOCAL_DRAFT_KEY = 'blogspace:draft';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(''); // store URL/base64
  const [coverFileName, setCoverFileName] = useState('');
  const [content, setContent] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const autosaveTimer = useRef(null);

  // Load draft if exists
  useEffect(() => {
    try {
      const draft = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || '');
        setCoverImage(parsed.coverImage || '');
        setCoverFileName(parsed.coverFileName || '');
        setContent(parsed.content || '');
        setCategoriesInput((parsed.categories || []).join(', '));
        setTagsInput((parsed.tags || []).join(', '));
        setIsPublished(parsed.isPublished !== undefined ? parsed.isPublished : true);
      }
    } catch (err) {
      console.warn('Failed to load draft', err);
    }
  }, []);

  // Autosave draft to localStorage every 5 seconds of idle time
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      const payload = {
        title,
        coverImage,
        coverFileName,
        content,
        categories: parseList(categoriesInput),
        tags: parseList(tagsInput),
        isPublished
      };
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(payload));
      // small UI ephemeral message
      setSuccessMsg('Draft saved locally');
      setTimeout(() => setSuccessMsg(''), 1200);
    }, 5000);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
    // eslint-disable-next-line
  }, [title, coverImage, content, categoriesInput, tagsInput, isPublished]);

  function parseList(input) {
    return input
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  // Basic validation
  const validate = () => {
    if (!title || title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return false;
    }
    if (!content || content.trim().length < 50) {
      setError('Content must be at least 50 characters');
      return false;
    }
    return true;
  };

  // handle local file -> base64 (preview) (this is optional; in production upload to S3/Cloudinary instead)
  const handleCoverFile = (file) => {
    if (!file) return;
    setCoverFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (publish = true) => {
    setError('');
    setSuccessMsg('');
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      content: content.trim(),
      categories: parseList(categoriesInput),
      tags: parseList(tagsInput),
      coverImage: coverImage || '',
      isPublished: publish
    };

    try {
      setIsSaving(true);
      const res = await api.post('/blogs', payload);
      // on success clear local draft
      localStorage.removeItem(LOCAL_DRAFT_KEY);
      setSuccessMsg(publish ? 'Published successfully' : 'Draft saved on server');
      // navigate to created blog page if available
      const created = res.data.blog;
      if (created && created._id) {
        navigate(`/blogs/${created._id}`);
      } else {
        // fallback: go to feed
        navigate('/feed');
      }
    } catch (err) {
      console.error('Create blog failed', err);
      setError(err.response?.data?.message || 'Error creating blog');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    // use server save as draft: isPublished=false
    try {
      await handleSubmit(false);
    } catch (err) {
      // handled inside
    }
  };

  const clearDraftLocal = () => {
    localStorage.removeItem(LOCAL_DRAFT_KEY);
    setTitle('');
    setCoverImage('');
    setCoverFileName('');
    setContent('');
    setCategoriesInput('');
    setTagsInput('');
    setIsPublished(true);
    setSuccessMsg('Local draft cleared');
    setTimeout(() => setSuccessMsg(''), 1200);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4">Write a new blog</h2>

      <div className="bg-white p-6 rounded-lg shadow">
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        {successMsg && <div className="mb-4 text-green-700 bg-green-50 p-3 rounded">{successMsg}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your post a captivating title"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover image (URL)</label>
            <input
              value={coverImage.startsWith('data:') ? '' : coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border rounded px-3 py-2"
            />
            <div className="mt-2 text-xs text-gray-500">Or upload a local image (converted to preview)</div>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="cover-file"
                type="file"
                accept="image/*"
                onChange={(e) => handleCoverFile(e.target.files?.[0])}
                className="text-sm"
              />
              {coverFileName && <div className="text-sm text-gray-600">{coverFileName}</div>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories (comma separated)</label>
            <input
              value={categoriesInput}
              onChange={(e) => setCategoriesInput(e.target.value)}
              placeholder="Technology, Programming"
              className="w-full border rounded px-3 py-2"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Tags (comma separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="react,javascript,design"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {coverImage ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover preview</label>
            <div className="w-full h-64 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
              {/* if data URL, show it directly */}
              <img src={coverImage} alt="cover preview" className="w-full h-full object-cover" />
            </div>
          </div>
        ) : null}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="14"
            placeholder="Write your story in markdown or HTML. You can paste formatted HTML as well."
            className="w-full border rounded px-3 py-2 min-h-[18rem]"
          />
          <div className="text-xs text-gray-400 mt-2">Tip: include images by URL or upload and paste the image URL into the content.</div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              <span>Publish now</span>
            </label>
            <button onClick={clearDraftLocal} className="text-sm text-gray-500 hover:underline">Clear local draft</button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              onClick={() => handleSubmit(true)}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isSaving ? 'Publishing...' : (isPublished ? 'Publish' : 'Save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
