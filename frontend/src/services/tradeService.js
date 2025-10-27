import { apiCall } from './api';

export const tradeService = {
  async deposit(accountId, amount, description) {
    const response = await apiCall('/trades/money', {
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        type: 'DEPOSIT',
        amount,
        description,
      }),
    });
    return response;
  },

  async executeTrade(tradeData) {
    const response = await apiCall('/trades/stocks', {
      method: 'POST',
      body: JSON.stringify(tradeData),
    });
    return response;
  },

  async getAccountTrades(accountId) {
    const response = await apiCall(`/trades/account/${accountId}`);
    if (response.ok) return response.json();
    return [];
  },

  async getAccountPositions(accountId) {
    const response = await apiCall(`/positions/account/${accountId}`);
    if (response.ok) return response.json();
    return [];
  },
};