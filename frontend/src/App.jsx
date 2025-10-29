import React, { useState, useEffect, useCallback } from 'react';

// Services
import { userService } from './services/userService';
import { accountService } from './services/accountService';
import { stockService } from './services/stockService';
import { tradeService } from './services/tradeService';

// Components
import LoginScreen from './components/auth/LoginScreen';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import ErrorBanner from './components/common/ErrorBanner';
import UserModal from './components/modals/UserModal';
import AccountModal from './components/modals/AccountModal';
import TradeModal from './components/modals/TradeModal';
import DepositModal from './components/modals/DepositModal';
import StockDetailModal from './components/modals/StockDetailModal';
import TransferModal from './components/modals/TransferModal';

// Pages
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import TradingPage from './pages/TradingPage';
import StocksPage from './pages/StocksPage';
import ProfilePage from './pages/ProfilePage';
import TransfersPage from './pages/TransfersPage';


function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [worstPerformers, setWorstPerformers] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [accountBalances, setAccountBalances] = useState({});
  const [accountTrades, setAccountTrades] = useState([]);
  const [accountPositions, setAccountPositions] = useState([]);
  const [tradeModalPositions, setTradeModalPositions] = useState([]); // NEW: Separate state for trade modal
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showStockDetailModal, setShowStockDetailModal] = useState(false);
  const [tradeMode, setTradeMode] = useState('BUY_STOCK');
  const [editingUser, setEditingUser] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  

  // Form states
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', type: 'user' });
  const [accountForm, setAccountForm] = useState({ name: '', user_id: '' });
  const [tradeForm, setTradeForm] = useState({ account_id: '', stock_id: '', quantity: '', price: '', description: '', tradeAmount: '' });
  const [depositForm, setDepositForm] = useState({ amount: '', description: '' });
  const [transferForm, setTransferForm] = useState({from_account_id: '', to_account_id: '', amount: '', description: ''});


  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, accountsData, stocksData, topData, worstData] = await Promise.all([
        userService.getAll(),
        accountService.getAll(),
        stockService.getAll(),
        stockService.getTopPerformers(10),
        stockService.getWorstPerformers(10)
      ]);

      setUsers(usersData);
      setAccounts(accountsData);
      setStocks(stocksData);
      setTopPerformers(topData);
      setWorstPerformers(worstData);

      const userAccountsData = accountsData.filter(a => a.user_id === currentUser.id);
      await fetchAccountBalances(userAccountsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  },  [currentUser]);

  const fetchAccountBalances = async (userAccounts) => {
  const balancePromises = userAccounts.map(account => 
    accountService.getBalance(account.id)
      .then(balanceData => ({ 
        id: account.id, 
        balance: balanceData?.balance || 0 
      }))
      .catch(() => ({ id: account.id, balance: 0 }))
  );
  
  const balanceResults = await Promise.all(balancePromises);
  const balances = {};
  balanceResults.forEach(({ id, balance }) => {
    balances[id] = balance;
  });
  
  setAccountBalances(balances);
  };

  const fetchAccountDetails = useCallback(async (accountId) => {
    try {
      const [tradesData, positionsData] = await Promise.all([
        tradeService.getAccountTrades(accountId),
        tradeService.getAccountPositions(accountId)
      ]);
      setAccountTrades(tradesData);
      setAccountPositions(positionsData);
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  }, []);

  // NEW: Function to fetch positions for trade modal
  const fetchPositionsForTradeModal = async (accountId) => {
    try {
      const positionsData = await tradeService.getAccountPositions(accountId);
      setTradeModalPositions(positionsData);
    } catch (error) {
      console.error('Error fetching positions for trade modal:', error);
      setTradeModalPositions([]);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  useEffect(() => {
    if (selectedAccount) {
      fetchAccountDetails(selectedAccount.id);
    }
  }, [selectedAccount, fetchAccountDetails]);
  
  const handleLogin = async (email, password) => {
    try {
      const response = await userService.login(email, password);
      
      if (response.status === 401) {
        alert('Invalid email or password');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const user = await response.json();
      setCurrentUser(user);
      setActiveTab('dashboard');
      setError(null);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Make sure the backend is running on http://localhost:8000');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userService.create(userForm);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create user');
      }

      const newUser = await response.json();
      setUsers([...users, newUser]);
      setShowUserModal(false);
      setUserForm({ name: '', email: '', password: '', type: 'user' });
      
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

      const response = await userService.update(editingUser.id, updateData);
      
      if (!response.ok) throw new Error('Failed to update user');

      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      
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
      const response = await userService.delete(userId);
      
      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(users.filter(u => u.id !== userId));
      
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
      const response = await accountService.create({ 
        name: accountForm.name, 
        user_id: parseInt(accountForm.user_id)
      });
      
      if (!response.ok) throw new Error('Failed to create account');

      await fetchData();
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
      const response = await accountService.update(editingAccount.id, { name: accountForm.name });
      
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
      const response = await accountService.delete(accountId);
      
      if (!response.ok) throw new Error('Failed to delete account');

      await fetchData();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await tradeService.deposit(
        selectedAccount.id,
        parseFloat(depositForm.amount),
        depositForm.description || 'Deposit'
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to deposit');
      }

      setShowDepositModal(false);
      setDepositForm({ amount: '', description: '' });
      await fetchData();
      await fetchAccountDetails(selectedAccount.id);
      alert('Deposit successful!');
    } catch (error) {
      console.error('Error depositing:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await tradeService.executeTrade({
        account_id: parseInt(tradeForm.account_id),
        stock_id: parseInt(tradeForm.stock_id),
        type: tradeMode,
        quantity: parseFloat(tradeForm.quantity),
        price: parseFloat(tradeForm.price),
        description: tradeForm.description || `${tradeMode === 'BUY_STOCK' ? 'Buy' : 'Sell'} stock`
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Trade failed');
      }

      setShowTradeModal(false);
      setTradeForm({ account_id: '', stock_id: '', quantity: '', price: '', description: '', tradeAmount: '' });
      setTradeModalPositions([]); // Clear trade modal positions
      await fetchData();
      if (selectedAccount) {
        await fetchAccountDetails(selectedAccount.id);
      }
      alert('Trade executed successfully!');
    } catch (error) {
      console.error('Error executing trade:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: openTradeModal now fetches positions for SELL mode
  const openTradeModal = async (mode, account = null) => {
    setTradeMode(mode);
    const targetAccount = account || selectedAccount;
    
    setTradeForm({ 
      account_id: targetAccount?.id || '', 
      stock_id: '', 
      quantity: '', 
      price: '', 
      description: '',
      tradeAmount: ''
    });

    // If selling, fetch positions for the target account
    if (mode === 'SELL_STOCK' && targetAccount?.id) {
      await fetchPositionsForTradeModal(targetAccount.id);
    } else {
      setTradeModalPositions([]);
    }
    
    setShowTradeModal(true);
  };

  // NEW: Handle account change in trade modal
  const handleTradeFormAccountChange = async (accountId) => {
    setTradeForm({ 
      ...tradeForm, 
      account_id: accountId, 
      stock_id: '', 
      quantity: '', 
      price: '',
      tradeAmount: ''
    });

    // If in sell mode, fetch positions for the newly selected account
    if (tradeMode === 'SELL_STOCK' && accountId) {
      await fetchPositionsForTradeModal(parseInt(accountId));
    }
  };

  const openDepositModal = (account) => {
    setSelectedAccount(account);
    setDepositForm({ amount: '', description: '' });
    setShowDepositModal(true);
  };

  const openStockDetail = (stock) => {
    setSelectedStock(stock);
    setShowStockDetailModal(true);
  };

  if (!currentUser) {
    return (
      <>
        <LoginScreen 
          onLogin={handleLogin} 
          onSignup={() => {
            setEditingUser(null);
            setUserForm({ name: '', email: '', password: '', type: 'user' });
            setShowUserModal(true);
          }} 
        />
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
  const handleTransfer = async (transferData) => {
  setLoading(true);
  try {
    const response = await tradeService.transferMoney({
      from_account_id: parseInt(transferData.from_account_id),
      to_account_id: parseInt(transferData.to_account_id),
      amount: parseFloat(transferData.amount),
      description: transferData.description || 'Account transfer'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Transfer failed');
    }

    setShowTransferModal(false);
    await fetchData();
    alert('Transfer completed successfully!');
    } catch (error) {
      console.error('Error transferring money:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openTransferModal = () => {
  setTransferForm({ from_account_id: '', to_account_id: '', amount: '', description: '' });
  setShowTransferModal(true);
  };

  const userAccounts = accounts.filter(a => a.user_id === currentUser.id);
  const totalBalance = Object.values(accountBalances).reduce((sum, balance) => sum + balance, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <Navigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <ErrorBanner error={error} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        )}

        {!loading && activeTab === 'dashboard' && (
          <DashboardPage
            userAccounts={userAccounts}
            totalBalance={totalBalance}
            stocks={stocks}
            accountBalances={accountBalances}
            accountTrades={accountTrades}
            topPerformers={topPerformers}
            worstPerformers={worstPerformers}
            onSelectAccount={setSelectedAccount}
          />
        )}

        {!loading && activeTab === 'accounts' && (
          <AccountsPage
            accounts={userAccounts}
            accountBalances={accountBalances}
            onCreateAccount={() => {
              setEditingAccount(null);
              setAccountForm({ name: '', user_id: currentUser?.id || '' });
              setShowAccountModal(true);
            }}
            onEditAccount={(account) => {
              setEditingAccount(account);
              setAccountForm({ name: account.name, user_id: account.user_id });
              setShowAccountModal(true);
            }}
            onDeleteAccount={handleDeleteAccount}
            onDeposit={openDepositModal}
            onSelectAccount={(account) => {
              setSelectedAccount(account);
              setActiveTab('trading');
            }}
          />
        )}

        {!loading && activeTab === 'trading' && (
          <TradingPage
            accounts={userAccounts}
            stocks={stocks}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            accountTrades={accountTrades}
            accountPositions={accountPositions}
            accountBalances={accountBalances}
            onTrade={openTradeModal}
            onDeposit={openDepositModal}
          />
        )}

        {!loading && activeTab === 'stocks' && (
          <StocksPage 
            stocks={stocks}
            topPerformers={topPerformers}
            worstPerformers={worstPerformers}
            onTrade={openTradeModal} 
            accounts={userAccounts}
            onViewStock={openStockDetail}
          />
        )}

        {!loading && activeTab === 'transfers' && (
          <TransfersPage
            accounts={userAccounts}
            allAccounts={accounts}
            currentUser={currentUser}
            onOpenTransferModal={openTransferModal}
          />
        )}

        {!loading && activeTab === 'profile' && (
          <ProfilePage
            user={currentUser}
            onEdit={() => {
              setEditingUser(currentUser);
              setUserForm({ name: currentUser.name, email: currentUser.email, password: '', type: currentUser.type });
              setShowUserModal(true);
            }}
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
          currentUser={currentUser}
          loading={loading}
        />
      )}

      {showTradeModal && (
        <TradeModal
          mode={tradeMode}
          form={tradeForm}
          setForm={setTradeForm}
          onSubmit={handleTrade}
          onClose={() => {
            setShowTradeModal(false);
            setTradeModalPositions([]); // Clear positions when closing
          }}
          accounts={userAccounts}
          stocks={stocks}
          accountPositions={tradeModalPositions} // Use separate positions state
          onAccountChange={handleTradeFormAccountChange} // NEW: Pass handler for account changes
          loading={loading}
        />
      )}

      {showDepositModal && (
        <DepositModal
          account={selectedAccount}
          form={depositForm}
          setForm={setDepositForm}
          onSubmit={handleDeposit}
          onClose={() => setShowDepositModal(false)}
          loading={loading}
        />
      )}

      {showStockDetailModal && selectedStock && (
        <StockDetailModal
          stock={selectedStock}
          onClose={() => setShowStockDetailModal(false)}
          onTrade={openTradeModal}
          accounts={userAccounts}
        />
      )}
      {showTransferModal && (
        <TransferModal
          accounts={userAccounts}
          allAccounts={accounts}
          currentUser={currentUser}
          selectedAccount={selectedAccount}
          onClose={() => setShowTransferModal(false)}
          onSubmit={handleTransfer}
          loading={loading}
        />
      )}
    </div>
  );
}

export default App;