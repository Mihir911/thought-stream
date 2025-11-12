import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { ThumbsUp, Heart, Zap } from "lucide-react";

const ReactionBar = ({blogId, initialReactions = [] }) => {
    const [reactions, setReactions] = useState(initialReactions);

    const sendReaction = async (type) => {
        try {
            const res = await api.post(`/blogs/${blogId}/like-reaction`, { type });

            //refetch or update locally - server returns reactions coount maybe
            // for simplicity just update local list length
            setReactions(prev => {
                const filtered = prev.filter(r => r.user !== 'me'); //naive
                return [...filtered, { type }];
            });
        } catch (err) {
            console.error('Reaction failed', err);
            
        }
    };

    return (
    <div className="flex items-center space-x-3">
      <button onClick={() => sendReaction('like')} className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100">
        <ThumbsUp className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-700">{reactions.filter(r => r.type === 'like').length}</span>
      </button>
      <button onClick={() => sendReaction('love')} className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100">
        <Heart className="h-4 w-4 text-red-500" />
        <span className="text-sm text-gray-700">{reactions.filter(r => r.type === 'love').length}</span>
      </button>
      <button onClick={() => sendReaction('clap')} className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100">
        <Zap className="h-4 w-4 text-yellow-500" />
        <span className="text-sm text-gray-700">{reactions.filter(r => r.type === 'clap').length}</span>
      </button>
    </div>
  );
};


export default ReactionBar;