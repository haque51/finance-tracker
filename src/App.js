import React, { useState, useEffect, createContext, useContext } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, CreditCard, Target, Settings, FileText, Receipt, Calendar, DollarSign, Plus, Edit2, Trash2, Search, Menu, BarChart3, Check, Bell, Zap, Download, RefreshCw, AlertTriangle } from 'lucide-react';

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
    { id: 'txn1', date: '2025-10-01', type: 'income', accountId: 'acc1', payee: 'Salary', categoryId: 'cat1', amount: 4500, currency: 'EUR', memo: 'Monthly salary', isReconciled: false },
    { id: 'txn2', date: '2025-10-02', type: 'expense', accountId: 'acc1', payee: 'Supermarket', categoryId: 'cat7', amount: -120, currency: 'EUR', memo: 'Groceries', isReconciled: false },
    { id: 'txn3', date: '2025-10-03', type: 'expense', accountId: 'acc3', payee: 'Restaurant', categoryId: 'cat6', amount: -85, currency: 'EUR', memo: 'Dinner', isReconciled: false }
  ],
  categories: [
    { id: 'cat1', name: 'Salary', type: 'income', icon: '💰' },
    { id: 'cat2', name: 'Freelance', type: 'income', icon: '💼' },
    { id: 'cat4', name: 'Housing', type: 'expense', icon: '🏠' },
    { id: 'cat5', name: 'Food & Dining', type: 'expense', icon: '🍽️' },
    { id: 'cat6', name: 'Restaurants', type: 'expense', icon: '🍽️' },
    { id: 'cat7', name: 'Groceries', type: 'expense', icon: '🛒' },
    { id: 'cat8', name: 'Transportation', type: 'expense', icon: '🚗' },
    { id: 'cat9', name: 'Entertainment', type: 'expense', icon: '🎬' }
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
    { id: 'rec1', name: 'Monthly Rent', accountId: 'acc1', type: 'expense', payee: 'Landlord', categoryId: 'cat4', amount: -1200, currency: 'EUR', frequency: 'monthly', interval: 1, startDate: '2025-01-01', endDate: null, isActive: true, lastProcessed: '2025-09-01' }
  ],
  templates: [
    { id: 'tpl1', name: 'Grocery Shopping', accountId: 'acc1', type: 'expense', payee: 'Supermarket', categoryId: 'cat7', amount: -100, currency: 'EUR', memo: 'Weekly groceries' }
  ],
  debtPayoffPlans: [
    { id: 'dbt1', name: 'Credit Card Payoff', strategy: 'avalanche', extraPayment: 200, accountIds: ['acc3'], createdAt: '2025-10-01' }
  ],
  alerts: [
    { id: 'alt1', type: 'budget_exceeded', categoryId: 'cat5', threshold: 400, isActive: true, message: 'Food & Dining budget exceeded' }
  ],
  autoCategorizationRules: [
    { id: 'rule1', payeePattern: 'supermarket', categoryId: 'cat7', priority: 1, isActive: true },
    { id: 'rule2', payeePattern: 'restaurant', categoryId: 'cat6', priority: 2, isActive: true }
  ]
};

