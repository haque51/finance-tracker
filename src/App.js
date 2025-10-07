import React, { useState, useEffect, createContext, useContext } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target, Settings, Receipt, Calendar, DollarSign, Plus, Edit2, Trash2, Search, Menu, BarChart3, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, X, CreditCard, Brain, Bell, Zap } from 'lucide-react';

const AppContext = createContext();
const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const initialState = {
  user: { id: 'user1', name: 'Demo User', email: 'demo@financetracker.com', theme: 'light', baseCurrency: 'EUR', monthlyIncomeGoal: 5000, monthlySavingsGoal: 1000 },
  accounts: [
    { id: 'acc1', name: 'Main Checking', type: 'checking', currency: 'EUR', institution: 'Bank A', openingBalance: 5000, currentBalance: 5000, isActive: true },
    { id: 'acc2', name: 'Savings', type: 'savings', currency: 'EUR', institution: 'Bank A', openingBalance: 10000, currentBalance: 10000, isActive: true },
    { id: 'acc3', name: 'Credit Card', type: 'credit_card', currency: 'EUR', institution: 'Bank B', openingBalance: 0, currentBalance: -1500, isActive: true, interestRate: 5.5 },
    { id: 'acc4', name: 'Car Loan', type: 'loan', currency: 'EUR', institution: 'Bank C', openingBalance: -15000, currentBalance: -12000, isActive: true, interestRate: 4.5 }
  ],
  transactions: [
    { id: 'txn1', date: '2025-10-01', type: 'income', accountId: 'acc1', payee: 'Salary', categoryId: 'cat1', amount: 4500, currency: 'EUR', memo: 'Monthly salary', isReconciled: false },
    { id: 'txn2', date: '2025-10-02', type: 'expense', accountId: 'acc1', payee: 'Supermarket', categoryId: 'cat5', subcategoryId: 'cat7', amount: -120, currency: 'EUR', memo: 'Groceries', isReconciled: false },
    { id: 'txn3', date: '2025-10-03', type: 'expense', accountId: 'acc3', payee: 'Restaurant', categoryId: 'cat5', subcategoryId: 'cat6', amount: -85, currency: 'EUR', memo: 'Dinner', isReconciled: false },
    { id: 'txn4', date: '2025-09-01', type: 'income', accountId: 'acc1', payee: 'Salary', categoryId: 'cat1', amount: 4200, currency: 'EUR', memo: 'Monthly salary', isReconciled: false }
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Payee</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {state.transactions.map(txn => (
              <tr key={txn.id} className="hover:bg-blue-50/30 transition">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{txn.date}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{txn.payee}</td>
                <td className={`px-6 py-4 text-sm text-right font-semibold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{txn.amount.toLocaleString()}
                </td>
              </tr>
            ))}
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
  const [activeTab, setActiveTab] = useState('spending');

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
        Financial Insights
      </h2>

      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {['spending', 'comparison', 'alerts', 'ai', 'autocategorization'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 dark:text-gray-400'
            }`}>
            {tab === 'spending' && 'Spending Analysis'}
            {tab === 'comparison' && 'Period Comparison'}
            {tab === 'alerts' && 'Smart Alerts'}
            {tab === 'ai' && 'AI Insights'}
            {tab === 'autocategorization' && 'Auto-Categorization'}
          </button>
        ))}
      </div>

      {activeTab === 'spending' && <SpendingAnalysis />}
      {activeTab === 'comparison' && <PeriodComparison />}
      {activeTab === 'alerts' && <SmartAlerts />}
      {activeTab === 'ai' && <AIInsights />}
      {activeTab === 'autocategorization' && <AutoCategorization />}
    </div>
  );
}

