import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { User, Wallet, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

function DashboardPage({ 
  userAccounts, 
  totalBalance, 
  stocks, 
  accountBalances, 
  accountTrades,
  topPerformers,
  worstPerformers,
  onSelectAccount 
}) {
  const generatePerformanceData = () => {
    if (!accountTrades || accountTrades.length === 0) {
      return [];
    }

    const monthlyData = {};
    let runningBalance = 0;

    accountTrades
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .forEach(trade => {
        const date = new Date(trade.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        if (trade.type === 'DEPOSIT') {
          runningBalance += trade.amount;
        } else if (trade.type === 'WITHDRAW') {
          runningBalance -= trade.amount;
        } else if (trade.type === 'BUY_STOCK') {
          runningBalance -= trade.amount;
        } else if (trade.type === 'SELL_STOCK') {
          runningBalance += trade.amount;
        }

        monthlyData[monthKey] = {
          month: monthName,
          balance: runningBalance
        };
      });

    return Object.values(monthlyData).slice(-6);
  };

  const performanceData = generatePerformanceData();
  const accountsData = userAccounts.map(acc => ({
    name: acc.name.substring(0, 15),
    balance: accountBalances[acc.id] || 0
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-blue-100">Track your investments and manage your portfolio</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">Total Balance</p>
            <Wallet className="w-8 h-8 text-blue-200" />
          </div>
          <h2 className="text-3xl font-bold mb-1">${totalBalance.toFixed(2)}</h2>
          <p className="text-blue-100 text-sm">Across {userAccounts.length} account{userAccounts.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Active Accounts</p>
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{userAccounts.length}</h2>
          <p className="text-green-600 text-sm flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            All active
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Available Stocks</p>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{stocks.length}</h2>
          <p className="text-gray-500 text-sm">Ready to trade</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Portfolio Performance
          </h3>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Balance']}
                />
                <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No transaction history yet</p>
                <p className="text-sm">Start trading to see your performance</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-blue-600" />
            Accounts Distribution
          </h3>
          {accountsData.length > 0 && accountsData.some(a => a.balance > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={accountsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Balance']}
                />
                <Bar dataKey="balance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No balances yet</p>
                <p className="text-sm">Deposit funds to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Market Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Top Performers
          </h3>
          {topPerformers.length > 0 ? (
            <div className="space-y-2">
              {topPerformers.slice(0, 5).map((stock, index) => (
                <div key={stock.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{stock.name}</p>
                      <p className="text-xs text-gray-500">{stock.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{stock.price_change_percent.toFixed(2)}%</p>
                    <p className="text-xs text-gray-500">${stock.current_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No performance data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Worst Performers */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
            Worst Performers
          </h3>
          {worstPerformers.length > 0 ? (
            <div className="space-y-2">
              {worstPerformers.slice(0, 5).map((stock, index) => (
                <div key={stock.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-red-600">#{index + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{stock.name}</p>
                      <p className="text-xs text-gray-500">{stock.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{stock.price_change_percent.toFixed(2)}%</p>
                    <p className="text-xs text-gray-500">${stock.current_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No performance data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Accounts */}
      {userAccounts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Accounts</h3>
          <div className="space-y-3">
            {userAccounts.slice(0, 5).map(account => (
              <div 
                key={account.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                onClick={() => onSelectAccount(account)}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{account.name}</h4>
                    <p className="text-sm text-gray-500">ID: {account.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${(accountBalances[account.id] || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Balance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;