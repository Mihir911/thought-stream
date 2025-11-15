import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Image, Paperclip, Trash, Save, ArrowUpRight } from 'lucide-react';
import ImageUploader from '../components/editor/ImageUploader';
import { captureOwnerStack } from 'react';
/**
 * CreateBlog - polished editor page with:
 * - Cover image (URL or upload -> base64 preview)
 * - Categories (chips) and tags (chip input)
 * - Markdown editor + live preview (simple markdown support)
 * - Autosave to localStorage + manual "Save Draft" (sends isPublished=false)
 * - Publish button (isPublished=true)
 * - Keyboard shortcut Cmd/Ctrl+S to save draft
 * Usage:
 * - Route: /create (Header already links to /create)
 * - Requires authentication (server will validate token)
 */

const LOCAL_DRAFT_KEY = 'blogspace:draft:v2';
const DEFAULT_CATEGORIES = [
  'Technology', 'Programming', 'Design', 'Lifestyle',
  'Travel', 'Food', 'Health', 'Business', 'Education', 'Science'
];


function simpleMarkdownToHtml(md = '') {
  let html = md
    .replace(/```([\s\S]*?)```/g, (m, p1) => `<pre class="rounded bg-slate-100 p-3 overflow-auto"><code>${escapeHtml(p1)}</code></pre>`)
    .replace(/^###### (.*$)/gim, '<h6 class="text-slate-700">$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5 class="text-slate-700">$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-slate-700">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-slate-800">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-slate-900">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-slate-900 text-2xl">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img alt="$1" src="$2" class="max-w-full rounded" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a class="text-sky-600 hover:underline" href="$2" target="_blank" rel="noreferrer noopener">$1</a>')
    .replace(/^\s*[-*] (.*)/gim, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/gim, '<ul class="list-disc pl-6 mb-2">$1</ul>')
    .replace(/\n{2,}/gim, '</p><p>')
    .replace(/^(?!<h|<ul|<pre|<img|<p|<blockquote)(.+)$/gim, '<p>$1</p>');

  if (!html.startsWith('<p') && !html.startsWith('<h') && !html.startsWith('<pre') && !html.startsWith('<ul') && !html.startsWith('<img')) {
    html = `<p>${html}</p>`;
  }
  return html;
}

function escapeHtml(unsafe = '') {
  return unsafe.replace(/[&<"']/g, function (m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '"': return '&quot;';
      default: return '&#039;';
    }
  });
}

const TagInput = ({ tags, setTags }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const addTag = (t) => {
    const trimmed = t.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setValue('');
    inputRef.current?.focus();
  };

  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(value);
    } else if (e.key === 'Backspace' && !value) {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
            {t}
            <button type="button" onClick={() => removeTag(t)} className="text-slate-400 hover:text-red-500">
              <Trash className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a tag and press Enter"
        className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
      />
    </div>
  );
};

