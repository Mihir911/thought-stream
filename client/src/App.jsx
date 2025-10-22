import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'

function App() {
  const { token } = useSelector(state => state.auth)

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-800">
              Welcome to BlogSpace
            </h1>
            <p className="text-center text-gray-600 mt-4">
              {token ? 'You are logged in!' : 'Please log in to continue'}
            </p>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App
