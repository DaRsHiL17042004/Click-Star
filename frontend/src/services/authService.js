// src/services/authService.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/auth';

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Optional: Logout (if needed to handle token clean up)
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
