import React, { useState, useEffect, createContext, useContext } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target, Settings, Receipt, Calendar, DollarSign, Plus, Edit2, Trash2, Search, Menu, BarChart3, ArrowRightLeft, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

const AppContext = createContext();

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const initialState = {
  user: {
    id: 'user1',
    name: 'Demo User',
    email: 'demo@financetracker.com',
    theme: 'light',
    baseCurrency: 'EUR',
    monthlyIncomeGoal: 5000,
    monthlySavingsGoal: 1000
  },
  accounts: [
    { id: 'acc1', name: 'Main Checking', type: 'checking', currency: 'EUR', institution: 'Bank A', openingBalance: 5000, currentBalance: 5000, isActive: true },
    { id: 'acc2', name: 'Savings', type: 'savings', currency: 'EUR', institution: 'Bank A', openingBalance: 10000, currentBalance: 10000, isActive: true },
    { id: 'acc3', name: 'Credit Card', type: 'credit_card', currency: 'EUR', institution: 'Bank B', openingBalance: 0, currentBalance: -1500, isActive: true }
  ],
  transactions: [
    { id: 'txn1', date: '2025-10-01', type: 'income', accountId: 'acc1', payee: 'Salary', categoryId: 'cat1', subcategoryId: null, amount: 4500, currency: 'EUR', memo: 'Monthly salary', isReconciled: false },
    { id: 'txn2', date: '2025-10-02', type: 'expense', accountId: 'acc1', payee: 'Supermarket', categoryId: 'cat5', subcategoryId: 'cat7', amount: -120, currency: 'EUR', memo: 'Groceries', isReconciled: false },
    { id: 'txn3', date: '2025-10-03', type: 'expense', accountId: 'acc3', payee: 'Restaurant', categoryId: 'cat5', subcategoryId: 'cat6', amount: -85, currency: 'EUR', memo: 'Dinner', isReconciled: false },
    { id: 'txn4', date: '2025-09-01', type: 'income', accountId: 'acc1', payee: 'Salary', categoryId: 'cat1', subcategoryId: null, amount: 4200, currency: 'EUR', memo: 'Monthly salary', isReconciled: false },
    { id: 'txn5', date: '2025-09-15', type: 'expense', accountId: 'acc1', payee: 'Shopping', categoryId: 'cat5', subcategoryId: 'cat7', amount: -150, currency: 'EUR', memo: 'Groceries', isReconciled: false }
  ],
  categories: [
    { id: 'cat1', name: 'Salary', type: 'income', parentId: null, icon: '💰' },
    { id: 'cat2', name: 'Freelance', type: 'income', parentId: null, icon: '💼' },
    { id: 'cat4', name: 'Housing', type: 'expense', parentId: null, icon: '🏠' },
    { id: 'cat5', name: 'Food & Dining', type: 'expense', parentId: null, icon: '🍽️' },
    { id: 'cat6', name: 'Restaurants', type: 'expense', parentId: 'cat5', icon: '🍽️' },
    { id: 'cat7', name: 'Groceries', type: 'expense', parentId: 'cat5', icon: '🛒' },
    { id: 'cat8', name: 'Transportation', type: 'expense', parentId: null, icon: '🚗' },
    { id: 'cat9', name: 'Entertainment', type: 'expense', parentId: null, icon: '🎬' }
  ],
  budgets: [
    { id: 'bud1', month: '2025-10', categoryId: 'cat5', budgeted: 400 },
    { id: 'bud2', month: '2025-10', categoryId: 'cat8', budgeted: 300 }
  ],
  goals: [
    { id: 'goal1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 10000, targetDate: '2025-12-31' },
    { id: 'goal2', name: 'Vacation', targetAmount: 3000, currentAmount: 500, targetDate: '2025-08-01' }
  ],
  recurringTransactions: [
    { id: 'rec1', name: 'Monthly Rent', accountId: 'acc1', type: 'expense', payee: 'Landlord', categoryId: 'cat4', subcategoryId: null, amount: -1200, currency: 'EUR', frequency: 'monthly', interval: 1, startDate: '2025-01-01', endDate: null, isActive: true, lastProcessed: '2025-09-01' }
  ],
  templates: [
    { id: 'tpl1', name: 'Grocery Shopping', accountId: 'acc1', type: 'expense', payee: 'Supermarket', categoryId: 'cat5', subcategoryId: 'cat7', amount: -100, currency: 'EUR', memo: 'Weekly groceries' }
  ],
  exchangeRates: { USD: 1.1, BDT: 0.0091, EUR: 1 }
};

export default function FinanceTrackerApp() {
  const [state, setState] = useState(initialState);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    if (state.user.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.user.theme]);

  const toggleTheme = () => {
    const newTheme = state.user.theme === 'light' ? 'dark' : 'light';
    updateState({ user: { ...state.user, theme: newTheme } });
  };

  const contextValue = { state, updateState, currentView, setCurrentView };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Lumina Finances</h1>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">{state.user.name}</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {state.user.theme === 'light' ? '🌙' : '☀️'}
                </button>
              </div>
              <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen`}>
            <nav className="p-4 space-y-1">
              <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Dashboard" view="dashboard" />
              <NavItem icon={<Wallet className="w-5 h-5" />} label="Accounts" view="accounts" />
              <NavItem icon={<Receipt className="w-5 h-5" />} label="Transactions" view="transactions" />
              <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Categories" view="categories" />
              <NavItem icon={<Calendar className="w-5 h-5" />} label="Recurring" view="recurring" />
              <NavItem icon={<DollarSign className="w-5 h-5" />} label="Budget" view="budget" />
              <NavItem icon={<Target className="w-5 h-5" />} label="Goals" view="goals" />
              <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" view="settings" />
            </nav>
          </aside>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {currentView === 'dashboard' && <DashboardView />}
              {currentView === 'accounts' && <AccountsView />}
              {currentView === 'transactions' && <TransactionsView />}
              {currentView === 'categories' && <CategoriesView />}
              {currentView === 'recurring' && <RecurringView />}
              {currentView === 'budget' && <BudgetView />}
              {currentView === 'goals' && <GoalsView />}
              {currentView === 'settings' && <SettingsView />}
            </div>
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
}

function NavItem({ icon, label, view }) {
  const { currentView, setCurrentView } = useApp();
  const isActive = currentView === view;

  return (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
        isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function DashboardView() {
  const { state } = useApp();
  const currentMonth = '2025-10';
  const previousMonth = '2025-09';

  const currentMonthTxns = state.transactions.filter(t => t.date.startsWith(currentMonth));
  const previousMonthTxns = state.transactions.filter(t => t.date.startsWith(previousMonth));

  const monthlyIncome = currentMonthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const previousIncome = previousMonthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const incomeChange = previousIncome > 0 ? ((monthlyIncome - previousIncome) / previousIncome * 100).toFixed(1) : 0;
  const incomeAbsChange = monthlyIncome - previousIncome;

  const monthlyExpenses = Math.abs(currentMonthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const previousExpenses = Math.abs(previousMonthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const expenseChange = previousExpenses > 0 ? ((monthlyExpenses - previousExpenses) / previousExpenses * 100).toFixed(1) : 0;
  const expenseAbsChange = monthlyExpenses - previousExpenses;

  const netWorth = state.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const previousNetWorth = netWorth - (monthlyIncome - monthlyExpenses);
  const netWorthChange = previousNetWorth !== 0 ? ((netWorth - previousNetWorth) / Math.abs(previousNetWorth) * 100).toFixed(1) : 0;
  const netWorthAbsChange = netWorth - previousNetWorth;

  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) : 0;
  const previousSavingsRate = previousIncome > 0 ? ((previousIncome - previousExpenses) / previousIncome * 100).toFixed(1) : 0;
  const savingsRateChange = (savingsRate - previousSavingsRate).toFixed(1);

  const spendingByCategory = {};
  currentMonthTxns.filter(t => t.type === 'expense').forEach(t => {
    const cat = state.categories.find(c => c.id === t.categoryId);
    const catName = cat ? cat.name : 'Uncategorized';
    spendingByCategory[catName] = (spendingByCategory[catName] || 0) + Math.abs(t.amount);
  });

  const categoryData = Object.entries(spendingByCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">October 2025</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Monthly Income" 
          value={`€${monthlyIncome.toLocaleString()}`} 
          icon={<TrendingUp className="w-6 h-6 text-green-600" />} 
          change={`€${incomeAbsChange.toLocaleString()}`}
          changePercent={`${incomeChange >= 0 ? '+' : ''}${incomeChange}%`}
          isPositive={incomeChange >= 0}
        />
        <MetricCard 
          title="Monthly Expenses" 
          value={`€${monthlyExpenses.toLocaleString()}`} 
          icon={<TrendingDown className="w-6 h-6 text-red-600" />} 
          change={`€${expenseAbsChange.toLocaleString()}`}
          changePercent={`${expenseChange >= 0 ? '+' : ''}${expenseChange}%`}
          isPositive={expenseChange <= 0}
        />
        <MetricCard 
          title="Net Worth" 
          value={`€${netWorth.toLocaleString()}`} 
          icon={<Wallet className="w-6 h-6 text-blue-600" />} 
          change={`€${netWorthAbsChange.toLocaleString()}`}
          changePercent={`${netWorthChange >= 0 ? '+' : ''}${netWorthChange}%`}
          isPositive={netWorthChange >= 0}
        />
        <MetricCard 
          title="Savings Rate" 
          value={`${savingsRate}%`} 
          icon={<Target className="w-6 h-6 text-purple-600" />} 
          change={`${savingsRateChange}% pts`}
          changePercent=""
          isPositive={savingsRateChange >= 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">No expense data</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Net Worth by Account</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={state.accounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="currentBalance" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Balances</h3>
        <div className="space-y-3">
          {state.accounts.map(account => {
            const balanceInBase = account.currentBalance * (state.exchangeRates[account.currency] || 1) / state.exchangeRates[state.user.baseCurrency];
            return (
              <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{account.type} • {account.institution}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {account.currency} {account.currentBalance.toLocaleString()}
                  </p>
                  {account.currency !== state.user.baseCurrency && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ≈ {state.user.baseCurrency} {balanceInBase.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, change, changePercent, isPositive }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className={`text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change} {changePercent && `(${changePercent})`} vs last month
          </p>
        </div>
        {icon}
      </div>
    </div>
  );
}

