
import React, { useState, useEffect, useCallback } from "react";
import { Account, Transaction } from "@/api/entities";
import { fetchExchangeRates, convertCurrency } from "../utils/exchangeRateApi";
import { useCurrentUser } from '../hooks/useCurrentUser'; // Use custom hook instead of User.me()
import exchangeRatesService from '../services/exchangeRatesService';
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import AccountCard from "../components/accounts/AccountCard";
import AccountForm from "../components/accounts/AccountForm";

export default function AccountsPage() {
  const { user: currentUser } = useCurrentUser(); // Get user from AppContext
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({ USD: 0.92, BDT: 0.0084, EUR: 1 });
  const [historicalRates, setHistoricalRates] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchLiveExchangeRates = useCallback(async () => {
    try {
      console.log('📡 Fetching real-time exchange rates for Accounts page...');
      const rates = await fetchExchangeRates('EUR', ['USD', 'BDT']);
      setExchangeRates(rates);
      console.log('✅ Exchange rates loaded:', rates);
    } catch (error) {
      console.warn("Could not fetch live rates, using defaults:", error);
      // Use default rates as fallback
      setExchangeRates({ EUR: 1, USD: 1.08, BDT: 118.5 });
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    if (!currentUser) return;

    try {
      const transactionsData = await Transaction.filter({}, "-date");
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
    }
  }, [currentUser]);

  const calculateHistoricalBalance = useCallback((account, month) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // If current month, return live balance
    if (month === currentMonth) {
      return account.balance;
    }

    // Calculate historical balance at end of selected month
    const monthEndDate = new Date(month + '-01');
    monthEndDate.setMonth(monthEndDate.getMonth() + 1);
    monthEndDate.setDate(0); // Last day of the month
    monthEndDate.setHours(23, 59, 59, 999);

    // Start with opening balance
    let balance = account.opening_balance || 0;

    // Apply all transactions up to the end of the selected month
    const relevantTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate <= monthEndDate;
    });

    relevantTransactions.forEach(txn => {
      if (txn.type === 'income' && txn.account_id === account.id) {
        balance += txn.amount || 0;
      } else if (txn.type === 'expense' && txn.account_id === account.id) {
        balance -= Math.abs(txn.amount || 0);
      } else if (txn.type === 'transfer') {
        if (txn.from_account_id === account.id) {
          balance -= Math.abs(txn.amount || 0);
        } else if (txn.to_account_id === account.id) {
          balance += Math.abs(txn.amount || 0);
        }
      }
    });

    return balance;
  }, [transactions]);

  const loadAccounts = useCallback(async () => {
    // Wait for user to be available from AppContext
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Filter accounts by current user ID
      const accountsData = await Account.filter({}, "-created_date");

      // Calculate balance_eur for each account using historical rates
      const accountsWithEur = accountsData.map(account => {
        const displayBalance = calculateHistoricalBalance(account, selectedMonth);

        // Convert to EUR using proper conversion function
        const balance_eur = convertCurrency(
          displayBalance,
          account.currency,
          'EUR',
          historicalRates
        );

        console.log(`Account: ${account.name} | ${displayBalance} ${account.currency} → €${balance_eur.toFixed(2)}`);

        return {
          ...account,
          balance: displayBalance, // Override balance with historical balance
          balance_eur: balance_eur
        };
      });

      setAccounts(accountsWithEur);
    } catch (error) {
      console.error("Error loading accounts:", error);
      setAccounts([]);
    }
    setIsLoading(false);
  }, [currentUser, historicalRates, selectedMonth, calculateHistoricalBalance]); // Use historicalRates dependency

  // Fetch exchange rates when user is available
  useEffect(() => {
    if (currentUser) {
      fetchLiveExchangeRates();
    }
  }, [currentUser, fetchLiveExchangeRates]);

  // Load transactions when user is available
  useEffect(() => {
    if (currentUser) {
      loadTransactions();
    }
  }, [currentUser, loadTransactions]);

  // Fetch historical rates when selected month changes
  useEffect(() => {
    const fetchHistoricalRatesForMonth = async () => {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      if (selectedMonth === currentMonth) {
        // Use live rates for current month
        setHistoricalRates(exchangeRates);
      } else {
        // Fetch historical rates for selected month
        try {
          const rates = await exchangeRatesService.getHistoricalRates(selectedMonth);
          if (rates && rates.rates) {
            setHistoricalRates(rates.rates);
          } else {
            // Fallback to current rates if historical rates not available
            console.warn(`No historical rates for ${selectedMonth}, using current rates`);
            setHistoricalRates(exchangeRates);
          }
        } catch (error) {
          console.error('Error fetching historical rates:', error);
          // Fallback to current rates on error
          setHistoricalRates(exchangeRates);
        }
      }
    };

    if (exchangeRates) {
      fetchHistoricalRatesForMonth();
    }
  }, [selectedMonth, exchangeRates]);

  // Load accounts when exchange rates, transactions, or selected month changes
  useEffect(() => {
    if (currentUser && historicalRates && transactions.length >= 0) {
      loadAccounts();
    }
  }, [currentUser, historicalRates, transactions, selectedMonth, loadAccounts]);

  const handleAddNew = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (accountId) => {
    if (!currentUser) {
      alert("Error: Current user not identified. Cannot delete account.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this account and all its transactions? This action cannot be undone.")) {
      try {
        // This is a cascading delete, be careful.
        // First, find all transactions for this account and delete them.
        // Only delete transactions created by current user for this account
        const transactionsToDelete = await Transaction.filter({
          account_id: accountId,
          user_id: currentUser.id
        });
        for (const trans of transactionsToDelete) {
          await Transaction.delete(trans.id);
        }

        await Account.delete(accountId);
        loadAccounts();
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account.");
      }
    }
  };

  const handleSave = async (formData) => {
    if (!currentUser) {
      alert("Error: Current user not identified. Cannot save account.");
      return;
    }

    try {
      if (editingAccount) {
        // For editing, use the current_balance from the form
        const balance_eur = convertCurrency(
          formData.current_balance,
          formData.currency,
          'EUR',
          exchangeRates
        );

        let dataToSave = {
          ...formData,
          balance: formData.current_balance,
          balance_eur: balance_eur,
        };
        // Don't update opening_balance when editing, it's an initial value
        delete dataToSave.opening_balance;
        // Remove current_balance as it's a form-specific field, not a database field
        delete dataToSave.current_balance;

        console.log(`Saving account: ${formData.current_balance} ${formData.currency} → €${balance_eur.toFixed(2)}`);

        await Account.update(editingAccount.id, dataToSave);
      } else {
        // For new accounts, only send the opening_balance
        // Backend will automatically set balance, balance_eur, and user_id
        let dataToSave = {
          name: formData.name,
          type: formData.type,
          currency: formData.currency,
          opening_balance: formData.opening_balance,
        };

        // Include optional fields if provided
        if (formData.institution) {
          dataToSave.institution = formData.institution;
        }
        if (formData.notes) {
          dataToSave.notes = formData.notes;
        }

        console.log(`Creating ${formData.type} account:`, dataToSave);

        await Account.create(dataToSave);
      }

      setIsFormOpen(false);
      setEditingAccount(null);
      loadAccounts();
    } catch (error) {
      console.error("Error saving account:", error);
      alert("Failed to save account.");
    }
  };

  // Helper function to format month for display
  const formatMonthDisplay = (monthStr) => {
    const date = new Date(monthStr + '-01');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Generate array of last 12 months
  const generateMonthOptions = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({ value: monthStr, label: formatMonthDisplay(monthStr) });
    }
    return months;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Accounts</h1>
            <p className="text-slate-600 mt-1">
              View, add, and edit your financial accounts.
            </p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Edit Account" : "Add New Account"}
              </DialogTitle>
            </DialogHeader>
            <AccountForm
              account={editingAccount}
              onSubmit={handleSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <AccountCard.Skeleton key={i} />)
          : accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={() => handleEdit(account)}
                onDelete={() => handleDelete(account.id)}
              />
            ))}
      </div>
      
      {!isLoading && accounts.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl">
            <h3 className="text-xl font-semibold text-slate-800">No Accounts Found</h3>
            <p className="text-slate-500 mt-2">Get started by adding your first financial account.</p>
            <Button onClick={handleAddNew} className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
        </div>
      )}
    </div>
  );
}
