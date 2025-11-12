import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Twitter, Github, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">BlogSpace</h3>
            <p className="text-gray-300 leading-relaxed">
              A modern blogging platform where writers share their stories, 
              ideas, and experiences with the world.
            </p>
            <div className="flex space-x-3">
              <a href="#" aria-label="Twitter" className="p-2 bg-gray-700 rounded-full hover:bg-blue-600 transition-colors duration-200">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Github" className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors duration-200">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Contact" className="p-2 bg-gray-700 rounded-full hover:bg-red-600 transition-colors duration-200">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200">Home</Link></li>
              <li><Link to="/feed" className="text-gray-300 hover:text-white transition-colors duration-200">For You</Link></li>
              <li><Link to="/trending" className="text-gray-300 hover:text-white transition-colors duration-200">Trending</Link></li>
              <li><Link to="/categories" className="text-gray-300 hover:text-white transition-colors duration-200">Categories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-300 hover:text-white transition-colors duration-200">Help Center</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors duration-200">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">Contact Us</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Community</h3>
            <ul className="space-y-2">
              <li><Link to="/writers" className="text-gray-300 hover:text-white transition-colors duration-200">Featured Writers</Link></li>
              <li><Link to="/guidelines" className="text-gray-300 hover:text-white transition-colors duration-200">Writing Guidelines</Link></li>
              <li><Link to="/events" className="text-gray-300 hover:text-white transition-colors duration-200">Community Events</Link></li>
              <li><Link to="/newsletter" className="text-gray-300 hover:text-white transition-colors duration-200">Newsletter</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400 flex items-center justify-center space-x-1">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by the BlogSpace Team • © {new Date().getFullYear()} All rights reserved</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer