import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { User, Wallet, TrendingUp, Plus, Edit2, Trash2, Eye, EyeOff, LogOut, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPassword, setShowPassword] = useState(false);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  // Form states
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', type: 'user' });
  const [accountForm, setAccountForm] = useState({ name: '', user_id: '' });

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [usersRes, accountsRes, stocksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/`),
        fetch(`${API_BASE_URL}/accounts/`),
        fetch(`${API_BASE_URL}/stocks/stocks`)
      ]);
      
      setUsers(await usersRes.json());
      setAccounts(await accountsRes.json());
      setStocks(await stocksRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/`);
      const allUsers = await response.json();
      const user = allUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        setCurrentUser(user);
        setActiveTab('dashboard');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      
      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setShowUserModal(false);
        setUserForm({ name: '', email: '', password: '', type: 'user' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = {};
      if (userForm.name) updateData.name = userForm.name;
      if (userForm.email) updateData.email = userForm.email;
      if (userForm.password) updateData.password = userForm.password;

      const response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setShowUserModal(false);
        setEditingUser(null);
        setUserForm({ name: '', email: '', password: '', type: 'user' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/user_id?user_id=${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...accountForm, user_id: parseInt(accountForm.user_id) })
      });
      
      if (response.ok) {
        const newAccount = await response.json();
        setAccounts([...accounts, newAccount]);
        setShowAccountModal(false);
        setAccountForm({ name: '', user_id: '' });
      }
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${editingAccount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: accountForm.name })
      });
      
      if (response.ok) {
        const updatedAccount = await response.json();
        setAccounts(accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a));
        setShowAccountModal(false);
        setEditingAccount(null);
        setAccountForm({ name: '', user_id: '' });
      }
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/?account_id=${accountId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setAccounts(accounts.filter(a => a.id !== accountId));
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, password: '', type: user.type });
    setShowUserModal(true);
  };

  const openEditAccountModal = (account) => {
    setEditingAccount(account);
    setAccountForm({ name: account.name, user_id: account.user_id });
    setShowAccountModal(true);
  };

  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', type: 'user' });
    setShowUserModal(true);
  };

  const openCreateAccountModal = () => {
    setEditingAccount(null);
    setAccountForm({ name: '', user_id: currentUser?.id || '' });
    setShowAccountModal(true);
  };

  // Login Screen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} onSignup={openCreateUserModal} />;
  }

  const userAccounts = accounts.filter(a => a.user_id === currentUser.id);
  const totalBalance = userAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">FinTech App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back</p>
                <p className="font-semibold text-gray-900">{currentUser.name}</p>
              </div>
              <button
                onClick={() => setCurrentUser(null)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'accounts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Accounts
            </button>
            <button
              onClick={() => setActiveTab('stocks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'stocks'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stocks
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            userAccounts={userAccounts}
            totalBalance={totalBalance}
            stocks={stocks}
          />
        )}
        {activeTab === 'accounts' && (
          <AccountsTab
            accounts={userAccounts}
            onCreateAccount={openCreateAccountModal}
            onEditAccount={openEditAccountModal}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
        {activeTab === 'stocks' && <StocksTab stocks={stocks} />}
        {activeTab === 'profile' && (
          <ProfileTab
            user={currentUser}
            onEdit={() => openEditUserModal(currentUser)}
          />
        )}
      </main>

      {/* Modals */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          form={userForm}
          setForm={setUserForm}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      )}

      {showAccountModal && (
        <AccountModal
          account={editingAccount}
          form={accountForm}
          setForm={setAccountForm}
          onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
          onClose={() => {
            setShowAccountModal(false);
            setEditingAccount(null);
          }}
          users={users}
        />
      )}
    </div>
  );
}

// Login Screen Component
function LoginScreen({ onLogin, onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600 p-3 rounded-xl mb-4">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button onClick={onSignup} className="text-blue-600 font-semibold hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Dashboard Tab
function DashboardTab({ userAccounts, totalBalance, stocks }) {
  const mockData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 }
  ];

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">Total Balance</p>
            <Wallet className="w-8 h-8 text-blue-200" />
          </div>
          <h2 className="text-3xl font-bold">${totalBalance.toFixed(2)}</h2>
          <p className="text-blue-100 text-sm mt-2">Across {userAccounts.length} accounts</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Active Accounts</p>
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{userAccounts.length}</h2>
          <p className="text-green-600 text-sm mt-2 flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            All active
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Available Stocks</p>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{stocks.length}</h2>
          <p className="text-gray-500 text-sm mt-2">Markets open</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Accounts */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Accounts</h3>
        <div className="space-y-3">
          {userAccounts.map(account => (
            <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">{account.name}</h4>
                <p className="text-sm text-gray-500">Account ID: {account.id}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">${(account.balance || 0).toFixed(2)}</p>
                <p className="text-sm text-gray-500">Balance</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Accounts Tab
function AccountsTab({ accounts, onCreateAccount, onEditAccount, onDeleteAccount }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Accounts</h2>
        <button
          onClick={onCreateAccount}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>New Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <div key={account.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
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
            <p className="text-sm text-gray-500 mb-4">ID: {account.id}</p>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Balance</p>
              <p className="text-2xl font-bold text-gray-900">${(account.balance || 0).toFixed(2)}</p>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Created: {new Date(account.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
          <p className="text-gray-500 mb-4">Create your first account to get started</p>
          <button
            onClick={onCreateAccount}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Account</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Stocks Tab
function StocksTab({ stocks }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Available Stocks</h2>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map(stock => (
              <tr key={stock.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="font-medium text-gray-900">{stock.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{stock.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg font-semibold text-gray-900">
                    ${stock.average_price.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 font-semibold">
                    Trade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stocks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No stocks available</h3>
          <p className="text-gray-500">Check back later for trading opportunities</p>
        </div>
      )}
    </div>
  );
}

// Profile Tab
function ProfileTab({ user, onEdit }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>

      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500 mb-1">User ID</p>
            <p className="font-semibold text-gray-900">#{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Account Type</p>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {user.type}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Member Since</p>
            <p className="font-semibold text-gray-900">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="font-semibold text-gray-900">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Modal
function UserModal({ user, form, setForm, onSubmit, onClose, showPassword, setShowPassword }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {user ? 'Edit Profile' : 'Create Account'}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Full name"
              required={!user}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="email@example.com"
              required={!user}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {user && '(leave empty to keep current)'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="••••••••"
                required={!user}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Account Modal
function AccountModal({ account, form, setForm, onSubmit, onClose, users }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {account ? 'Edit Account' : 'Create Account'}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Main Account"
              required
              minLength={4}
              maxLength={40}
            />
          </div>

          {!account && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
              <select
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {account ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;