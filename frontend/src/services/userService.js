import { apiCall } from './api';

export const userService = {
  async login(email, password) {
    const response = await apiCall('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  async getAll() {
    const response = await apiCall('/users/');
    if (response.ok) return response.json();
    return [];
  },

  async create(userData) {
    const response = await apiCall('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  },

  async update(userId, userData) {
    const response = await apiCall(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    return response;
  },

  async delete(userId) {
    const response = await apiCall(`/users/${userId}`, {
      method: 'DELETE',
    });
    return response;
  },
};