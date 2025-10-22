import { createSlice } from '@reduxjs/toolkit'

const blogSlice = createSlice({
  name: 'blogs',
  initialState: {
    blogs: [],
    currentBlog: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearBlogError: (state) => {
      state.error = null
    },
    setBlogs: (state, action) => {
      state.blogs = action.payload
    },
    setCurrentBlog: (state, action) => {
      state.currentBlog = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { clearBlogError, setBlogs, setCurrentBlog, setLoading, setError } = blogSlice.actions
export default blogSlice.reducer
