/**
 * Lumina Finance - Main Application Component
 * Light theme optimized for visibility and contrast
 */
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target, Settings, Receipt, Calendar, DollarSign, Plus, Edit2, Trash2, Search, Menu, BarChart3, ArrowRightLeft, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, X, CreditCard, Brain, Bell, Zap, Download, Upload, LogOut, MoreVertical, RefreshCw } from 'lucide-react';
import { useApp as useGlobalApp } from './context/AppContext';
import { fetchExchangeRates } from './utils/exchangeRateApi';
import { DEFAULT_CATEGORIES, getAutoIcon } from './data/defaultCategories';
import { demoData, getEmptyState } from './data/demoData';
import LoadingOverlay from './components/LoadingOverlay';
import accountService from './services/accountService';
import transactionService from './services/transactionService';
const AppContext = createContext();

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export default function FinanceTrackerApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const globalContext = useGlobalApp();

  // Detect if we're in demo mode or authenticated mode
  const isDemoMode = location.pathname === '/demo';
  const isAuthenticated = !isDemoMode && globalContext.isAuthenticated;

  // Initialize state conditionally: demo data for demo mode, empty state for authenticated users
  const [state, setState] = useState(() => {
    return isDemoMode ? demoData : getEmptyState();
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Show loading only when authenticated and not in demo mode
  const [isLoadingData, setIsLoadingData] = useState(isAuthenticated && !isDemoMode);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Fetch real-time exchange rates
  const refreshExchangeRates = async () => {
    try {
      setIsRefreshingRates(true);
      const baseCurrency = currentUser?.baseCurrency || 'EUR';

      // Get unique currencies from all accounts
      const accountCurrencies = [...new Set(state.accounts.map(acc => acc.currency))];
      const targetCurrencies = accountCurrencies.filter(c => c !== baseCurrency);

      if (targetCurrencies.length === 0) {
        // No foreign currencies, no need to fetch rates
        return;
      }

      const rates = await fetchExchangeRates(baseCurrency, targetCurrencies);

      updateState({ exchangeRates: rates });
      console.log('Exchange rates updated:', rates);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setIsRefreshingRates(false);
    }
  };

  // Use global user when authenticated, local state user when in demo mode
  // Initialize theme to 'light' if not present in user object
  const currentUser = isAuthenticated
    ? { ...globalContext.user, theme: globalContext.user?.theme || 'light' }
    : state.user;

  // Load data from backend when authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated && !isDemoMode) {
        try {
          setIsLoadingData(true);

          // Load all data in parallel
          const [accountsData, transactionsData, categoriesData, budgetsData, goalsData, recurringData] = await Promise.all([
            globalContext.loadAccounts().catch(err => { console.error('Failed to load accounts:', err); return []; }),
            globalContext.loadTransactions().catch(err => { console.error('Failed to load transactions:', err); return { transactions: [] }; }),
            globalContext.loadCategories().catch(err => { console.error('Failed to load categories:', err); return []; }),
            globalContext.loadBudgets().catch(err => { console.error('Failed to load budgets:', err); return []; }),
            globalContext.loadGoals().catch(err => { console.error('Failed to load goals:', err); return []; }),
            globalContext.loadRecurringTransactions().catch(err => { console.error('Failed to load recurring:', err); return []; })
          ]);

          // If backend has no categories, this is a new user - save defaults to backend
          let finalCategories = categoriesData;

          console.log('=== CATEGORY LOADING DEBUG ===');
          console.log('Categories from backend:', categoriesData?.length || 0);
          if (categoriesData && categoriesData.length > 0) {
            console.log('Sample backend category:', categoriesData[0]);
          }

          if (!categoriesData || categoriesData.length === 0) {
            console.log('🆕 New user detected - initializing default categories in backend...');
            try {
              // Save default categories to backend
              const savedCategories = await globalContext.createCategoriesBulk(DEFAULT_CATEGORIES);
              console.log('Saved categories from backend:', savedCategories?.length || 0);
              if (savedCategories && savedCategories.length > 0) {
                console.log('Sample saved category:', savedCategories[0]);
              }
              finalCategories = savedCategories && savedCategories.length > 0 ? savedCategories : DEFAULT_CATEGORIES;
              console.log(`✅ Default categories saved to backend: ${finalCategories.length} categories`);
            } catch (err) {
              console.warn('⚠️ Failed to save default categories to backend, using local defaults:', err);
              finalCategories = DEFAULT_CATEGORIES;
            }
          }

          console.log('Final categories being used:', finalCategories?.length || 0);
          if (finalCategories && finalCategories.length > 0) {
            console.log('Sample final category:', finalCategories[0]);
          }
          console.log('==============================');

          // Update local state with backend data
          updateState({
            accounts: accountsData || [],
            transactions: transactionsData?.transactions || transactionsData || [],
            categories: finalCategories,
            budgets: budgetsData || [],
            goals: goalsData || [],
            recurringTransactions: recurringData || []
          });
        } catch (error) {
          console.error('Failed to load user data:', error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    loadUserData();
  }, [isAuthenticated, isDemoMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentUser?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentUser?.theme]);

  // Fetch exchange rates on mount and when accounts change
  useEffect(() => {
    refreshExchangeRates();

    // Refresh rates every 1 hour
    const interval = setInterval(() => {
      refreshExchangeRates();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [state.accounts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Process due recurring transactions automatically
  useEffect(() => {
    const processRecurringTransactions = () => {
      const today = new Date().toISOString().split('T')[0];
      const dueRecurring = state.recurringTransactions.filter(rec => {
        if (!rec.isActive) return false;

        if (!rec.lastProcessed) {
          // Never processed - check if start date has passed
          return rec.startDate <= today;
        }

        // Calculate next due date based on frequency and interval
        const lastProcessedDate = new Date(rec.lastProcessed);
        const nextDueDate = new Date(lastProcessedDate);

        switch (rec.frequency) {
          case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + rec.interval);
            break;
          case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + (rec.interval * 7));
            break;
          case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + rec.interval);
            break;
          case 'yearly':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + rec.interval);
            break;
          default:
            return false;
        }

        return nextDueDate.toISOString().split('T')[0] <= today;
      });

      if (dueRecurring.length > 0) {
        console.log(`Processing ${dueRecurring.length} due recurring transactions...`);

        const newTransactions = [];
        const updatedAccounts = [...state.accounts];
        const updatedRecurring = [...state.recurringTransactions];

        dueRecurring.forEach(rec => {
          const newTxn = {
            id: 'txn_rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            date: today,
            type: rec.type,
            accountId: rec.accountId,
            payee: rec.payee,
            categoryId: rec.categoryId,
            subcategoryId: rec.subcategoryId,
            amount: rec.amount,
            currency: rec.currency,
            memo: `Recurring: ${rec.name}`,
            isReconciled: false
          };

          newTransactions.push(newTxn);

          // Update account balance
          const accountIndex = updatedAccounts.findIndex(acc => acc.id === rec.accountId);
          if (accountIndex !== -1) {
            updatedAccounts[accountIndex] = {
              ...updatedAccounts[accountIndex],
              currentBalance: updatedAccounts[accountIndex].currentBalance + rec.amount
            };
          }

          // Update lastProcessed date
          const recIndex = updatedRecurring.findIndex(r => r.id === rec.id);
          if (recIndex !== -1) {
            updatedRecurring[recIndex] = {
              ...updatedRecurring[recIndex],
              lastProcessed: today
            };
          }
        });

        if (newTransactions.length > 0) {
          updateState({
            transactions: [...state.transactions, ...newTransactions],
            accounts: updatedAccounts,
            recurringTransactions: updatedRecurring
          });
          console.log(`✅ Processed ${newTransactions.length} recurring transactions`);
        }
      }
    };

    // Check on mount and every hour
    processRecurringTransactions();
    const interval = setInterval(processRecurringTransactions, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [state.recurringTransactions, state.accounts, state.transactions]); // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = (newTheme) => {
    if (isAuthenticated) {
      // For authenticated users, update global context and persist to localStorage
      const updatedUser = { ...globalContext.user, theme: newTheme };
      globalContext.updateUser(updatedUser);
    } else {
      // For demo mode, update local state
      updateState({ user: { ...state.user, theme: newTheme } });
    }
  };

  const toggleTheme = () => {
    const newTheme = currentUser?.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    try {
      await globalContext.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const contextValue = { state, updateState, currentView, setCurrentView, isDemoMode, isAuthenticated, currentUser, handleLogout, isLoadingData, refreshExchangeRates, isRefreshingRates };

  return (
    <AppContext.Provider value={contextValue}>
      {/* Show loading overlay when fetching data for authenticated users */}
      {isLoadingData && !isDemoMode && <LoadingOverlay text="Loading your financial data..." />}

      <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
        {/* Modern Header with Glassmorphism - Per Design Spec */}
        <header className="sticky top-0 z-50 glass-card border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-primary p-2 rounded-button shadow-card">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">Lumina Finance</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Personal Finance Tracker</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-button shadow-sm">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {(currentUser?.name || 'Guest').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{currentUser?.name || 'Guest'}</span>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-error hover:bg-error-50 dark:hover:bg-error-900/20 rounded-button transition-all duration-hover hover:shadow-card"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                )}
                <button
                  onClick={toggleTheme}
                  className="p-3 rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-hover text-xl hover:scale-110"
                  title="Toggle Theme"
                >
                  {currentUser?.theme === 'light' ? '🌙' : '☀️'}
                </button>
              </div>
              <button className="md:hidden p-2 rounded-button hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-hover" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Modern Sidebar with Glassmorphism */}
          <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-72 glass-card border-r border-gray-200/50 dark:border-gray-700/50 min-h-screen custom-scrollbar`}>
            <nav className="p-6 space-y-2">
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

          <main className="flex-1 p-8 relative bg-background-light dark:bg-background-dark">
            {isLoadingData && (
              <div className="absolute inset-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-glass flex items-center justify-center z-50 animate-fade-in">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-200 dark:border-primary-800 border-t-primary shadow-card"></div>
                  <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">Loading your financial data...</p>
                </div>
              </div>
            )}
            <div className="max-w-7xl mx-auto">
              {isAuthenticated && currentView === 'dashboard' && (
                <div className="mb-8 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-card p-6 shadow-card animate-slide-down">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-success p-3 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {currentUser?.name || 'User'}! 👋
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
                        Here's your financial overview for today
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
              {currentView === 'settings' && <SettingsView setTheme={setTheme} currentUser={currentUser} />}
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
      className={`nav-item w-full ${isActive ? 'active' : ''}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function DashboardView() {
  const { state, refreshExchangeRates, isRefreshingRates, currentUser } = useApp();

  // Get current date
  const now = new Date();
  const currentMonthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // State for selected month
  const [selectedMonth, setSelectedMonth] = React.useState(currentMonthString);

  // Get all available months from transactions
  const getAvailableMonths = () => {
    if (!state.transactions || state.transactions.length === 0) {
      return [currentMonthString];
    }

    // Find earliest transaction date
    const dates = state.transactions.map(t => new Date(t.date));
    const earliestDate = new Date(Math.min(...dates));

    // Generate list of months from earliest to now
    const months = [];
    let current = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);

    while (current <= end) {
      months.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
      current.setMonth(current.getMonth() + 1);
    }

    return months.reverse(); // Most recent first
  };

  const availableMonths = getAvailableMonths();

  // Calculate previous month
  const getPreviousMonth = (monthString) => {
    const [year, month] = monthString.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const previousMonth = getPreviousMonth(selectedMonth);

  const currentMonthTxns = state.transactions.filter(t => t.date.startsWith(selectedMonth));
  const previousMonthTxns = state.transactions.filter(t => t.date.startsWith(previousMonth));

  const monthlyIncome = currentMonthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const previousIncome = previousMonthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const incomeChange = previousIncome > 0 ? ((monthlyIncome - previousIncome) / previousIncome * 100).toFixed(1) : 0;
  const incomeAbsChange = monthlyIncome - previousIncome;

  const monthlyExpenses = Math.abs(currentMonthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const previousExpenses = Math.abs(previousMonthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const expenseChange = previousExpenses > 0 ? ((monthlyExpenses - previousExpenses) / previousExpenses * 100).toFixed(1) : 0;
  const expenseAbsChange = monthlyExpenses - previousExpenses;

  // Calculate net worth based on selected month
  // For current month, use account currentBalance
  // For historical months, calculate from opening balance + transactions up to that month
  const calculateNetWorthForMonth = (monthString) => {
    const baseCurrency = currentUser.baseCurrency || 'EUR';

    if (monthString === currentMonthString) {
      // Current month - use actual account balances
      // Loans and credit cards should be negative in net worth calculation
      return state.accounts.reduce((sum, acc) => {
        const isDebtAccount = acc.type === 'loan' || acc.type === 'credit_card';
        let balance = isDebtAccount && acc.currentBalance > 0 ? -acc.currentBalance : acc.currentBalance;

        // Convert to base currency
        // exchangeRates format: { BDT: 118.5 } means 1 EUR = 118.5 BDT
        // To convert BDT to EUR: BDT_amount / rate
        const accountCurrency = acc.currency || baseCurrency;
        if (accountCurrency !== baseCurrency) {
          const rate = state.exchangeRates[accountCurrency] || 1;
          balance = balance / rate;
        }

        return sum + balance;
      }, 0);
    } else {
      // Historical month - calculate from opening balance + transactions
      let netWorth = state.accounts.reduce((sum, acc) => {
        const isDebtAccount = acc.type === 'loan' || acc.type === 'credit_card';
        let balance = isDebtAccount && acc.openingBalance > 0 ? -acc.openingBalance : acc.openingBalance;

        // Convert to base currency
        // exchangeRates format: { BDT: 118.5 } means 1 EUR = 118.5 BDT
        // To convert BDT to EUR: BDT_amount / rate
        const accountCurrency = acc.currency || baseCurrency;
        if (accountCurrency !== baseCurrency) {
          const rate = state.exchangeRates[accountCurrency] || 1;
          balance = balance / rate;
        }

        return sum + balance;
      }, 0);

      // Add all transactions up to and including the selected month
      state.transactions.forEach(t => {
        if (t.date <= `${monthString}-31`) {
          if (t.type === 'income') {
            netWorth += t.amount;
          } else if (t.type === 'expense') {
            netWorth += t.amount; // amount is already negative for expenses
          }
        }
      });

      return netWorth;
    }
  };

  const netWorth = calculateNetWorthForMonth(selectedMonth);
  const previousNetWorth = calculateNetWorthForMonth(previousMonth);
  const netWorthAbsChange = netWorth - previousNetWorth;
  const netWorthChange = previousNetWorth !== 0 ? ((netWorth - previousNetWorth) / Math.abs(previousNetWorth) * 100).toFixed(1) : 0;

  const currentSavings = monthlyIncome - monthlyExpenses;
  const previousSavings = previousIncome - previousExpenses;
  const savingsAmountChange = currentSavings - previousSavings;

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

  // Format month for display
  const formatMonthDisplay = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshExchangeRates}
            disabled={isRefreshingRates}
            className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh exchange rates"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshingRates ? 'animate-spin' : ''}`} />
          </button>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {formatMonthDisplay(month)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Income"
          value={`€${monthlyIncome.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          change={`€${incomeAbsChange.toLocaleString()}`}
          changePercent={`${incomeChange >= 0 ? '+' : ''}${incomeChange}%`}
          isPositive={incomeChange >= 0}
        />
        <MetricCard
          title="Monthly Expenses"
          value={`€${monthlyExpenses.toLocaleString()}`}
          icon={<TrendingDown className="w-6 h-6 text-white" />}
          change={`€${expenseAbsChange.toLocaleString()}`}
          changePercent={`${expenseChange >= 0 ? '+' : ''}${expenseChange}%`}
          isPositive={expenseChange <= 0}
        />
        <MetricCard
          title="Net Worth"
          value={`€${netWorth.toLocaleString()}`}
          icon={<Wallet className="w-6 h-6 text-white" />}
          change={`€${netWorthAbsChange.toLocaleString()}`}
          changePercent={`${netWorthChange >= 0 ? '+' : ''}${netWorthChange}%`}
          isPositive={netWorthChange >= 0}
        />
        <MetricCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          icon={<Target className="w-6 h-6 text-white" />}
          change={`€${savingsAmountChange.toLocaleString()}`}
          changePercent={`${savingsRateChange >= 0 ? '+' : ''}${savingsRateChange}% pts`}
          isPositive={savingsAmountChange >= 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-primary rounded-full"></div>
            <span>Spending by Category</span>
          </h3>
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

        <div className="chart-container">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-accent rounded-full"></div>
            <span>Net Worth by Account</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={state.accounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="currentBalance" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.9}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6 animate-fade-in">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
          <div className="w-1 h-6 bg-gradient-success rounded-full"></div>
          <span>Account Balances</span>
        </h3>
        <div className="space-y-3">
          {state.accounts.map(account => {
            // Convert account balance to base currency
            // exchangeRates format: { BDT: 118.5 } means 1 EUR = 118.5 BDT
            // To convert BDT to EUR: BDT_amount / rate
            const accountCurrency = account.currency || state.user.baseCurrency;
            const balanceInBase = accountCurrency === state.user.baseCurrency
              ? account.currentBalance
              : account.currentBalance / (state.exchangeRates[accountCurrency] || 1);
            return (
              <div key={account.id} className="group glass-card p-4 flex justify-between items-center hover:shadow-glow transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-primary rounded-xl">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{account.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{account.type} • {account.institution}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${account.currentBalance >= 0 ? 'text-success-600 dark:text-success-400' : 'text-red-600 dark:text-red-400'}`}>
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
    <div className="stat-card animate-scale-in group hover:scale-105 transition-transform duration-300">
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gradient mb-3">{value}</p>
            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
              isPositive
                ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{change} {changePercent && `(${changePercent})`}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">vs last month</p>
          </div>
          <div className="p-3 bg-gradient-primary rounded-xl shadow-glow">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// Keep all the existing view components (AccountsView, TransactionsView, CategoriesView, RecurringView, BudgetView, GoalsView, SettingsView)
// I'll include them but keep them unchanged from the original

function AccountsView() {
  const { state, updateState, isDemoMode, isAuthenticated } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete all associated transactions.')) {
      try {
        // Call backend API if authenticated
        if (isAuthenticated && !isDemoMode) {
          await accountService.deleteAccount(id);
        }

        // Update local state
        updateState({
          accounts: state.accounts.filter(a => a.id !== id),
          transactions: state.transactions.filter(t => t.accountId !== id && t.transferAccountId !== id)
        });
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('Failed to delete account. Please try again.');
      }
    }
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Accounts</h2>
          <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">Manage your financial accounts</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingAccount(null); }} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {showForm && <AccountForm account={editingAccount} onClose={() => { setShowForm(false); setEditingAccount(null); }} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.accounts.map(account => {
          // Convert account balance to base currency
          // exchangeRates format: { USD: 1.08, BDT: 118.5 } means 1 EUR = 1.08 USD
          // To convert USD to EUR: USD_amount / 1.08
          const accountCurrency = account.currency || state.user.baseCurrency;
          const balanceInBase = accountCurrency === state.user.baseCurrency
            ? account.currentBalance
            : account.currentBalance / (state.exchangeRates[accountCurrency] || 1);

          // Determine if account is a debt type (should be displayed as negative)
          const isDebtAccount = account.type === 'loan' || account.type === 'credit_card';
          const displayBalance = isDebtAccount && account.currentBalance > 0 ? -account.currentBalance : account.currentBalance;
          const isNegative = displayBalance < 0;

          // Capitalize account type
          const capitalizedType = account.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

          return (
            <div key={account.id} className="glass-card group relative animate-fade-in hover:scale-105 transition-all duration-card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-primary rounded-button">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{capitalizedType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`badge-modern ${!isNegative ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300' : 'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300'}`}>
                    {!isNegative ? 'Asset' : 'Debt'}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === account.id ? null : account.id)}
                      className="btn-icon hover:shadow-card-hover"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    {openMenuId === account.id && (
                      <div className="absolute right-0 mt-2 w-48 glass-card shadow-card z-10 animate-scale-in">
                        <button
                          onClick={() => {
                            setEditingAccount(account);
                            setShowForm(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-t-button transition-all duration-hover"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left text-error hover:bg-error-50 dark:hover:bg-error-900/20 rounded-b-button transition-all duration-hover"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className={`text-3xl font-bold mb-3 ${!isNegative ? 'text-success dark:text-success-400' : 'text-error dark:text-error-400'}`}>
                {account.currency} {displayBalance.toLocaleString()}
              </p>
              {account.currency !== state.user.baseCurrency && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  ≈ {state.user.baseCurrency} {balanceInBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">Institution: {account.institution}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AccountForm({ account, onClose }) {
  const { state, updateState, isDemoMode, isAuthenticated } = useApp();
  const isEditing = !!account;

  const [formData, setFormData] = useState(account ? {
    name: account.name,
    type: account.type,
    currency: account.currency,
    institution: account.institution,
    openingBalance: account.openingBalance,
    currentBalance: account.currentBalance,
    interestRate: account.interestRate || ''
  } : {
    name: '',
    type: 'checking',
    currency: 'EUR',
    institution: '',
    openingBalance: '',
    currentBalance: '',
    interestRate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        // When editing, keep the original opening balance, only update current balance and other fields
        const updatedAccount = {
          ...account,
          name: formData.name,
          type: formData.type,
          currency: formData.currency,
          institution: formData.institution,
          currentBalance: parseFloat(formData.currentBalance) || 0,
          interestRate: parseFloat(formData.interestRate) || 0
        };

        // Call backend API if authenticated
        if (isAuthenticated && !isDemoMode) {
          await accountService.updateAccount(account.id, updatedAccount);
        }

        // Update local state
        updateState({
          accounts: state.accounts.map(a =>
            a.id === account.id ? updatedAccount : a
          )
        });
      } else {
        // When creating, set both opening and current balance to the same value
        const openingBalance = parseFloat(formData.openingBalance) || 0;
        const newAccountData = {
          name: formData.name,
          type: formData.type,
          currency: formData.currency,
          institution: formData.institution,
          openingBalance: openingBalance,
          currentBalance: openingBalance,
          isActive: true,
          interestRate: parseFloat(formData.interestRate) || 0
        };

        let newAccount;
        // Call backend API if authenticated
        if (isAuthenticated && !isDemoMode) {
          newAccount = await accountService.createAccount(newAccountData);
        } else {
          // Demo mode: use temporary ID
          newAccount = {
            ...newAccountData,
            id: 'acc' + Date.now()
          };
        }

        // Update local state
        updateState({ accounts: [...state.accounts, newAccount] });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save account:', error);
      console.error('Error details:', error.response?.data);
      console.error('Original error:', error.originalError);
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

      // Try to extract the most detailed error message
      const errorData = error.originalError?.response?.data
        || error.response?.data
        || {};

      const errorMessage = errorData.message
        || errorData.error
        || errorData.details
        || error.message
        || 'Unknown error occurred';

      // If there are validation details, show them
      let detailsText = '';
      if (errorData.details && typeof errorData.details === 'object') {
        detailsText = '\n\nDetails:\n' + JSON.stringify(errorData.details, null, 2);
      }

      alert(`Failed to save account: ${errorMessage}${detailsText}\n\nCheck browser console for full details.`);
    }
  };

  return (
    <div className="glass-card animate-fade-in">
      <h3 className="text-2xl font-bold text-gradient mb-6">{account ? 'Edit Account' : 'Add New Account'}</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Account Name *</label>
            <input
              type="text"
              placeholder="e.g., Main Checking"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="input-modern"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Account Type</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="input-modern"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit_card">Credit Card</option>
              <option value="loan">Loan</option>
              <option value="investment">Investment</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Currency</label>
            <select
              value={formData.currency}
              onChange={e => setFormData({ ...formData, currency: e.target.value })}
              className="input-modern"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="BDT">BDT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Institution *</label>
            <input
              type="text"
              placeholder="e.g., Bank A"
              value={formData.institution}
              onChange={e => setFormData({ ...formData, institution: e.target.value })}
              className="input-modern"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Opening Balance {!isEditing && '*'}
            </label>
            <input
              type="number"
              step="0.01"
              placeholder={isEditing ? "Cannot be modified" : "Enter opening balance"}
              value={formData.openingBalance}
              onChange={e => setFormData({ ...formData, openingBalance: e.target.value })}
              disabled={isEditing}
              className="input-modern disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              required={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Current Balance {isEditing && '*'}
            </label>
            <input
              type="number"
              step="0.01"
              placeholder={isEditing ? "Enter current balance" : "Auto-set from opening balance"}
              value={formData.currentBalance}
              onChange={e => setFormData({ ...formData, currentBalance: e.target.value })}
              disabled={!isEditing}
              className="input-modern disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              required={isEditing}
            />
          </div>

          {(formData.type === 'loan' || formData.type === 'credit_card') && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 4.5"
                value={formData.interestRate}
                onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                className="input-modern"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button type="submit" className="btn-primary">
            {isEditing ? 'Update Account' : 'Create Account'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function TransactionsView() {
  const { state, updateState, isDemoMode, isAuthenticated } = useApp();
  const globalContext = useGlobalApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = state.transactions.filter(t => t.payee.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = async (id) => {
    const txn = state.transactions.find(t => t.id === id);
    if (window.confirm('Delete this transaction?')) {
      try {
        if (isAuthenticated && !isDemoMode) {
          await transactionService.deleteTransaction(id);
          // Reload data from backend to get updated balances
          const [accountsData, transactionsData] = await Promise.all([
            globalContext.loadAccounts(),
            globalContext.loadTransactions()
          ]);
          updateState({
            accounts: accountsData,
            transactions: transactionsData?.transactions || transactionsData
          });
        } else {
          // Demo mode: Update local state with balance calculations
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
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Transactions</h2>
          <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">Track your income, expenses, and transfers</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingTransaction(null); }} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {showForm && <TransactionForm transaction={editingTransaction} onClose={() => { setShowForm(false); setEditingTransaction(null); }} />}

      <div className="glass-card">
        <div className="flex-1 relative mb-6">
          <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-modern pl-12" />
        </div>

        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Payee</th>
                <th>Category</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(txn => {
                const category = state.categories.find(c => c.id === txn.categoryId);
                const subcategory = txn.subcategoryId ? state.categories.find(c => c.id === txn.subcategoryId) : null;
                return (
                  <tr key={txn.id}>
                    <td>{txn.date}</td>
                    <td>
                      <span className={`badge-modern ${
                        txn.type === 'income' ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300' :
                        txn.type === 'expense' ? 'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300' :
                        'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      }`}>
                        {txn.type === 'transfer' ? <ArrowRightLeft className="w-3 h-3 inline mr-1" /> : null}
                        {txn.type}
                      </span>
                    </td>
                    <td className="font-medium">{txn.payee}</td>
                    <td>
                      {category ? `${category.icon} ${category.name}` : 'Uncategorized'}
                      {subcategory && ` > ${subcategory.name}`}
                    </td>
                    <td className={`text-right font-semibold ${txn.amount >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                      {txn.currency} {txn.amount.toLocaleString()}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingTransaction(txn); setShowForm(true); }} className="p-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-button transition-all duration-hover">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(txn.id)} className="p-2 text-error-600 hover:text-error-800 dark:text-error-400 dark:hover:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-button transition-all duration-hover">
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
    </div>
  );
}

function TransactionForm({ transaction, onClose }) {
  const { state, updateState, isDemoMode, isAuthenticated } = useApp();
  const globalContext = useGlobalApp();
  const [formData, setFormData] = useState(transaction ? {
    date: transaction.date,
    type: transaction.type,
    accountId: transaction.accountId,
    transferAccountId: transaction.transferAccountId || '',
    payee: transaction.payee,
    categoryId: transaction.categoryId,
    subcategoryId: transaction.subcategoryId || '',
    amount: Math.abs(transaction.amount),
    currency: transaction.currency,
    memo: transaction.memo || ''
  } : {
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    accountId: '',
    transferAccountId: '',
    payee: '',
    categoryId: '',
    subcategoryId: '',
    amount: '',
    currency: 'EUR',
    memo: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.accountId) {
      alert('Please select an account');
      return;
    }

    if (formData.type !== 'transfer' && !formData.categoryId) {
      alert('Please select a category');
      return;
    }

    if (formData.type === 'transfer' && !formData.transferAccountId) {
      alert('Please select a transfer destination account');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    try {
      // Map form fields to backend format
      const txnData = {
        type: formData.type,
        accountId: formData.accountId,
        toAccountId: formData.transferAccountId || null, // Map transferAccountId to toAccountId
        categoryId: formData.categoryId || null,
        subcategoryId: formData.subcategoryId || null,
        amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
        currency: formData.currency,
        description: formData.payee || '', // Map payee to description (optional)
        date: formData.date,
        notes: formData.memo || null, // Map memo to notes
        reconciled: false
      };

      if (transaction) {
        // Update existing transaction
        if (isAuthenticated && !isDemoMode) {
          await transactionService.updateTransaction(transaction.id, txnData);
          // Reload data from backend to get updated balances
          const [accountsData, transactionsData] = await Promise.all([
            globalContext.loadAccounts(),
            globalContext.loadTransactions()
          ]);
          updateState({
            accounts: accountsData,
            transactions: transactionsData?.transactions || transactionsData
          });
        } else {
          // Demo mode: Update local state with balance calculations
          const oldTxn = state.transactions.find(t => t.id === transaction.id);
          const updatedAccounts = state.accounts.map(acc => {
            // Reverse old transaction
            if (acc.id === oldTxn.accountId) {
              if (oldTxn.type === 'transfer') {
                acc = { ...acc, currentBalance: acc.currentBalance + Math.abs(oldTxn.amount) };
              } else {
                acc = { ...acc, currentBalance: acc.currentBalance - oldTxn.amount };
              }
            }
            if (oldTxn.type === 'transfer' && acc.id === oldTxn.transferAccountId) {
              acc = { ...acc, currentBalance: acc.currentBalance - Math.abs(oldTxn.amount) };
            }

            // Apply new transaction
            if (acc.id === formData.accountId) {
              if (formData.type === 'transfer') {
                acc = { ...acc, currentBalance: acc.currentBalance - Math.abs(parseFloat(formData.amount)) };
              } else {
                acc = { ...acc, currentBalance: acc.currentBalance + (formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount))) };
              }
            }
            if (formData.type === 'transfer' && acc.id === formData.transferAccountId) {
              acc = { ...acc, currentBalance: acc.currentBalance + Math.abs(parseFloat(formData.amount)) };
            }
            return acc;
          });

          updateState({
            transactions: state.transactions.map(t => t.id === transaction.id ? {
              ...txnData,
              id: transaction.id,
              isReconciled: t.isReconciled
            } : t),
            accounts: updatedAccounts
          });
        }
      } else {
        // Create new transaction
        let newTxn;
        if (isAuthenticated && !isDemoMode) {
          newTxn = await transactionService.createTransaction(txnData);
          // Reload data from backend to get updated balances
          const [accountsData, transactionsData] = await Promise.all([
            globalContext.loadAccounts(),
            globalContext.loadTransactions()
          ]);
          updateState({
            accounts: accountsData,
            transactions: transactionsData?.transactions || transactionsData
          });
        } else {
          // Demo mode: Update local state with balance calculations
          newTxn = {
            ...txnData,
            id: 'txn' + Date.now(),
            isReconciled: false
          };

          const updatedAccounts = state.accounts.map(acc => {
            if (acc.id === formData.accountId) {
              if (formData.type === 'transfer') {
                return { ...acc, currentBalance: acc.currentBalance - Math.abs(newTxn.amount) };
              }
              return { ...acc, currentBalance: acc.currentBalance + newTxn.amount };
            }
            if (formData.type === 'transfer' && acc.id === formData.transferAccountId) {
              return { ...acc, currentBalance: acc.currentBalance + Math.abs(newTxn.amount) };
            }
            return acc;
          });

          updateState({ transactions: [...state.transactions, newTxn], accounts: updatedAccounts });
        }
      }
      onClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      console.error('Error details:', error.response?.data);
      console.error('Original error:', error.originalError);
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

      // Try to extract the most detailed error message
      const errorData = error.originalError?.response?.data
        || error.response?.data
        || {};

      const errorMessage = errorData.message
        || errorData.error
        || errorData.details
        || error.message
        || 'Unknown error occurred';

      // If there are validation details, show them
      let detailsText = '';
      if (errorData.details && typeof errorData.details === 'object') {
        detailsText = '\n\nDetails:\n' + JSON.stringify(errorData.details, null, 2);
      }

      alert(`Failed to save transaction: ${errorMessage}${detailsText}\n\nCheck browser console for full details.`);
    }
  };

  const filteredCategories = state.categories.filter(c => c.type === formData.type && !c.parentId);
  const subcategories = formData.categoryId ? state.categories.filter(c => c.parentId === formData.categoryId) : [];

  // Debug: Log available categories
  console.log('=== TRANSACTION FORM CATEGORIES DEBUG ===');
  console.log('Total categories in state:', state.categories.length);
  console.log('All categories:', state.categories);
  console.log('Filtered categories for', formData.type, ':', filteredCategories);
  console.log('Selected category ID:', formData.categoryId);
  console.log('======================================');

  return (
    <div className="glass-card animate-fade-in">
      <h3 className="text-2xl font-bold text-gradient mb-6">{transaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Date *</label>
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="input-modern" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Type *</label>
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value, categoryId: '', subcategoryId: '' })} className="input-modern">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">From Account *</label>
            <select value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} className="input-modern" required>
              <option value="">Select Account</option>
              {state.accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
          {formData.type === 'transfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">To Account *</label>
              <select value={formData.transferAccountId} onChange={e => setFormData({ ...formData, transferAccountId: e.target.value })} className="input-modern" required>
                <option value="">To Account</option>
                {state.accounts.filter(a => a.id !== formData.accountId).map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Payee</label>
            <input type="text" placeholder="e.g., Supermarket (Optional)" value={formData.payee} onChange={e => setFormData({ ...formData, payee: e.target.value })} className="input-modern" />
          </div>
          {formData.type !== 'transfer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Category *</label>
                <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })} className="input-modern" required>
                  <option value="">Select Category</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              {subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Subcategory</label>
                  <select value={formData.subcategoryId} onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })} className="input-modern">
                    <option value="">Select Subcategory (Optional)</option>
                    {subcategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Amount *</label>
            <input type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="input-modern" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Memo</label>
            <input type="text" placeholder="Memo" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })} className="input-modern" />
          </div>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="btn-primary">{transaction ? 'Update' : 'Add'} Transaction</button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function CategoriesView() {
  const { state, updateState } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Categories</h2>
          <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">Organize your transactions</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingCategory(null); }} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {showForm && <CategoryForm category={editingCategory} onClose={() => { setShowForm(false); setEditingCategory(null); }} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-success-600 dark:text-success-400">Income Categories</span>
          </h3>
          <div className="space-y-2">
            {incomeCategories.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
                  <span className="text-gray-900 dark:text-white font-medium">{cat.icon} {cat.name}</span>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    {openMenuId === cat.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setShowForm(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(cat.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {getSubcategories(cat.id).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-2 pl-8 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg mt-1">
                    <span className="text-gray-900 dark:text-white text-sm">{sub.icon} {sub.name}</span>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === sub.id ? null : sub.id)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      {openMenuId === sub.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <button
                            onClick={() => {
                              setEditingCategory(sub);
                              setShowForm(true);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(sub.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-error-600 dark:text-error-400">Expense Categories</span>
          </h3>
          <div className="space-y-2">
            {expenseCategories.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
                  <span className="text-gray-900 dark:text-white font-medium">{cat.icon} {cat.name}</span>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    {openMenuId === cat.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setShowForm(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(cat.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {getSubcategories(cat.id).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-2 pl-8 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg mt-1">
                    <span className="text-gray-900 dark:text-white text-sm">{sub.icon} {sub.name}</span>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === sub.id ? null : sub.id)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      {openMenuId === sub.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <button
                            onClick={() => {
                              setEditingCategory(sub);
                              setShowForm(true);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(sub.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
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
    icon: '📝'
  });
  const [manualIconEdit, setManualIconEdit] = useState(!!category);

  // Auto-assign icon when name changes (unless user manually edited icon)
  const handleNameChange = (newName) => {
    const updates = { name: newName };

    // Only auto-assign icon if user hasn't manually edited it
    if (!manualIconEdit) {
      updates.icon = getAutoIcon(newName, formData.type);
    }

    setFormData({ ...formData, ...updates });
  };

  // Handle icon manual edit
  const handleIconChange = (newIcon) => {
    setManualIconEdit(true);
    setFormData({ ...formData, icon: newIcon });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (category) {
      updateState({ categories: state.categories.map(c => c.id === category.id ? { ...c, ...formData } : c) });
    } else {
      const newCategory = {
        ...formData,
        id: 'cat_custom_' + Date.now(),
        // Ensure icon is set, fallback to auto-assignment if empty
        icon: formData.icon || getAutoIcon(formData.name, formData.type)
      };
      updateState({ categories: [...state.categories, newCategory] });
    }
    onClose();
  };

  const parentCategories = state.categories.filter(c => c.type === formData.type && !c.parentId && c.id !== category?.id);

  return (
    <div className="glass-card animate-fade-in">
      <h3 className="text-2xl font-bold text-gradient mb-6">{category ? 'Edit Category' : 'Add Category'}</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Category Name *</label>
            <input
              type="text"
              placeholder="Category Name"
              value={formData.name}
              onChange={e => handleNameChange(e.target.value)}
              className="input-modern"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Type *</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value, parentId: null, icon: getAutoIcon(formData.name, e.target.value) })}
              className="input-modern disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!!category}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Parent Category</label>
            <select
              value={formData.parentId || ''}
              onChange={e => setFormData({ ...formData, parentId: e.target.value || null })}
              className="input-modern"
            >
              <option value="">No Parent (Main Category)</option>
              {parentCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Icon (Emoji)</label>
            <input
              type="text"
              placeholder="Icon (emoji) - auto-assigned"
              value={formData.icon}
              onChange={e => handleIconChange(e.target.value)}
              className="input-modern"
              maxLength="2"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: Icon is automatically assigned based on category name. You can override it by typing your own emoji.
        </p>
        <div className="flex gap-4">
          <button type="submit" className="btn-primary">{category ? 'Update' : 'Add'} Category</button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function RecurringView() {
  const { state, updateState } = useApp();
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

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

  const handleDeleteRecurring = (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      updateState({ recurringTransactions: state.recurringTransactions.filter(r => r.id !== id) });
    }
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      updateState({ templates: state.templates.filter(t => t.id !== id) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient">Recurring & Templates</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Automate recurring transactions and save templates</p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Recurring Transactions</h3>
          <button onClick={() => setShowRecurringForm(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Recurring</span>
          </button>
        </div>

        {showRecurringForm && <RecurringForm recurring={editingRecurring} onClose={() => { setShowRecurringForm(false); setEditingRecurring(null); }} />}

        <div className="space-y-4">
          {state.recurringTransactions.map(rec => {
            const account = state.accounts.find(a => a.id === rec.accountId);
            const category = state.categories.find(c => c.id === rec.categoryId);
            return (
              <div key={rec.id} className="glass-card animate-fade-in hover:shadow-card-hover transition-all duration-card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{rec.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{rec.payee} • {category?.name} • {account?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Every {rec.interval} {rec.frequency}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last processed: {rec.lastProcessed || 'Never'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`text-lg font-semibold ${rec.amount >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                      {rec.currency} {rec.amount.toLocaleString()}
                    </p>
                    <button onClick={() => processRecurring(rec.id)} className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-button font-medium shadow-card transition-all duration-hover active:scale-95 text-sm">
                      Process Now
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === rec.id ? null : rec.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </button>
                      {openMenuId === rec.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <button
                            onClick={() => {
                              setEditingRecurring(rec);
                              setShowRecurringForm(true);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteRecurring(rec.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6 mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Templates</h3>
          <button onClick={() => setShowTemplateForm(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Template</span>
          </button>
        </div>

        {showTemplateForm && <TemplateForm template={editingTemplate} onClose={() => { setShowTemplateForm(false); setEditingTemplate(null); }} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.templates.map(tpl => {
            const category = state.categories.find(c => c.id === tpl.categoryId);
            return (
              <div key={tpl.id} className="glass-card animate-fade-in hover:shadow-card-hover transition-all duration-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tpl.name}</h3>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === tpl.id ? null : tpl.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    {openMenuId === tpl.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <button
                          onClick={() => {
                            setEditingTemplate(tpl);
                            setShowTemplateForm(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteTemplate(tpl.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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

function RecurringForm({ recurring, onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState(recurring ? {
    name: recurring.name,
    accountId: recurring.accountId,
    type: recurring.type,
    payee: recurring.payee || '',
    categoryId: recurring.categoryId,
    subcategoryId: recurring.subcategoryId || '',
    amount: Math.abs(recurring.amount),
    currency: recurring.currency,
    frequency: recurring.frequency,
    interval: recurring.interval,
    startDate: recurring.startDate,
    isActive: recurring.isActive
  } : {
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
    if (recurring) {
      // Update existing recurring
      updateState({
        recurringTransactions: state.recurringTransactions.map(r =>
          r.id === recurring.id ? {
            ...r,
            ...formData,
            amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount))
          } : r
        )
      });
    } else {
      // Create new recurring
      const newRecurring = {
        ...formData,
        id: 'rec' + Date.now(),
        amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
        lastProcessed: null,
        endDate: null
      };
      updateState({ recurringTransactions: [...state.recurringTransactions, newRecurring] });
    }
    onClose();
  };

  const filteredCategories = state.categories.filter(c => c.type === formData.type && !c.parentId);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{recurring ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account *</label>
            <select value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" required>
              {state.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payee</label>
            <input type="text" placeholder="Payee (Optional)" value={formData.payee} onChange={e => setFormData({ ...formData, payee: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
            <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" required>
              <option value="">Select Category</option>
              {filteredCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
            <input type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency *</label>
            <select value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interval *</label>
            <input type="number" placeholder="Interval" value={formData.interval} onChange={e => setFormData({ ...formData, interval: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function TemplateForm({ template, onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState(template ? {
    name: template.name,
    accountId: template.accountId,
    type: template.type,
    payee: template.payee || '',
    categoryId: template.categoryId,
    subcategoryId: template.subcategoryId || '',
    amount: Math.abs(template.amount),
    currency: template.currency,
    memo: template.memo || ''
  } : {
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
    if (template) {
      // Update existing template
      updateState({
        templates: state.templates.map(t =>
          t.id === template.id ? {
            ...t,
            ...formData,
            amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount))
          } : t
        )
      });
    } else {
      // Create new template
      const newTemplate = {
        ...formData,
        id: 'tpl' + Date.now(),
        amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount))
      };
      updateState({ templates: [...state.templates, newTemplate] });
    }
    onClose();
  };

  const filteredCategories = state.categories.filter(c => c.type === formData.type && !c.parentId);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{template ? 'Edit Template' : 'Add Template'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Name *</label>
            <input type="text" placeholder="Template Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account *</label>
            <select value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" required>
              {state.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payee</label>
            <input type="text" placeholder="Payee (Optional)" value={formData.payee} onChange={e => setFormData({ ...formData, payee: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
            <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" required>
              <option value="">Select Category</option>
              {filteredCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
            <input type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
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
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const expenseCategories = state.categories.filter(c => c.type === 'expense' && !c.parentId);
  const monthTransactions = state.transactions.filter(t =>
    t.date.startsWith(selectedMonth) && t.type === 'expense'
  );

  // Only get budgets that exist for this month
  const monthBudgets = state.budgets.filter(b => b.month === selectedMonth);

  const getSpentByCategory = (categoryId) => {
    const spent = monthTransactions
      .filter(t => t.categoryId === categoryId)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return spent;
  };

  const handleDeleteBudget = (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      updateState({
        budgets: state.budgets.filter(b => b.id !== budgetId)
      });
    }
  };

  const totalBudgeted = monthBudgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = monthBudgets.reduce((sum, b) => sum + getSpentByCategory(b.categoryId), 0);
  const totalRemaining = totalBudgeted - totalSpent;

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

  const formatMonthDisplay = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Budget</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track spending against your monthly budgets</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => changeMonth(-1)}
            className="btn-icon bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[200px] text-center">
            {formatMonthDisplay(selectedMonth)}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="btn-icon bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingBudget(null); }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Budget</span>
          </button>
        </div>
      </div>

      {showForm && (
        <BudgetForm
          budget={editingBudget}
          month={selectedMonth}
          onClose={() => { setShowForm(false); setEditingBudget(null); }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budgeted</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{totalBudgeted.toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-primary p-3 rounded-button">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="bg-error-600 p-3 rounded-button">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {totalRemaining >= 0 ? 'Remaining' : 'Overspent'}
              </p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                €{Math.abs(totalRemaining).toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-button ${totalRemaining >= 0 ? 'bg-success-600' : 'bg-error-600'}`}>
              {totalRemaining >= 0 ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <AlertCircle className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {monthBudgets.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Budgets for {formatMonthDisplay(selectedMonth)}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start by creating your first budget for this month
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Budgeted</th>
                  <th className="text-right">Spent</th>
                  <th className="text-right">Remaining</th>
                  <th>Progress</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthBudgets.map(budget => {
                  const category = expenseCategories.find(c => c.id === budget.categoryId);
                  if (!category) return null;

                  const spent = getSpentByCategory(budget.categoryId);
                  const remaining = budget.budgeted - spent;
                  const percentSpent = budget.budgeted > 0 ? (spent / budget.budgeted) * 100 : 0;
                  const isOverBudget = remaining < 0;

                  return (
                    <tr key={budget.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="text-right font-semibold">
                        €{budget.budgeted.toLocaleString()}
                      </td>
                      <td className="text-right font-semibold">
                        €{spent.toLocaleString()}
                      </td>
                      <td className="text-right">
                        <span className={`font-semibold ${
                          isOverBudget ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400'
                        }`}>
                          {isOverBudget && '-'}€{Math.abs(remaining).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-chart ${
                                  isOverBudget
                                    ? 'bg-error-600'
                                    : percentSpent > 80
                                    ? 'bg-warning-500'
                                    : 'bg-success-600'
                                }`}
                                style={{ width: `${Math.min(percentSpent, 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-xs font-medium min-w-[3rem] text-right ${
                            isOverBudget
                              ? 'text-error-600 dark:text-error-400'
                              : percentSpent > 80
                              ? 'text-warning-600 dark:text-warning-400'
                              : 'text-success-600 dark:text-success-400'
                          }`}>
                            {percentSpent.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === budget.id ? null : budget.id)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </button>
                          {openMenuId === budget.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                              <button
                                onClick={() => {
                                  setEditingBudget(budget);
                                  setShowForm(true);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteBudget(budget.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetForm({ budget, month, onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState(budget || {
    categoryId: '',
    budgeted: ''
  });

  const expenseCategories = state.categories.filter(c => c.type === 'expense' && !c.parentId);

  // Filter out categories that already have budgets for this month (unless editing)
  const availableCategories = expenseCategories.filter(cat => {
    if (budget && budget.categoryId === cat.id) return true; // Allow current category when editing
    return !state.budgets.some(b => b.month === month && b.categoryId === cat.id);
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    const budgetedAmount = parseFloat(formData.budgeted);
    if (isNaN(budgetedAmount) || budgetedAmount <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    if (budget) {
      // Update existing budget
      updateState({
        budgets: state.budgets.map(b =>
          b.id === budget.id
            ? { ...b, categoryId: formData.categoryId, budgeted: budgetedAmount }
            : b
        )
      });
    } else {
      // Create new budget
      const newBudget = {
        id: 'bud' + Date.now(),
        month: month,
        categoryId: formData.categoryId,
        budgeted: budgetedAmount
      };
      updateState({
        budgets: [...state.budgets, newBudget]
      });
    }

    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {budget ? 'Edit Budget' : 'Add Budget'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
            <select
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={!!budget} // Disable changing category when editing
            >
              <option value="">Select Category</option>
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            {budget && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Category cannot be changed when editing
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Amount (€) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.budgeted}
              onChange={e => setFormData({ ...formData, budgeted: e.target.value })}
              placeholder="1000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {budget ? 'Update' : 'Create'} Budget
          </button>
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
            Cancel
          </button>
        </div>
      </form>
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Financial Goals</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track progress towards your savings goals</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingGoal(null); }}
          className="btn-primary flex items-center space-x-2"
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
        <div className="glass-card p-12 text-center animate-fade-in">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Goals Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start by creating your first financial goal
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
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
                className="glass-card overflow-hidden animate-fade-in hover:shadow-card-hover transition-all duration-card"
              >
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
    currentAmount: '',
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

    let currentAmount = parseFloat(formData.currentAmount) || 0;
    if (formData.linkedAccountId) {
      const linkedAccount = state.accounts.find(a => a.id === formData.linkedAccountId);
      if (linkedAccount) {
        currentAmount = linkedAccount.currentBalance;
      }
    }

    if (goal) {
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Target Amount (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.targetAmount}
              onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
              placeholder="10000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Target Date
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Initial Amount (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.currentAmount}
              onChange={e => setFormData({ ...formData, currentAmount: e.target.value })}
              placeholder="Enter initial amount"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
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

// NEW: Debt Payoff Module
function DebtPayoffView() {
  const { state, updateState } = useApp();
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const debtAccounts = state.accounts.filter(a =>
    (a.type === 'loan' || a.type === 'credit_card') && a.currentBalance > 0
  );

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
  let remainingDebts = accounts.map(a => ({
    ...a,
    balance: Math.abs(a.currentBalance)
  }));

  const extraPayment = plan.extraMonthlyPayment;
  
  while (remainingDebts.some(d => d.balance > 0) && monthsToPayoff < 360) {
    monthsToPayoff++;
    
    // Calculate interest and payments for this month
    const updatedDebts = [];
    let monthInterest = 0;
    
    for (let i = 0; i < remainingDebts.length; i++) {
      const debt = remainingDebts[i];
      
      if (debt.balance <= 0) {
        updatedDebts.push(debt);
        continue;
      }
      
      const monthlyRate = (debt.interestRate || 0) / 100 / 12;
      const interestCharge = debt.balance * monthlyRate;
      
      const minPayment = Math.max(25, debt.balance * 0.02);
      let payment = minPayment;
      
      const firstDebtWithBalance = remainingDebts.find(d => d.balance > 0);
      if (debt === firstDebtWithBalance) {
        payment += extraPayment;
      }
      
      payment = Math.min(payment, debt.balance + interestCharge);
      const newBalance = Math.max(0, debt.balance + interestCharge - payment);
      
      updatedDebts.push({ ...debt, balance: newBalance, interestCharge });
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
  const handleDeletePlan = (id) => {
    if (window.confirm('Delete this payoff plan?')) {
      updateState({
        debtPayoffPlans: state.debtPayoffPlans.filter(p => p.id !== id)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Debt Payoff</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create strategies to pay off your debts faster</p>
        </div>
        <button
          onClick={() => { setShowPlanForm(true); setEditingPlan(null); }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Plan</span>
        </button>
      </div>

      {showPlanForm && (
        <DebtPayoffPlanForm
          plan={editingPlan}
          onClose={() => { setShowPlanForm(false); setEditingPlan(null); }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Debt Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Outstanding Debt</span>
              <span className="text-2xl font-bold text-red-600">€{totalDebt.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active Debt Accounts</span>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">{debtAccounts.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Active Payoff Plans</h3>
          <div className="text-center">
            <span className="text-3xl font-bold text-blue-600">{state.debtPayoffPlans.filter(p => p.isActive).length}</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Plans in progress</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Debt Accounts</h3>
        <div className="space-y-3">
          {debtAccounts.map(account => (
            <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{account.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {account.type} • {account.institution}
                  {account.interestRate && ` • ${account.interestRate}% APR`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">
                  €{Math.abs(account.currentBalance).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {debtAccounts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No debt accounts found</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Payoff Plans</h3>
        {state.debtPayoffPlans.map(plan => {
          const projection = calculatePayoffProjection(plan);
          const planAccounts = plan.accountIds.map(id => 
            state.accounts.find(a => a.id === id)
          ).filter(Boolean);
          
          return (
            <div key={plan.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      plan.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Strategy: <span className="font-medium capitalize">{plan.strategy}</span> • 
                    Extra Payment: <span className="font-medium">€{plan.extraMonthlyPayment}</span>/month
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Accounts: {planAccounts.map(a => a.name).join(', ')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => { setEditingPlan(plan); setShowPlanForm(true); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Projected Payoff</p>
                  <p className="text-lg font-bold text-blue-600">{projection.monthsToPayoff} months</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(projection.payoffDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Interest</p>
                  <p className="text-lg font-bold text-green-600">€{parseFloat(projection.totalInterestPaid).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Estimated</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Debt</p>
                  <p className="text-lg font-bold text-purple-600">
                    €{planAccounts.reduce((sum, a) => sum + Math.abs(a.currentBalance), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current</p>
                </div>
              </div>
            </div>
          );
        })}
        {state.debtPayoffPlans.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Payoff Plans Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create a debt payoff plan to start tracking your progress
            </p>
            <button
              onClick={() => setShowPlanForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DebtPayoffPlanForm({ plan, onClose }) {
  const { state, updateState } = useApp();
  const debtAccounts = state.accounts.filter(a =>
    (a.type === 'loan' || a.type === 'credit_card') && a.currentBalance > 0
  );

  const [formData, setFormData] = useState(plan || {
    name: '',
    strategy: 'avalanche',
    extraMonthlyPayment: '',
    accountIds: [],
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.accountIds.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (plan) {
      updateState({
        debtPayoffPlans: state.debtPayoffPlans.map(p =>
          p.id === plan.id ? { ...p, ...formData } : p
        )
      });
    } else {
      const newPlan = {
        ...formData,
        id: 'dpp' + Date.now(),
        createdDate: new Date().toISOString().split('T')[0],
        extraMonthlyPayment: parseFloat(formData.extraMonthlyPayment) || 0
      };
      updateState({
        debtPayoffPlans: [...state.debtPayoffPlans, newPlan]
      });
    }
    onClose();
  };

  const toggleAccount = (accountId) => {
    setFormData(prev => ({
      ...prev,
      accountIds: prev.accountIds.includes(accountId)
        ? prev.accountIds.filter(id => id !== accountId)
        : [...prev.accountIds, accountId]
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {plan ? 'Edit Payoff Plan' : 'Create Payoff Plan'}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Plan Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Credit Card Payoff 2025"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Payoff Strategy
            </label>
            <select
              value={formData.strategy}
              onChange={e => setFormData({ ...formData, strategy: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="avalanche">Avalanche (Highest Interest First)</option>
              <option value="snowball">Snowball (Smallest Balance First)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Extra Monthly Payment (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.extraMonthlyPayment}
              onChange={e => setFormData({ ...formData, extraMonthlyPayment: e.target.value })}
              placeholder="200"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Debt Accounts
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {debtAccounts.map(account => (
              <label
                key={account.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <input
                  type="checkbox"
                  checked={formData.accountIds.includes(account.id)}
                  onChange={() => toggleAccount(account.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    €{Math.abs(account.currentBalance).toLocaleString()}
                    {account.interestRate && ` • ${account.interestRate}% APR`}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
            Mark as active plan
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {plan ? 'Update Plan' : 'Create Plan'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// NEW: Insights Module
function InsightsView() {
  const [activeTab, setActiveTab] = useState('spending');
  const [comparisonPeriod, setComparisonPeriod] = useState('month');

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient">Financial Insights</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Analyze your spending patterns and trends</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('spending')}
          className={`px-4 py-3 font-medium transition-all duration-hover ${
            activeTab === 'spending'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Spending Analysis
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-3 font-medium transition-all duration-hover ${
            activeTab === 'comparison'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Period Comparison
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-3 font-medium transition-all duration-hover ${
            activeTab === 'alerts'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Smart Alerts
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'ai'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          AI Insights
        </button>
        <button
          onClick={() => setActiveTab('autocategorization')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'autocategorization'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Auto-Categorization
        </button>
      </div>

      {activeTab === 'spending' && <SpendingAnalysis />}
      {activeTab === 'comparison' && <PeriodComparison comparisonPeriod={comparisonPeriod} setComparisonPeriod={setComparisonPeriod} />}
      {activeTab === 'alerts' && <SmartAlerts />}
      {activeTab === 'ai' && <AIInsights />}
      {activeTab === 'autocategorization' && <AutoCategorization />}
    </div>
  );
}

function SpendingAnalysis() {
  const { state } = useApp();
  const currentMonth = '2025-10';
  
  const monthTransactions = state.transactions.filter(t => 
    t.date.startsWith(currentMonth) && t.type === 'expense'
  );

  const categorySpending = {};
  monthTransactions.forEach(t => {
    const cat = state.categories.find(c => c.id === t.categoryId);
    const catName = cat ? cat.name : 'Uncategorized';
    if (!categorySpending[catName]) {
      categorySpending[catName] = { total: 0, count: 0, transactions: [] };
    }
    categorySpending[catName].total += Math.abs(t.amount);
    categorySpending[catName].count += 1;
    categorySpending[catName].transactions.push(t);
  });

  const sortedCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b.total - a.total);

  const totalSpending = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const avgTransactionSize = monthTransactions.length > 0 
    ? (totalSpending / monthTransactions.length).toFixed(2)
    : 0;

  const largestTransaction = monthTransactions.reduce((max, t) => 
    Math.abs(t.amount) > Math.abs(max.amount) ? t : max, 
    monthTransactions[0] || { amount: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spending</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">€{totalSpending.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Transaction</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">€{avgTransactionSize}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{monthTransactions.length} transactions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Largest Expense</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">€{Math.abs(largestTransaction?.amount || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{largestTransaction?.payee || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Spending by Category</h3>
        <div className="space-y-4">
          {sortedCategories.map(([category, data]) => {
            const percentage = ((data.total / totalSpending) * 100).toFixed(1);
            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{category}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      €{data.total.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {data.count} transaction{data.count !== 1 ? 's' : ''} • 
                  Avg: €{(data.total / data.count).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PeriodComparison({ comparisonPeriod, setComparisonPeriod }) {
  const { state } = useApp();
  
  const getCurrentPeriodData = () => {
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
    
    return { currentStart, previousStart, label };
  };

  const { currentStart, previousStart, label } = getCurrentPeriodData();
  
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
        <select
          value={comparisonPeriod}
          onChange={e => setComparisonPeriod(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="month">Month vs Month</option>
          <option value="quarter">Quarter vs Quarter</option>
          <option value="year">Year vs Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Income</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">€{currentIncome.toLocaleString()}</p>
          <div className={`flex items-center mt-2 text-sm ${parseFloat(incomeChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(incomeChange) >= 0 ? '↑' : '↓'} {Math.abs(incomeChange)}%
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs last {label.toLowerCase()}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expenses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">€{currentExpenses.toLocaleString()}</p>
          <div className={`flex items-center mt-2 text-sm ${parseFloat(expensesChange) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(expensesChange) >= 0 ? '↑' : '↓'} {Math.abs(expensesChange)}%
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs last {label.toLowerCase()}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Savings</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">€{currentSavings.toLocaleString()}</p>
          <div className={`flex items-center mt-2 text-sm ${parseFloat(savingsChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(savingsChange) >= 0 ? '↑' : '↓'} {Math.abs(savingsChange)}%
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs last {label.toLowerCase()}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Worth</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">€{currentNetWorth.toLocaleString()}</p>
          <div className={`flex items-center mt-2 text-sm ${parseFloat(netWorthChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(netWorthChange) >= 0 ? '↑' : '↓'} {Math.abs(netWorthChange)}%
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs last {label.toLowerCase()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Trend Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[
            { period: `Previous ${label}`, Income: previousIncome, Expenses: previousExpenses, Savings: previousSavings },
            { period: `Current ${label}`, Income: currentIncome, Expenses: currentExpenses, Savings: currentSavings }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="Expenses" stroke="#EF4444" strokeWidth={2} />
            <Line type="monotone" dataKey="Savings" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SmartAlerts() {
  const { state, updateState } = useApp();
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);

  const handleDeleteAlert = (id) => {
    if (window.confirm('Delete this alert?')) {
      updateState({
        alerts: state.alerts.filter(a => a.id !== id)
      });
    }
  };

  const toggleAlert = (id) => {
    updateState({
      alerts: state.alerts.map(a =>
        a.id === id ? { ...a, isActive: !a.isActive } : a
      )
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">Set up automatic alerts for budget limits, unusual spending, and account thresholds</p>
        <button
          onClick={() => { setShowAlertForm(true); setEditingAlert(null); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>New Alert</span>
        </button>
      </div>

      {showAlertForm && (
        <AlertForm
          alert={editingAlert}
          onClose={() => { setShowAlertForm(false); setEditingAlert(null); }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.alerts.map(alert => {
          const category = alert.categoryId ? state.categories.find(c => c.id === alert.categoryId) : null;
          const account = alert.accountId ? state.accounts.find(a => a.id === alert.accountId) : null;
          
          return (
            <div key={alert.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <Bell className={`w-5 h-5 ${alert.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{alert.name}</h4>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`px-2 py-1 text-xs rounded ${
                      alert.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {alert.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => { setEditingAlert(alert); setShowAlertForm(true); }}
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium">Type:</span> {alert.type === 'budget' ? 'Budget Alert' : alert.type === 'balance' ? 'Balance Alert' : 'Transaction Alert'}
                </p>
                <p>
                  <span className="font-medium">Condition:</span> {alert.condition} €{alert.threshold}
                </p>
                {category && (
                  <p>
                    <span className="font-medium">Category:</span> {category.icon} {category.name}
                  </p>
                )}
                {account && (
                  <p>
                    <span className="font-medium">Account:</span> {account.name}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {state.alerts.length === 0 && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Alerts Set Up
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create alerts to get notified about important financial events
          </p>
          <button
            onClick={() => setShowAlertForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Alert
          </button>
        </div>
      )}
    </div>
  );
}

function AlertForm({ alert, onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState(alert || {
    name: '',
    type: 'budget',
    condition: 'exceeds',
    threshold: '',
    categoryId: '',
    accountId: '',
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.threshold) {
      alert('Please fill in all required fields');
      return;
    }

    if (alert) {
      updateState({
        alerts: state.alerts.map(a =>
          a.id === alert.id ? { ...a, ...formData } : a
        )
      });
    } else {
      const newAlert = {
        ...formData,
        id: 'alert' + Date.now(),
        threshold: parseFloat(formData.threshold)
      };
      updateState({
        alerts: [...state.alerts, newAlert]
      });
    }
    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {alert ? 'Edit Alert' : 'Create Alert'}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alert Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Food Budget Alert"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Alert Type
            </label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value, categoryId: '', accountId: '' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="budget">Budget Alert</option>
              <option value="balance">Balance Alert</option>
              <option value="transaction">Unusual Transaction</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Condition
            </label>
            <select
              value={formData.condition}
              onChange={e => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="exceeds">Exceeds</option>
              <option value="below">Falls Below</option>
              <option value="equals">Equals</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Threshold Amount (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.threshold}
            onChange={e => setFormData({ ...formData, threshold: e.target.value })}
            placeholder="500"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {formData.type === 'budget' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Category</option>
              {state.categories.filter(c => c.type === 'expense' && !c.parentId).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {formData.type === 'balance' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Account
            </label>
            <select
              value={formData.accountId}
              onChange={e => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Account</option>
              {state.accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActiveAlert"
            checked={formData.isActive}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="isActiveAlert" className="text-sm text-gray-700 dark:text-gray-300">
            Activate alert immediately
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {alert ? 'Update Alert' : 'Create Alert'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function AIInsights() {
  const { state } = useApp();
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    
    // Prepare financial data summary
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
      categoryBreakdown,
      transactionCount: monthTransactions.length
    };

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a financial advisor analyzing someone's personal finances. Based on the following financial data for this month, provide 3-5 actionable insights and recommendations:

Monthly Income: €${financialSummary.monthlyIncome}
Monthly Expenses: €${financialSummary.monthlyExpenses}
Savings Rate: ${financialSummary.savingsRate}%
Net Worth: €${financialSummary.netWorth}
Total Debt: €${financialSummary.totalDebt}
Transaction Count: ${financialSummary.transactionCount}

Spending by Category:
${Object.entries(financialSummary.categoryBreakdown).map(([cat, amt]) => `- ${cat}: €${amt}`).join('\n')}

Provide specific, practical advice in a friendly but professional tone. Focus on areas of improvement and positive reinforcement for good habits.`
            }
          ]
        })
      });

      const data = await response.json();
      setInsights(data.content[0].text);
    } catch (error) {
      setInsights('Unable to generate insights at this time. Please try again later.');
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">Get AI-powered insights and recommendations based on your financial data</p>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Brain className="w-4 h-4" />
          <span>{loading ? 'Generating...' : 'Generate AI Insights'}</span>
        </button>
      </div>

      {insights && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-start space-x-3 mb-4">
            <Brain className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Financial Insights</h3>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {insights}
              </div>
            </div>
          </div>
        </div>
      )}

      {!insights && !loading && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            AI-Powered Financial Analysis
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Click the button above to get personalized insights and recommendations based on your spending patterns
          </p>
        </div>
      )}
    </div>
  );
}

function AutoCategorization() {
  const { state, updateState } = useApp();
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const handleDeleteRule = (id) => {
    if (window.confirm('Delete this rule?')) {
      updateState({
        autoCategorization: state.autoCategorization.filter(r => r.id !== id)
      });
    }
  };

  const toggleRule = (id) => {
    updateState({
      autoCategorization: state.autoCategorization.map(r =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      )
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">Create rules to automatically categorize transactions based on payee, memo, or amount</p>
        <button
          onClick={() => { setShowRuleForm(true); setEditingRule(null); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>New Rule</span>
        </button>
      </div>

      {showRuleForm && (
        <AutoCatRule
          rule={editingRule}
          onClose={() => { setShowRuleForm(false); setEditingRule(null); }}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Condition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {state.autoCategorization.sort((a, b) => a.priority - b.priority).map(rule => {
              const category = state.categories.find(c => c.id === rule.categoryId);
              const subcategory = rule.subcategoryId ? state.categories.find(c => c.id === rule.subcategoryId) : null;
              
              return (
                <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                      {rule.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {rule.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {rule.matchField === 'payee' && `Payee contains "${rule.matchValue}"`}
                    {rule.matchField === 'memo' && `Memo contains "${rule.matchValue}"`}
                    {rule.matchField === 'amount' && `Amount equals €${rule.matchValue}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {category ? `${category.icon} ${category.name}` : 'N/A'}
                    {subcategory && ` > ${subcategory.name}`}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        rule.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => { setEditingRule(rule); setShowRuleForm(true); }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
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

      {state.autoCategorization.length === 0 && (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Auto-Categorization Rules
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create rules to automatically categorize your transactions
          </p>
          <button
            onClick={() => setShowRuleForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Rule
          </button>
        </div>
      )}
    </div>
  );
}

function AutoCatRule({ rule, onClose }) {
  const { state, updateState } = useApp();
  const [formData, setFormData] = useState(rule || {
    name: '',
    matchField: 'payee',
    matchValue: '',
    categoryId: '',
    subcategoryId: '',
    priority: state.autoCategorization.length + 1,
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.matchValue || !formData.categoryId) {
      alert('Please fill in all required fields');
      return;
    }

    if (rule) {
      updateState({
        autoCategorization: state.autoCategorization.map(r =>
          r.id === rule.id ? { ...r, ...formData } : r
        )
      });
    } else {
      const newRule = {
        ...formData,
        id: 'auto' + Date.now(),
        priority: parseInt(formData.priority)
      };
      updateState({
        autoCategorization: [...state.autoCategorization, newRule]
      });
    }
    onClose();
  };

  const expenseCategories = state.categories.filter(c => c.type === 'expense' && !c.parentId);
  const subcategories = formData.categoryId ? state.categories.filter(c => c.parentId === formData.categoryId) : [];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {rule ? 'Edit Rule' : 'Create Auto-Categorization Rule'}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rule Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Supermarket Auto-Cat"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Match Field
            </label>
            <select
              value={formData.matchField}
              onChange={e => setFormData({ ...formData, matchField: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="payee">Payee</option>
              <option value="memo">Memo</option>
              <option value="amount">Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Match Value
            </label>
            <input
              type="text"
              value={formData.matchValue}
              onChange={e => setFormData({ ...formData, matchValue: e.target.value })}
              placeholder={formData.matchField === 'amount' ? '50.00' : 'Search text'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Category</option>
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                Subcategory (Optional)
              </label>
              <select
                value={formData.subcategoryId}
                onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">None</option>
                {subcategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority (lower number = higher priority)
          </label>
          <input
            type="number"
            min="1"
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActiveRule"
            checked={formData.isActive}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="isActiveRule" className="text-sm text-gray-700 dark:text-gray-300">
            Activate rule immediately
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {rule ? 'Update Rule' : 'Create Rule'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// NEW: Reports Module
function ReportsView() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    accountIds: [],
    categoryIds: []
  });

  const filteredTransactions = state.transactions.filter(txn => {
    const dateMatch = txn.date >= filters.startDate && txn.date <= filters.endDate;
    const accountMatch = filters.accountIds.length === 0 || filters.accountIds.includes(txn.accountId);
    const categoryMatch = filters.categoryIds.length === 0 || filters.categoryIds.includes(txn.categoryId);
    return dateMatch && accountMatch && categoryMatch;
  });

  const toggleAccountFilter = (accountId) => {
    setFilters(prev => ({
      ...prev,
      accountIds: prev.accountIds.includes(accountId)
        ? prev.accountIds.filter(id => id !== accountId)
        : [...prev.accountIds, accountId]
    }));
  };

  const toggleCategoryFilter = (categoryId) => {
    setFilters(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      accountIds: [],
      categoryIds: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Financial Reports</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Generate detailed reports and export your data</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Clear All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Accounts ({filters.accountIds.length} selected)
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={e => toggleAccountFilter(e.target.value)}
                value=""
              >
                <option value="">Select accounts...</option>
                {state.accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {filters.accountIds.includes(acc.id) ? '✓ ' : ''}{acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Categories ({filters.categoryIds.length} selected)
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={e => toggleCategoryFilter(e.target.value)}
                value=""
              >
                <option value="">Select categories...</option>
                {state.categories.filter(c => !c.parentId).map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {filters.categoryIds.includes(cat.id) ? '✓ ' : ''}{cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.accountIds.length > 0 || filters.categoryIds.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {filters.accountIds.map(id => {
              const account = state.accounts.find(a => a.id === id);
              return account ? (
                <span
                  key={id}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm"
                >
                  <span>{account.name}</span>
                  <button onClick={() => toggleAccountFilter(id)} className="hover:text-blue-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null;
            })}
            {filters.categoryIds.map(id => {
              const category = state.categories.find(c => c.id === id);
              return category ? (
                <span
                  key={id}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm"
                >
                  <span>{category.icon} {category.name}</span>
                  <button onClick={() => toggleCategoryFilter(id)} className="hover:text-green-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Showing {filteredTransactions.length} of {state.transactions.length} transactions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Overview Report
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'custom'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Custom Report Builder
        </button>
      </div>

      {activeTab === 'overview' && (
        <OverviewReport transactions={filteredTransactions} filters={filters} />
      )}
      {activeTab === 'custom' && (
        <CustomReportBuilder transactions={filteredTransactions} filters={filters} />
      )}
    </div>
  );
}

function OverviewReport({ transactions, filters }) {
  const { state } = useApp();

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = Math.abs(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const netSavings = income - expenses;
  const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(1) : 0;

  // Category breakdown
  const categoryBreakdown = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = state.categories.find(c => c.id === t.categoryId);
    const catName = cat ? cat.name : 'Uncategorized';
    categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + Math.abs(t.amount);
  });

  const categoryData = Object.entries(categoryBreakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Monthly trend
  const monthlyData = {};
  transactions.forEach(t => {
    const month = t.date.substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, expenses: 0 };
    }
    if (t.type === 'income') {
      monthlyData[month].income += t.amount;
    } else if (t.type === 'expense') {
      monthlyData[month].expenses += Math.abs(t.amount);
    }
  });

  const monthlyTrendData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Account breakdown
  const accountBreakdown = {};
  transactions.forEach(t => {
    const acc = state.accounts.find(a => a.id === t.accountId);
    const accName = acc ? acc.name : 'Unknown';
    if (!accountBreakdown[accName]) {
      accountBreakdown[accName] = { income: 0, expenses: 0, transactions: 0 };
    }
    accountBreakdown[accName].transactions += 1;
    if (t.type === 'income') {
      accountBreakdown[accName].income += t.amount;
    } else if (t.type === 'expense') {
      accountBreakdown[accName].expenses += Math.abs(t.amount);
    }
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const exportToPDF = () => {
    const reportContent = `
Financial Overview Report
Date Range: ${filters.startDate} to ${filters.endDate}
Generated: ${new Date().toLocaleDateString()}

SUMMARY
--------
Total Income: €${income.toLocaleString()}
Total Expenses: €${expenses.toLocaleString()}
Net Savings: €${netSavings.toLocaleString()}
Savings Rate: ${savingsRate}%

EXPENSES BY CATEGORY
--------------------
${categoryData.map(c => `${c.name}: €${c.value.toLocaleString()}`).join('\n')}

TRANSACTIONS BY ACCOUNT
-----------------------
${Object.entries(accountBreakdown).map(([name, data]) => 
  `${name}: ${data.transactions} transactions, €${data.income.toLocaleString()} income, €${data.expenses.toLocaleString()} expenses`
).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${filters.startDate}-to-${filters.endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={exportToPDF}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600">€{income.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {transactions.filter(t => t.type === 'income').length} transactions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">€{expenses.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {transactions.filter(t => t.type === 'expense').length} transactions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Savings</p>
          <p className={`text-2xl font-bold ${netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{netSavings.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {netSavings >= 0 ? 'Surplus' : 'Deficit'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Savings Rate</p>
          <p className="text-2xl font-bold text-blue-600">{savingsRate}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            of income saved
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Expenses by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={entry => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">No expense data</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Monthly Trend
          </h3>
          {monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">No trend data</p>
          )}
        </div>
      </div>

      {/* Category Details Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Category Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  % of Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Transactions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {categoryData.map((cat, index) => {
                const txnCount = transactions.filter(
                  t => t.type === 'expense' && state.categories.find(c => c.id === t.categoryId)?.name === cat.name
                ).length;
                const percentage = ((cat.value / expenses) * 100).toFixed(1);

                return (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{cat.name}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">
                      €{cat.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                      {percentage}%
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                      {txnCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Activity by Account
        </h3>
        <div className="space-y-4">
          {Object.entries(accountBreakdown).map(([name, data]) => (
            <div key={name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {data.transactions} transactions
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
                  <p className="text-lg font-semibold text-green-600">€{data.income.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
                  <p className="text-lg font-semibold text-red-600">€{data.expenses.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomReportBuilder({ transactions, filters }) {
  const { state } = useApp();
  const [selectedColumns, setSelectedColumns] = useState([
    'date', 'type', 'payee', 'category', 'amount'
  ]);

  const availableColumns = [
    { id: 'date', label: 'Date' },
    { id: 'type', label: 'Type' },
    { id: 'account', label: 'Account' },
    { id: 'payee', label: 'Payee' },
    { id: 'category', label: 'Category' },
    { id: 'subcategory', label: 'Subcategory' },
    { id: 'amount', label: 'Amount' },
    { id: 'currency', label: 'Currency' },
    { id: 'memo', label: 'Memo' }
  ];

  const toggleColumn = (columnId) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const getColumnValue = (transaction, columnId) => {
    switch (columnId) {
      case 'date':
        return transaction.date;
      case 'type':
        return transaction.type;
      case 'account':
        return state.accounts.find(a => a.id === transaction.accountId)?.name || 'Unknown';
      case 'payee':
        return transaction.payee;
      case 'category':
        return state.categories.find(c => c.id === transaction.categoryId)?.name || 'Uncategorized';
      case 'subcategory':
        return transaction.subcategoryId
          ? state.categories.find(c => c.id === transaction.subcategoryId)?.name || '-'
          : '-';
      case 'amount':
        return transaction.amount;
      case 'currency':
        return transaction.currency;
      case 'memo':
        return transaction.memo || '-';
      default:
        return '';
    }
  };

  const exportToCSV = () => {
    const headers = selectedColumns.map(
      colId => availableColumns.find(c => c.id === colId)?.label
    ).join(',');

    const rows = transactions.map(txn =>
      selectedColumns.map(colId => {
        const value = getColumnValue(txn, colId);
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-report-${filters.startDate}-to-${filters.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const reportLines = [
      'Custom Financial Report',
      `Date Range: ${filters.startDate} to ${filters.endDate}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'TRANSACTIONS',
      '------------',
      ''
    ];

    transactions.forEach((txn, index) => {
      reportLines.push(`Transaction ${index + 1}:`);
      selectedColumns.forEach(colId => {
        const label = availableColumns.find(c => c.id === colId)?.label;
        const value = getColumnValue(txn, colId);
        reportLines.push(`  ${label}: ${value}`);
      });
      reportLines.push('');
    });

    reportLines.push('', `Total Transactions: ${transactions.length}`);

    const reportContent = reportLines.join('\n');
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-report-${filters.startDate}-to-${filters.endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Select Columns to Include
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableColumns.map(col => (
            <label
              key={col.id}
              className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <input
                type="checkbox"
                checked={selectedColumns.includes(col.id)}
                onChange={() => toggleColumn(col.id)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-900 dark:text-white">{col.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {selectedColumns.length} column{selectedColumns.length !== 1 ? 's' : ''} selected • 
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} to export
        </p>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            disabled={selectedColumns.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportToPDF}
            disabled={selectedColumns.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export TXT</span>
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Preview</h3>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                {selectedColumns.map(colId => {
                  const col = availableColumns.find(c => c.id === colId);
                  return (
                    <th
                      key={colId}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap"
                    >
                      {col?.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.slice(0, 50).map((txn, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  {selectedColumns.map(colId => (
                    <td
                      key={colId}
                      className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap"
                    >
                      {colId === 'amount' ? (
                        <span className={txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {getColumnValue(txn, colId)}
                        </span>
                      ) : (
                        getColumnValue(txn, colId)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length > 50 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing first 50 of {transactions.length} transactions. Export to see all data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
function SettingsView({ setTheme, currentUser }) {
  const { state, updateState, isDemoMode } = useApp();
  const globalContext = useGlobalApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [showResetCategoriesConfirm, setShowResetCategoriesConfirm] = useState(false);
  const [isResettingCategories, setIsResettingCategories] = useState(false);
  const [resetCategoriesResult, setResetCategoriesResult] = useState(null);

  const refreshExchangeRates = () => {
    // Simulating exchange rate refresh - in production, this would call an API
    const newRates = {
      USD: (1.08 + Math.random() * 0.04).toFixed(4),
      BDT: (0.0089 + Math.random() * 0.0004).toFixed(6),
      EUR: 1
    };
    updateState({ exchangeRates: newRates });
    alert('Exchange rates updated successfully!');
  };

  const handleStartOver = () => {
    if (resetInput === 'DELETE ALL DATA') {
      // Reset to demo data in demo mode, or empty state in authenticated mode
      const resetData = isDemoMode ? demoData : getEmptyState();
      updateState({
        accounts: resetData.accounts,
        transactions: resetData.transactions,
        categories: resetData.categories,
        budgets: resetData.budgets,
        goals: resetData.goals,
        recurringTransactions: resetData.recurringTransactions,
        templates: resetData.templates,
        debtPayoffPlans: resetData.debtPayoffPlans,
        alerts: resetData.alerts,
        autoCategorization: resetData.autoCategorization
      });
      setShowResetConfirm(false);
      setResetInput('');
      alert(isDemoMode ? 'All data has been reset to demo defaults!' : 'All data has been cleared!');
    } else {
      alert('Please type "DELETE ALL DATA" exactly to confirm.');
    }
  };

  const handleResetCategories = async () => {
    try {
      setIsResettingCategories(true);
      setResetCategoriesResult(null);

      console.log('🔄 Starting category reset...');
      const newCategories = await globalContext.resetCategories();

      // Update local state with new categories
      updateState({ categories: newCategories });

      setResetCategoriesResult({
        success: true,
        message: `Successfully reset ${newCategories.length} categories!`,
        count: newCategories.length
      });

      console.log('✅ Category reset complete!');
    } catch (error) {
      console.error('❌ Category reset failed:', error);
      setResetCategoriesResult({
        success: false,
        message: error.message || 'Failed to reset categories. Please try again.',
        error: error
      });
    } finally {
      setIsResettingCategories(false);
      setShowResetCategoriesConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient">Settings</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your preferences and account settings</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'profile'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          User Profile
        </button>
        <button
          onClick={() => setActiveTab('currency')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'currency'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Currency
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'goals'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Financial Goals
        </button>
        <button
          onClick={() => setActiveTab('defaults')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'defaults'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Defaults
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'data'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Data Management
        </button>
        <button
          onClick={() => setActiveTab('danger')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'danger'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Danger Zone
        </button>
      </div>

      {/* User Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">User Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={state.user.name}
                  onChange={e => updateState({ user: { ...state.user, name: e.target.value }})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={state.user.email}
                  onChange={e => updateState({ user: { ...state.user, email: e.target.value }})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={state.user.id}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your unique user identifier (read-only)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Appearance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                      currentUser?.theme === 'light'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl">☀️</span>
                      <span className="font-medium text-gray-900 dark:text-white">Light</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                      currentUser?.theme === 'dark'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl">🌙</span>
                      <span className="font-medium text-gray-900 dark:text-white">Dark</span>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Current theme: <span className="font-semibold capitalize">{currentUser?.theme}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Currency Settings Tab */}
      {activeTab === 'currency' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Base Currency</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                Select your primary currency
              </label>
              <select
                value={state.user.baseCurrency}
                onChange={e => updateState({ user: { ...state.user, baseCurrency: e.target.value }})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="EUR">EUR - Euro (€)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="BDT">BDT - Bangladeshi Taka (৳)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All multi-currency transactions will be converted to this currency
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Exchange Rates</h3>
              <button
                onClick={refreshExchangeRates}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>🔄</span>
                <span>Refresh Rates</span>
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(state.exchangeRates).map(([currency, rate]) => (
                <div
                  key={currency}
                  className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currency}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currency === 'EUR' && '(Base Currency)'}
                      {currency === 'USD' && 'US Dollar'}
                      {currency === 'BDT' && 'Bangladeshi Taka'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {rate}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      per 1 {state.user.baseCurrency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Exchange rates are for reference only. Click refresh to update with simulated rates.
              In production, these would connect to a live exchange rate API.
            </p>
          </div>
        </div>
      )}

      {/* Financial Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Monthly Financial Targets
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Set your target monthly income and savings goals. These will be used for tracking progress across the application.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                  Monthly Income Goal (€)
                </label>
                <input
                  type="number"
                  step="100"
                  value={state.user.monthlyIncomeGoal}
                  onChange={e => updateState({ 
                    user: { ...state.user, monthlyIncomeGoal: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="5000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your target monthly income
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                  Monthly Savings Goal (€)
                </label>
                <input
                  type="number"
                  step="50"
                  value={state.user.monthlySavingsGoal}
                  onChange={e => updateState({ 
                    user: { ...state.user, monthlySavingsGoal: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your target monthly savings
                </p>
              </div>
            </div>

            {state.user.monthlyIncomeGoal > 0 && state.user.monthlySavingsGoal > 0 && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Your Savings Target
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      You're aiming to save{' '}
                      <span className="font-semibold">
                        {((state.user.monthlySavingsGoal / state.user.monthlyIncomeGoal) * 100).toFixed(1)}%
                      </span>{' '}
                      of your monthly income (€{state.user.monthlySavingsGoal.toLocaleString()} out of €
                      {state.user.monthlyIncomeGoal.toLocaleString()})
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Defaults Tab */}
      {activeTab === 'defaults' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Default Account for Transactions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select which account should be pre-selected when adding new transactions
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                Default Account
              </label>
              <select
                value={state.user.defaultAccountId || ''}
                onChange={e => updateState({ 
                  user: { ...state.user, defaultAccountId: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">None (Always ask)</option>
                {state.accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This account will be automatically selected in transaction forms
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Other Preferences
            </h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.user.showBalanceInHeader || false}
                  onChange={e => updateState({ 
                    user: { ...state.user, showBalanceInHeader: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Show total balance in header
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Display your net worth at the top of every page
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.user.confirmBeforeDelete || true}
                  onChange={e => updateState({ 
                    user: { ...state.user, confirmBeforeDelete: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Confirm before deleting
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Show confirmation dialog when deleting transactions or accounts
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Data Management Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Export & Backup
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Export your financial data for backup or analysis
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(state, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `lumina-finances-backup-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Export All Data (JSON)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Download complete backup of all your data
                    </p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors opacity-50 cursor-not-allowed"
                disabled
              >
                <div className="flex items-center space-x-3">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Import Data (Coming Soon)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Restore from a previous backup
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Data Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{state.accounts.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Accounts</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{state.transactions.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Transactions</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{state.categories.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Categories</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{state.goals.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Goals</p>
              </div>
            </div>
          </div>

          {/* Reset Categories Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Category Management
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Reset your categories to default settings. This will delete all custom categories and restore the original category structure.
            </p>

            {/* Show result message if exists */}
            {resetCategoriesResult && (
              <div className={`mb-4 p-4 rounded-lg ${
                resetCategoriesResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {resetCategoriesResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={`text-sm font-medium ${
                    resetCategoriesResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                  }`}>
                    {resetCategoriesResult.message}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowResetCategoriesConfirm(true)}
              disabled={isResettingCategories}
              className="w-full flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors border border-orange-200 dark:border-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <RefreshCw className={`w-5 h-5 text-orange-600 ${isResettingCategories ? 'animate-spin' : ''}`} />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {isResettingCategories ? 'Resetting Categories...' : 'Reset Categories to Defaults'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Delete all categories and restore default category structure
                  </p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Reset Categories Confirmation Dialog */}
      {showResetCategoriesConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Reset Categories?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will delete all your current categories and restore the default category structure.
                  This action cannot be undone.
                </p>
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    ⚠️ <strong>Warning:</strong> Any transactions using custom categories may lose their category associations.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowResetCategoriesConfirm(false)}
                disabled={isResettingCategories}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetCategories}
                disabled={isResettingCategories}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isResettingCategories ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset Categories</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border-2 border-red-200 dark:border-red-800">
            <div className="flex items-start space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-semibold text-red-900 dark:text-red-400 mb-2">
                  Danger Zone
                </h3>
                <p className="text-sm text-red-800 dark:text-red-300">
                  These actions are irreversible. Please proceed with caution.
                </p>
              </div>
            </div>

            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Start Over - Delete All Data
              </button>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    ⚠️ This will permanently delete:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                    <li>All accounts and transactions</li>
                    <li>All categories and budgets</li>
                    <li>All goals and debt payoff plans</li>
                    <li>All recurring transactions and templates</li>
                    <li>All alerts and auto-categorization rules</li>
                  </ul>
                  <p className="text-sm font-semibold text-red-600 mt-3">
                    This action cannot be undone!
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Type <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">DELETE ALL DATA</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={resetInput}
                    onChange={e => setResetInput(e.target.value)}
                    placeholder="DELETE ALL DATA"
                    className="w-full px-4 py-2 border-2 border-red-300 dark:border-red-700 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleStartOver}
                    disabled={resetInput !== 'DELETE ALL DATA'}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetInput('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Tip:</strong> Before resetting, consider exporting your data from the Data Management tab to create a backup.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


