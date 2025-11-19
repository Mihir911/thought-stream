import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { ThumbsUp, Heart, Zap, Lightbulb, Angry } from "lucide-react";

const ReactionBar = ({ blogId, initialReactions = [], userReaction, onReactionChange }) => {
    const [reactions, setReactions] = useState(initialReactions);

    useEffect(() => {
        setReactions(initialReactions);
    }, [initialReactions]);

    const sendReaction = async (type) => {
        try {
            const res = await api.post(`/blogs/${blogId}/like-reaction`, { type });
            
            if (res.data.success) {
                // Update local state
                if (userReaction === type) {
                    // Remove reaction if same type clicked
                    onReactionChange(null);
                    setReactions(prev => prev.filter(r => r.type !== type));
                } else {
                    // Add new reaction
                    onReactionChange(type);
                    setReactions(prev => [...prev.filter(r => r.type !== userReaction), { type, user: 'current' }]);
                }
            }
        } catch (err) {
            console.error('Reaction failed', err);
        }
    };

    const getReactionCount = (type) => {
        return reactions.filter(r => r.type === type).length;
    };

    const getReactionIcon = (type) => {
        switch (type) {
            case 'like': return <ThumbsUp className="h-4 w-4" />;
            case 'love': return <Heart className="h-4 w-4" />;
            case 'clap': return <Zap className="h-4 w-4" />;
            case 'insightful': return <Lightbulb className="h-4 w-4" />;
            case 'angry': return <Angry className="h-4 w-4" />;
            default: return <ThumbsUp className="h-4 w-4" />;
        }
    };

    return (
        <div className="flex items-center space-x-3">
            {['like', 'love', 'clap', 'insightful', 'angry'].map(reactionType => (
                <button 
                    key={reactionType}
                    onClick={() => sendReaction(reactionType)} 
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
                        userReaction === reactionType 
                            ? 'bg-blue-50 border-blue-200 text-blue-600' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {getReactionIcon(reactionType)}
                    <span className="text-sm capitalize">{reactionType}</span>
                    <span className="text-sm">{getReactionCount(reactionType)}</span>
                </button>
            ))}
        </div>
    );
};

export default ReactionBar;