function SpendingAnalysis() {
  const { state } = useApp();
  const currentMonth = '2025-10';
  
  const monthTransactions = state.transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');
  const totalSpending = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const avgTransactionSize = monthTransactions.length > 0 ? (totalSpending / monthTransactions.length).toFixed(2) : 0;
  const largestTransaction = monthTransactions.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max, monthTransactions[0] || { amount: 0 });

  const categorySpending = {};
  monthTransactions.forEach(t => {
    const cat = state.categories.find(c => c.id === t.categoryId);
    const catName = cat ? cat.name : 'Uncategorized';
    if (!categorySpending[catName]) {
      categorySpending[catName] = { total: 0, count: 0 };
    }
    categorySpending[catName].total += Math.abs(t.amount);
    categorySpending[catName].count += 1;
  });

  const sortedCategories = Object.entries(categorySpending).sort(([, a], [, b]) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Total Spending', value: `€${totalSpending.toLocaleString()}`, detail: 'This month', icon: <TrendingDown className="w-5 h-5 text-red-600" /> },
          { title: 'Avg Transaction', value: `€${avgTransactionSize}`, detail: `${monthTransactions.length} transactions`, icon: <BarChart3 className="w-5 h-5 text-blue-600" /> },
          { title: 'Largest Expense', value: `€${Math.abs(largestTransaction?.amount || 0).toLocaleString()}`, detail: largestTransaction?.payee || 'N/A', icon: <AlertCircle className="w-5 h-5 text-orange-600" /> }
        ].map((metric, i) => (
          <div key={i} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                {metric.icon}
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{metric.title}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{metric.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spending by Category</h3>
        </div>
        <div className="space-y-5">
          {sortedCategories.map(([category, data]) => {
            const percentage = ((data.total / totalSpending) * 100).toFixed(1);
            return (
              <div key={category} className="p-4 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{category}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">€{data.total.toLocaleString()}</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 ml-2 font-semibold">({percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/30" 
                    style={{ width: `${percentage}%` }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center space-x-1">
                  <span>{data.count} transaction{data.count !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>Avg: €{(data.total / data.count).toFixed(2)}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PeriodComparison() {
  const { state } = useApp();
  const [comparisonPeriod, setComparisonPeriod] = useState('month');
  
  let currentStart, previousStart, label;
  if (comparisonPeriod === 'month') {
    currentStart = '2025-10';
    previousStart = '2025-09';
    label = 'Month';
  } else if (comparisonPeriod === 'quarter') {
    currentStart = '2025-10';
    previousStart = '2025-07';
    label = 'Quarter';
  } else {
    currentStart = '2025';
    previousStart = '2024';
    label = 'Year';
  }
  
  const currentTxns = state.transactions.filter(t => t.date.startsWith(currentStart));
  const previousTxns = state.transactions.filter(t => t.date.startsWith(previousStart));
  
  const currentIncome = currentTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const previousIncome = previousTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const incomeChange = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome * 100).toFixed(1) : 0;
  
  const currentExpenses = Math.abs(currentTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const previousExpenses = Math.abs(previousTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const expensesChange = previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses * 100).toFixed(1) : 0;
  
  const currentSavings = currentIncome - currentExpenses;
  const previousSavings = previousIncome - previousExpenses;
  const savingsChange = previousSavings !== 0 ? ((currentSavings - previousSavings) / Math.abs(previousSavings) * 100).toFixed(1) : 0;

  const currentNetWorth = state.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const previousNetWorth = currentNetWorth - currentSavings;
  const netWorthChange = previousNetWorth !== 0 ? ((currentNetWorth - previousNetWorth) / Math.abs(previousNetWorth) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Compare:</label>
        <select value={comparisonPeriod} onChange={e => setComparisonPeriod(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="month">Month vs Month</option>
          <option value="quarter">Quarter vs Quarter</option>
          <option value="year">Year vs Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Income', value: currentIncome, change: incomeChange, positive: parseFloat(incomeChange) >= 0 },
          { label: 'Expenses', value: currentExpenses, change: expensesChange, positive: parseFloat(expensesChange) <= 0 },
          { label: 'Net Savings', value: currentSavings, change: savingsChange, positive: parseFloat(savingsChange) >= 0 },
          { label: 'Net Worth', value: currentNetWorth, change: netWorthChange, positive: parseFloat(netWorthChange) >= 0 }
        ].map((metric, i) => (
          <div key={i} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{metric.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">€{metric.value.toLocaleString()}</p>
            <div className={`flex items-center text-sm font-semibold ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
              {metric.positive ? '↑' : '↓'} {Math.abs(metric.change)}%
              <span className="text-gray-500 dark:text-gray-400 ml-1 font-normal">vs last {label.toLowerCase()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Trend Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[
            { period: `Previous ${label}`, Income: previousIncome, Expenses: previousExpenses, Savings: previousSavings },
            { period: `Current ${label}`, Income: currentIncome, Expenses: currentExpenses, Savings: currentSavings }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="Expenses" stroke="#EF4444" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="Savings" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SmartAlerts() {
  const { state, updateState } = useApp();
  const [showAlertForm, setShowAlertForm] = useState(false);

  const toggleAlert = (id) => {
    updateState({
      alerts: state.alerts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">Set up automatic alerts for budget limits and account thresholds</p>
        <button onClick={() => setShowAlertForm(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105">
          <Plus className="w-4 h-4" />
          <span>New Alert</span>
        </button>
      </div>

      {showAlertForm && <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 p-8 rounded-2xl shadow-2xl border border-gray-200/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Alert</h3>
          <button onClick={() => setShowAlertForm(false)} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Alert form would go here...</p>
      </div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.alerts.map(alert => {
          const category = alert.categoryId ? state.categories.find(c => c.id === alert.categoryId) : null;
          
          return (
            <div key={alert.id} className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <Bell className={`w-5 h-5 ${alert.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{alert.name}</h4>
                </div>
                <button onClick={() => toggleAlert(alert.id)}
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    alert.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                  {alert.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">Type:</span> {alert.type === 'budget' ? 'Budget Alert' : 'Balance Alert'}</p>
                <p><span className="font-medium">Condition:</span> {alert.condition} €{alert.threshold}</p>
                {category && <p><span className="font-medium">Category:</span> {category.icon} {category.name}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIInsights() {
  const { state } = useApp();
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    
    const currentMonth = '2025-10';
    const monthTransactions = state.transactions.filter(t => t.date.startsWith(currentMonth));
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = Math.abs(monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
    
    const categoryBreakdown = {};
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = state.categories.find(c => c.id === t.categoryId);
      const catName = cat ? cat.name : 'Uncategorized';
      categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + Math.abs(t.amount);
    });

    const financialSummary = {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      savingsRate: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0,
      netWorth: state.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0),
      totalDebt: state.accounts.filter(a => a.currentBalance < 0).reduce((sum, a) => sum + Math.abs(a.currentBalance), 0),
      categoryBreakdown
    };

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a financial advisor. Based on this monthly data, provide 3-5 actionable insights:

Monthly Income: €${financialSummary.monthlyIncome}
Monthly Expenses: €${financialSummary.monthlyExpenses}
Savings Rate: ${financialSummary.savingsRate}%
Net Worth: €${financialSummary.netWorth}
Total Debt: €${financialSummary.totalDebt}

Spending by Category:
${Object.entries(financialSummary.categoryBreakdown).map(([cat, amt]) => `- ${cat}: €${amt}`).join('\n')}

Provide specific, practical advice in a friendly tone.`
          }]
        })
      });

      const data = await response.json();
      setInsights(data.content[0].text);
    } catch (error) {
      setInsights('Unable to generate insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">Get AI-powered insights based on your financial data</p>
        <button onClick={generateInsights} disabled={loading}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50">
          <Brain className="w-4 h-4" />
          <span>{loading ? 'Generating...' : 'Generate AI Insights'}</span>
        </button>
      </div>

      {loading && (
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-12 rounded-2xl shadow-lg border border-gray-200/50 text-center">
          <div className="animate-pulse">
            <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analyzing Your Finances...</h3>
            <p className="text-gray-600 dark:text-gray-400">Claude is reviewing your data</p>
          </div>
        </div>
      )}

      {insights && !loading && (
        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-50/90 to-blue-50/90 dark:from-purple-900/30 dark:to-blue-900/30 p-8 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 shadow-lg">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Brain className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">AI Financial Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Powered by Claude AI</p>
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {insights}
          </div>
        </div>
      )}

      {!insights && !loading && (
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-12 rounded-2xl shadow-lg border border-gray-200/50 text-center">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 inline-block mb-4">
            <Brain className="w-16 h-16 text-purple-500 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Financial Analysis</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Click the button above to get personalized insights
          </p>
        </div>
      )}
    </div>
  );
}

function AutoCategorization() {
  const { state, updateState } = useApp();

  const toggleRule = (id) => {
    updateState({
      autoCategorization: state.autoCategorization.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">Create rules to automatically categorize transactions</p>
      </div>

      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/80 dark:bg-gray-700/80">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Condition</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {state.autoCategorization.map(rule => {
              const category = state.categories.find(c => c.id === rule.categoryId);
              
              return (
                <tr key={rule.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-semibold">
                      {rule.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{rule.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    Payee contains "{rule.matchValue}" → {category?.icon} {category?.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleRule(rule.id)}
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        rule.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
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

function SettingsView() {
  const { state, updateState } = useApp();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
        Settings
      </h2>
      <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">User Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input type="text" value={state.user.name}
              onChange={e => updateState({ user: { ...state.user, name: e.target.value }})}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input type="email" value={state.user.email}
              onChange={e => updateState({ user: { ...state.user, email: e.target.value }})}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
