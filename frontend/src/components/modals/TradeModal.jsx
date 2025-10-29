import React, { useEffect } from 'react';
import { ShoppingCart, TrendingDown, X } from 'lucide-react';

function TradeModal({ mode, form, setForm, onSubmit, onClose, accounts, stocks, accountPositions, onAccountChange, loading }) {
  // Ensure arrays are defined
  const safeAccounts = accounts || [];
  const safeStocks = stocks || [];
  const safeAccountPositions = accountPositions || [];
  
  const selectedAccount = safeAccounts.find(a => a.id === parseInt(form.account_id));
  const selectedStock = safeStocks.find(s => s.id === parseInt(form.stock_id));
  
  // Get positions for the selected account
  const accountOwnedStocks = safeAccountPositions
    .filter(pos => pos.quantity > 0)
    .map(pos => ({
      ...safeStocks.find(s => s.id === pos.stock_id),
      ownedQuantity: pos.quantity,
      averagePurchasePrice: pos.average_purchase_price,
      currentMarketPrice: safeStocks.find(s => s.id === pos.stock_id)?.average_price || 0
    }))
    .filter(stock => stock.id); // Filter out any undefined stocks

  // Determine which stocks to show based on mode
  const availableStocks = mode === 'SELL_STOCK' ? accountOwnedStocks : safeStocks;
  
  // Find the owned position for the selected stock (when selling)
  const ownedPosition = mode === 'SELL_STOCK' 
    ? accountOwnedStocks.find(s => s.id === parseInt(form.stock_id))
    : null;

  // Calculate values for SELL mode
  const currentMarketPrice = ownedPosition?.currentMarketPrice || parseFloat(form.price) || 0;
  const maxSellValue = ownedPosition ? (ownedPosition.ownedQuantity * currentMarketPrice) : 0;
  
  // Calculate quantity based on amount for both BUY and SELL
  const tradeAmount = parseFloat(form.tradeAmount) || 0;
  const pricePerShare = mode === 'SELL_STOCK' 
    ? currentMarketPrice 
    : parseFloat(form.price) || 0;
  
  const calculatedQuantity = pricePerShare > 0 
    ? (tradeAmount / pricePerShare) 
    : 0;

  // Total amount calculation
  const totalAmount = tradeAmount.toFixed(2);

  // Update form.price when stock is selected
  useEffect(() => {
    if (form.stock_id && selectedStock) {
      const price = mode === 'SELL_STOCK' && ownedPosition
        ? currentMarketPrice
        : selectedStock.average_price;
      
      setForm(prevForm => ({
        ...prevForm,
        price: price.toString()
      }));
    }
  }, [form.stock_id, mode, ownedPosition, currentMarketPrice, selectedStock]);

  // Handle account selection change
  const handleAccountChange = (e) => {
    const accountId = e.target.value;
    
    // If onAccountChange prop is provided, use it (for fetching new positions)
    if (onAccountChange) {
      onAccountChange(accountId);
    } else {
      // Fallback to basic form update
      setForm({ ...form, account_id: accountId, stock_id: '', quantity: '', price: '', tradeAmount: '' });
    }
  };

  // Handle stock selection
  const handleStockChange = (e) => {
    const stockId = e.target.value;
    const stock = safeStocks.find(s => s.id === parseInt(stockId));
    
    if (mode === 'SELL_STOCK') {
      const position = accountOwnedStocks.find(s => s.id === parseInt(stockId));
      setForm({ 
        ...form, 
        stock_id: stockId,
        price: position?.currentMarketPrice.toString() || '',
        tradeAmount: '',
        quantity: ''
      });
    } else {
      setForm({ 
        ...form, 
        stock_id: stockId,
        price: stock ? stock.average_price.toString() : '',
        tradeAmount: '',
        quantity: ''
      });
    }
  };

  // Handle form submission with quantity calculation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a modified form with calculated quantity
    const modifiedForm = {
      ...form,
      quantity: calculatedQuantity.toString()
    };
    
    // Create a synthetic event with the modified form
    const syntheticEvent = {
      ...e,
      preventDefault: () => {}
    };
    
    // Temporarily update form to include calculated quantity
    setForm(modifiedForm);
    
    // Call onSubmit with the values
    setTimeout(() => {
      onSubmit(syntheticEvent);
    }, 0);
  };

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trading Account
            </label>
            <select
              value={form.account_id}
              onChange={handleAccountChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
              required
            >
              <option value="">Select an account</option>
              {safeAccounts.map(account => (
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
              onChange={handleStockChange}
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
                  {stock.name} ({stock.symbol || `STK${stock.id}`}) - €{stock.average_price?.toFixed(2) || '0.00'}
                  {mode === 'SELL_STOCK' && ` (Own: ${stock.ownedQuantity.toFixed(2)} shares)`}
                </option>
              ))}
            </select>
            {selectedStock && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">
                  Current market price: <span className="font-semibold">€{currentMarketPrice.toFixed(2)}</span>
                </p>
                {mode === 'SELL_STOCK' && ownedPosition && (
                  <>
                    <p className="text-sm text-gray-500">
                      You own: <span className="font-semibold">{ownedPosition.ownedQuantity.toFixed(2)} shares</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Total value: <span className="font-semibold">€{maxSellValue.toFixed(2)}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Avg. purchase price: <span className="font-semibold">€{ownedPosition.averagePurchasePrice?.toFixed(2) || '0.00'}</span>
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Amount to Trade - Both BUY and SELL modes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'BUY_STOCK' ? 'Amount to Invest (EUR)' : 'Amount to Sell (EUR)'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                €
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={mode === 'SELL_STOCK' ? maxSellValue : undefined}
                value={form.tradeAmount || ''}
                onChange={(e) => setForm({ ...form, tradeAmount: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg"
                placeholder="0.00"
                required
              />
            </div>
            {mode === 'SELL_STOCK' && ownedPosition ? (
              <>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: €{maxSellValue.toFixed(2)} ({ownedPosition.ownedQuantity.toFixed(2)} shares @ €{currentMarketPrice.toFixed(2)})
                </p>
                {tradeAmount > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    This will sell <span className="font-semibold">{calculatedQuantity.toFixed(4)} shares</span>
                  </p>
                )}
              </>
            ) : mode === 'BUY_STOCK' && pricePerShare > 0 && tradeAmount > 0 ? (
              <p className="text-sm text-blue-600 mt-2">
                This will buy <span className="font-semibold">{calculatedQuantity.toFixed(4)} shares</span> @ €{pricePerShare.toFixed(2)} each
              </p>
            ) : null}
          </div>

          {/* Price Per Share - Show current price, allow adjustment in BUY mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Share {mode === 'SELL_STOCK' && '(Current Market Price)'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                €
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                  mode === 'SELL_STOCK' ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="0.00"
                required
                readOnly={mode === 'SELL_STOCK'}
                disabled={mode === 'SELL_STOCK'}
              />
            </div>
            {mode === 'BUY_STOCK' ? (
              <p className="text-xs text-gray-500 mt-1">
                Current market price is pre-filled but you can adjust it
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Locked to current market price for accurate selling
              </p>
            )}
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
          {tradeAmount > 0 && calculatedQuantity > 0 && selectedStock && selectedAccount && (
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
                    {calculatedQuantity.toFixed(4)} shares
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={mode === 'BUY_STOCK' ? 'text-green-800' : 'text-red-800'}>
                    Price per Share:
                  </span>
                  <span className={`font-semibold ${
                    mode === 'BUY_STOCK' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    €{pricePerShare.toFixed(2)}
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
                    €{totalAmount}
                  </span>
                </div>
                {mode === 'SELL_STOCK' && ownedPosition && (
                  <div className="pt-2 border-t border-red-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-red-800">Original Cost:</span>
                      <span className="font-semibold text-red-900">
                        €{(ownedPosition.averagePurchasePrice * calculatedQuantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-800">Profit/Loss:</span>
                      <span className={`font-bold ${
                        tradeAmount >= (ownedPosition.averagePurchasePrice * calculatedQuantity)
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {tradeAmount >= (ownedPosition.averagePurchasePrice * calculatedQuantity) ? '+' : ''}
                        €{(tradeAmount - (ownedPosition.averagePurchasePrice * calculatedQuantity)).toFixed(2)}
                        {' '}
                        ({(((tradeAmount - (ownedPosition.averagePurchasePrice * calculatedQuantity)) / 
                          (ownedPosition.averagePurchasePrice * calculatedQuantity)) * 100).toFixed(2)}%)
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
              disabled={loading || (mode === 'SELL_STOCK' && calculatedQuantity <= 0)}
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