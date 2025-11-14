import React, { useState } from "react";
import { Link, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, User, Menu, X, Search, Bookmark, Pen } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import Logo from '../../components/ui/Logo';
import ProtectedLink from "../auth/ProtectedLinks";



const Header = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth || {});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
  };


  return (
    <header className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-1 rounded-md bg-gradient-to-r from-sky-600 to-blue-600">
                <Logo className="h-9 w-auto" />
              </div>
              {/* <span className="hidden sm:inline-block text-lg font-extrabold text-slate-900">BlogSpace</span> */}
            </Link>
          </div>

          {/* Center: nav (desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            <ProtectedLink
              to="/feed"
              className="text-sm font-medium text-slate-700 hover:text-sky-600 transition"
            >
              For you
            </ProtectedLink>

            <NavLink
              to="/trending"
              className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-sky-600' : 'text-slate-700 hover:text-sky-600'}`}
            >
              Trending
            </NavLink>

            <NavLink
              to="/categories"
              className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-sky-600' : 'text-slate-700 hover:text-sky-600'}`}
            >
              Categories
            </NavLink>
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-4">
            {/* Search icon - opens site-wide search (could be wired later) */}
            <button
              aria-label="Search posts"
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              title="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Desktop CTA / Auth actions */}
            {token ? (
              <>
                <Link
                  to="/create"
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow"
                >
                  <Pen className="h-4 w-4" />
                  Write
                </Link>

                <div className="relative">
                  {/* Avatar button */}
                  <button
                    onClick={() => setUserMenuOpen(prev => !prev)}
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                    className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    title="Account"
                  >
                    <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-medium">
                      {user?.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </div>
                    <span className="hidden sm:inline-block text-sm text-slate-700">{user?.username || 'You'}</span>
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div
                      role="menu"
                      aria-label="Account menu"
                      className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-md shadow-lg z-40"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2"><User className="h-4 w-4 text-sky-600" /> Profile</div>
                      </Link>

                      <Link
                        to="/bookmarks"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2"><Bookmark className="h-4 w-4 text-sky-600" /> Saved</div>
                      </Link>

                      <Link
                        to="/create"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2"><Pen className="h-4 w-4 text-sky-600" /> New post</div>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <div className="flex items-center gap-2"><LogOut className="h-4 w-4" /> Logout</div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-sky-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(prev => !prev)}
              className="md:hidden p-2 rounded-md text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-3 space-y-2">
            <ProtectedLink to="/feed" className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50">For you</ProtectedLink>
            <Link to="/trending" className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50">Trending</Link>
            <Link to="/categories" className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50">Categories</Link>

            {token ? (
              <>
                <Link to="/create" className="block px-3 py-2 rounded-md bg-sky-600 text-white text-sm font-semibold">Write a post</Link>
                <Link to="/bookmarks" className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50">Saved</Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50">Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md bg-sky-600 text-white text-sm font-semibold">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;