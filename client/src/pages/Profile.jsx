import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, Link as LinkIcon, Calendar, Mail, X, Camera } from 'lucide-react';
import api from '../utils/api';
import BlogCard from '../components/blog/BlogCard';
import FollowButton from '../components/ui/FollowButton';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    location: '',
    website: ''
  });

  const isOwnProfile = !id || (currentUser && currentUser._id === id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let userData;

        if (isOwnProfile) {
          userData = currentUser;
        } else {
          const res = await api.get(`/user/${id}`);
          userData = res.data.user;
        }

        setProfile(userData);

        // Fetch blogs
        if (userData) {
          const blogsRes = await api.get(`/blogs?author=${userData._id}&limit=20`);
          setBlogs(blogsRes.data.blogs || []);

          // Mock stats for now if not in user object
          setStats({
            followers: userData.followersCount || 0,
            following: userData.following?.length || 0
          });
        }

      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOwnProfile && !currentUser) {
      // Wait for auth or redirect? 
      // App.jsx handles auth check usually or we show loading
    } else {
      fetchData();
    }
  }, [id, currentUser, isOwnProfile]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">User not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">

        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.username}&background=random`}
              alt={profile.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-display font-bold text-gray-900">{profile.username}</h1>
                {!isOwnProfile && (
                  <FollowButton
                    userId={profile._id}
                    isFollowing={currentUser?.following?.includes(profile._id)}
                  />
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      setEditForm({
                        username: profile.username || '',
                        bio: profile.bio || '',
                        location: profile.location || '',
                        website: profile.website || ''
                      });
                      setIsEditing(true);
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <p className="text-gray-600 mb-4 max-w-2xl">{profile.bio || "No bio yet."}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <LinkIcon size={16} />
                    <a href={profile.website} target="_blank" rel="noreferrer" className="hover:text-primary-600 transition-colors">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <span className="block font-bold text-gray-900 text-lg">{blogs.length}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Stories</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-gray-900 text-lg">{stats.followers}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Followers</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-gray-900 text-lg">{stats.following}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex gap-8">
            <button className="pb-4 border-b-2 border-primary-600 text-primary-600 font-medium text-sm">
              Stories
            </button>
            <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">
              About
            </button>
          </nav>
        </div>

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No stories published yet.</p>
          </div>
        )}

      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
                  placeholder="Tell your story..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Where are you based?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <div className="relative">
                  <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={e => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="https://your-site.com"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await api.put('/user/profile', editForm);
                    setProfile(res.data.user);
                    setIsEditing(false);
                  } catch (err) {
                    console.error("Failed to update profile", err);
                  }
                }}
                className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
