import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Categories from './pages/Categories';
import CategoryPage from './pages/CategoryPage';
import Profile from './pages/Profile';
import About from './pages/About';
import Trending from './pages/Trending';
import BlogDetail from './pages/BlogDetail';
import Bookmarks from './pages/Bookmarks';
import HybridFeed from './pages/HybridFeed';


function App() {
  const { token } = useSelector(state => state.auth);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:category" element={<CategoryPage />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/feed" element={<HybridFeed />} />


          {/* fallback to landing */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;