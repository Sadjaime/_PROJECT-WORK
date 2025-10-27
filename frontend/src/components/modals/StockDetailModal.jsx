import React from 'react';
import { X, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function StockDetailModal({ stock, onClose, onTrade, accounts }) {
  const priceHistory = stock.price_history || {};
  const historyData = Object.entries(priceHistory)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, price]) => ({
      date: new Date(date + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      price: price
    }));

  const hasHistory = historyData.length > 0;
  const firstPrice = hasHistory ? historyData[0].price : stock.average_price;
  const lastPrice = hasHistory ? historyData[historyData.length - 1].price : stock.average_price;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{stock.name}</h2>
            <p className="text-gray-500">Symbol: {stock.symbol || `STK${stock.id}`}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-1">Current Price</p>
            <p className="text-2xl font-bold text-blue-900">${stock.average_price.toFixed(2)}</p>
          </div>
          <div className={`rounded-lg p-4 ${priceChange >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm mb-1 ${priceChange >= 0 ? 'text-green-800' : 'text-red-800'}`}>Change</p>
            <p className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Stock ID</p>
            <p className="text-2xl font-bold text-gray-900">#{stock.id}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price History</h3>
          {hasHistory ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                />
                <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <BarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No price history available</p>
                <p className="text-sm">Historical data will appear here</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onTrade('BUY_STOCK');
            }}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            disabled={accounts.length === 0}
          >
            Trade This Stock
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockDetailModal;