import api from './api';

/**
 * Register a new user
 * @param {Object} userData - User registration data (name, email, password)
 * @returns {Promise} - Response data including user and token
 */
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

/**
 * Login a user
 * @param {Object} credentials - User login credentials (email, password)
 * @returns {Promise} - Response data including user and token
 */
const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

/**
 * Login a user with Google
 * @param {string} credential - Google OAuth credential ID token
 * @returns {Promise} - Response data including user and token
 */
const googleLogin = async (credential) => {
  try {
    console.log("Attempting Google login with backend...");
    const response = await api.post('/auth/google', { credential });
    console.log("Backend response received:", response.status);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error("AuthService Google Login Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * Logout the current user
 */
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get current logged in user from local storage
 * @returns {Object|null} - User object or null
 */
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Update current user data in local storage
 * @param {Object} userData - User object data
 */
const updateCurrentUser = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

const authService = {
  register,
  login,
  googleLogin,
  logout,
  getCurrentUser,
  updateCurrentUser,
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export default authService;
