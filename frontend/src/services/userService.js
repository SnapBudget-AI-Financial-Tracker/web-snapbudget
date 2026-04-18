import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const userService = {
  uploadAvatar: async (file) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post(`${API_URL}/users/avatar`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  updateProfile: async (name) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await axios.put(`${API_URL}/users/profile`, { name }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
  }
};
