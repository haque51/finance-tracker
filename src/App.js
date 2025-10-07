import React, { useState, useEffect, createContext, useContext } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target, Settings, Receipt, Calendar, DollarSign, Plus, Edit2, Trash2, Search, Menu, BarChart3, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, X, CreditCard, Brain, Bell, Zap, ArrowRightLeft, Download, Upload, RefreshCw } from 'lucide-react';

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
    { id: 'txn1', date: '2025-10-01', type: 'income', accountId: 'acc1', payee: 'Salary', categoryId: 'cat1', amount: 4500, currency: 'EUR', memo: 'Monthly salary', isReconciled: false },
    { id: 'txn2', date: '2025-10-02', type: 'expense', accountId: 'acc1', payee: 'Supermarket', categoryId: 'cat5', subcategoryId: 'cat7', amount: -120, currency: 'EUR', memo: 'Groceries', isReconciled: false },
    { id: 'txn3', date: '2025-10-03', type: 'expense', accountId: 'acc3', payee: 'Restaurant', categoryId: 'cat5', subcategoryId: 'cat6', amount: -85, currency: 'EUR', memo: 'Dinner', isReconciled: false },
    { id: 'txn7', date: '2025-10-04', type: 'transfer', fromAccountId: 'acc1', toAccountId: 'acc2', amount: 500, currency: 'EUR', memo: 'Monthly savings transfer' },
    { id: 'txn4', date: '2025-09-01', type: 'income', accountId: 'acc1', payee: 'Salary', categoryId: 'cat1', amount: 4200, currency: 'EUR', memo: 'Monthly salary', isReconciled: false },
    { id: 'txn5', date: '2025-08-15', type: 'expense', accountId: 'acc1', payee: 'Gas Station', categoryId: 'cat8', amount: -65, currency: 'EUR', memo: 'Fuel', isReconciled: false },
    { id: 'txn6', date: '2025-08-20', type: 'expense', accountId: 'acc3', payee: 'Cinema', categoryId: 'cat9', amount: -30, currency: 'EUR', memo: 'Movie night', isReconciled: false }
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
    { id: 'goal1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 10000, targetDate: '2025-12-31', linkedAccountId: null },
    { id: 'goal2', name: 'Vacation', targetAmount: 3000, currentAmount: 500, targetDate: '2025-08-01', linkedAccountId: null }
  ],
  recurringTransactions: [
    { id: 'rec1', name: 'Monthly Rent', accountId: 'acc1', type: 'expense', payee: 'Landlord', categoryId: 'cat4', amount: -1200, currency: 'EUR', frequency: 'monthly', interval: 1, startDate: '2025-01-01', isActive: true, lastProcessed: '2025-09-01' }
  ],
  templates: [
    { id: 'tpl1', name: 'Grocery Shopping', accountId: 'acc1', type: 'expense', payee: 'Supermarket', categoryId: 'cat5', subcategoryId: 'cat7', amount: -100, currency: 'EUR', memo: 'Weekly groceries' }
  ],
  debtPayoffPlans: [
    { id: 'dpp1', name: 'Credit Card Payoff', strategy: 'avalanche', extraMonthlyPayment: 200, accountIds: ['acc3'], createdDate: '2025-10-01', isActive: true }
  ],
  alerts: [
    { id: 'alert1', type: 'budget', name: 'Food Budget Alert', condition: 'exceeds', categoryId: 'cat5', accountId: null, threshold: 400, isActive: true }
  ],
  autoCategorization: [
    { id: 'auto1', name: 'Grocery Auto-Cat', matchField: 'payee', matchValue: 'Supermarket', categoryId: 'cat5', subcategoryId: 'cat7', priority: 1, isActive: true }
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
                  Lumina Finances
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
          <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-64 backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border-r border-gray-200/50 dark:border-gray-700/50 min-h-screen`}>
            <nav className="p-4 space-y-1.5">
              <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Dashboard" view="dashboard" />
              <NavItem icon={<Wallet className="w-5 h-5" />} label="Accounts" view="accounts" />
              <NavItem icon={<Receipt className="w-5 h-5" />} label="Transactions" view="transactions" />
              <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Categories" view="categories" />
              <NavItem icon={<Calendar className="w-5 h-5" />} label="Recurring" view="recurring" />
              <NavItem icon={<DollarSign className="w-5 h-5" />} label="Budget" view="budget" />
              <NavItem icon={<Target className="w-5 h-5" />} label="Goals" view="goals" />
              <NavItem icon={<CreditCard className="w-5 h-5" />} label="Debt Payoff" view="debt" />
              <NavItem icon={<Brain className="w-5 h-5" />} label="Insights" view="insights" />
              <NavItem icon={<Receipt className="w-5 h-5" />} label="Reports" view="reports" />
              <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" view="settings" />
            </nav>
          </aside>

          <main className="flex-1 p-6 lg:p-8">
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
    <button onClick={() => setCurrentView(view)}
      className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70'
      }`}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function DashboardView() {
  const { state } = useApp();
  const currentMonth = '2025-10';
  const currentMonthTxns = state.transactions.filter(t => t.date.startsWith(currentMonth));
  const monthlyIncome = currentMonthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = Math.abs(currentMonthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const netWorth = state.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) : 0;

  const spendingByCategory = {};
  currentMonthTxns.filter(t => t.type === 'expense').forEach(t => {
    const cat = state.categories.find(c => c.id === t.categoryId);
    const catName = cat ? cat.name : 'Uncategorized';
    spendingByCategory[catName] = (spendingByCategory[catName] || 0) + Math.abs(t.amount);
  });
  const categoryData = Object.entries(spendingByCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
        Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Monthly Income" value={`€${monthlyIncome.toLocaleString()}`} 
          icon={<TrendingUp className="w-6 h-6 text-green-600" />} change="+7.1%" isPositive={true} />
        <MetricCard title="Monthly Expenses" value={`€${monthlyExpenses.toLocaleString()}`} 
          icon={<TrendingDown className="w-6 h-6 text-red-600" />} change="-18.7%" isPositive={true} />
        <MetricCard title="Net Worth" value={`€${netWorth.toLocaleString()}`} 
          icon={<Wallet className="w-6 h-6 text-blue-600" />} change="+2.3%" isPositive={true} />
        <MetricCard title="Savings Rate" value={`${savingsRate}%`} 
          icon={<Target className="w-6 h-6 text-purple-600" />} change="+1.2% pts" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-12">No data</p>}
        </div>

        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Balances</h3>
          <div className="space-y-3">
            {state.accounts.map(account => (
              <div key={account.id} className="flex justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{account.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{account.type}</p>
                </div>
                <p className={`text-lg font-bold ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{account.currentBalance.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
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
  const { state } = useApp();
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
        Accounts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.accounts.map(account => (
          <div key={account.id} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{account.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{account.type}</p>
            <p className={`text-2xl font-bold ${account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{account.currentBalance.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsView() {
  const { state } = useApp();

  const getTransactionDisplay = (txn) => {
    if (txn.type === 'transfer') {
      const fromAccount = state.accounts.find(a => a.id === txn.fromAccountId);
      const toAccount = state.accounts.find(a => a.id === txn.toAccountId);
      return {
        icon: <ArrowRightLeft className="w-4 h-4 text-blue-600" />,
        description: `From ${fromAccount?.name || 'Unknown'} → To ${toAccount?.name || 'Unknown'}`,
        colorClass: 'text-blue-600'
      };
    } else {
      return {
        icon: null,
        description: txn.payee,
        colorClass: txn.amount >= 0 ? 'text-green-600' : 'text-red-600'
      };
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
        Transactions
      </h2>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/80 dark:bg-gray-700/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Description</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {state.transactions.map(txn => {
              const display = getTransactionDisplay(txn);
              return (
                <tr key={txn.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{txn.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      {display.icon}
                      <span>{display.description}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm text-right font-semibold ${display.colorClass}`}>
                    €{Math.abs(txn.amount).toLocaleString()}
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

function CategoriesView() {
  const { state } = useApp();
  const incomeCategories = state.categories.filter(c => c.type === 'income' && !c.parentId);
  const expenseCategories = state.categories.filter(c => c.type === 'expense' && !c.parentId);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
        Categories
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold mb-4 text-green-600">Income Categories</h3>
          <div className="space-y-2">
            {incomeCategories.map(cat => (
              <div key={cat.id} className="p-3 bg-green-50/50 dark:bg-green-900/10 rounded-xl">
                <span className="text-gray-900 dark:text-white font-medium">{cat.icon} {cat.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold mb-4 text-red-600">Expense Categories</h3>
          <div className="space-y-2">
            {expenseCategories.map(cat => (
              <div key={cat.id} className="p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl">
                <span className="text-gray-900 dark:text-white font-medium">{cat.icon} {cat.name}</span>
              </div>
            ))}
          </div>
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
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
        Recurring & Templates
      </h2>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recurring Transactions</h3>
        <div className="space-y-3">
          {state.recurringTransactions.map(rec => {
            const account = state.accounts.find(a => a.id === rec.accountId);
            const category = state.categories.find(c => c.id === rec.categoryId);
            return (
              <div key={rec.id} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{rec.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {rec.payee} • {category?.icon} {category?.name} • {account?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Every {rec.interval} {rec.frequency}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Last processed: {rec.lastProcessed || 'Never'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <p className={`text-lg font-semibold ${rec.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {rec.currency} {rec.amount.toLocaleString()}
                    </p>
                    <button onClick={() => processRecurring(rec.id)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
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
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.templates.map(tpl => {
            const category = state.categories.find(c => c.id === tpl.categoryId);
            return (
              <div key={tpl.id} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tpl.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{tpl.payee} • {category?.icon} {category?.name}</p>
                <p className={`text-xl font-semibold ${tpl.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

function BudgetView() {
  const { state } = useApp();
  const [selectedMonth] = useState('2025-10');

  const expenseCategories = state.categories.filter(c => c.type === 'expense' && !c.parentId);
  const monthTransactions = state.transactions.filter(t => t.date.startsWith(selectedMonth) && t.type === 'expense');

  const getSpentByCategory = (categoryId) => {
    return monthTransactions.filter(t => t.categoryId === categoryId).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getBudget = (categoryId) => {
    const budget = state.budgets.find(b => b.categoryId === categoryId && b.month === selectedMonth);
    return budget?.budgeted || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
          Budget
        </h2>
        <span className="text-lg font-semibold">{selectedMonth}</span>
      </div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Budget by Category</h3>
        <div className="space-y-4">
          {expenseCategories.map(category => {
            const budgeted = getBudget(category.id);
            const spent = getSpentByCategory(category.id);
            const remaining = budgeted - spent;
            const percentSpent = budgeted > 0 ? (spent / budgeted) * 100 : 0;

            return (
              <div key={category.id} className="p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{category.icon} {category.name}</span>
                  <span className={`text-sm font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    €{Math.abs(remaining).toLocaleString()} {remaining < 0 ? 'over' : 'left'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className={`h-2 rounded-full ${remaining < 0 ? 'bg-red-600' : percentSpent > 80 ? 'bg-yellow-500' : 'bg-green-600'}`}
                    style={{ width: `${Math.min(percentSpent, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GoalsView() {
  const { state } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
          Financial Goals
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {state.goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount * 100).toFixed(1);
          const remaining = goal.targetAmount - goal.currentAmount;
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          return (
            <div key={goal.id} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{goal.name}</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      €{goal.currentAmount.toLocaleString()} / €{goal.targetAmount.toLocaleString()}
                    </span>
                    <span className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                      style={{ width: `${Math.min(parseFloat(progress), 100)}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">€{remaining.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Target Date</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{goal.targetDate}</p>
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

  const calculatePayoffProjection = (plan) => {
    const accounts = plan.accountIds.map(id => state.accounts.find(a => a.id === id)).filter(Boolean);
    
    if (plan.strategy === 'avalanche') {
      accounts.sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
    } else if (plan.strategy === 'snowball') {
      accounts.sort((a, b) => Math.abs(a.currentBalance) - Math.abs(b.currentBalance));
    }

    let monthsToPayoff = 0;
    let totalInterestPaid = 0;
    let remainingDebts = accounts.map(a => ({ ...a, balance: Math.abs(a.currentBalance) }));

    while (remainingDebts.some(d => d.balance > 0) && monthsToPayoff < 360) {
      monthsToPayoff++;
      const updatedDebts = [];
      let monthInterest = 0;

      for (let debt of remainingDebts) {
        if (debt.balance <= 0) {
          updatedDebts.push(debt);
          continue;
        }

        const monthlyRate = (debt.interestRate || 0) / 100 / 12;
        const interestCharge = debt.balance * monthlyRate;
        const minPayment = Math.max(25, debt.balance * 0.02);
        let payment = minPayment;

        const firstDebt = remainingDebts.find(d => d.balance > 0);
        if (debt === firstDebt) payment += plan.extraMonthlyPayment;

        payment = Math.min(payment, debt.balance + interestCharge);
        const newBalance = Math.max(0, debt.balance + interestCharge - payment);

        updatedDebts.push({ ...debt, balance: newBalance });
        monthInterest += interestCharge;
      }

      totalInterestPaid += monthInterest;
      remainingDebts = updatedDebts;
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);

    return {
      monthsToPayoff,
      payoffDate: payoffDate.toISOString().split('T')[0],
      totalInterestPaid: totalInterestPaid.toFixed(2)
    };
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
        Debt Payoff
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Debt Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Outstanding Debt</span>
              <span className="text-2xl font-bold text-red-600">€{totalDebt.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Debt Accounts</span>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">{debtAccounts.length}</span>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Active Payoff Plans</h3>
          <div className="text-center">
            <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {state.debtPayoffPlans.filter(p => p.isActive).length}
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Plans in progress</p>
          </div>
        </div>
      </div>

      {state.debtPayoffPlans.map(plan => {
        const projection = calculatePayoffProjection(plan);
        const planAccounts = plan.accountIds.map(id => state.accounts.find(a => a.id === id)).filter(Boolean);

        return (
          <div key={plan.id} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Strategy: <span className="font-medium capitalize">{plan.strategy}</span> • 
                Extra Payment: <span className="font-medium">€{plan.extraMonthlyPayment}</span>/month
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Projected Payoff</p>
                <p className="text-2xl font-bold text-blue-600">{projection.monthsToPayoff} months</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(projection.payoffDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Interest</p>
                <p className="text-2xl font-bold text-green-600">€{parseFloat(projection.totalInterestPaid).toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Estimated</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Debt</p>
                <p className="text-2xl font-bold text-purple-600">
                  €{planAccounts.reduce((sum, a) => sum + Math.abs(a.currentBalance), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InsightsView() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
        Financial Insights
      </h2>
      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-12 rounded-2xl shadow-lg border border-gray-200/50 text-center">
        <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Insights</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Full insights module with AI analysis available in complete version
        </p>
      </div>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
        Reports Module
      </h2>
      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-12 rounded-2xl shadow-lg border border-gray-200/50 text-center">
        <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Advanced Reporting</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Full reports module with custom report builder available in complete version
        </p>
      </div>
    </div>
  );
}

function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
        Settings
      </h2>

      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {['profile', 'currency', 'goals', 'defaults', 'data', 'danger'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 dark:text-gray-400'
            }`}>
            {tab === 'profile' && 'Profile'}
            {tab === 'currency' && 'Currency'}
            {tab === 'goals' && 'Financial Goals'}
            {tab === 'defaults' && 'Defaults'}
            {tab === 'data' && 'Data Management'}
            {tab === 'danger' && 'Danger Zone'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'currency' && <CurrencyTab />}
      {activeTab === 'goals' && <FinancialGoalsTab />}
      {activeTab === 'defaults' && <DefaultsTab />}
      {activeTab === 'data' && <DataManagementTab />}
      {activeTab === 'danger' && <DangerZoneTab />}
    </div>
  );
}

function ProfileTab() {
  const { state, updateState } = useApp();

  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">User Profile</h3>
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User ID</label>
          <input type="text" value={state.user.id} disabled
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your unique identifier</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
          <input type="text" value={state.user.name}
            onChange={e => updateState({ user: { ...state.user, name: e.target.value }})}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
          <input type="email" value={state.user.email}
            onChange={e => updateState({ user: { ...state.user, email: e.target.value }})}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Profile Updated</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Changes are saved automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrencyTab() {
  const { state, updateState } = useApp();

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Currency Settings</h3>
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Currency</label>
            <select value={state.user.baseCurrency}
              onChange={e => updateState({ user: { ...state.user, baseCurrency: e.target.value }})}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500">
              <option value="EUR">EUR (€) - Euro</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This is your primary currency for reports and calculations</p>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Exchange Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(state.exchangeRates).map(([currency, rate]) => (
            <div key={currency} className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">1 {currency} =</p>
              <p className="text-2xl font-bold text-blue-600">{rate}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{state.user.baseCurrency}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Exchange rates are used for multi-currency conversions. Rates are simulated for demo purposes.
        </p>
      </div>
    </div>
  );
}

function FinancialGoalsTab() {
  const { state, updateState } = useApp();

  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Monthly Financial Targets</h3>
      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Income Goal</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">€</span>
            <input type="number" step="100" min="0" value={state.user.monthlyIncomeGoal}
              onChange={e => updateState({ user: { ...state.user, monthlyIncomeGoal: parseFloat(e.target.value) || 0 }})}
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Target monthly income you aim to achieve</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Savings Goal</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">€</span>
            <input type="number" step="50" min="0" value={state.user.monthlySavingsGoal}
              onChange={e => updateState({ user: { ...state.user, monthlySavingsGoal: parseFloat(e.target.value) || 0 }})}
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Amount you want to save each month</p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Income Goal</p>
              <p className="text-2xl font-bold text-green-600">€{state.user.monthlyIncomeGoal.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per month</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Savings Goal</p>
              <p className="text-2xl font-bold text-blue-600">€{state.user.monthlySavingsGoal.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultsTab() {
  const { state, updateState } = useApp();

  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Default Preferences</h3>
      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Account</label>
          <select value={state.user.defaultAccount}
            onChange={e => updateState({ user: { ...state.user, defaultAccount: e.target.value }})}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500">
            {state.accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This account will be pre-selected when adding transactions</p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={state.user.autoBackup}
              onChange={e => updateState({ user: { ...state.user, autoBackup: e.target.checked }})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Enable Auto-Backup</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Automatically save data snapshots (simulated)</p>
            </div>
          </label>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Current Default Account</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {state.accounts.find(a => a.id === state.user.defaultAccount)?.name || 'None selected'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataManagementTab() {
  const { state } = useApp();

  const exportData = () => {
    const dataToExport = {
      user: state.user,
      accounts: state.accounts,
      transactions: state.transactions,
      categories: state.categories,
      budgets: state.budgets,
      goals: state.goals,
      recurringTransactions: state.recurringTransactions,
      templates: state.templates,
      debtPayoffPlans: state.debtPayoffPlans,
      alerts: state.alerts,
      autoCategorization: state.autoCategorization,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lumina-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          try {
            const importedData = JSON.parse(event.target.result);
            alert('Import successful! However, in this demo version, data will reset on page refresh.');
            console.log('Imported data:', importedData);
          } catch (error) {
            alert('Error importing data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Export Data</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Download all your financial data as a JSON file for backup or migration purposes.
        </p>
        <button onClick={exportData}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105">
          <Download className="w-4 h-4" />
          <span>Export All Data</span>
        </button>
      </div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Import Data</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Restore your data from a previously exported JSON file.
        </p>
        <button onClick={importData}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105">
          <Upload className="w-4 h-4" />
          <span>Import Data</span>
        </button>
      </div>

      <div className="backdrop-blur-xl bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-900/30 dark:to-orange-900/30 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/50">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Demo Version Note</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This is a demonstration version running in your browser. Data is not persisted between sessions. 
              In a production version, data would be stored securely in a database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DangerZoneTab() {
  const { updateState } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);

  const resetAllData = () => {
    updateState(initialState);
    setShowConfirm(false);
    alert('All data has been reset to defaults.');
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-gradient-to-br from-red-50/90 to-rose-50/90 dark:from-red-900/30 dark:to-rose-900/30 p-6 rounded-2xl border-2 border-red-200/50 dark:border-red-800/50">
        <div className="flex items-start space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-xl font-semibold text-red-600 mb-1">Danger Zone</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Irreversible actions that will permanently affect your data.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Reset All Data</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                This will delete all accounts, transactions, budgets, and goals. This action cannot be undone.
              </p>
            </div>
            <button onClick={() => setShowConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-medium">
              Reset Data
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-2xl border-2 border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3 mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirm Reset</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you absolutely sure you want to reset all data? This will:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4 list-disc list-inside">
                <li>Delete all accounts and transactions</li>
                <li>Remove all budgets and financial goals</li>
                <li>Clear all categories and templates</li>
                <li>Reset to default demo data</li>
              </ul>
              <p className="text-sm font-semibold text-red-600">This action cannot be undone!</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={resetAllData}
              className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold">
              Yes, Reset Everything
            </button>
            <button onClick={() => setShowConfirm(false)}
              className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