export default function FinanceTrackerApp() {
  const [state, setState] = useState(initialState);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.user.theme === 'dark');
  }, [state.user.theme]);

  const contextValue = { state, updateState, currentView, setCurrentView };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Finance Tracker</h1>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">{state.user.name}</span>
                <button
                  onClick={() => updateState({ user: { ...state.user, theme: state.user.theme === 'light' ? 'dark' : 'light' }})}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
              <NavItem icon={<Check className="w-5 h-5" />} label="Reconciliation" view="reconciliation" />
              <NavItem icon={<DollarSign className="w-5 h-5" />} label="Budget" view="budget" />
              <NavItem icon={<Target className="w-5 h-5" />} label="Goals" view="goals" />
              <NavItem icon={<CreditCard className="w-5 h-5" />} label="Debt" view="debt" />
              <NavItem icon={<Zap className="w-5 h-5" />} label="Insights" view="insights" />
              <NavItem icon={<FileText className="w-5 h-5" />} label="Reports" view="reports" />
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
              {currentView === 'reconciliation' && <ReconciliationView />}
              {currentView === 'budget' && <BudgetView />}
              {currentView === 'goals' && <GoalsView />}
              {currentView === 'debt' && <DebtPayoffView />}
              {currentView === 'insights' && <InsightsView />}
              {currentView === 'reports' && <ReportsView />}
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

  const monthTransactions = state.transactions.filter(t => t.date.startsWith(currentMonth));
  const monthlyIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = Math.abs(monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const netWorth = state.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) : 0;

  const spendingByCategory = {};
  monthTransactions.filter(t => t.type === 'expense').forEach(t => {
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
        <MetricCard title="Monthly Income" value={`€${monthlyIncome.toLocaleString()}`} icon={<TrendingUp className="w-6 h-6 text-green-600" />} trend="+5.2%" />
        <MetricCard title="Monthly Expenses" value={`€${monthlyExpenses.toLocaleString()}`} icon={<TrendingDown className="w-6 h-6 text-red-600" />} trend="-2.1%" />
        <MetricCard title="Net Worth" value={`€${netWorth.toLocaleString()}`} icon={<Wallet className="w-6 h-6 text-blue-600" />} trend="+1.8%" />
        <MetricCard title="Savings Rate" value={`${savingsRate}%`} icon={<Target className="w-6 h-6 text-purple-600" />} trend="+3.5%" />
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
          {state.accounts.map(account => (
            <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{account.type} • {account.institution}</p>
              </div>
              <p className={`text-lg font-semibold ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{account.currentBalance.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && <p className="text-sm mt-1 text-green-600">{trend} vs last month</p>}
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
        transactions: state.transactions.filter(t => t.accountId !== id)
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
        {state.accounts.map(account => (
          <div key={account.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{account.type}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${account.currentBalance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {account.currentBalance >= 0 ? 'Asset' : 'Debt'}
              </span>
            </div>
            <p className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{account.currency} {account.currentBalance.toLocaleString()}</p>
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
        ))}
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
      updateState({ accounts: state.accounts.map(a => a.id === account.id ? { ...a, ...formData } : a) });
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
            <input type="number" placeholder="Opening Balance" value={formData.openingBalance} onChange={e => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0, currentBalance: parseFloat(e.target.value) || 0 })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          )}
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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = state.transactions.filter(t => t.payee.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = (id) => {
    const txn = state.transactions.find(t => t.id === id);
    if (window.confirm('Delete this transaction?')) {
      const updatedAccounts = state.accounts.map(acc => {
        if (acc.id === txn.accountId) {
          return { ...acc, currentBalance: acc.currentBalance - txn.amount };
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
        <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} />}

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map(txn => {
              const category = state.categories.find(c => c.id === txn.categoryId);
              return (
                <tr key={txn.id}>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{txn.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{txn.payee}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{category ? category.icon + ' ' + category.name : 'Uncategorized'}</td>
                  <td className={`px-6 py-4 text-sm text-right font-semibold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{txn.currency} {txn.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(txn.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
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

function TransactionForm({ onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    accountId: state.accounts[0]?.id || '',
    payee: '',
    categoryId: state.categories[0]?.id || '',
    amount: 0,
    currency: 'EUR',
    memo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
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
      return acc;
    });
    updateState({ transactions: [...state.transactions, newTxn], accounts: updatedAccounts });
    onClose();
  };

  const filteredCategories = state.categories.filter(c => c.type === formData.type);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Transaction</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, categoryId: '' })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            {state.accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
          <input type="text" placeholder="Payee" value={formData.payee} onChange={e => setFormData({ ...formData, payee: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            <option value="">Select Category</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
          <input type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          <input type="text" placeholder="Memo" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Transaction</button>
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function CategoriesView() {
  const { state } = useApp();
  const incomeCategories = state.categories.filter(c => c.type === 'income');
  const expenseCategories = state.categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-green-600">Income Categories</h3>
          <div className="space-y-2">
            {incomeCategories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">{cat.icon} {cat.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-red-600">Expense Categories</h3>
          <div className="space-y-2">
            {expenseCategories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">{cat.icon} {cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecurringView() {
  const { state } = useApp();
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recurring & Templates</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recurring Transactions</h3>
        <div className="space-y-3">
          {state.recurringTransactions.map(rec => (
            <div key={rec.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">{rec.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{rec.payee} • Every {rec.interval} {rec.frequency}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Templates</h3>
        <div className="space-y-3">
          {state.templates.map(tpl => (
            <div key={tpl.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">{tpl.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tpl.payee}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReconciliationView() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reconciliation</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">Reconciliation feature coming soon. Match your transactions with bank statements.</p>
      </div>
    </div>
  );
}

function BudgetView() {
  const { state } = useApp();
  const selectedMonth = '2025-10';
  const expenseCategories = state.categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Budget</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Budgeted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {expenseCategories.map(cat => {
              const budget = state.budgets.find(b => b.categoryId === cat.id && b.month === selectedMonth);
              return (
                <tr key={cat.id}>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{cat.icon} {cat.name}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">€{budget?.budgeted || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GoalsView() {
  const { state } = useApp();
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Goals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount * 100).toFixed(1);
          return (
            <div key={goal.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{goal.name}</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">€{goal.currentAmount.toLocaleString()} / €{goal.targetAmount.toLocaleString()}</span>
                  <span className="text-blue-600 font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${Math.min(parseFloat(progress), 100)}%` }}></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target: {goal.targetDate}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DebtPayoffView() {
  const { state } = useApp();
  const debtAccounts = state.accounts.filter(a => a.currentBalance < 0);
  const totalDebt = Math.abs(debtAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0));

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Debt Payoff</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard title="Total Debt" value={`€${totalDebt.toLocaleString()}`} icon={<CreditCard className="w-6 h-6 text-red-600" />} trend="" />
        <MetricCard title="Debt Accounts" value={debtAccounts.length.toString()} icon={<Wallet className="w-6 h-6 text-orange-600" />} trend="" />
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Debt Accounts</h3>
        <div className="space-y-3">
          {debtAccounts.map(acc => (
            <div key={acc.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="text-gray-900 dark:text-white">{acc.name}</span>
              <span className="text-lg font-semibold text-red-600">€{Math.abs(acc.currentBalance).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsView() {
  const { state } = useApp();
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Insights</h2>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Zap className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Insights</h4>
            <p className="text-gray-700 dark:text-gray-300">Your financial insights will appear here. Track spending patterns and get personalized recommendations.</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Active Alerts</h3>
        <div className="space-y-3">
          {state.alerts.map(alert => (
            <div key={alert.id} className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start space-x-3">
                <Bell className="w-5 h-5 text-yellow-600 mt-1" />
                <p className="text-gray-900 dark:text-white">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsView() {
  const { state } = useApp();
  const [dateRange, setDateRange] = useState({ start: '2025-10-01', end: '2025-10-31' });

  const filteredTransactions = state.transactions.filter(t => {
    return t.date >= dateRange.start && t.date <= dateRange.end;
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard title="Total Income" value={`€${totalIncome.toLocaleString()}`} icon={<TrendingUp className="w-6 h-6 text-green-600" />} trend="" />
        <MetricCard title="Total Expenses" value={`€${totalExpenses.toLocaleString()}`} icon={<TrendingDown className="w-6 h-6 text-red-600" />} trend="" />
      </div>
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
        </div>
      </div>
    </div>
  );
}
