import React from 'react';
import { Wallet, Plus, Edit2, Trash2 } from 'lucide-react';

function AccountsPage({ 
  accounts, 
  accountBalances, 
  onCreateAccount, 
  onEditAccount, 
  onDeleteAccount, 
  onDeposit, 
  onSelectAccount 
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Accounts</h2>
          <p className="text-gray-500 mt-1">Manage your investment accounts</p>
        </div>
        <button
          onClick={onCreateAccount}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Account</span>
        </button>
      </div>

      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => (
            <div key={account.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditAccount(account)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteAccount(account.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{account.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Account ID: {account.id}</p>
              <div className="pt-4 border-t border-gray-200 mb-4">
                <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">${(accountBalances[account.id] || 0).toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onDeposit(account)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                >
                  Deposit
                </button>
                <button
                  onClick={() => onSelectAccount(account)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                >
                  Trade
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Created: {new Date(account.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
          <p className="text-gray-500 mb-6">Create your first account to start managing your investments</p>
          <button
            onClick={onCreateAccount}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Account</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountsPage;