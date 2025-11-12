import React, { useState } from 'react';
import api from '../../utils/api';

const Comment = ({ comment, onReply, onUpvote }) => {
  return (
    <div className="border-b py-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium">{comment.user?.username || 'User'}</div>
          <div className="text-sm text-gray-700 mt-1">{comment.text}</div>
          <div className="text-xs text-gray-400 mt-2">{new Date(comment.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex flex-col items-end">
          <button onClick={() => onUpvote(comment._id)} className="text-sm text-gray-500 hover:text-gray-700">▲ {comment.upvotes?.length || 0}</button>
          <button onClick={() => onReply(comment._id)} className="text-xs text-blue-600 mt-2">Reply</button>
        </div>
      </div>

      {comment.children?.length ? (
        <div className="pl-6 mt-3">
          {comment.children.map(c => <Comment key={c._id} comment={c} onReply={onReply} onUpvote={onUpvote} />)}
        </div>
      ) : null}
    </div>
  );
};

const Comments = ({ blogId, comments = [], refresh }) => {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [posting, setPosting] = useState(false);

  const postComment = async () => {
    if (!text.trim()) return;
    try {
      setPosting(true);
      await api.post(`/blogs/${blogId}/comment`, { text, parent: replyTo });
      setText('');
      setReplyTo(null);
      refresh && refresh();
    } catch (err) {
      console.error('Comment failed', err);
    } finally {
      setPosting(false);
    }
  };

  const handleUpvote = async (commentId) => {
    try {
      await api.post(`/blogs/${blogId}/comment/${commentId}/upvote`);
      refresh && refresh();
    } catch (err) {
      console.error('Upvote failed', err);
    }
  };

  const nested = buildTree(comments || []);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Comments</h3>

      <div className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="3"
          className="w-full p-3 border rounded-md"
          placeholder={replyTo ? 'Replying...' : 'Add a comment...'}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-gray-500">{replyTo ? 'Replying to a comment' : ''}</div>
          <div className="flex items-center gap-2">
            {replyTo && <button onClick={() => setReplyTo(null)} className="text-sm text-gray-500">Cancel</button>}
            <button onClick={postComment} disabled={posting} className="bg-blue-600 text-white px-4 py-1 rounded-md">
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {nested.map(c => <Comment key={c._id} comment={c} onReply={(id) => setReplyTo(id)} onUpvote={handleUpvote} />)}
      </div>
    </div>
  );
};

// helper: build tree of comments from flat array (parent references)
function buildTree(flat = []) {
  const map = {};
  flat.forEach(c => { map[c._id] = { ...c, children: [] }; });
  const roots = [];
  flat.forEach(c => {
    if (c.parent) {
      const parent = map[c.parent];
      if (parent) parent.children.push(map[c._id]);
      else roots.push(map[c._id]);
    } else {
      roots.push(map[c._id]);
    }
  });
  return roots;
}

export default Comments;