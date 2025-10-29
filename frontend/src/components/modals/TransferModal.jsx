import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';

function TransferModal({ 
  accounts, 
  allAccounts,
  currentUser,
  selectedAccount, 
  onClose, 
  onSubmit, 
  loading 
}) {
  const [formData, setFormData] = useState({
    from_account_id: selectedAccount?.id || '',
    to_account_id: '',
    amount: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const fromAccount = accounts.find(a => a.id === parseInt(formData.from_account_id));
  const toAccount = allAccounts.find(a => a.id === parseInt(formData.to_account_id));
  
  // Filter out the selected source account from destination options
  const availableDestinations = allAccounts.filter(
    a => a.id !== parseInt(formData.from_account_id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Transfer Money</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* From Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Account
            </label>
            <select
              value={formData.from_account_id}
              onChange={(e) => setFormData({ ...formData, from_account_id: e.target.value, to_account_id: '' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
              required
            >
              <option value="">Select source account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            {fromAccount && (
              <p className="text-sm text-gray-500 mt-2">
                Available balance: <span className="font-semibold">€{fromAccount.balance?.toFixed(2) || '0.00'}</span>
              </p>
            )}
          </div>

          {/* Visual Arrow */}
          <div className="flex justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <ArrowRight className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          {/* To Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Account
            </label>
            <select
              value={formData.to_account_id}
              onChange={(e) => setFormData({ ...formData, to_account_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
              required
              disabled={!formData.from_account_id}
            >
              <option value="">Select destination account</option>
              <optgroup label="Your Accounts">
                {availableDestinations
                  .filter(a => a.user_id === currentUser.id)
                  .map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Other Users' Accounts">
                {availableDestinations
                  .filter(a => a.user_id !== currentUser.id)
                  .map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} (User ID: {account.user_id})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                €
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="What's this transfer for?"
              maxLength={200}
            />
          </div>

          {/* Transfer Summary */}
          {formData.from_account_id && formData.to_account_id && formData.amount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Transfer Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-800">From:</span>
                  <span className="font-semibold text-blue-900">
                    {fromAccount?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">To:</span>
                  <span className="font-semibold text-blue-900">
                    {toAccount?.name}
                  </span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-blue-200">
                  <span className="text-blue-800">Amount:</span>
                  <span className="font-bold text-blue-900">
                    €{parseFloat(formData.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Transfer Money
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransferModal;