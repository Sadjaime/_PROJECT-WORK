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

  async withdraw(accountId, amount, description) {
    const response = await apiCall('/trades/money', {
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        type: 'WITHDRAW',
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

  async transferMoney(transferData) {
    const response = await apiCall('/trades/transfer', {
      method: 'POST',
      body: JSON.stringify(transferData),
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

  async getAccountBalance(accountId) {
    const response = await apiCall(`/trades/account/${accountId}/balance`);
    if (response.ok) return response.json();
    return null;
  },

  async getAccountTransfers(accountId) {
    const response = await apiCall(`/trades/account/${accountId}/transfers`);
    if (response.ok) {
      const data = await response.json();
      return data.transfers || [];
    }
    return [];
  },
};