import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ArrowRight, Cpu, Code, Palette, Coffee, Plane,
  Utensils, Heart, Briefcase, GraduationCap, FlaskConical,
  TrendingUp, Film, Trophy, Music, Brush, Sparkles
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced metadata with specific icons and gradients
  const categoryMeta = {
    'Technology': {
      icon: Cpu,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      gradient: 'from-blue-500 to-cyan-500',
      desc: 'The latest in tech and innovation.'
    },
    'Programming': {
      icon: Code,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      gradient: 'from-indigo-500 to-purple-500',
      desc: 'Coding tips, tutorials, and best practices.'
    },
    'Design': {
      icon: Palette,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      gradient: 'from-pink-500 to-rose-500',
      desc: 'UI/UX, graphic design, and creative inspiration.'
    },
    'Lifestyle': {
      icon: Coffee,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      gradient: 'from-amber-500 to-orange-500',
      desc: 'Living your best life, every day.'
    },
    'Travel': {
      icon: Plane,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      gradient: 'from-sky-500 to-blue-500',
      desc: 'Explore the world with us.'
    },
    'Food': {
      icon: Utensils,
      color: 'text-red-600',
      bg: 'bg-red-50',
      gradient: 'from-red-500 to-orange-500',
      desc: 'Delicious recipes and culinary adventures.'
    },
    'Health': {
      icon: Heart,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      gradient: 'from-emerald-500 to-teal-500',
      desc: 'Wellness, fitness, and mental health.'
    },
    'Business': {
      icon: Briefcase,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      gradient: 'from-slate-500 to-gray-500',
      desc: 'Entrepreneurship, startups, and career advice.'
    },
    'Education': {
      icon: GraduationCap,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      gradient: 'from-violet-500 to-purple-500',
      desc: 'Learning resources and academic insights.'
    },
    'Science': {
      icon: FlaskConical,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      gradient: 'from-teal-500 to-emerald-500',
      desc: 'Discoveries that change our understanding.'
    },
    'Finance': {
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      gradient: 'from-green-500 to-emerald-500',
      desc: 'Money management and investment strategies.'
    },
    'Entertainment': {
      icon: Film,
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-50',
      gradient: 'from-fuchsia-500 to-pink-500',
      desc: 'Movies, music, and pop culture.'
    },
    'Sports': {
      icon: Trophy,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      gradient: 'from-orange-500 to-red-500',
      desc: 'News, analysis, and highlights.'
    },
    'Art': {
      icon: Brush,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      gradient: 'from-rose-500 to-pink-500',
      desc: 'Creative expression in all forms.'
    },
    'Music': {
      icon: Music,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      gradient: 'from-cyan-500 to-blue-500',
      desc: 'Rhythms, beats, and melodies.'
    }
  };

  useEffect(() => {
    setCategories(Object.keys(categoryMeta));
    setLoading(false);
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center justify-center p-2 bg-white rounded-full shadow-sm mb-8 border border-gray-100">
            <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              Discover
            </span>
            <span className="px-3 text-sm font-medium text-gray-600">
              Explore by topic
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6 tracking-tight">
            Find your next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600">
              favorite story
            </span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 leading-relaxed">
            Browse through our curated collection of categories. From technology to travel, find the content that speaks to you.
          </p>

          <div className="relative max-w-lg mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
            <div className="relative bg-white rounded-2xl shadow-xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
              <input
                type="text"
                placeholder="Search for a topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-transparent border-none outline-none text-lg text-gray-900 placeholder-gray-400 rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const meta = categoryMeta[cat] || {
              icon: Sparkles,
              color: 'text-gray-600',
              bg: 'bg-gray-50',
              gradient: 'from-gray-500 to-slate-500',
              desc: 'Explore this topic.'
            };
            const Icon = meta.icon;

            return (
              <Link
                key={cat}
                to={`/category/${cat}`}
                className="group relative bg-white rounded-3xl p-1 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50" />

                <div className="relative h-full bg-white rounded-[20px] p-6 flex flex-col border border-gray-100 group-hover:border-transparent transition-colors">
                  {/* Icon Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3.5 rounded-2xl ${meta.bg} ${meta.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={28} strokeWidth={2} />
                    </div>
                    <div className="p-2 rounded-full bg-gray-50 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                      <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all">
                      {cat}
                    </h3>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      {meta.desc}
                    </p>
                  </div>

                  {/* Hover Gradient Line */}
                  <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${meta.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                </div>
              </Link>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500">We couldn't find any topics matching "{searchTerm}"</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Categories;