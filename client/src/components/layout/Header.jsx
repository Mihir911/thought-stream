import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import Logo from "../ui/Logo";
import api from "../../utils/api";
import {
  Menu,
  X,
  Search,
  User,
  Bell,
  PenSquare,
  LogOut,
  Sparkles,
  TrendingUp,
  Grid,
  Settings,
  Bookmark
} from "lucide-react";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (token) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/user/notifications');
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.notifications.filter(n => !n.isRead).length);
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      };
      fetchNotifications();
      // Poll every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate("/");
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoadingSearch(true);
      const res = await api.get(`/search?q=${val}`);
      setResults(res.data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/user/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking read", error);
    }
  };

  const navLinks = [
    { path: "/feed", label: "For You", icon: Sparkles },
    { path: "/trending", label: "Trending", icon: TrendingUp },
    { path: "/categories", label: "Categories", icon: Grid },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium ${isActive(link.path)
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                    }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2.5 rounded-full transition-colors ${searchOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <Search size={20} />
              </button>

              {searchOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
                  <div className="p-3 border-b border-gray-100">
                    <input
                      autoFocus
                      type="text"
                      value={query}
                      onChange={handleSearch}
                      placeholder="Search stories, people, tags..."
                      className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 text-sm"
                    />
                  </div>
                  {query && (
                    <div className="max-h-[60vh] overflow-y-auto">
                      {loadingSearch ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                      ) : results.length > 0 ? (
                        <div className="py-2">
                          {results.map((item) => (
                            <Link
                              key={item._id}
                              to={`/blogs/${item._id}`}
                              onClick={() => { setSearchOpen(false); setQuery(""); }}
                              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{item.title}</h4>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.excerpt || "No description"}</p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">No results found</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {token ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors relative"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={async () => {
                              await api.put('/user/notifications/read-all');
                              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                              setUnreadCount(0);
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-primary-50/30' : ''}`}
                              onClick={() => markAsRead(notif._id)}
                            >
                              <div className="flex gap-3">
                                <img
                                  src={notif.sender?.profilePicture || `https://ui-avatars.com/api/?name=${notif.sender?.username}&background=random`}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800">
                                    <span className="font-medium">{notif.sender?.username}</span> {notif.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                {!notif.isRead && (
                                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="ml-2 flex items-center gap-2 p-1 pr-3 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <img
                      src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=random`}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[100px] truncate">
                      {user?.username}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in p-2">
                      <div className="px-4 py-3 border-b border-gray-100 mb-2">
                        <p className="font-medium text-gray-900">{user?.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/create"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                      >
                        <PenSquare size={18} /> Write a Story
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                      >
                        <User size={18} /> Profile
                      </Link>

                      <Link
                        to="/bookmarks"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                      >
                        <Bookmark size={18} /> Library
                      </Link>

                      <Link
                        to="/my-blogs"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                      >
                        <Grid size={18} /> My Stories
                      </Link>

                      <div className="h-px bg-gray-100 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 text-red-600 text-sm font-medium transition-colors"
                      >
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link
                  to="/login"
                  className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-full transition-all shadow-lg shadow-gray-900/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-full text-gray-600 hover:bg-gray-100 ml-1"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-xl animate-slide-down">
          <div className="p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${isActive(link.path)
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
            {!token && (
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex justify-center px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
