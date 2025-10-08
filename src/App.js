import React, { useState, useEffect, createContext, useContext } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target, Settings, Receipt, Calendar, DollarSign, Plus, Edit2, Trash2, Search, Menu, BarChart3, ChevronRight, CheckCircle, AlertCircle, X, CreditCard, Brain, ArrowRightLeft, Download, Upload, RefreshCw } from 'lucide-react';

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
    secondaryCurrencies: ['USD', 'BDT'],
    monthlyIncomeGoal: 5000, 
    monthlySavingsGoal: 1000,
    defaultAccount: 'acc1',
    autoBackup: true
  },
  accounts: [
    { id: 'acc1', name: 'Main Checking', type: 'checking', currency: 'EUR', institution: 'Bank A', openingBalance: 5000, currentBalance: 4500, isActive: true },
    { id: 'acc2', name: 'Savings', type: 'savings', currency: 'EUR', institution: 'Bank A', openingBalance: 10000, currentBalance: 10500, isActive: true },
    { id: 'acc3', name: 'Credit Card', type: 'credit_card', currency: 'EUR', institution: 'Bank B', openingBalance: 0, currentBalance: -1500, isActive: true, interestRate: 5.5 },
    { id: 'acc4', name: 'Car Loan', type: 'loan', currency: 'EUR', institution: 'Bank C', openingBalance: -15000, currentBalance: -12000, isActive: true, interestRate: 4.5 }
  ],
  transactions: [
    { id: 'txn1', date: '2025-10-01', type: 'income', accountId: 'acc1', payee: 'Salary', categoryId: 'cat1', amount: 4500, currency: 'EUR', memo: 'Monthly salary', isReconciled: true },
    { id: 'txn2', date: '2025-10-03', type: 'expense', accountId: 'acc1', payee: 'Grocery Store', categoryId: 'cat5', amount: -150, currency: 'EUR', memo: 'Weekly shopping', isReconciled: false },
    { id: 'txn3', date: '2025-10-05', type: 'expense', accountId: 'acc3', payee: 'Restaurant', categoryId: 'cat8', amount: -80, currency: 'EUR', memo: 'Dinner', isReconciled: false },
    { id: 'txn4', date: '2025-10-07', type: 'transfer', fromAccountId: 'acc1', toAccountId: 'acc2', amount: 500, currency: 'EUR', memo: 'Savings transfer', isReconciled: false },
    { id: 'txn5', date: '2025-10-10', type: 'expense', accountId: 'acc1', payee: 'Utilities', categoryId: 'cat4', amount: -120, currency: 'EUR', memo: 'Electric bill', isReconciled: true },
    { id: 'txn6', date: '2025-10-12', type: 'expense', accountId: 'acc3', payee: 'Online Shopping', categoryId: 'cat6', amount: -250, currency: 'EUR', memo: 'Electronics', isReconciled: false },
    { id: 'txn7', date: '2025-10-15', type: 'income', accountId: 'acc2', payee: 'Interest', categoryId: 'cat2', amount: 15, currency: 'EUR', memo: 'Savings interest', isReconciled: true }
  ],
  categories: [
    { id: 'cat1', name: 'Salary', type: 'income', parentId: null, icon: '💼' },
    { id: 'cat2', name: 'Investments', type: 'income', parentId: null, icon: '📈' },
    { id: 'cat3', name: 'Transportation', type: 'expense', parentId: null, icon: '🚗' },
    { id: 'cat4', name: 'Housing', type: 'expense', parentId: null, icon: '🏠' },
    { id: 'cat5', name: 'Food & Dining', type: 'expense', parentId: null, icon: '🍽️' },
    { id: 'cat6', name: 'Shopping', type: 'expense', parentId: null, icon: '🛍️' },
    { id: 'cat7', name: 'Groceries', type: 'expense', parentId: 'cat5', icon: '🛒' },
    { id: 'cat8', name: 'Restaurants', type: 'expense', parentId: 'cat5', icon: '🍴' },
    { id: 'cat9', name: 'Entertainment', type: 'expense', parentId: null, icon: '🎬' }
  ],
  budgets: [
    { id: 'bud1', month: '2025-10', categoryId: 'cat5', budgeted: 400 },
    { id: 'bud2', month: '2025-10', categoryId: 'cat8', budgeted: 300 }
  ],
  goals: [
    { id: 'goal1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 10500, targetDate: '2025-12-31', linkedAccountId: 'acc2' },
    { id: 'goal2', name: 'Vacation', targetAmount: 3000, currentAmount: 500, targetDate: '2026-08-01', linkedAccountId: null }
  ],
  recurringTransactions: [
    { id: 'rec1', name: 'Monthly Rent', accountId: 'acc1', type: 'expense', payee: 'Landlord', categoryId: 'cat4', amount: -1200, currency: 'EUR', frequency: 'monthly', interval: 1, startDate: '2025-01-01', isActive: true, lastProcessed: '2025-09-01' }
  ],
  exchangeRates: { USD: 1.1, BDT: 0.0091, EUR: 1 }
};

