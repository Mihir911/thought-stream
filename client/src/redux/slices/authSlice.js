import { createSlice, createAsyncThunk, isAction } from "@reduxjs/toolkit";
import axios from 'axios';

const API_URL = 'api/auth'

//async thunks
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData)
            localStorage.setItem('token', response.data.token)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Registration failed' })
        }
    }
)

export const loginUser = createAsyncThunk(
    'auth/login',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, userData)
            localStorage.setItem('token', response.data.token)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Login failed'})
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('token'),
        isLoading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null,
            state.token = null,
            localStorage.removeItem('token')
        },
        clearError: (state) => {
            state.error = null
        },
    },

    extraReducers: (builder) => {
        builder
        .addCase(registerUser.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false
            state.user = action.payload.user
            state.token = action.payload.token
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload.token
        })
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false
            state.user = action.payload.user
            state.token = action.payload.token
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload?.message || 'Login failed'
        })
    },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
