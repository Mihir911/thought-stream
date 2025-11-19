import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, BookOpen, Users, TrendingUp, Search } from 'lucide-react';
import api from '../utils/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        setLoading(true);
        
        // Get some blogs to extract popular categories
        const response = await api.get('/blogs?limit=50');
        const blogs = response.data.blogs || [];
        
        // Extract and count categories
        const categoryCounts = {};
        blogs.forEach(blog => {
          blog.categories?.forEach(category => {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          });
        });

        // Create category objects with counts
        const categoryData = Object.entries(categoryCounts)
          .map(([name, count]) => ({
            name,
            count,
            // Mock trending status (you can replace with actual trending logic)
            trending: count > 5
          }))
          .sort((a, b) => b.count - a.count);

        setCategories(categoryData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to default categories
        setCategories(getDefaultCategories());
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesData();
  }, []);

  const getDefaultCategories = () => {
    const defaultCats = [
      'Technology', 'Programming', 'Design', 'Lifestyle', 'Travel',
      'Food', 'Health', 'Business', 'Education', 'Science',
      'Finance', 'Entertainment', 'Sports', 'Art', 'Music'
    ];
    
    return defaultCats.map(name => ({
      name,
      count: Math.floor(Math.random() * 50) + 10,
      trending: Math.random() > 0.7
    }));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const popularCategories = categories
    .filter(cat => cat.trending)
    .slice(0, 6);

  const CategoryCard = ({ category, showCount = true }) => (
    <Link
      to={`/categories/${category.name}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 group hover:border-primary-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="text-white font-bold text-lg">
            {category.name[0].toUpperCase()}
          </span>
        </div>
        {category.trending && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>Trending</span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {category.name}
      </h3>
      
      {showCount && (
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{category.count} stories</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{Math.floor(category.count * 2.5)} readers</span>
          </div>
        </div>
      )}
    </Link>
  );

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="flex space-x-4">
        <div className="w-20 h-4 bg-gray-200 rounded"></div>
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Grid className="h-6 w-6 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Explore Categories</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover stories organized by topics that matter to you. 
            Find your next favorite read in any category.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg shadow-sm"
            />
          </div>
        </div>

        {/* Popular Categories */}
        {popularCategories.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Popular Categories</h2>
              <div className="flex items-center space-x-2 text-primary-600">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Most active communities</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCategories.map(category => (
                <CategoryCard key={category.name} category={category} />
              ))}
            </div>
          </section>
        )}

        {/* All Categories */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              All Categories
              {searchTerm && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({filteredCategories.length} results)
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <LoadingSkeleton key={index} />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Grid className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? `No categories matching "${searchTerm}"` : 'No categories available at the moment'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCategories.map(category => (
                <CategoryCard key={category.name} category={category} />
              ))}
            </div>
          )}
        </section>

        {/* Category Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {categories.length}+
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {categories.reduce((sum, cat) => sum + cat.count, 0).toLocaleString()}+
              </div>
              <div className="text-gray-600">Total Stories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {Math.floor(categories.reduce((sum, cat) => sum + cat.count, 0) * 2.5).toLocaleString()}+
              </div>
              <div className="text-gray-600">Active Readers</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary-500 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Can't find your category?</h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Start writing about topics you're passionate about and help grow our community. 
              Your stories might just create a new trending category!
            </p>
            <Link
              to="/create"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Start Writing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;