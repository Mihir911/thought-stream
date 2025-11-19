import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  User, 
  Edit3, 
  BookOpen, 
  Eye, 
  Heart, 
  Bookmark, 
  Calendar,
  Mail,
  Clock,
  TrendingUp,
  FileText,
  Users,
  Award
} from 'lucide-react';
import api from '../utils/api';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const [userBlogs, setUserBlogs] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's blogs
        const blogsResponse = await api.get('/blogs?author=' + user.id + '&limit=10');
        const blogs = blogsResponse.data.blogs || [];
        setUserBlogs(blogs);

        // Calculate user stats
        const totalViews = blogs.reduce((sum, blog) => sum + (blog.viewsCount || 0), 0);
        const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0);
        const totalReadTime = blogs.reduce((sum, blog) => sum + (blog.readTime || 0), 0);
        const avgReadTime = blogs.length > 0 ? Math.round(totalReadTime / blogs.length) : 0;

        setUserStats({
          totalBlogs: blogs.length,
          totalViews,
          totalLikes,
          avgReadTime,
          memberSince: new Date(user.createdAt).getFullYear(),
          readingTime: Math.floor(totalReadTime * 1.2) // Estimated reading time
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const BlogCard = ({ blog }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-2">
          {blog.categories?.slice(0, 2).map(category => (
            <span 
              key={category} 
              className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium"
            >
              {category}
            </span>
          ))}
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{blog.viewsCount || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span>{blog.likes?.length || 0}</span>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {blog.title}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {blog.excerpt || 'No description available...'}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{blog.readTime || 5} min read</span>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600 mt-1">{label}</p>
        </div>
        <div className={`p-3 rounded-lg ${
          color === 'primary' ? 'bg-primary-100 text-primary-600' :
          color === 'green' ? 'bg-green-100 text-green-600' :
          color === 'orange' ? 'bg-orange-100 text-orange-600' :
          'bg-purple-100 text-purple-600'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-primary-500 to-blue-600"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
              <div className="flex items-end space-x-6">
                <div className="w-32 h-32 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center">
                  <div className="w-28 h-28 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-4xl font-bold">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="pb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                  <p className="text-gray-600 mt-1">Writer & Storyteller</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={FileText} 
              label="Total Stories" 
              value={userStats.totalBlogs} 
              color="primary"
            />
            <StatCard 
              icon={Eye} 
              label="Total Views" 
              value={userStats.totalViews.toLocaleString()} 
              color="green"
            />
            <StatCard 
              icon={Heart} 
              label="Total Likes" 
              value={userStats.totalLikes.toLocaleString()} 
              color="orange"
            />
            <StatCard 
              icon={Clock} 
              label="Avg Read Time" 
              value={`${userStats.avgReadTime}m`} 
              color="purple"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Writing Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stories Published</span>
                  <span className="font-medium text-gray-900">{userStats?.totalBlogs || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Words</span>
                  <span className="font-medium text-gray-900">
                    {((userStats?.totalBlogs || 0) * 800).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reading Time</span>
                  <span className="font-medium text-gray-900">
                    {userStats?.readingTime || 0}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {userStats?.memberSince || new Date().getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests?.length > 0 ? (
                  user.interests.map(interest => (
                    <span 
                      key={interest.category}
                      className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                    >
                      {interest.category}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No interests selected yet</p>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">First Story</div>
                    <div className="text-xs text-gray-500">Published your first story</div>
                  </div>
                </div>
                {userStats?.totalBlogs >= 5 && (
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Prolific Writer</div>
                      <div className="text-xs text-gray-500">Published 5+ stories</div>
                    </div>
                  </div>
                )}
                {userStats?.totalViews >= 1000 && (
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Popular Writer</div>
                      <div className="text-xs text-gray-500">1,000+ total views</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp },
                  { id: 'stories', label: 'My Stories', icon: BookOpen },
                  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
                  { id: 'analytics', label: 'Analytics', icon: Users }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Writing Overview</h3>
                    {userStats?.totalBlogs === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Start Your Writing Journey</h4>
                        <p className="text-gray-600 mb-6">
                          You haven't published any stories yet. Share your first story with the community!
                        </p>
                        <button className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                          Write Your First Story
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-primary-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-primary-600">{userStats?.totalBlogs}</div>
                            <div className="text-sm text-primary-700">Stories Published</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{userStats?.totalViews.toLocaleString()}</div>
                            <div className="text-sm text-green-700">Total Views</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{userStats?.totalLikes.toLocaleString()}</div>
                            <div className="text-sm text-orange-700">Total Likes</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
                          <div className="space-y-3">
                            {userBlogs.slice(0, 3).map(blog => (
                              <div key={blog._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">{blog.title}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(blog.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'stories' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">My Stories</h3>
                      <span className="text-sm text-gray-500">
                        {userBlogs.length} story{userBlogs.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                          <div key={index} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded mb-4"></div>
                            <div className="flex justify-between">
                              <div className="w-24 h-4 bg-gray-200 rounded"></div>
                              <div className="w-20 h-4 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : userBlogs.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No Stories Yet</h4>
                        <p className="text-gray-600 mb-6">
                          Start sharing your thoughts and stories with the community
                        </p>
                        <button className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                          Write Your First Story
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userBlogs.map(blog => (
                          <BlogCard key={blog._id} blog={blog} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'bookmarks' && (
                  <div className="text-center py-12">
                    <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Bookmarks</h4>
                    <p className="text-gray-600">
                      Stories you've saved will appear here
                    </p>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h4>
                    <p className="text-gray-600">
                      Detailed analytics and insights coming soon
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;