function AccountsView() {
  const { state, updateState } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure? This will delete all associated transactions.')) {
      updateState({
        accounts: state.accounts.filter(a => a.id !== id),
        transactions: state.transactions.filter(t => t.accountId !== id && t.transferAccountId !== id)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts</h2>
        <button onClick={() => { setShowForm(true); setEditingAccount(null); }} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {showForm && <AccountForm account={editingAccount} onClose={() => { setShowForm(false); setEditingAccount(null); }} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.accounts.map(account => {
          const balanceInBase = account.currentBalance * (state.exchangeRates[account.currency] || 1) / state.exchangeRates[state.user.baseCurrency];
          return (
            <div key={account.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{account.type}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${account.currentBalance >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {account.currentBalance >= 0 ? 'Asset' : 'Debt'}
                </span>
              </div>
              <p className={`text-2xl font-bold mb-2 ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {account.currency} {account.currentBalance.toLocaleString()}
              </p>
              {account.currency !== state.user.baseCurrency && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  ≈ {state.user.baseCurrency} {balanceInBase.toFixed(2)}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Institution: {account.institution}</p>
              <div className="flex space-x-2">
                <button onClick={() => { setEditingAccount(account); setShowForm(true); }} className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button onClick={() => handleDelete(account.id)} className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded hover:bg-red-100 dark:hover:bg-red-900/50">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AccountForm({ account, onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState(account || {
    name: '',
    type: 'checking',
    currency: 'EUR',
    institution: '',
    openingBalance: 0,
    currentBalance: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (account) {
      updateState({ accounts: state.accounts.map(a => a.id === account.id ? { ...a, ...formData, openingBalance: a.openingBalance } : a) });
    } else {
      const newAccount = { ...formData, id: 'acc' + Date.now(), isActive: true };
      updateState({ accounts: [...state.accounts, newAccount] });
    }
    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{account ? 'Edit Account' : 'Add New Account'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Account Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit_card">Credit Card</option>
            <option value="loan">Loan</option>
            <option value="investment">Investment</option>
            <option value="cash">Cash</option>
          </select>
          <select value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="BDT">BDT</option>
          </select>
          <input type="text" placeholder="Institution" value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          {!account && (
            <input type="number" step="0.01" placeholder="Opening Balance" value={formData.openingBalance} onChange={e => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0, currentBalance: parseFloat(e.target.value) || 0 })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          )}
          <input type="number" step="0.01" placeholder="Current Balance" value={formData.currentBalance} onChange={e => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{account ? 'Update' : 'Create'}</button>
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function TransactionsView() {
  const { state, updateState } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = state.transactions.filter(t => t.payee.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = (id) => {
    const txn = state.transactions.find(t => t.id === id);
    if (window.confirm('Delete this transaction?')) {
      const updatedAccounts = state.accounts.map(acc => {
        if (acc.id === txn.accountId) {
          return { ...acc, currentBalance: acc.currentBalance - txn.amount };
        }
        if (txn.type === 'transfer' && acc.id === txn.transferAccountId) {
          return { ...acc, currentBalance: acc.currentBalance + txn.amount };
        }
        return acc;
      });
      updateState({ transactions: state.transactions.filter(t => t.id !== id), accounts: updatedAccounts });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h2>
        <button onClick={() => { setShowForm(true); setEditingTransaction(null); }} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {showForm && <TransactionForm transaction={editingTransaction} onClose={() => { setShowForm(false); setEditingTransaction(null); }} />}

      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map(txn => {
              const category = state.categories.find(c => c.id === txn.categoryId);
              const subcategory = txn.subcategoryId ? state.categories.find(c => c.id === txn.subcategoryId) : null;
              return (
                <tr key={txn.id}>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{txn.date}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      txn.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      txn.type === 'expense' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {txn.type === 'transfer' ? <ArrowRightLeft className="w-3 h-3 inline" /> : txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{txn.payee}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {category ? `${category.icon} ${category.name}` : 'Uncategorized'}
                    {subcategory && ` > ${subcategory.name}`}
                  </td>
                  <td className={`px-6 py-4 text-sm text-right font-semibold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{txn.currency} {txn.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => { setEditingTransaction(txn); setShowForm(true); }} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(txn.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionForm({ transaction, onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState(transaction || {
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    accountId: state.accounts[0]?.id || '',
    transferAccountId: '',
    payee: '',
    categoryId: '',
    subcategoryId: '',
    amount: 0,
    currency: 'EUR',
    memo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (transaction) {
      const oldTxn = state.transactions.find(t => t.id === transaction.id);
      const updatedAccounts = state.accounts.map(acc => {
        if (acc.id === oldTxn.accountId) {
          acc = { ...acc, currentBalance: acc.currentBalance - oldTxn.amount };
        }
        if (oldTxn.type === 'transfer' && acc.id === oldTxn.transferAccountId) {
          acc = { ...acc, currentBalance: acc.currentBalance + oldTxn.amount };
        }
        if (acc.id === formData.accountId) {
          acc = { ...acc, currentBalance: acc.currentBalance + (formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount))) };
        }
        if (formData.type === 'transfer' && acc.id === formData.transferAccountId) {
          acc = { ...acc, currentBalance: acc.currentBalance - (formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount))) };
        }
        return acc;
      });
      
      updateState({
        transactions: state.transactions.map(t => t.id === transaction.id ? {
          ...formData,
          id: transaction.id,
          amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
          isReconciled: t.isReconciled
        } : t),
        accounts: updatedAccounts
      });
    } else {
      const newTxn = {
        ...formData,
        id: 'txn' + Date.now(),
        amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
        isReconciled: false
      };
      
      const updatedAccounts = state.accounts.map(acc => {
        if (acc.id === formData.accountId) {
          return { ...acc, currentBalance: acc.currentBalance + newTxn.amount };
        }
        if (formData.type === 'transfer' && acc.id === formData.transferAccountId) {
          return { ...acc, currentBalance: acc.currentBalance - newTxn.amount };
        }
        return acc;
      });
      
      updateState({ transactions: [...state.transactions, newTxn], accounts: updatedAccounts });
    }
    onClose();
  };

  const filteredCategories = state.categories.filter(c => c.type === formData.type && !c.parentId);
  const subcategories = formData.categoryId ? state.categories.filter(c => c.parentId === formData.categoryId) : [];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{transaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, categoryId: '', subcategoryId: '' })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
          <select value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            <option value="">Select Account</option>
            {state.accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
          {formData.type === 'transfer' && (
            <select value={formData.transferAccountId} onChange={e => setFormData({ ...formData, transferAccountId: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
              <option value="">To Account</option>
              {state.accounts.filter(a => a.id !== formData.accountId).map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          )}
          <input type="text" placeholder="Payee" value={formData.payee} onChange={e => setFormData({ ...formData, payee: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          {formData.type !== 'transfer' && (
            <>
              <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                <option value="">Select Category</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
              {subcategories.length > 0 && (
                <select value={formData.subcategoryId} onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="">Select Subcategory (Optional)</option>
                  {subcategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              )}
            </>
          )}
          <input type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <input type="text" placeholder="Memo" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{transaction ? 'Update' : 'Add'} Transaction</button>
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function CategoriesView() {
  const { state, updateState } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const incomeCategories = state.categories.filter(c => c.type === 'income' && !c.parentId);
  const expenseCategories = state.categories.filter(c => c.type === 'expense' && !c.parentId);

  const handleDelete = (id) => {
    const hasSubcategories = state.categories.some(c => c.parentId === id);
    const hasTransactions = state.transactions.some(t => t.categoryId === id || t.subcategoryId === id);
    
    if (hasSubcategories) {
      alert('Cannot delete category with subcategories. Delete subcategories first.');
      return;
    }
    
    if (hasTransactions) {
      if (!window.confirm('This category has transactions. Transactions will be uncategorized. Continue?')) {
        return;
      }
    }
    
    updateState({ categories: state.categories.filter(c => c.id !== id) });
  };

  const getSubcategories = (parentId) => state.categories.filter(c => c.parentId === parentId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h2>
        <button onClick={() => { setShowForm(true); setEditingCategory(null); }} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {showForm && <CategoryForm category={editingCategory} onClose={() => { setShowForm(false); setEditingCategory(null); }} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-green-600">Income Categories</h3>
          <div className="space-y-2">
            {incomeCategories.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white font-medium">{cat.icon} {cat.name}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => { setEditingCategory(cat); setShowForm(true); }} className="text-blue-600 hover:text-blue-800">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {getSubcategories(cat.id).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-2 pl-8 bg-gray-100 dark:bg-gray-600 rounded-lg mt-1">
                    <span className="text-gray-900 dark:text-white text-sm">{sub.icon} {sub.name}</span>
                    <div className="flex space-x-2">
                      <button onClick={() => { setEditingCategory(sub); setShowForm(true); }} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(sub.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-red-600">Expense Categories</h3>
          <div className="space-y-2">
            {expenseCategories.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white font-medium">{cat.icon} {cat.name}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => { setEditingCategory(cat); setShowForm(true); }} className="text-blue-600 hover:text-blue-800">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {getSubcategories(cat.id).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-2 pl-8 bg-gray-100 dark:bg-gray-600 rounded-lg mt-1">
                    <span className="text-gray-900 dark:text-white text-sm">{sub.icon} {sub.name}</span>
                    <div className="flex space-x-2">
                      <button onClick={() => { setEditingCategory(sub); setShowForm(true); }} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(sub.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryForm({ category, onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState(category || {
    name: '',
    type: 'expense',
    parentId: null,
    icon: '📁'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (category) {
      updateState({ categories: state.categories.map(c => c.id === category.id ? { ...c, ...formData } : c) });
    } else {
      const newCategory = { ...formData, id: 'cat' + Date.now() };
      updateState({ categories: [...state.categories, newCategory] });
    }
    onClose();
  };

  const parentCategories = state.categories.filter(c => c.type === formData.type && !c.parentId && c.id !== category?.id);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{category ? 'Edit Category' : 'Add Category'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Category Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, parentId: null })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={!!category}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={formData.parentId || ''} onChange={e => setFormData({ ...formData, parentId: e.target.value || null })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="">No Parent (Main Category)</option>
            {parentCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
          <input type="text" placeholder="Icon (emoji)" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" maxLength="2" />
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{category ? 'Update' : 'Add'} Category</button>
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function RecurringView() {
  const { state, updateState } = useApp();
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  const processRecurring = (recurringId) => {
    const recurring = state.recurringTransactions.find(r => r.id === recurringId);
    if (!recurring) return;

    const newTxn = {
      id: 'txn' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: recurring.type,
      accountId: recurring.accountId,
      payee: recurring.payee,
      categoryId: recurring.categoryId,
      subcategoryId: recurring.subcategoryId,
      amount: recurring.amount,
      currency: recurring.currency,
      memo: `Recurring: ${recurring.name}`,
      isReconciled: false
    };

    const updatedAccounts = state.accounts.map(acc => {
      if (acc.id === recurring.accountId) {
        return { ...acc, currentBalance: acc.currentBalance + recurring.amount };
      }
      return acc;
    });

    updateState({
      transactions: [...state.transactions, newTxn],
      accounts: updatedAccounts,
      recurringTransactions: state.recurringTransactions.map(r =>
        r.id === recurringId ? { ...r, lastProcessed: newTxn.date } : r
      )
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recurring & Templates</h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recurring Transactions</h3>
          <button onClick={() => setShowRecurringForm(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>Add Recurring</span>
          </button>
        </div>

        {showRecurringForm && <RecurringForm onClose={() => setShowRecurringForm(false)} />}

        <div className="space-y-3">
          {state.recurringTransactions.map(rec => {
            const account = state.accounts.find(a => a.id === rec.accountId);
            const category = state.categories.find(c => c.id === rec.categoryId);
            return (
              <div key={rec.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{rec.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{rec.payee} • {category?.name} • {account?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Every {rec.interval} {rec.frequency}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last processed: {rec.lastProcessed || 'Never'}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className={`text-lg font-semibold ${rec.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {rec.currency} {rec.amount.toLocaleString()}
                    </p>
                    <button onClick={() => processRecurring(rec.id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                      Process Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Templates</h3>
          <button onClick={() => setShowTemplateForm(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>Add Template</span>
          </button>
        </div>

        {showTemplateForm && <TemplateForm onClose={() => setShowTemplateForm(false)} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.templates.map(tpl => {
            const category = state.categories.find(c => c.id === tpl.categoryId);
            return (
              <div key={tpl.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tpl.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{tpl.payee} • {category?.name}</p>
                <p className={`text-lg font-semibold ${tpl.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tpl.currency} {tpl.amount.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RecurringForm({ onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    accountId: state.accounts[0]?.id || '',
    type: 'expense',
    payee: '',
    categoryId: '',
    subcategoryId: '',
    amount: 0,
    currency: 'EUR',
    frequency: 'monthly',
    interval: 1,
    startDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecurring = {
      ...formData,
      id: 'rec' + Date.now(),
      amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
      lastProcessed: null,
      endDate: null
    };
    updateState({ recurringTransactions: [...state.recurringTransactions, newRecurring] });
    onClose();
  };

  const filteredCategories = state.categories.filter(c => c.type === formData.type && !c.parentId);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Recurring Transaction</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            {state.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>
          <input type="text" placeholder="Payee" value={formData.payee} onChange={e => setFormData({ ...formData, payee: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            <option value="">Select Category</option>
            {filteredCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
          </select>
          <input type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <select value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input type="number" placeholder="Interval" value={formData.interval} onChange={e => setFormData({ ...formData, interval: parseInt(e.target.value) })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function TemplateForm({ onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    accountId: state.accounts[0]?.id || '',
    type: 'expense',
    payee: '',
    categoryId: '',
    subcategoryId: '',
    amount: 0,
    currency: 'EUR',
    memo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTemplate = {
      ...formData,
      id: 'tpl' + Date.now(),
      amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount))
    };
    updateState({ templates: [...state.templates, newTemplate] });
    onClose();
  };

  const filteredCategories = state.categories.filter(c => c.type === formData.type && !c.parentId);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Template</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Template Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            {state.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>
          <input type="text" placeholder="Payee" value={formData.payee} onChange={e => setFormData({ ...formData, payee: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            <option value="">Select Category</option>
            {filteredCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
          </select>
          <input type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function BudgetView() {
  const { state, updateState } = useApp();
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [editingBudget, setEditingBudget] = useState({});

  // Get all expense categories (parent categories only)
  const expenseCategories = state.categories.filter(c => c.type === 'expense' && !c.parentId);

  // Get transactions for selected month
  const monthTransactions = state.transactions.filter(t => 
    t.date.startsWith(selectedMonth) && t.type === 'expense'
  );

  // Calculate spending by category for selected month
  const getSpentByCategory = (categoryId) => {
    const spent = monthTransactions
      .filter(t => t.categoryId === categoryId)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return spent;
  };

  // Get budget for category and month
  const getBudget = (categoryId) => {
    const budget = state.budgets.find(b => 
      b.categoryId === categoryId && b.month === selectedMonth
    );
    return budget?.budgeted || 0;
  };

  // Calculate totals
  const totalBudgeted = expenseCategories.reduce((sum, cat) => sum + getBudget(cat.id), 0);
  const totalSpent = expenseCategories.reduce((sum, cat) => sum + getSpentByCategory(cat.id), 0);
  const totalRemaining = totalBudgeted - totalSpent;

  // Handle budget update
  const updateBudget = (categoryId, amount) => {
    const existingBudget = state.budgets.find(b => 
      b.categoryId === categoryId && b.month === selectedMonth
    );

    if (existingBudget) {
      updateState({
        budgets: state.budgets.map(b => 
          b.id === existingBudget.id 
            ? { ...b, budgeted: parseFloat(amount) || 0 }
            : b
        )
      });
    } else {
      const newBudget = {
        id: 'bud' + Date.now(),
        month: selectedMonth,
        categoryId: categoryId,
        budgeted: parseFloat(amount) || 0
      };
      updateState({
        budgets: [...state.budgets, newBudget]
      });
    }
    setEditingBudget({});
  };

  // Month navigation
  const changeMonth = (direction) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newMonth = month + direction;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // Format month display
  const formatMonthDisplay = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header with Month Navigation */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Budget</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[200px] text-center">
            {formatMonthDisplay(selectedMonth)}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budgeted</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{totalBudgeted.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{totalSpent.toLocaleString()}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {totalRemaining >= 0 ? 'Remaining' : 'Overspent'}
              </p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{Math.abs(totalRemaining).toLocaleString()}
              </p>
            </div>
            {totalRemaining >= 0 ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
        </div>
      </div>

      {/* Category Budget Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Budgeted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Spent
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {expenseCategories.map(category => {
                const budgeted = getBudget(category.id);
                const spent = getSpentByCategory(category.id);
                const remaining = budgeted - spent;
                const percentSpent = budgeted > 0 ? (spent / budgeted) * 100 : 0;
                const isOverBudget = remaining < 0;

                return (
                  <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingBudget[category.id] ? (
                        <input
                          type="number"
                          step="0.01"
                          autoFocus
                          defaultValue={budgeted}
                          onBlur={(e) => updateBudget(category.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateBudget(category.id, e.target.value);
                            } else if (e.key === 'Escape') {
                              setEditingBudget({});
                            }
                          }}
                          className="w-24 px-2 py-1 text-right border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingBudget({ [category.id]: true })}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          €{budgeted.toLocaleString()}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        €{spent.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-semibold ${
                        isOverBudget ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {isOverBudget && '-'}€{Math.abs(remaining).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isOverBudget 
                                  ? 'bg-red-600' 
                                  : percentSpent > 80 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(percentSpent, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className={`text-xs font-medium ${
                          isOverBudget 
                            ? 'text-red-600' 
                            : percentSpent > 80 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                        }`}>
                          {percentSpent.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Tip:</strong> Click on any budgeted amount to edit it. Press Enter to save or Escape to cancel.
        </p>
      </div>
    </div>
  );
}
function GoalsView() {
  const { state, updateState } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      updateState({
        goals: state.goals.filter(g => g.id !== id)
      });
    }
  };

  const handleContribute = (goalId, amount) => {
    const contribution = parseFloat(amount);
    if (isNaN(contribution) || contribution <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    updateState({
      goals: state.goals.map(g => 
        g.id === goalId 
          ? { ...g, currentAmount: g.currentAmount + contribution }
          : g
      )
    });
  };

  // Sync linked account balances with goals
  const goalsWithLinkedAccounts = state.goals.map(goal => {
    if (goal.linkedAccountId) {
      const linkedAccount = state.accounts.find(a => a.id === goal.linkedAccountId);
      if (linkedAccount) {
        return { ...goal, currentAmount: linkedAccount.currentBalance };
      }
    }
    return goal;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Goals</h2>
        <button 
          onClick={() => { setShowForm(true); setEditingGoal(null); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {showForm && (
        <GoalForm 
          goal={editingGoal} 
          onClose={() => { setShowForm(false); setEditingGoal(null); }} 
        />
      )}

      {goalsWithLinkedAccounts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Goals Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start by creating your first financial goal
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goalsWithLinkedAccounts.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount * 100).toFixed(1);
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysUntilTarget = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysUntilTarget < 0;
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            
            const linkedAccount = goal.linkedAccountId 
              ? state.accounts.find(a => a.id === goal.linkedAccountId)
              : null;

            return (
              <div 
                key={goal.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Goal Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {goal.name}
                      </h3>
                      {linkedAccount && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                          <span>🔗</span>
                          <span>Linked to {linkedAccount.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setEditingGoal(goal); setShowForm(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        €{goal.currentAmount.toLocaleString()} / €{goal.targetAmount.toLocaleString()}
                      </span>
                      <span className={`font-semibold ${
                        isCompleted ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          isCompleted ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(parseFloat(progress), 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Goal Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          €{remaining.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Target Date</p>
                        <p className={`text-sm font-semibold ${
                          isOverdue ? 'text-red-600' : 'text-gray-900 dark:text-white'
                        }`}>
                          {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4">
                    {isCompleted ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Goal Achieved!
                      </span>
                    ) : isOverdue ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Overdue by {Math.abs(daysUntilTarget)} days
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {daysUntilTarget} days remaining
                      </span>
                    )}
                  </div>
                </div>

                {/* Contribution Section */}
                {!goal.linkedAccountId && !isCompleted && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
                    <ContributionForm 
                      goalId={goal.id} 
                      onContribute={handleContribute}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GoalForm({ goal, onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState(goal || {
    name: '',
    targetAmount: '',
    currentAmount: 0,
    targetDate: '',
    linkedAccountId: ''
  });

  const handleSubmit = () => {
    const targetAmount = parseFloat(formData.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      alert('Please enter a valid target amount');
      return;
    }

    if (!formData.name || !formData.targetDate) {
      alert('Please fill in all required fields');
      return;
    }

    // If linking to an account, use the account's balance as current amount
    let currentAmount = formData.currentAmount;
    if (formData.linkedAccountId) {
      const linkedAccount = state.accounts.find(a => a.id === formData.linkedAccountId);
      if (linkedAccount) {
        currentAmount = linkedAccount.currentBalance;
      }
    }

    if (goal) {
      // Edit existing goal
      updateState({
        goals: state.goals.map(g =>
          g.id === goal.id
            ? {
                ...g,
                name: formData.name,
                targetAmount: targetAmount,
                targetDate: formData.targetDate,
                linkedAccountId: formData.linkedAccountId || null,
                currentAmount: formData.linkedAccountId ? currentAmount : g.currentAmount
              }
            : g
        )
      });
    } else {
      // Add new goal
      const newGoal = {
        id: 'goal' + Date.now(),
        name: formData.name,
        targetAmount: targetAmount,
        currentAmount: currentAmount,
        targetDate: formData.targetDate,
        linkedAccountId: formData.linkedAccountId || null
      };
      updateState({
        goals: [...state.goals, newGoal]
      });
    }

    onClose();
  };

  const savingsAccounts = state.accounts.filter(a => 
    a.type === 'savings' || a.type === 'investment'
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {goal ? 'Edit Goal' : 'Add New Goal'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Goal Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Emergency Fund, Vacation, New Car"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Amount (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.targetAmount}
              onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
              placeholder="10000"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Date
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Link to Savings Account (Optional)
          </label>
          <select
            value={formData.linkedAccountId || ''}
            onChange={e => setFormData({ ...formData, linkedAccountId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">No Account Link</option>
            {savingsAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (€{acc.currentBalance.toLocaleString()})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            When linked, the goal's current amount will automatically match the account balance
          </p>
        </div>

        {!goal && !formData.linkedAccountId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Initial Amount (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.currentAmount}
              onChange={e => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {goal ? 'Update Goal' : 'Create Goal'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ContributionForm({ goalId, onContribute }) {
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    if (amount) {
      onContribute(goalId, amount);
      setAmount('');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <TrendingUp className="w-5 h-5 text-green-600" />
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        placeholder="Add contribution"
        className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <button
        onClick={handleAdd}
        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Add
      </button>
    </div>
  );
}

function SettingsView() {
  const { state, updateState } = useApp();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">User Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input type="text" value={state.user.name} onChange={e => updateState({ user: { ...state.user, name: e.target.value }})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input type="email" value={state.user.email} onChange={e => updateState({ user: { ...state.user, email: e.target.value }})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Currency</label>
            <select value={state.user.baseCurrency} onChange={e => updateState({ user: { ...state.user, baseCurrency: e.target.value }})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="BDT">BDT</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
