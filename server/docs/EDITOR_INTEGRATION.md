# Frontend integration plan — Editor choice & mapping

This document describes the recommended frontend plan and mapping between the editor (TipTap) and the backend we've implemented.

1) Editor choice
- TipTap (v2) recommended (@tiptap/react)
  - ProseMirror-based, rich extension ecosystem, good image node control, produces JSON doc that can be stored directly as `contentBlocks`.

2) Data mapping
- TipTap JSON <-> Blog.contentBlocks (store tiptap doc JSON as `contentBlocks`)
- Image node attrs:
  - `uploadId`: Upload document ID (ObjectId string)
  - `src`: download URL returned by POST /api/uploads
  - `alt`, `caption`, `width`, `float` (string attrs)
- On publish: POST /api/blogs body:
  {
    title,
    contentBlocks: <tiptap JSON>,
    categories: [...],
    tags: [...],
    coverUpload: <uploadId> (optional),
    isPublished: true
  }

3) Image upload flow
- When user inserts file:
  - POST /api/uploads (multipart/form-data, field "file") with Authorization header.
  - On 201: response includes `upload.id` and `urls.download` and `urls.thumbnailMedium`.
  - Insert image node:
    {
      type: 'image',
      attrs: {
        uploadId: '<uploadId>',
        src: '<urls.thumbnailMedium || urls.download>',
        alt: '',
        caption: '',
        width: 'auto',
        float: ''
      }
    }
  - Persist metadata changes (alt/caption/width/float) via PATCH /api/uploads/:id/metadata (non-blocking).

4) Autosave and drafts
- Periodically (idle or every N seconds) PUT or POST to:
  - POST /api/drafts -> create if none
  - PUT /api/drafts/:id -> update
- Payload: { title, contentBlocks, coverUpload, tags, categories, isPublished: false }
- On page load, try to GET /api/drafts to recover a draft.

5) Image editing UI
- Floating toolbar for selected image node:
  - Resize presets (small/medium/full), custom width input (px/%)
  - Alignment (left/center/right)
  - Alt and caption editor
  - Replace: triggers file upload and updates node attrs
  - Delete: remove node and optionally PATCH /api/uploads/:id to decrement usageCount (backend cleanup job preferred).

6) Read-only rendering
- Use TipTap's HTML serializer on the server or client to render `contentBlocks` to HTML for BlogDetail.
- For images: render `<img src="/api/uploads/<id>/thumbnail/medium" style="width:60%" alt="...">` and render captions.

7) Performance & production notes
- Use thumbnails for feed cards; full original for detail view.
- Consider moving to S3 + CDN later — Upload doc can store external URLs.
- Add client-side validation for file type and max size.
- Implement optimistic UI and show upload progress.

8) Minimal dependency list for frontend
- @tiptap/react, @tiptap/core, @tiptap/starter-kit, @tiptap/extension-image
- axios (already used), react-hot-toast (optional), clsx (optional)

9) Example plugin/extension mapping (pseudo)
- Image extension with addAttributes: uploadId, src, alt, caption, width, float
- Commands:
  - insertImage({ uploadId, src }) -> editor.chain().focus().setImage({ uploadId, src }).run()
  - updateImageAttrs(id, attrs) -> editor.commands.updateAttributes('image', attrs)

---

Keep this file as the single source-of-truth for frontend mapping. After you confirm, I'll produce a React TipTap Editor component with:
- toolbar (bold/italic/h1..h4/list/quote/link),
- image upload button (opens file picker, calls POST /api/uploads),
- floating image toolbar (resize/align/alt/caption),
- autosave to /api/drafts.