const CreateBlog = () => {
  const navigate = useNavigate();
  const user = useSelector(s => s.auth?.user);
  const token = useSelector(s => s.auth?.token) || localStorage.getItem('token');

  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const editorRef = useRef(null);
  const autosaveTimer = useRef(null);

  useEffect(() => {
    try {
      const draft = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (draft) {
        const d = JSON.parse(draft);
        setTitle(d.title || '');
        setCoverImage(d.coverImage || '');
        setCoverPreview(d.coverPreview || '');
        setContent(d.content || '');
        setSelectedCategories(d.categories || []);
        setTags(d.tags || []);
      }
    } catch (err) { /* ignore */ }
  }, []);

  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      const payload = { title, coverImage, coverPreview, content, categories: selectedCategories, tags };
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(payload));
      setSuccessMsg('Draft saved locally');
      setTimeout(() => setSuccessMsg(''), 1200);
    }, 2500);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [title, coverImage, coverPreview, content, selectedCategories, tags]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line
  }, [title, coverImage, content, selectedCategories, tags]);

  const insertAtCursor = useCallback((text) => {
    const el = editorRef.current;
    if (!el) {
      setContent(prev => prev + text);
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const newVal = content.slice(0, start) + text + content.slice(end);
    setContent(newVal);
    // restore focus and set caret after inserted text
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.selectionStart = el.selectionEnd = pos;
    });
  }, [content]);

  const handleCoverFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverPreview(e.target.result);
      setCoverImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const onImageUpload = (url, originalName) => {
    let alt = originalName || 'image';
    try { alt = window.prompt('Alt text (for accessibility)', originalName) || originalName; } catch (err) { }
    let caption = "";
    try {
      caption = window.prompt('Optional caption (leave empty to skip)') || '';
    } catch (error) {}

    const captionMd = caption ? `\n*${caption}*` : '';
    const md = `\n\n![${alt}](${url})${captionMd}\n\n`;
    insertAtCursor(md);
    setSuccessMsg('Image inserted');
    setTimeout(() => setSuccessMsg(''), 1200);
  };

  const toggleCategory = (c) => {
    setSelectedCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const validate = () => {
    if (!title || title.trim().length < 5) {
      setError('Please provide a title (min 5 characters).');
      return false;
    }
    if (!content || content.trim().length < 50) {
      setError('Content is too short (min 50 characters).');
      return false;
    }
    return true;
  };

  const commonPayload = () => ({
    title: title.trim(),
    content: content.trim(),
    categories: selectedCategories,
    tags,
    coverImage: coverImage || '',
  });

  const handleSaveDraft = async () => {
    if (!token) {
      setError('You must be logged in to save drafts.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const payload = { ...commonPayload(), isPublished: false };
      await api.post('/blogs', payload);
      setSuccessMsg('Draft saved to server');
      setTimeout(() => setSuccessMsg(''), 1500);
      localStorage.removeItem(LOCAL_DRAFT_KEY);
    } catch (err) {
      console.error('Save draft error', err);
      setError(err?.response?.data?.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validate()) return;
    if (!token) {
      setError('You must be logged in to publish.');
      return;
    }
    setIsPublishing(true);
    setError('');
    try {
      const payload = { ...commonPayload(), isPublished: true };
      const res = await api.post('/blogs', payload);
      const created = res.data.blog;
      localStorage.removeItem(LOCAL_DRAFT_KEY);
      if (created && created._id) {
        navigate(`/blogs/${created._id}`);
      } else {
        setSuccessMsg('Published successfully');
      }
    } catch (err) {
      console.error('Publish error', err);
      setError(err?.response?.data?.message || 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="text-slate-800 font-semibold">New post</div>
              <div className="text-sm text-slate-500">Compose your story</div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-md cursor-pointer hover:shadow-sm">
                <Image className="h-4 w-4 text-sky-600" />
                <input type="file" accept="image/*" onChange={(e) => handleCoverFile(e.target.files?.[0])} className="hidden" />
                <span className="text-xs text-slate-600">Upload cover</span>
              </label>

              {/* <label className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-md cursor-pointer hover:shadow-sm">
                <Paperclip className="h-4 w-4 text-slate-500" />
                <input type="file" accept="image/*" onChange={(e) => handleInsertImageToContent(e.target.files?.[0])} className="hidden" />
                <span className="text-xs text-slate-600">Insert image</span>
              </label> */}

                <ImageUploader onUploaded={onImageUpload} buttonText="Insert image" /> 

              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-slate-200 hover:shadow-sm"
                title="Save draft (Cmd/Ctrl+S)"
              >
                <Save className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-700">{isSaving ? 'Saving...' : 'Save draft'}</span>
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 shadow"
              >
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm">{isPublishing ? 'Publishing...' : 'Publish'}</span>
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <aside className="lg:col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Intriguing title that captures attention"
                  className="w-full border border-slate-200 rounded px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cover preview</label>
                {coverPreview ? (
                  <div className="relative">
                    <img src={coverPreview} alt="cover preview" className="w-full h-40 object-cover rounded" />
                    <button onClick={() => { setCoverImage(''); setCoverPreview(''); }} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                      <Trash className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 rounded h-40 flex items-center justify-center text-slate-400">
                    No cover image
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-2">Tip: Use a wide image (1200x600) for best results.</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_CATEGORIES.map(c => {
                    const active = selectedCategories.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleCategory(c)}
                        className={`px-3 py-1 rounded-full text-sm ${active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
                <TagInput tags={tags} setTags={setTags} />
              </div>

              <div className="text-xs text-slate-500">
                Drafts are autosaved locally and can be saved to server as drafts. Publishing will make your post visible.
              </div>
            </aside>

            <section className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Editor (Markdown)</label>
                  <textarea
                    ref={editorRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    placeholder="Write your story here using Markdown. Use **bold**, *italic*, headings (#), lists (-), links [text](url), and code blocks (```)..."
                    className="w-full h-full border border-slate-200 rounded px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Live preview</label>
                  <div className="prose max-w-none border border-slate-100 rounded p-4 h-full overflow-auto bg-white">
                    <div dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content || '*Nothing to preview*') }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-slate-500">{successMsg || 'Autosave active'}</div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => {
                    localStorage.removeItem(LOCAL_DRAFT_KEY);
                    setTitle(''); setContent(''); setCoverImage(''); setCoverPreview(''); setSelectedCategories([]); setTags([]);
                    setSuccessMsg('Local draft cleared');
                    setTimeout(() => setSuccessMsg(''), 1200);
                  }} className="px-3 py-2 rounded-md bg-white border border-slate-200 hover:shadow-sm text-sm">Clear local draft</button>
                  <button onClick={handleSaveDraft} className="px-3 py-2 rounded-md bg-white border border-slate-200 hover:shadow-sm text-sm">Save draft</button>
                  <button onClick={handlePublish} className="px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 text-sm">{isPublishing ? 'Publishing...' : 'Publish'}</button>
                </div>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-3">{error}</div>}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;