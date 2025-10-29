import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import { tradeService } from '../services/tradeService';

function TransfersPage({ accounts, onOpenTransferModal }) {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransfers();
    }
  }, [selectedAccount]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const data = await tradeService.getAccountTransfers(selectedAccount.id);
      setTransfers(data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transfer History</h2>
          <p className="text-gray-500 mt-1">View all money transfers between accounts</p>
        </div>
        <button
          onClick={onOpenTransferModal}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
          disabled={accounts.length === 0}
        >
          <ArrowRight className="w-5 h-5" />
          <span>New Transfer</span>
        </button>
      </div>

      {/* Account Selector */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Account to View Transfers
        </label>
        <select
          value={selectedAccount?.id || ''}
          onChange={(e) => {
            const account = accounts.find(a => a.id === parseInt(e.target.value));
            setSelectedAccount(account);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        >
          <option value="">Choose an account...</option>
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transfers List */}
      {selectedAccount && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transfers for {selectedAccount.name}
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-2">Loading transfers...</p>
            </div>
          ) : transfers.length > 0 ? (
            <div className="space-y-3">
              {transfers.map((transfer) => (
                <div
                  key={transfer.transfer_id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    transfer.type === 'incoming'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-3 rounded-full ${
                      transfer.type === 'incoming' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transfer.type === 'incoming' ? (
                        <ArrowLeft className={`w-6 h-6 ${
                          transfer.type === 'incoming' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      ) : (
                        <ArrowRight className={`w-6 h-6 ${
                          transfer.type === 'incoming' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          transfer.type === 'incoming'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transfer.type === 'incoming' ? 'Received' : 'Sent'}
                        </span>
                      </div>
                      
                      <p className="font-semibold text-gray-900">
                        {transfer.type === 'incoming' 
                          ? `From: ${transfer.from_account_name || 'Unknown'}`
                          : `To: ${transfer.to_account_name || 'Unknown'}`
                        }
                      </p>
                      
                      {transfer.description && (
                        <p className="text-sm text-gray-600 mt-1">{transfer.description}</p>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(transfer.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className={`text-2xl font-bold ${
                      transfer.type === 'incoming' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transfer.type === 'incoming' ? '+' : '-'}€{transfer.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {transfer.transfer_id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transfers yet</h3>
              <p className="text-gray-500 mb-4">
                Start transferring money between accounts
              </p>
              <button
                onClick={onOpenTransferModal}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Make a Transfer</span>
              </button>
            </div>
          )}
        </div>
      )}

      {!selectedAccount && accounts.length > 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
          <ArrowRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an account</h3>
          <p className="text-gray-500">Choose an account above to view its transfer history</p>
        </div>
      )}

      {accounts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
          <p className="text-gray-500">Create an account first to start making transfers</p>
        </div>
      )}
    </div>
  );
}

export default TransfersPage;