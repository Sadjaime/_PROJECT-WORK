import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { User, Wallet, TrendingUp, Plus, Edit2, Trash2, Eye, EyeOff, LogOut, DollarSign, ArrowUpRight, ArrowDownRight, Menu, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  // Form states
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', type: 'user' });
  const [accountForm, setAccountForm] = useState({ name: '', user_id: '' });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, accountsRes, stocksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/`),
        fetch(`${API_BASE_URL}/accounts/`),
        fetch(`${API_BASE_URL}/stocks/stocks`)
      ]);
      
      if (!usersRes.ok || !accountsRes.ok || !stocksRes.ok) {
        throw new Error('Failed to fetch data');
      }

      setUsers(await usersRes.json());
      setAccounts(await accountsRes.json());
      setStocks(await stocksRes.json());
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const allUsers = await response.json();
      const user = allUsers.find(u => u.email === email);
      
      if (user && user.password === password) {
        setCurrentUser(user);
        setActiveTab('dashboard');
        setError(null);
      } else {
        alert('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Make sure the backend is running on http://localhost:8000');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create user');
      }

      const newUser = await response.json();
      setUsers([...users, newUser]);
      setShowUserModal(false);
      setUserForm({ name: '', email: '', password: '', type: 'user' });
      
      // Auto-login after signup
      if (!currentUser) {
        setCurrentUser(newUser);
        setActiveTab('dashboard');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      
      if (!response.ok) throw new Error('Failed to update user');

      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      // Update current user if editing self
      if (currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
      }
      
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', type: 'user' });
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? All associated accounts will be deleted.')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(users.filter(u => u.id !== userId));
      
      // Logout if deleting self
      if (currentUser.id === userId) {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: accountForm.name, 
          user_id: parseInt(accountForm.user_id),
          balance: 0
        })
      });
      
      if (!response.ok) throw new Error('Failed to create account');

      const newAccount = await response.json();
      setAccounts([...accounts, newAccount]);
      setShowAccountModal(false);
      setAccountForm({ name: '', user_id: '' });
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${editingAccount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: accountForm.name })
      });
      
      if (!response.ok) throw new Error('Failed to update account');

      const updatedAccount = await response.json();
      setAccounts(accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a));
      setShowAccountModal(false);
      setEditingAccount(null);
      setAccountForm({ name: '', user_id: '' });
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/?account_id=${accountId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete account');

      setAccounts(accounts.filter(a => a.id !== accountId));
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    } finally {
      setLoading(false);
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
    return (
      <>
        <LoginScreen onLogin={handleLogin} onSignup={openCreateUserModal} />
        {showUserModal && (
          <UserModal
            user={null}
            form={userForm}
            setForm={setUserForm}
            onSubmit={handleCreateUser}
            onClose={() => {
              setShowUserModal(false);
              setUserForm({ name: '', email: '', password: '', type: 'user' });
            }}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loading={loading}
          />
        )}
      </>
    );
  }

  const userAccounts = accounts.filter(a => a.user_id === currentUser.id);
  const totalBalance = userAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">FinTech Pro</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Investment Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-500">Welcome back</p>
                <p className="font-semibold text-gray-900">{currentUser.name}</p>
              </div>
              <button
                onClick={() => setCurrentUser(null)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition sm:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`bg-white border-b border-gray-200 ${mobileMenuOpen ? 'block' : 'hidden'} sm:block`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:space-x-8">
            {['dashboard', 'accounts', 'stocks', 'profile'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition capitalize ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        )}

        {!loading && activeTab === 'dashboard' && (
          <DashboardTab
            userAccounts={userAccounts}
            totalBalance={totalBalance}
            stocks={stocks}
          />
        )}
        {!loading && activeTab === 'accounts' && (
          <AccountsTab
            accounts={userAccounts}
            onCreateAccount={openCreateAccountModal}
            onEditAccount={openEditAccountModal}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
        {!loading && activeTab === 'stocks' && <StocksTab stocks={stocks} />}
        {!loading && activeTab === 'profile' && (
          <ProfileTab
            user={currentUser}
            onEdit={() => openEditUserModal(currentUser)}
            onDelete={() => handleDeleteUser(currentUser.id)}
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
          loading={loading}
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
          loading={loading}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform hover:scale-105 transition-transform duration-300">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl mb-4 shadow-lg">
            <DollarSign className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to manage your investments</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg hover:shadow-xl"
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

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Make sure the backend is running on http://localhost:8000
          </p>
        </div>
      </div>
    </div>
  );
}

// Dashboard Tab
function DashboardTab({ userAccounts, totalBalance, stocks }) {
  const mockPerformanceData = [
    { month: 'Jan', balance: 3200 },
    { month: 'Feb', balance: 3800 },
    { month: 'Mar', balance: 4200 },
    { month: 'Apr', balance: 3900 },
    { month: 'May', balance: 4800 },
    { month: 'Jun', balance: 5200 }
  ];

  const accountsData = userAccounts.map(acc => ({
    name: acc.name.substring(0, 15),
    balance: acc.balance || 0
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
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">Total Balance</p>
            <Wallet className="w-8 h-8 text-blue-200" />
          </div>
          <h2 className="text-3xl font-bold mb-1">${totalBalance.toFixed(2)}</h2>
          <p className="text-blue-100 text-sm">Across {userAccounts.length} account{userAccounts.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 transform hover:scale-105 transition-transform">
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

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 transform hover:scale-105 transition-transform">
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
        {/* Performance Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Portfolio Performance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => [`$${value}`, 'Balance']}
              />
              <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Accounts Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-blue-600" />
            Accounts Distribution
          </h3>
          {accountsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={accountsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => [`$${value}`, 'Balance']}
                />
                <Bar dataKey="balance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No accounts yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Avg Balance</p>
          <p className="text-xl font-bold text-gray-900">
            ${userAccounts.length > 0 ? (totalBalance / userAccounts.length).toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Highest Balance</p>
          <p className="text-xl font-bold text-gray-900">
            ${userAccounts.length > 0 ? Math.max(...userAccounts.map(a => a.balance || 0)).toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Markets</p>
          <p className="text-xl font-bold text-green-600">Open</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Stocks</p>
          <p className="text-xl font-bold text-gray-900">{stocks.length}</p>
        </div>
      </div>

      {/* Recent Accounts */}
      {userAccounts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Accounts</h3>
          <div className="space-y-3">
            {userAccounts.slice(0, 5).map(account => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
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
                  <p className="font-bold text-gray-900">${(account.balance || 0).toFixed(2)}</p>
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

// Accounts Tab
function AccountsTab({ accounts, onCreateAccount, onEditAccount, onDeleteAccount }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Accounts</h2>
          <p className="text-gray-500 mt-1">Manage your investment accounts</p>
        </div>
        <button
          onClick={onCreateAccount}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>New Account</span>
        </button>
      </div>

      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => (
            <div key={account.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditAccount(account)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit account"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteAccount(account.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{account.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Account ID: {account.id}</p>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">${(account.balance || 0).toFixed(2)}</p>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Created: {new Date(account.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
          <p className="text-gray-500 mb-6">Create your first account to start managing your investments</p>
          <button
            onClick={onCreateAccount}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Account</span>
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Available Stocks</h2>
        <p className="text-gray-500 mt-1">Browse and trade available securities</p>
      </div>

      {stocks.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                        Available
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No stocks available</h3>
          <p className="text-gray-500">Check back later for trading opportunities</p>
        </div>
      )}
    </div>
  );
}

// Profile Tab
function ProfileTab({ user, onEdit, onDelete }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-full">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {user.type}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onEdit}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">User ID</p>
            <p className="font-semibold text-gray-900">#{user.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Account Type</p>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {user.type}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-semibold text-gray-900">
              {new Date(user.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Email Address</p>
            <p className="font-semibold text-gray-900">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Account Security</h4>
        <p className="text-blue-800 text-sm">
          Keep your account secure by using a strong password and never sharing your login credentials.
        </p>
      </div>
    </div>
  );
}

// User Modal
function UserModal({ user, form, setForm, onSubmit, onClose, showPassword, setShowPassword, loading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {user ? 'Edit Profile' : 'Create Account'}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="John Doe"
              required={!user}
              minLength={4}
              maxLength={40}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="john@example.com"
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
                maxLength={30}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {!user && (
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                user ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Account Modal
function AccountModal({ account, form, setForm, onSubmit, onClose, users, loading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {account ? 'Edit Account' : 'Create New Account'}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Main Investment Account"
              required
              minLength={4}
              maxLength={40}
            />
            <p className="text-xs text-gray-500 mt-1">Choose a descriptive name for your account</p>
          </div>

          {!account && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
              <select
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              >
                <option value="">Select account owner</option>
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
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                account ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;