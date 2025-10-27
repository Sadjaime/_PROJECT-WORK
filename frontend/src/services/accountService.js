import { apiCall } from './api';

export const accountService = {
  async getAll() {
    const response = await apiCall('/accounts/');
    if (response.ok) return response.json();
    return [];
  },

  async create(accountData) {
    const response = await apiCall('/accounts/', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
    return response;
  },

  async update(accountId, accountData) {
    const response = await apiCall(`/accounts/${accountId}`, {
      method: 'PATCH',
      body: JSON.stringify(accountData),
    });
    return response;
  },

  async delete(accountId) {
    const response = await apiCall(`/accounts/?account_id=${accountId}`, {
      method: 'DELETE',
    });
    return response;
  },

  async getBalance(accountId) {
    const response = await apiCall(`/trades/account/${accountId}/balance`);
    if (response.ok) return response.json();
    return null;
  },
};