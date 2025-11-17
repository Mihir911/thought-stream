import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Heading, List, Link as LinkIcon, Image as ImageIcon, Trash } from 'lucide-react';
import api from '../../utils/api';
// import '../styles/editor.css';


/**
 * RichEditor
 * - TipTap-based WYSIWYG editor with toolbar (bold, italic, headings, lists, image, link)
 * - Image upload integration: uploads to POST /api/uploads (multipart/form-data)
 *   then inserts an image node with attrs { src, uploadId, alt, caption, width }
 * - onChange receives { contentBlocks, html } where contentBlocks = tiptapJSON.content
 *
 * Props:
 * - initialContentBlocks: (optional) array or TipTap doc content
 * - placeholder: string
 * - onChange: fn({ contentBlocks, html })
 */



const RichEditor = ({ initialContentBlocks = null, placeholder = 'Start writing…', onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: false,
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialContentBlocks ? { type: 'doc', content: initialContentBlocks } : '',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      const contentBlocks = json.content || [];
      onChange && onChange({ contentBlocks, html, json });
    },
  });

  // Provide a programmatic API to insert images after upload
  const insertImageNode = useCallback((attrs = {}) => {
    if (!editor) return;
    editor.chain().focus().setImage(attrs).run();
  }, [editor]);

  // handle file -> upload -> insert
  const handleImageFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const form = new FormData();
      form.append('file', file);

      const res = await api.post('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });

      const upload = res?.data?.upload;
      if (!upload) throw new Error('Upload response missing');

      // prefer thumbnail medium for initial display
      const src = upload.urls.thumbnailMedium || upload.urls.download;
      const uploadId = String(upload.id);

      // insert image node with metadata attributes for later editing
      insertImageNode({
        src,
        uploadId,
        alt: upload.originalname || '',
        caption: '',
        width: '100%',
      });
    } catch (err) {
      console.error('Image upload failed', err);
      // user-friendly handling could be added here (toasts)
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // toolbar helpers
  const toggleHeading = (level) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleBullet = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrdered = () => editor.chain().focus().toggleOrderedList().run();

  // Insert link prompt (blocking prompt for simplicity; can be improved to non-blocking modal)
  const addLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // Replace selected image (upload + replace src & uploadId)
  const replaceSelectedImage = async (file) => {
    if (!editor || !file) return;
    const { state } = editor;
    // find selected image node
    const { from, to } = state.selection;
    let nodePos = null;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === 'image') {
        nodePos = { node, pos };
        return false;
      }
      return true;
    });
    if (!nodePos) {
      // fallback: just insert new image
      return handleImageFile(file);
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const form = new FormData();
      form.append('file', file);

      const res = await api.post('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });

      const upload = res?.data?.upload;
      if (!upload) throw new Error('Upload response missing');

      const src = upload.urls.thumbnailMedium || upload.urls.download;
      const uploadId = String(upload.id);

      // update node attributes
      editor.chain().focus().setNodeMarkup(nodePos.pos, undefined, {
        ...nodePos.node.attrs,
        src,
        uploadId,
      }).run();
    } catch (err) {
      console.error('Replace image failed', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // UI rendering
  return (
    <div className="rich-editor">
      <div className="editor-toolbar mb-3 flex flex-wrap items-center gap-2">
        <button onClick={toggleBold} type="button" className="btn"> <Bold className="h-4 w-4" /> </button>
        <button onClick={toggleItalic} type="button" className="btn"> <Italic className="h-4 w-4" /> </button>
        <button onClick={() => toggleHeading(1)} type="button" className="btn"> H1 </button>
        <button onClick={() => toggleHeading(2)} type="button" className="btn"> H2 </button>
        <button onClick={toggleBullet} type="button" className="btn"> <List className="h-4 w-4" /> </button>
        <button onClick={toggleOrdered} type="button" className="btn"> 1. </button>
        <button onClick={addLink} type="button" className="btn"> <LinkIcon className="h-4 w-4" /> </button>

        <label className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-md cursor-pointer hover:shadow-sm ml-2">
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files?.[0])} />
          <ImageIcon className="h-4 w-4 text-sky-600" />
          <span className="text-xs text-slate-600">Insert image</span>
        </label>

        {/* replace/delete controls for selected image */}
        <ImageReplaceControls editor={editor} onReplace={replaceSelectedImage} />
        {uploading && <div className="text-xs text-slate-500 ml-2">Uploading... {uploadProgress}%</div>}
      </div>

      <div className="editor-content border border-slate-200 rounded p-4 bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

/**
 * ImageReplaceControls - small UI to replace or remove the currently selected image node
 */
const ImageReplaceControls = ({ editor, onReplace }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const { state } = editor;
      const { from, to } = state.selection;
      let found = false;
      state.doc.nodesBetween(from, to, (node) => {
        if (node.type.name === 'image') {
          found = true;
          return false;
        }
        return true;
      });
      setShow(found);
    };
    editor.on('selectionUpdate', update);
    return () => editor.off('selectionUpdate', update);
  }, [editor]);

  if (!show) return null;

  return (
    <div className="flex items-center gap-2 ml-2">
      <label className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-md cursor-pointer hover:shadow-sm">
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onReplace(e.target.files?.[0])} />
        <span className="text-xs text-slate-600">Replace image</span>
      </label>

      <button
        type="button"
        onClick={() => {
          if (!editor) return;
          const { state } = editor;
          const { from, to } = state.selection;
          let imagePos = null;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === 'image') {
              imagePos = pos;
              return false;
            }
            return true;
          });
          if (imagePos !== null) {
            editor.chain().focus().deleteRange({ from: imagePos, to: imagePos + 1 }).run();
          }
        }}
        className="btn-danger"
        title="Remove image"
      >
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );
};

export default RichEditor;