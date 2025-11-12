import React from "react";
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, User, PenSquare } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';


const Header = () => {
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };


  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <PenSquare className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">BlogSpace</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Link to="/feed" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
              For you
            </Link>
            <Link to="/trending" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
              Trending
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
              Categories
            </Link>

            {token ? (
              <>
                <Link
                  to="/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Write Blog
                </Link>
                <div className="flex items-center space-x-3">
                  <Link to="/bookmarks" className="text-gray-600 hover:text-gray-900">
                    Saved
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {user?.username || 'Profile'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
