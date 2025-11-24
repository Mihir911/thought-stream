import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, List, ListOrdered, Image as ImageIcon,
    Quote, Heading1, Heading2, Code, Undo, Redo
} from 'lucide-react';
import api from '../../utils/api';

const MenuBar = ({ editor }) => {
    if (!editor) return null;

    const addImage = async () => {
        const url = window.prompt('Enter image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
        // Ideally implement file upload here
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.upload) {
                editor.chain().focus().setImage({
                    src: res.data.upload.url,
                    alt: file.name,
                    title: file.name
                }).run();
            }
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to upload image");
        }
    };

    return (
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 sticky top-0 bg-white z-10">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
                title="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
                title="Italic"
            >
                <Italic size={18} />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
                title="Heading 1"
            >
                <Heading1 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
                title="Bullet List"
            >
                <List size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
                title="Ordered List"
            >
                <ListOrdered size={18} />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
                title="Quote"
            >
                <Quote size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('codeBlock') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
                title="Code Block"
            >
                <Code size={18} />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
            <label className="p-2 rounded hover:bg-gray-100 text-gray-600 cursor-pointer" title="Upload Image">
                <ImageIcon size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
            <div className="flex-1" />
            <button
                onClick={() => editor.chain().focus().undo().run()}
                className="p-2 rounded hover:bg-gray-100 text-gray-600"
                title="Undo"
            >
                <Undo size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                className="p-2 rounded hover:bg-gray-100 text-gray-600"
                title="Redo"
            >
                <Redo size={18} />
            </button>
        </div>
    );
};

const RichTextEditor = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Placeholder.configure({
                placeholder: 'Tell your story...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            // Pass the JSON content back to parent
            // We can also pass HTML if needed, but JSON is better for structured data
            // However, the backend expects contentBlocks (array) or content (string)
            // Let's pass the JSON object which Tiptap produces
            onChange(editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] px-8 py-6',
            },
        },
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
