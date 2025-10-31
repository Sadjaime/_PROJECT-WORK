import React from 'react';
import { TrendingUp, TrendingDown, BarChart2, Users, Star } from 'lucide-react';

function StocksPage({ stocks, topPerformers, worstPerformers, mostTraded, onTrade, accounts, onViewStock }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Stock Market</h2>
        <p className="text-gray-500 mt-1">Browse and trade available securities</p>
      </div>

      {/* Market Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Top 10 Gainers
          </h3>
          {topPerformers.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {topPerformers.map((stock, index) => (
                <div key={stock.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition cursor-pointer" onClick={() => onViewStock(stock)}>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{stock.name}</p>
                      <p className="text-xs text-gray-500">{stock.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">+{stock.price_change_percent.toFixed(2)}%</p>
                    <p className="text-sm text-gray-600">€{stock.current_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No performance data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Worst Performers */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
            Top 10 Losers
          </h3>
          {worstPerformers.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {worstPerformers.map((stock, index) => (
                <div key={stock.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition cursor-pointer" onClick={() => onViewStock(stock)}>
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{stock.name}</p>
                      <p className="text-xs text-gray-500">{stock.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 text-lg">{stock.price_change_percent.toFixed(2)}%</p>
                    <p className="text-sm text-gray-600">€{stock.current_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No performance data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Most Traded Stocks */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-600" />
            Most Popular
          </h3>
          {mostTraded && mostTraded.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mostTraded.map((stock, index) => (
                <div 
                  key={stock.id} 
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition cursor-pointer" 
                  onClick={() => onViewStock(stock)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{stock.name}</p>
                      <p className="text-xs text-gray-500">{stock.symbol || `STK${stock.id}`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-yellow-700 mb-1">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="font-bold">{stock.holder_count}</span>
                    </div>
                    <p className="text-xs text-gray-600">{stock.total_quantity.toFixed(2)} shares</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No trading data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Stocks */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">All Available Stocks</h3>
        {stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map(stock => (
              <div key={stock.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                    Available
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-xl mb-2">{stock.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Symbol: {stock.symbol || `STK${stock.id}`}</p>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Current Price</p>
                  <p className="text-3xl font-bold text-gray-900">€{stock.average_price.toFixed(2)}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewStock(stock)}
                    className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-semibold flex items-center justify-center"
                  >
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Chart
                  </button>
                  <button
                    onClick={() => onTrade('BUY_STOCK')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                    disabled={accounts.length === 0}
                  >
                    Trade
                  </button>
                </div>
                
                {accounts.length === 0 && (
                  <p className="text-xs text-gray-400 mt-2 text-center">Create an account first</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No stocks available</h3>
            <p className="text-gray-500">Check back later for trading opportunities</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StocksPage;