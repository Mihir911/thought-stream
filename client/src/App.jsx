import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  const { token } = useSelector(state => state.auth)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center max-w-4xl mx-auto">
                  <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                    Share Your Stories<br />With the World
                  </h1>
                  <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
                    A beautiful platform to write, share, and discover amazing blog posts.
                    Join our community of passionate writers and readers.
                  </p>
                  {!token ? (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a 
                        href="/register" 
                        className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        Start Writing Now
                      </a>
                      <a 
                        href="/login" 
                        className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 text-lg font-semibold"
                      >
                        Sign In
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a 
                        href="/create" 
                        className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        Write Your First Blog
                      </a>
                      <a 
                        href="/blogs" 
                        className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 text-lg font-semibold"
                      >
                        Explore Blogs
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
