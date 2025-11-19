import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './redux/store';
import { fetchUserProfile } from './redux/slices/authSlice';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages (we'll create these next)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForYou from './pages/ForYou';
import Trending from './pages/Trending';
import Categories from './pages/Categories';
import CategoryPage from './pages/CategoryPage';
import BlogDetail from './pages/BlogDetail';
import CreateBlog from './pages/CreateBlog';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import MyBlogs from './pages/MyBlogs';
import Drafts from './pages/Drafts';
import About from './pages/About';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
  </div>
);

// App content component
const AppContent = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [appLoading, setAppLoading] = React.useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      if (token) {
        try {
          await dispatch(fetchUserProfile()).unwrap();
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
        }
      }
      setAppLoading(false);
    };

    initializeApp();
  }, [dispatch, token]);

  if (appLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<ForYou />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:category" element={<CategoryPage />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/create" element={<CreateBlog />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/my-blogs" element={<MyBlogs />} />
          <Route path="/drafts" element={<Drafts />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// Main App component
function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;