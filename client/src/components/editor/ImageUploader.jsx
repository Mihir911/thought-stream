import React, { useState, useRef } from 'react';
import api from '../../utils/api';
import { UploadCloud, X } from 'lucide-react';


/**
 * ImageUploader
 * - Renders a file input button
 * - Uploads selected image to POST /api/uploads (multipart/form-data field 'file')
 * - Shows progress and calls onUploaded(url, originalName) on success
 *
 * Props:
 * - onUploaded: function(url, originalName) => void
 * - className: optional
 * - buttonText: optional
 */


const ImageUploader = ({ onUploaded, className = '', buttonText = 'Insert image' }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await api.post('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        }
      });

      if (res?.data?.url) {
        onUploaded(res.data.url, res.data.originalName || file.name);
      } else {
        throw new Error('Upload did not return URL');
      }
    } catch (err) {
      console.error('Upload failed', err);
      setError(err?.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <label className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-md cursor-pointer hover:shadow-sm">
        <UploadCloud className="h-4 w-4 text-sky-600" />
        <span className="text-xs text-slate-600">{buttonText}</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {uploading && (
        <div className="text-xs text-slate-500">Uploading... {progress}%</div>
      )}
      {error && (
        <div className="text-xs text-red-600 flex items-center gap-1">
          <X className="h-3 w-3" /> {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;