export default function FinanceTrackerApp() {
  const [state, setState] = useState(initialState);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  useEffect(() => {
    const root = document.documentElement;
    if (state.user.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.user.theme]);

  const toggleTheme = () => {
    const newTheme = state.user.theme === 'light' ? 'dark' : 'light';
    updateState({ user: { ...state.user, theme: newTheme } });
  };

  return (
    <AppContext.Provider value={{ state, updateState, currentView, setCurrentView }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-500">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-blue-500/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  Lumina Finance v9
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/50">
                  {state.user.name}
                </span>
                <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all">
                  {state.user.theme === 'light' ? '🌙' : '☀️'}
                </button>
              </div>
              <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          <aside className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transition-transform duration-300`}>
            <nav className="p-4 space-y-1">
              <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Dashboard" view="dashboard" />
              <NavItem icon={<Wallet className="w-5 h-5" />} label="Accounts" view="accounts" />
              <NavItem icon={<Receipt className="w-5 h-5" />} label="Transactions" view="transactions" />
              <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Categories" view="categories" />
              <NavItem icon={<Calendar className="w-5 h-5" />} label="Recurring" view="recurring" />
              <NavItem icon={<DollarSign className="w-5 h-5" />} label="Budget" view="budget" />
              <NavItem icon={<Target className="w-5 h-5" />} label="Goals" view="goals" />
              <NavItem icon={<CreditCard className="w-5 h-5" />} label="Debt Payoff" view="debt" />
              <NavItem icon={<Brain className="w-5 h-5" />} label="Insights" view="insights" />
              <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Reports" view="reports" />
              <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" view="settings" />
            </nav>
          </aside>

          <main className="flex-1 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {currentView === 'dashboard' && <DashboardView />}
              {currentView === 'accounts' && <AccountsView />}
              {currentView === 'transactions' && <TransactionsView />}
              {currentView === 'categories' && <CategoriesView />}
              {currentView === 'recurring' && <RecurringView />}
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
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        isActive
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
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
  const currentMonthIncome = state.transactions.filter(t => t.type === 'income' && t.date.startsWith(currentMonth)).reduce((sum, t) => sum + t.amount, 0);
  const currentMonthExpenses = Math.abs(state.transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth)).reduce((sum, t) => sum + t.amount, 0));
  const netWorth = state.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const savingsRate = currentMonthIncome > 0 ? (((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100).toFixed(1) : 0;

  const incomeVsExpenseData = [
    { name: 'Income', value: currentMonthIncome, fill: '#10B981' },
    { name: 'Expenses', value: currentMonthExpenses, fill: '#EF4444' }
  ];

  const spendingByCategoryData = state.categories
    .filter(c => c.type === 'expense' && !c.parentId)
    .map(cat => {
      const spent = Math.abs(state.transactions.filter(t => t.categoryId === cat.id && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
      return { name: cat.name, value: spent, fill: ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#6366F1'][Math.floor(Math.random() * 6)] };
    })
    .filter(d => d.value > 0);

  const monthlyTrendsData = [
    { month: 'May', income: 4200, expenses: 3800, savings: 400, fill: '#10B981' },
    { month: 'Jun', income: 4500, expenses: 3500, savings: 1000, fill: '#10B981' },
    { month: 'Jul', income: 4500, expenses: 4000, savings: 500, fill: '#10B981' },
    { month: 'Aug', income: 4800, expenses: 3900, savings: 900, fill: '#10B981' },
    { month: 'Sep', income: 4500, expenses: 3700, savings: 800, fill: '#10B981' },
    { month: 'Oct', income: currentMonthIncome, expenses: currentMonthExpenses, savings: currentMonthIncome - currentMonthExpenses, fill: '#10B981' }
  ];

  const netWorthByTypeData = [
    { name: 'Banking', value: state.accounts.filter(a => ['checking', 'savings'].includes(a.type)).reduce((s, a) => s + (a.currentBalance > 0 ? a.currentBalance : 0), 0), fill: '#3B82F6' },
    { name: 'Credit', value: Math.abs(state.accounts.filter(a => a.type === 'credit_card').reduce((s, a) => s + a.currentBalance, 0)), fill: '#8B5CF6' },
    { name: 'Loans', value: Math.abs(state.accounts.filter(a => a.type === 'loan').reduce((s, a) => s + a.currentBalance, 0)), fill: '#EF4444' },
    { name: 'Investment', value: state.accounts.filter(a => a.type === 'investment').reduce((s, a) => s + a.currentBalance, 0), fill: '#6366F1' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Monthly Income" value={`€${currentMonthIncome.toLocaleString()}`} icon={<TrendingUp className="w-6 h-6 text-green-500" />} change="+12%" isPositive={true} />
        <MetricCard title="Monthly Expenses" value={`€${currentMonthExpenses.toLocaleString()}`} icon={<TrendingDown className="w-6 h-6 text-red-500" />} change="-8%" isPositive={true} />
        <MetricCard title="Net Worth" value={`€${netWorth.toLocaleString()}`} icon={<Wallet className="w-6 h-6 text-blue-500" />} change="+15%" isPositive={true} />
        <MetricCard title="Savings Rate" value={`${savingsRate}%`} icon={<Target className="w-6 h-6 text-purple-500" />} change="+5%" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={incomeVsExpenseData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={(entry) => `€${entry.value.toLocaleString()}`}>
                {incomeVsExpenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={spendingByCategoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={(entry) => entry.name}>
                {spendingByCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
              <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, change, isPositive }) {
  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
          <p className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change} vs last month
          </p>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
          {icon}
        </div>
      </div>
    </div>
  );
}

function AccountsView() {
  const { state, updateState } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);

  const totalNetWorth = state.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalAssets = state.accounts.filter(a => a.currentBalance > 0).reduce((sum, a) => sum + a.currentBalance, 0);
  const totalLiabilities = Math.abs(state.accounts.filter(a => a.currentBalance < 0).reduce((sum, a) => sum + a.currentBalance, 0));
  const activeAccountsCount = state.accounts.filter(a => a.isActive).length;

  const groupedAccounts = {
    banking: state.accounts.filter(a => ['checking', 'savings', 'cash'].includes(a.type)),
    credit: state.accounts.filter(a => a.type === 'credit_card'),
    loans: state.accounts.filter(a => a.type === 'loan'),
    investment: state.accounts.filter(a => a.type === 'investment')
  };

  const handleAddAccount = (accountData) => {
    const newAccount = {
      id: 'acc' + Date.now(),
      ...accountData,
      currentBalance: accountData.openingBalance
    };
    updateState({ accounts: [...state.accounts, newAccount] });
    setShowAddModal(false);
  };

  const handleEditAccount = (accountData) => {
    updateState({
      accounts: state.accounts.map(a => 
        a.id === editingAccount.id ? { ...a, ...accountData } : a
      )
    });
    setEditingAccount(null);
  };

  const handleDeleteAccount = () => {
    const accountTransactions = state.transactions.filter(
      t => t.accountId === deletingAccount.id || 
           t.fromAccountId === deletingAccount.id || 
           t.toAccountId === deletingAccount.id
    );
    
    if (accountTransactions.length > 0) {
      alert(`Cannot delete account with ${accountTransactions.length} associated transactions.`);
      return;
    }
    
    updateState({
      accounts: state.accounts.filter(a => a.id !== deletingAccount.id)
    });
    setDeletingAccount(null);
  };

  const getAccountIcon = (type) => {
    const icons = { checking: '💳', savings: '🏦', credit_card: '💰', loan: '📊', investment: '📈', cash: '💵' };
    return icons[type] || '💳';
  };

  const getAccountColor = (type) => {
    const colors = { checking: 'blue', savings: 'green', credit_card: 'purple', loan: 'red', investment: 'indigo', cash: 'gray' };
    return colors[type] || 'blue';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Accounts</h2>
        <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105">
          <Plus className="w-5 h-5" />
          <span>Add Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-200/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Worth</p>
          <p className={`text-2xl font-bold ${totalNetWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{totalNetWorth.toLocaleString()}
          </p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-200/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Assets</p>
          <p className="text-2xl font-bold text-green-600">€{totalAssets.toLocaleString()}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-200/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Liabilities</p>
          <p className="text-2xl font-bold text-red-600">€{totalLiabilities.toLocaleString()}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl shadow-lg border border-gray-200/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Accounts</p>
          <p className="text-2xl font-bold text-blue-600">{activeAccountsCount}</p>
        </div>
      </div>

      {Object.entries(groupedAccounts).map(([type, accounts]) => accounts.length > 0 && (
        <div key={type}>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 capitalize">
            {type === 'banking' ? '🏦 Banking Accounts' : type === 'credit' ? '💰 Credit Cards' : type === 'loans' ? '📊 Loans' : '📈 Investments'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(account => (
              <AccountCard 
                key={account.id} 
                account={account} 
                onEdit={() => setEditingAccount(account)}
                onDelete={() => setDeletingAccount(account)}
                getIcon={getAccountIcon}
                getColor={getAccountColor}
              />
            ))}
          </div>
        </div>
      ))}

      {showAddModal && <AccountFormModal title="Add Account" onClose={() => setShowAddModal(false)} onSave={handleAddAccount} />}
      {editingAccount && <AccountFormModal title="Edit Account" account={editingAccount} onClose={() => setEditingAccount(null)} onSave={handleEditAccount} />}
      {deletingAccount && <DeleteConfirmModal account={deletingAccount} onClose={() => setDeletingAccount(null)} onConfirm={handleDeleteAccount} />}
    </div>
  );
}

function AccountCard({ account, onEdit, onDelete, getIcon, getColor }) {
  const [showDetails, setShowDetails] = useState(false);
  const color = getColor(account.type);
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600',
    gray: 'from-gray-500 to-gray-600'
  };

  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className={`h-2 bg-gradient-to-r ${colorClasses[color]}`} />
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getIcon(account.type)}</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{account.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{account.institution}</p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${account.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {account.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <p className={`text-2xl font-bold mb-2 ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {account.currency} {Math.abs(account.currentBalance).toLocaleString()}
        </p>

        {account.interestRate && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Interest Rate: {account.interestRate}%</p>
        )}

        <button onClick={() => setShowDetails(!showDetails)} className="text-sm text-blue-600 hover:text-blue-700 mb-3 flex items-center">
          {showDetails ? 'Hide' : 'Show'} Details <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </button>

        {showDetails && (
          <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-lg p-3 mb-3 text-sm space-y-1">
            <p className="text-gray-700 dark:text-gray-300">Opening Balance: {account.currency} {account.openingBalance.toLocaleString()}</p>
            <p className={`${(account.currentBalance - account.openingBalance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Change: {account.currentBalance >= account.openingBalance ? '+' : ''}{(account.currentBalance - account.openingBalance).toLocaleString()}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">ID: {account.id}</p>
          </div>
        )}

        <div className="flex space-x-2">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all">
            <Edit2 className="w-4 h-4" />
            <span className="text-sm">Edit</span>
          </button>
          <button onClick={onDelete} className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all">
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountFormModal({ title, account, onClose, onSave }) {
  const { state } = useApp();
  const [formData, setFormData] = useState(account || {
    name: '',
    type: 'checking',
    institution: '',
    currency: state.user.baseCurrency,
    openingBalance: 0,
    currentBalance: 0,
    isActive: true,
    interestRate: 0
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Account name is required';
    if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type *</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit_card">Credit Card</option>
              <option value="loan">Loan</option>
              <option value="investment">Investment</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution *</label>
            <input type="text" value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency *</label>
            <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="BDT">BDT (৳)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opening Balance</label>
            <input type="number" value={formData.openingBalance} onChange={(e) => setFormData({...formData, openingBalance: parseFloat(e.target.value) || 0})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
          </div>

          {account && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Balance</label>
              <input type="number" value={formData.currentBalance} onChange={(e) => setFormData({...formData, currentBalance: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
          )}

          {(['loan', 'credit_card'].includes(formData.type)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (%)</label>
              <input type="number" step="0.1" value={formData.interestRate} onChange={(e) => setFormData({...formData, interestRate: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
          )}

          <div className="flex items-center">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="w-4 h-4 text-blue-600 rounded" />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active Account</label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex space-x-3">
          <button onClick={handleSubmit} className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold">
            {account ? 'Update' : 'Create'} Account
          </button>
          <button onClick={onClose} className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ account, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Account</h3>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to delete <strong>{account.name}</strong>?
          </p>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-800 dark:text-red-400 font-medium mb-2">⚠️ Warning:</p>
            <ul className="text-sm text-red-800 dark:text-red-400 space-y-1">
              <li>• Account will be permanently deleted</li>
              <li>• Cannot delete if transactions exist</li>
              <li>• This action cannot be undone</li>
            </ul>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Account Details:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Type: {account.type}</li>
              <li>Institution: {account.institution}</li>
              <li>Balance: {account.currency} {account.currentBalance.toLocaleString()}</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onConfirm} className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold">
            Yes, Delete Account
          </button>
          <button onClick={onClose} className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function TransactionsView() {
  const { state, updateState } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');

  const getTransactionDisplay = (txn) => {
    const account = state.accounts.find(a => a.id === txn.accountId);
    const category = state.categories.find(c => c.id === txn.categoryId);
    
    if (txn.type === 'transfer') {
      const fromAccount = state.accounts.find(a => a.id === txn.fromAccountId);
      const toAccount = state.accounts.find(a => a.id === txn.toAccountId);
      return {
        description: `Transfer: ${fromAccount?.name} → ${toAccount?.name}`,
        amount: txn.amount,
        colorClass: 'text-blue-600',
        account: `${fromAccount?.name} → ${toAccount?.name}`,
        category: 'Transfer'
      };
    }
    
    return {
      description: txn.payee,
      amount: txn.amount,
      colorClass: txn.amount >= 0 ? 'text-green-600' : 'text-red-600',
      account: account?.name || 'Unknown',
      category: category?.name || 'Uncategorized'
    };
  };

  const filteredTransactions = state.transactions.filter(txn => {
    const display = getTransactionDisplay(txn);
    const matchesSearch = searchTerm === '' || 
      display.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      display.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.memo && txn.memo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || txn.type === filterType;
    
    const matchesAccount = filterAccount === 'all' || 
      txn.accountId === filterAccount ||
      txn.fromAccountId === filterAccount ||
      txn.toAccountId === filterAccount;
    
    return matchesSearch && matchesType && matchesAccount;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleAddTransaction = (txnData) => {
    const newTxn = {
      id: 'txn' + Date.now(),
      ...txnData,
      isReconciled: false
    };

    let updatedAccounts = [...state.accounts];
    
    if (txnData.type === 'transfer') {
      updatedAccounts = updatedAccounts.map(acc => {
        if (acc.id === txnData.fromAccountId) {
          return { ...acc, currentBalance: acc.currentBalance - txnData.amount };
        }
        if (acc.id === txnData.toAccountId) {
          return { ...acc, currentBalance: acc.currentBalance + txnData.amount };
        }
        return acc;
      });
    } else {
      updatedAccounts = updatedAccounts.map(acc => {
        if (acc.id === txnData.accountId) {
          return { ...acc, currentBalance: acc.currentBalance + txnData.amount };
        }
        return acc;
      });
    }

    updateState({
      transactions: [...state.transactions, newTxn],
      accounts: updatedAccounts
    });
    setShowAddModal(false);
  };

  const handleEditTransaction = (txnData) => {
    const oldTxn = state.transactions.find(t => t.id === editingTransaction.id);
    
    let updatedAccounts = [...state.accounts];
    
    if (oldTxn.type === 'transfer') {
      updatedAccounts = updatedAccounts.map(acc => {
        if (acc.id === oldTxn.fromAccountId) return { ...acc, currentBalance: acc.currentBalance + oldTxn.amount };
        if (acc.id === oldTxn.toAccountId) return { ...acc, currentBalance: acc.currentBalance - oldTxn.amount };
        return acc;
      });
    } else {
      updatedAccounts = updatedAccounts.map(acc => {
        if (acc.id === oldTxn.accountId) return { ...acc, currentBalance: acc.currentBalance - oldTxn.amount };
        return acc;
      });
    }
    
    if (txnData.type === 'transfer') {
      updatedAccounts = updatedAccounts.map(acc => {
        if (acc.id === txnData.fromAccountId) return { ...acc, currentBalance: acc.currentBalance - txnData.amount };
        if (acc.id === txnData.toAccountId) return { ...acc, currentBalance: acc.currentBalance + txnData.amount };
        return acc;
      });
    } else {
      updatedAccounts = updatedAccounts.map(acc => {
        if (acc.id === txnData.accountId) return { ...acc, currentBalance: acc.currentBalance + txnData.amount };
        return acc;
      });
    }

    updateState({
      transactions: state.transactions.map(t => t.id === editingTransaction.id ? { ...t, ...txnData } : t),
      accounts: updatedAccounts
    });
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = () => {
    const txn = deletingTransaction;
    let updatedAccounts = [...state.accounts];
    
    if (txn.type === 'transfer') {
      updatedAccounts = updatedAccounts.map(acc => {
        if (acc.id === txn.fromAccountId) return { ...acc, currentBalance: acc.currentBalance + txn.amount };
        if (acc.id === txn.toAccountId) return { ...acc, currentBalance: acc.currentBalance - txn.amount };
        return acc;
      });
    } else {
      updatedAccounts = updatedAccounts.map(acc => {
        if (acc.id === txn.accountId) return { ...acc, currentBalance: acc.currentBalance - txn.amount };
        return acc;
      });
    }

    updateState({
      transactions: state.transactions.filter(t => t.id !== txn.id),
      accounts: updatedAccounts
    });
    setDeletingTransaction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Transactions</h2>
        <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105">
          <Plus className="w-5 h-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
          </div>
          
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
          
          <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <option value="all">All Accounts</option>
            {state.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Account</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map(txn => {
                const display = getTransactionDisplay(txn);
                return (
                  <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{txn.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{display.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{display.account}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{display.category}</td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right ${display.colorClass}`}>
                      {txn.currency} {Math.abs(display.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setEditingTransaction(txn)} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button onClick={() => setDeletingTransaction(txn)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
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

      {showAddModal && <TransactionFormModal title="Add Transaction" onClose={() => setShowAddModal(false)} onSave={handleAddTransaction} />}
      {editingTransaction && <TransactionFormModal title="Edit Transaction" transaction={editingTransaction} onClose={() => setEditingTransaction(null)} onSave={handleEditTransaction} />}
      {deletingTransaction && <TransactionDeleteModal transaction={deletingTransaction} onClose={() => setDeletingTransaction(null)} onConfirm={handleDeleteTransaction} />}
    </div>
  );
}

function TransactionFormModal({ title, transaction, onClose, onSave }) {
  const { state } = useApp();
  const [formData, setFormData] = useState(transaction || {
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    accountId: state.user.defaultAccount,
    payee: '',
    categoryId: '',
    amount: 0,
    currency: state.user.baseCurrency,
    memo: '',
    fromAccountId: '',
    toAccountId: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (formData.type !== 'transfer' && !formData.payee.trim()) newErrors.payee = 'Payee is required';
    if (formData.type !== 'transfer' && !formData.accountId) newErrors.accountId = 'Account is required';
    if (formData.type === 'transfer' && (!formData.fromAccountId || !formData.toAccountId)) newErrors.transfer = 'Both accounts required';
    if (formData.amount === 0) newErrors.amount = 'Amount cannot be zero';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const dataToSave = { ...formData };
      if (formData.type === 'expense' && formData.amount > 0) dataToSave.amount = -Math.abs(formData.amount);
      if (formData.type === 'income' && formData.amount < 0) dataToSave.amount = Math.abs(formData.amount);
      if (formData.type === 'transfer') dataToSave.amount = Math.abs(formData.amount);
      onSave(dataToSave);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {formData.type === 'transfer' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Account *</label>
                <select value={formData.fromAccountId} onChange={(e) => setFormData({...formData, fromAccountId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="">Select Account</option>
                  {state.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Account *</label>
                <select value={formData.toAccountId} onChange={(e) => setFormData({...formData, toAccountId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="">Select Account</option>
                  {state.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
                {errors.transfer && <p className="text-red-500 text-xs mt-1">{errors.transfer}</p>}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payee *</label>
                <input type="text" value={formData.payee} onChange={(e) => setFormData({...formData, payee: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                {errors.payee && <p className="text-red-500 text-xs mt-1">{errors.payee}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account *</label>
                <select value={formData.accountId} onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="">Select Account</option>
                  {state.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
                {errors.accountId && <p className="text-red-500 text-xs mt-1">{errors.accountId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="">Select Category</option>
                  {state.categories.filter(c => c.type === formData.type).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
            <input type="number" step="0.01" value={Math.abs(formData.amount)} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Memo</label>
            <textarea value={formData.memo} onChange={(e) => setFormData({...formData, memo: e.target.value})} rows="2"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex space-x-3">
          <button onClick={handleSubmit} className="flex-1 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold">
            {transaction ? 'Update' : 'Create'} Transaction
          </button>
          <button onClick={onClose} className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function TransactionDeleteModal({ transaction, onClose, onConfirm }) {
  const { state } = useApp();
  const details = (() => {
    if (transaction.type === 'transfer') {
      const from = state.accounts.find(a => a.id === transaction.fromAccountId);
      const to = state.accounts.find(a => a.id === transaction.toAccountId);
      return {
        description: `Transfer from ${from?.name} to ${to?.name}`,
        details: [`Amount: ${transaction.currency} ${transaction.amount}`, `Date: ${transaction.date}`]
      };
    }
    const account = state.accounts.find(a => a.id === transaction.accountId);
    const category = state.categories.find(c => c.id === transaction.categoryId);
    return {
      description: transaction.payee,
      details: [`Account: ${account?.name}`, `Category: ${category?.name || 'None'}`, `Amount: ${transaction.currency} ${Math.abs(transaction.amount)}`]
    };
  })();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Transaction</h3>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to delete this transaction?
          </p>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-800 dark:text-red-400 font-medium mb-2">⚠️ This will:</p>
            <ul className="text-sm text-red-800 dark:text-red-400 space-y-1">
              <li>• Permanently delete the transaction</li>
              <li>• Update account balances automatically</li>
              <li>• Cannot be undone</li>
            </ul>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Transaction Details:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Date: {transaction.date}</li>
              <li>Type: {transaction.type}</li>
              <li>Description: {details.description}</li>
              {details.details.map((detail, i) => <li key={i}>{detail}</li>)}
            </ul>
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onConfirm} className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold">
            Yes, Delete Transaction
          </button>
          <button onClick={onClose} className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoriesView() {
  const { state, updateState } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const incomeCategories = state.categories.filter(c => c.type === 'income' && !c.parentId);
  const expenseCategories = state.categories.filter(c => c.type === 'expense' && !c.parentId);
  const getSubcategories = (parentId) => state.categories.filter(c => c.parentId === parentId);

  const handleAddCategory = (categoryData) => {
    const newCategory = { id: 'cat' + Date.now(), ...categoryData };
    updateState({ categories: [...state.categories, newCategory] });
    setShowAddModal(false);
  };

  const handleEditCategory = (categoryData) => {
    updateState({
      categories: state.categories.map(c => c.id === editingCategory.id ? { ...c, ...categoryData } : c)
    });
    setEditingCategory(null);
  };

  const handleDeleteCategory = () => {
    const categoryTransactions = state.transactions.filter(t => t.categoryId === deletingCategory.id);
    if (categoryTransactions.length > 0) {
      alert(`Cannot delete category with ${categoryTransactions.length} associated transactions.`);
      return;
    }
    updateState({
      categories: state.categories.filter(c => c.id !== deletingCategory.id && c.parentId !== deletingCategory.id)
    });
    setDeletingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Categories</h2>
        <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105">
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" /> Income Categories
          </h3>
          {incomeCategories.map(cat => (
            <div key={cat.id} className="backdrop-blur-xl bg-green-50/60 dark:bg-green-900/20 p-4 rounded-xl border border-green-200/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setEditingCategory(cat)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => setDeletingCategory(cat)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              {getSubcategories(cat.id).map(sub => (
                <div key={sub.id} className="ml-8 mt-2 flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{sub.icon} {sub.name}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => setEditingCategory(sub)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded">
                      <Edit2 className="w-3 h-3 text-blue-600" />
                    </button>
                    <button onClick={() => setDeletingCategory(sub)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2" /> Expense Categories
          </h3>
          {expenseCategories.map(cat => (
            <div key={cat.id} className="backdrop-blur-xl bg-red-50/60 dark:bg-red-900/20 p-4 rounded-xl border border-red-200/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setEditingCategory(cat)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => setDeletingCategory(cat)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              {getSubcategories(cat.id).map(sub => (
                <div key={sub.id} className="ml-8 mt-2 flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{sub.icon} {sub.name}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => setEditingCategory(sub)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded">
                      <Edit2 className="w-3 h-3 text-blue-600" />
                    </button>
                    <button onClick={() => setDeletingCategory(sub)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showAddModal && <CategoryFormModal title="Add Category" onClose={() => setShowAddModal(false)} onSave={handleAddCategory} />}
      {editingCategory && <CategoryFormModal title="Edit Category" category={editingCategory} onClose={() => setEditingCategory(null)} onSave={handleEditCategory} />}
      {deletingCategory && <CategoryDeleteModal category={deletingCategory} onClose={() => setDeletingCategory(null)} onConfirm={handleDeleteCategory} />}
    </div>
  );
}

function CategoryFormModal({ title, category, onClose, onSave }) {
  const { state } = useApp();
  const [formData, setFormData] = useState(category || { name: '', type: 'expense', parentId: null, icon: '📁' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
            <input type="text" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Emoji (e.g., 🏠)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Category</label>
            <select value={formData.parentId || ''} onChange={(e) => setFormData({...formData, parentId: e.target.value || null})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="">None (Main Category)</option>
              {state.categories.filter(c => c.type === formData.type && !c.parentId && c.id !== category?.id).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex space-x-3">
          <button onClick={handleSubmit} className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold">
            {category ? 'Update' : 'Create'} Category
          </button>
          <button onClick={onClose} className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryDeleteModal({ category, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Category</h3>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to delete <strong>{category.icon} {category.name}</strong>?
          </p>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-400 font-medium mb-2">⚠️ Warning:</p>
            <ul className="text-sm text-red-800 dark:text-red-400 space-y-1">
              <li>• Category will be permanently deleted</li>
              <li>• Subcategories will also be deleted</li>
              <li>• Cannot delete if transactions exist</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onConfirm} className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold">
            Yes, Delete Category
          </button>
          <button onClick={onClose} className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function RecurringView() {
  const { state, updateState } = useApp();

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
      amount: recurring.amount,
      currency: recurring.currency,
      memo: 'Recurring: ' + recurring.name,
      isReconciled: false
    };

    const updatedAccounts = state.accounts.map(acc => {
      if (acc.id === recurring.accountId) {
        return { ...acc, currentBalance: acc.currentBalance + recurring.amount };
      }
      return acc;
    });

    const updatedRecurring = state.recurringTransactions.map(r => {
      if (r.id === recurringId) {
        return { ...r, lastProcessed: newTxn.date };
      }
      return r;
    });

    updateState({
      transactions: [...state.transactions, newTxn],
      accounts: updatedAccounts,
      recurringTransactions: updatedRecurring
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Recurring Transactions</h2>
      <div className="space-y-3">
        {state.recurringTransactions.map(rec => {
          const account = state.accounts.find(a => a.id === rec.accountId);
          const category = state.categories.find(c => c.id === rec.categoryId);
          return (
            <div key={rec.id} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{rec.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{rec.payee} • {category?.icon} {category?.name} • {account?.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {rec.frequency} • Last: {rec.lastProcessed || 'Never'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${rec.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {rec.amount >= 0 ? '+' : ''}{rec.currency} {Math.abs(rec.amount).toLocaleString()}
                  </p>
                  <button onClick={() => processRecurring(rec.id)}
                    className="mt-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                    Process Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BudgetView() {
  const { state } = useApp();
  const currentMonth = '2025-10';
  
  const budgetsWithSpending = state.budgets.map(budget => {
    const category = state.categories.find(c => c.id === budget.categoryId);
    const spent = Math.abs(state.transactions
      .filter(t => t.type === 'expense' && t.categoryId === budget.categoryId && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0));
    const remaining = budget.budgeted - spent;
    const percentage = (spent / budget.budgeted) * 100;
    
    return { ...budget, category, spent, remaining, percentage };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Budget Tracking</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetsWithSpending.map(budget => (
          <div key={budget.id} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{budget.category?.icon} {budget.category?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{budget.month}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">€{budget.spent.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">of €{budget.budgeted.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={`font-semibold ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {budget.remaining >= 0 ? `€${budget.remaining.toLocaleString()} remaining` : `€${Math.abs(budget.remaining).toLocaleString()} over budget`}
                </span>
                <span className={`font-semibold ${budget.percentage < 80 ? 'text-green-600' : budget.percentage < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {budget.percentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    budget.percentage < 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    budget.percentage < 100 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-red-500 to-rose-500'
                  }`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalsView() {
  const { state } = useApp();
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Financial Goals</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.goals.map(goal => {
          const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1);
          const remaining = goal.targetAmount - goal.currentAmount;
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          
          return (
            <div key={goal.id} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{goal.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Target: {goal.targetDate}</p>
                </div>
                {isCompleted && <CheckCircle className="w-6 h-6 text-green-500" />}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">€{goal.currentAmount.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">of €{goal.targetAmount.toLocaleString()}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                      {isCompleted ? 'Goal Completed! 🎉' : `€${remaining.toLocaleString()} remaining`}
                    </span>
                    <span className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} style={{ width: `${Math.min(parseFloat(progress), 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DebtPayoffView() {
  const { state } = useApp();
  const debtAccounts = state.accounts.filter(a => (a.type === 'loan' || a.type === 'credit_card') && a.currentBalance < 0);
  const totalDebt = debtAccounts.reduce((sum, acc) => sum + Math.abs(acc.currentBalance), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Debt Payoff</h2>
      
      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Debt Overview</h3>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 dark:text-gray-400">Total Outstanding Debt</span>
          <span className="text-2xl font-bold text-red-600">€{totalDebt.toLocaleString()}</span>
        </div>

        <div className="space-y-3">
          {debtAccounts.map(acc => (
            <div key={acc.id} className="bg-red-50/50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{acc.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{acc.institution} • {acc.interestRate}% APR</p>
                </div>
                <p className="text-lg font-bold text-red-600">€{Math.abs(acc.currentBalance).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsView() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Financial Insights</h2>
      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-12 rounded-2xl shadow-lg border border-gray-200/50 text-center">
        <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Insights Coming Soon</h3>
        <p className="text-gray-600 dark:text-gray-400">Advanced financial analysis with Claude AI integration</p>
      </div>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Reports</h2>
      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-12 rounded-2xl shadow-lg border border-gray-200/50 text-center">
        <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Custom Reports Coming Soon</h3>
        <p className="text-gray-600 dark:text-gray-400">Generate detailed financial reports with export capabilities</p>
      </div>
    </div>
  );
}

function SettingsView() {
  const { state, updateState } = useApp();
  const [activeTab, setActiveTab] = useState('profile');

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleSecondaryCurrency = (currencyCode) => {
    const currencyInUse = state.accounts.some(acc => acc.currency === currencyCode) || 
                         state.transactions.some(txn => txn.currency === currencyCode);
    
    if (currencyInUse && state.user.secondaryCurrencies.includes(currencyCode)) {
      alert(`Cannot disable ${currencyCode}. This currency is currently used by accounts or transactions.`);
      return;
    }
    
    const newSecondaries = state.user.secondaryCurrencies.includes(currencyCode)
      ? state.user.secondaryCurrencies.filter(c => c !== currencyCode)
      : [...state.user.secondaryCurrencies, currencyCode];
    
    updateState({ user: { ...state.user, secondaryCurrencies: newSecondaries } });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Settings</h2>
      
      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 p-2">
            {['profile', 'currency', 'goals', 'data'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Settings</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" value={state.user.name} onChange={(e) => updateState({ user: { ...state.user, name: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={state.user.email} onChange={(e) => updateState({ user: { ...state.user, email: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
            </div>
          )}

          {activeTab === 'currency' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Primary Currency</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Currency</label>
                  <select value={state.user.baseCurrency} onChange={(e) => updateState({ user: { ...state.user, baseCurrency: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This is your primary currency. It will be the default for new accounts and transactions.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secondary Currencies</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enable additional currencies you want to use. Only enabled currencies will appear in account and transaction forms.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { code: 'EUR', name: 'Euro', symbol: '€' },
                    { code: 'USD', name: 'US Dollar', symbol: '$' },
                    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
                    { code: 'GBP', name: 'British Pound', symbol: '£' },
                    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
                    { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
                  ].filter(curr => curr.code !== state.user.baseCurrency).map(curr => {
                    const isEnabled = state.user.secondaryCurrencies.includes(curr.code);
                    const isInUse = state.accounts.some(acc => acc.currency === curr.code) || 
                                   state.transactions.some(txn => txn.currency === curr.code);
                    
                    return (
                      <div 
                        key={curr.code} 
                        onClick={() => toggleSecondaryCurrency(curr.code)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isEnabled 
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                              isEnabled ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isEnabled && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{curr.symbol}</span>
                          </div>
                          {isInUse && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                              In Use
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{curr.code}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{curr.name}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Enabled Currencies</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Currently enabled: <span className="font-medium">{[state.user.baseCurrency, ...state.user.secondaryCurrencies].join(', ')}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        💡 You cannot disable currencies that are currently in use by accounts or transactions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Exchange Rates</h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(state.exchangeRates).map(([currency, rate]) => (
                    <div key={currency} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">{currency}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{rate}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Financial Goals</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Income Goal (€)</label>
                <input type="number" value={state.user.monthlyIncomeGoal} onChange={(e) => updateState({ user: { ...state.user, monthlyIncomeGoal: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Savings Goal (€)</label>
                <input type="number" value={state.user.monthlySavingsGoal} onChange={(e) => updateState({ user: { ...state.user, monthlySavingsGoal: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
              <button onClick={exportData} className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all">
                <Download className="w-4 h-4" />
                <span>Export All Data</span>
              </button>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  ⚠️ Demo version: Data is stored in browser memory and resets on refresh. Use export to save your data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
