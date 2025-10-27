import React from 'react';
import { ShoppingCart, TrendingDown, History, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function TradingPage({ 
  accounts, 
  stocks, 
  selectedAccount, 
  setSelectedAccount, 
  accountTrades, 
  accountPositions, 
  accountBalances, 
  onTrade, 
  onDeposit 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Trading Center</h2>
        <p className="text-gray-500 mt-1">Buy and sell stocks from your accounts</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Trading Account</label>
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
              {account.name} - Balance: ${(accountBalances[account.id] || 0).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {selectedAccount && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg">
              <p className="text-green-100 mb-1">Available Balance</p>
              <p className="text-3xl font-bold">${(accountBalances[selectedAccount.id] || 0).toFixed(2)}</p>
              <button
                onClick={() => onDeposit(selectedAccount)}
                className="mt-4 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition font-semibold text-sm"
              >
                Deposit Funds
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <p className="text-gray-600 mb-1">Total Positions</p>
              <p className="text-3xl font-bold text-gray-900">{accountPositions.length}</p>
              <p className="text-sm text-gray-500 mt-2">Active investments</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <p className="text-gray-600 mb-1">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">{accountTrades.length}</p>
              <p className="text-sm text-gray-500 mt-2">All time</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => onTrade('BUY_STOCK', selectedAccount)}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-semibold">Buy Stocks</span>
              </button>
              <button
                onClick={() => onTrade('SELL_STOCK', selectedAccount)}
                className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition shadow-lg"
              >
                <TrendingDown className="w-5 h-5" />
                <span className="font-semibold">Sell Stocks</span>
              </button>
            </div>
          </div>

          {accountPositions.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Positions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accountPositions.map(position => (
                      <tr key={position.stock_id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 font-medium text-gray-900">{position.stock_name}</td>
                        <td className="px-4 py-4 text-gray-600">{position.quantity}</td>
                        <td className="px-4 py-4 text-gray-600">${position.average_purchase_price.toFixed(2)}</td>
                        <td className="px-4 py-4 text-gray-600">${position.current_market_price.toFixed(2)}</td>
                        <td className="px-4 py-4 font-semibold text-gray-900">${position.current_value.toFixed(2)}</td>
                        <td className={`px-4 py-4 font-semibold ${position.unrealized_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {position.unrealized_profit_loss >= 0 ? '+' : ''}${position.unrealized_profit_loss.toFixed(2)}
                          <span className="text-sm ml-1">
                            ({position.unrealized_profit_loss_percentage.toFixed(2)}%)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {accountTrades.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <History className="w-5 h-5 mr-2 text-blue-600" />
                Transaction History
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {accountTrades.slice(0, 10).map(trade => (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        trade.type === 'DEPOSIT' ? 'bg-green-100' :
                        trade.type === 'WITHDRAW' ? 'bg-red-100' :
                        trade.type === 'BUY_STOCK' ? 'bg-blue-100' :
                        'bg-orange-100'
                      }`}>
                        {trade.type === 'DEPOSIT' && <ArrowUpRight className="w-5 h-5 text-green-600" />}
                        {trade.type === 'WITHDRAW' && <ArrowDownRight className="w-5 h-5 text-red-600" />}
                        {trade.type === 'BUY_STOCK' && <ShoppingCart className="w-5 h-5 text-blue-600" />}
                        {trade.type === 'SELL_STOCK' && <TrendingDown className="w-5 h-5 text-orange-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{trade.type.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(trade.timestamp).toLocaleString()}
                        </p>
                        {trade.description && (
                          <p className="text-xs text-gray-400">{trade.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        trade.type === 'DEPOSIT' || trade.type === 'SELL_STOCK' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.type === 'DEPOSIT' || trade.type === 'SELL_STOCK' ? '+' : '-'}
                        ${trade.amount.toFixed(2)}
                      </p>
                      {trade.quantity && (
                        <p className="text-sm text-gray-500">{trade.quantity} shares @ ${trade.price?.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!selectedAccount && (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an account to start trading</h3>
          <p className="text-gray-500">Choose an account from the dropdown above</p>
        </div>
      )}
    </div>
  );
}

export default TradingPage;