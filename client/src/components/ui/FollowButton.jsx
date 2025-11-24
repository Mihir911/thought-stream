import React, { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import api from '../../utils/api';
import { useSelector } from 'react-redux';

const FollowButton = ({ userId, isFollowing: initialIsFollowing, onToggle }) => {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(state => state.auth);

    if (!user || user._id === userId) return null;

    const handleFollow = async () => {
        try {
            setLoading(true);
            if (isFollowing) {
                await api.post(`/user/unfollow/${userId}`);
                setIsFollowing(false);
            } else {
                await api.post(`/user/follow/${userId}`);
                setIsFollowing(true);
            }
            if (onToggle) onToggle(!isFollowing);
        } catch (error) {
            console.error('Follow error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
                }`}
        >
            {isFollowing ? (
                <>
                    <UserCheck size={16} />
                    Following
                </>
            ) : (
                <>
                    <UserPlus size={16} />
                    Follow
                </>
            )}
        </button>
    );
};

export default FollowButton;
