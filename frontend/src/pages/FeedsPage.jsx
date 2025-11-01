import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Star, ShoppingCart, Award, Clock, Eye } from 'lucide-react';
import { feedService } from '../services/feedService';

function FeedsPage({ onTrade, accounts, onViewStock, stocks }) {
  const [topTraders, setTopTraders] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [activeTab, setActiveTab] = useState('traders');

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    setLoading(true);
    try {
      const [traders, trades, trending] = await Promise.all([
        feedService.getTopTraders(10),
        feedService.getRecentTrades(20, 7),
        feedService.getTrendingStocks(7)
      ]);
      
      setTopTraders(traders);
      setRecentTrades(trades);
      setTrendingStocks(trending);
    } catch (error) {
      console.error('Error fetching feed data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuySameStock = (stockId) => {
    const stock = stocks.find(s => s.id === stockId);
    if (stock) {
      onViewStock(stock);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 mt-4">Loading social feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-3 mb-2">
          <Users className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Social Trading Feed</h2>
        </div>
        <p className="text-purple-100">
          Follow top performing traders and discover trending stocks
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('traders')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'traders'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Top Traders</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'trades'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Activity</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'trending'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Trending Stocks</span>
            </div>
          </button>
        </div>
      </div>

      {/* Top Traders Tab */}
      {activeTab === 'traders' && (
        <div className="space-y-4">
          {topTraders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {topTraders.map((trader, index) => (
                <div
                  key={trader.user_id}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`relative ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-purple-100 to-purple-200'
                      } p-4 rounded-full`}>
                        <Users className={`w-6 h-6 ${index < 3 ? 'text-white' : 'text-purple-600'}`} />
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1">
                            <Award className="w-4 h-4 text-yellow-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                          <span>{trader.user_name}</span>
                          {index < 3 && (
                            <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              #{index + 1}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {trader.total_accounts} account{trader.total_accounts !== 1 ? 's' : ''} • {trader.total_positions} positions
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-800 mb-1">Total Invested</p>
                      <p className="text-lg font-bold text-blue-900">
                        €{trader.total_invested.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-800 mb-1">Current Value</p>
                      <p className="text-lg font-bold text-purple-900">
                        €{trader.current_value.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 ${
                    trader.profit_loss >= 0 ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${
                          trader.profit_loss >= 0 ? 'text-green-800' : 'text-red-800'
                        } mb-1`}>
                          Total Return
                        </p>
                        <p className={`text-2xl font-bold ${
                          trader.profit_loss >= 0 ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {trader.profit_loss >= 0 ? '+' : ''}€{trader.profit_loss.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center space-x-1 ${
                          trader.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trader.profit_loss >= 0 ? (
                            <TrendingUp className="w-8 h-8" />
                          ) : (
                            <TrendingDown className="w-8 h-8" />
                          )}
                        </div>
                        <p className={`text-xl font-bold ${
                          trader.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trader.return_percentage.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No traders to display</h3>
              <p className="text-gray-500">Top traders will appear here once users start trading</p>
            </div>
          )}
        </div>
      )}

      {/* Recent Trades Tab */}
      {activeTab === 'trades' && (
        <div className="space-y-4">
          {recentTrades.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 divide-y divide-gray-200">
              {recentTrades.map((trade) => (
                <div
                  key={trade.trade_id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-full">
                        <ShoppingCart className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold text-gray-900">{trade.trader_name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            trade.trader_return >= 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.trader_return >= 0 ? '+' : ''}{trade.trader_return.toFixed(1)}% return
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          bought <span className="font-semibold">{trade.quantity} shares</span> of{' '}
                          <span className="font-semibold">{trade.stock_name}</span>{' '}
                          ({trade.stock_symbol})
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(trade.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-500 mb-1">Trade Value</p>
                      <p className="text-lg font-bold text-gray-900">
                        €{trade.total_amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleBuySameStock(trade.stock_id)}
                        className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold flex items-center space-x-1"
                        disabled={accounts.length === 0}
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Stock</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-500">Recent trades from top traders will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Trending Stocks Tab */}
      {activeTab === 'trending' && (
        <div className="space-y-4">
          {trendingStocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingStocks.map((stock, index) => (
                <div
                  key={stock.stock_id}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900">#{index + 1}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {stock.stock_name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {stock.stock_symbol}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Price</span>
                      <span className="font-bold text-gray-900">
                        €{stock.current_price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Traders Buying</span>
                      <span className="font-bold text-purple-600">
                        {stock.traders_buying}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Purchases</span>
                      <span className="font-bold text-blue-600">
                        {stock.purchase_count}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Invested</span>
                      <span className="font-bold text-green-600">
                        €{stock.total_invested.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBuySameStock(stock.stock_id)}
                      className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-semibold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onTrade('BUY_STOCK')}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                      disabled={accounts.length === 0}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trending stocks</h3>
              <p className="text-gray-500">Popular stocks will appear here based on top trader activity</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FeedsPage;