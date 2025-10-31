import { apiCall } from './api';

export const feedService = {
  async getTopTraders(limit = 10) {
    const response = await apiCall(`/feed/top-traders?limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      return data.traders || [];
    }
    return [];
  },

  async getRecentTrades(limit = 20, days = 7) {
    const response = await apiCall(`/feed/recent-trades?limit=${limit}&days=${days}`);
    if (response.ok) {
      const data = await response.json();
      return data.trades || [];
    }
    return [];
  },

  async getTrendingStocks(days = 7) {
    const response = await apiCall(`/feed/trending-stocks?days=${days}`);
    if (response.ok) {
      const data = await response.json();
      return data.trending_stocks || [];
    }
    return [];
  },

  async getTraderProfile(userId) {
    const response = await apiCall(`/feed/trader/${userId}`);
    if (response.ok) return response.json();
    return null;
  },
};