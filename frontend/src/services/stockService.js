import { apiCall } from './api';

export const stockService = {
  async getAll() {
    const response = await apiCall('/stocks');
    if (response.ok) return response.json();
    return [];
  },

  async getTopPerformers(limit = 10) {
    const response = await apiCall(`/stocks/performance/top?limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      return data.stocks || [];
    }
    return [];
  },

  async getWorstPerformers(limit = 10) {
    const response = await apiCall(`/stocks/performance/worst?limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      return data.stocks || [];
    }
    return [];
  },

  async getMostTraded(limit = 10) {
    const response = await apiCall(`/stocks/most-traded?limit=${limit}`);
    if (response.ok) return response.json();
    return [];
  },
};