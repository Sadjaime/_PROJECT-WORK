import React from 'react';
import { ShoppingCart, TrendingDown, X } from 'lucide-react';

function TradeModal({ mode, form, setForm, onSubmit, onClose, accounts, stocks, accountPositions, loading }) {
  const selectedAccount = accounts.find(a => a.id === parseInt(form.account_id));
  const selectedStock = stocks.find(s => s.id === parseInt(form.stock_id));
  
  // Get positions for the selected account
  const accountOwnedStocks = accountPositions
    .filter(pos => pos.quantity > 0)
    .map(pos => ({
      ...stocks.find(s => s.id === pos.stock_id),
      ownedQuantity: pos.quantity,
      averagePurchasePrice: pos.average_purchase_price
    }))
    .filter(stock => stock.id); // Filter out any undefined stocks

  // Determine which stocks to show based on mode
  const availableStocks = mode === 'SELL_STOCK' ? accountOwnedStocks : stocks;
  
  const totalAmount = form.quantity && form.price 
    ? (parseFloat(form.quantity) * parseFloat(form.price)).toFixed(2)
    : '0.00';

  // Find the owned position for the selected stock (when selling)
  const ownedPosition = mode === 'SELL_STOCK' 
    ? accountOwnedStocks.find(s => s.id === parseInt(form.stock_id))
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              mode === 'BUY_STOCK' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {mode === 'BUY_STOCK' ? (
                <ShoppingCart className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {mode === 'BUY_STOCK' ? 'Buy Stock' : 'Sell Stock'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trading Account
            </label>
            <select
              value={form.account_id}
              onChange={(e) => setForm({ ...form, account_id: e.target.value, stock_id: '', quantity: '', price: '' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
              required
            >
              <option value="">Select an account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>
            <select
              value={form.stock_id}
              onChange={(e) => {
                const stockId = e.target.value;
                const stock = stocks.find(s => s.id === parseInt(stockId));
                setForm({ 
                  ...form, 
                  stock_id: stockId,
                  price: stock ? stock.average_price.toString() : ''
                });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
              required
              disabled={!form.account_id}
            >
              <option value="">
                {!form.account_id 
                  ? 'Select an account first' 
                  : availableStocks.length === 0 
                    ? mode === 'SELL_STOCK' 
                      ? 'No stocks owned in this account'
                      : 'No stocks available'
                    : 'Select a stock'
                }
              </option>
              {availableStocks.map(stock => (
                <option key={stock.id} value={stock.id}>
                  {stock.name} ({stock.symbol || `STK${stock.id}`}) - ${stock.average_price.toFixed(2)}
                  {mode === 'SELL_STOCK' && ` (Own: ${stock.ownedQuantity} shares)`}
                </option>
              ))}
            </select>
            {selectedStock && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">
                  Current market price: <span className="font-semibold">${selectedStock.average_price.toFixed(2)}</span>
                </p>
                {mode === 'SELL_STOCK' && ownedPosition && (
                  <>
                    <p className="text-sm text-gray-500">
                      You own: <span className="font-semibold">{ownedPosition.ownedQuantity} shares</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Avg. purchase price: <span className="font-semibold">${ownedPosition.averagePurchasePrice.toFixed(2)}</span>
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (Shares)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={mode === 'SELL_STOCK' && ownedPosition ? ownedPosition.ownedQuantity : undefined}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="10"
              required
            />
            {mode === 'SELL_STOCK' && ownedPosition && (
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {ownedPosition.ownedQuantity} shares
              </p>
            )}
          </div>

          {/* Price Per Share */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Share
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current market price is pre-filled but you can adjust it
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Investment strategy, notes, etc."
              maxLength={200}
            />
          </div>

          {/* Trade Summary */}
          {form.quantity && form.price && selectedStock && selectedAccount && (
            <div className={`border-2 rounded-lg p-4 ${
              mode === 'BUY_STOCK' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                mode === 'BUY_STOCK' ? 'text-green-900' : 'text-red-900'
              }`}>
                Trade Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={mode === 'BUY_STOCK' ? 'text-green-800' : 'text-red-800'}>
                    Account:
                  </span>
                  <span className={`font-semibold ${
                    mode === 'BUY_STOCK' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {selectedAccount.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={mode === 'BUY_STOCK' ? 'text-green-800' : 'text-red-800'}>
                    Stock:
                  </span>
                  <span className={`font-semibold ${
                    mode === 'BUY_STOCK' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {selectedStock.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={mode === 'BUY_STOCK' ? 'text-green-800' : 'text-red-800'}>
                    Quantity:
                  </span>
                  <span className={`font-semibold ${
                    mode === 'BUY_STOCK' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {parseFloat(form.quantity).toFixed(2)} shares
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={mode === 'BUY_STOCK' ? 'text-green-800' : 'text-red-800'}>
                    Price per Share:
                  </span>
                  <span className={`font-semibold ${
                    mode === 'BUY_STOCK' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    ${parseFloat(form.price).toFixed(2)}
                  </span>
                </div>
                <div className={`flex justify-between text-lg pt-2 border-t ${
                  mode === 'BUY_STOCK' ? 'border-green-200' : 'border-red-200'
                }`}>
                  <span className={mode === 'BUY_STOCK' ? 'text-green-800' : 'text-red-800'}>
                    Total Amount:
                  </span>
                  <span className={`font-bold ${
                    mode === 'BUY_STOCK' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    ${totalAmount}
                  </span>
                </div>
                {mode === 'SELL_STOCK' && ownedPosition && (
                  <div className="pt-2 border-t border-red-200">
                    <div className="flex justify-between">
                      <span className="text-red-800">Potential Profit/Loss:</span>
                      <span className={`font-bold ${
                        parseFloat(form.price) >= ownedPosition.averagePurchasePrice 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {parseFloat(form.price) >= ownedPosition.averagePurchasePrice ? '+' : ''}
                        ${((parseFloat(form.price) - ownedPosition.averagePurchasePrice) * parseFloat(form.quantity)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
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
              className={`flex-1 text-white px-6 py-3 rounded-lg transition font-semibold disabled:opacity-50 flex items-center justify-center ${
                mode === 'BUY_STOCK' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'BUY_STOCK' ? (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Buy Stock
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5 mr-2" />
                      Sell Stock
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TradeModal;