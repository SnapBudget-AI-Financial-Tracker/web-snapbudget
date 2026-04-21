import api from './api';

/**
 * Get user budget settings
 * @returns {Promise<Object>} Budget settings
 */
const getBudgetSettings = async () => {
  const response = await api.get('/users/budget');
  return response.data;
};

/**
 * Update user budget settings
 * @param {Object} budgetData Budget data
 * @returns {Promise<Object>} Updated user
 */
const updateBudget = async (budgetData) => {
  const response = await api.put('/users/budget', budgetData);
  return response.data;
};

/**
 * Update user profile
 * @param {Object} profileData Profile data
 * @returns {Promise<Object>} Updated user
 */
const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

/**
 * Upload user avatar
 * @param {File} file Avatar file
 * @returns {Promise<Object>} Upload result
 */
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const userService = {
  getBudgetSettings,
  updateBudget,
  updateProfile,
  uploadAvatar,
};

export default userService;
