
import React, { useState, useEffect, useCallback } from "react";
import { Account, Transaction, TransactionTemplate } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { useApp } from '../context/AppContext';  // Import useApp to access shared categories
import { useCurrentUser } from '../hooks/useCurrentUser';  // Import custom hook
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Filter, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";

import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import TransactionFilters from "../components/transactions/TransactionFilters";
import { formatCurrency } from "../components/utils/CurrencyFormatter";

export default function TransactionsPage() {
  const { categories: sharedCategories } = useApp(); // Get categories from shared context
  const { user: currentUser } = useCurrentUser(); // Get user from AppContext instead of API call
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({ USD: 0.92, BDT: 0.0084, EUR: 1 });
  const [netWorth, setNetWorth] = useState(0);

  // Use shared categories from context
  const categories = sharedCategories || [];
  
  const [filters, setFilters] = useState({
    search: "",
    account: "all",
    type: "all",
    category: "all",
    dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    dateTo: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const fetchExchangeRates = useCallback(async () => {
    try {
      const result = await InvokeLLM({
        prompt: "Get current exchange rates for USD to EUR and BDT to EUR.",
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            USD_to_EUR: { type: "number" },
            BDT_to_EUR: { type: "number" }
          }
        }
      });
      
      if (result.USD_to_EUR && result.BDT_to_EUR) {
        setExchangeRates({
          USD: result.USD_to_EUR,
          BDT: result.BDT_to_EUR,
          EUR: 1
        });
      }
    } catch (error) {
      console.warn("Could not fetch live rates, using defaults");
    }
  }, []);

  const loadData = useCallback(async () => {
    // Wait for user to be available from AppContext
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [transactionsData, accountsData, templatesData] = await Promise.all([
        Transaction.filter({}, '-date'),
        Account.filter({}), // Fetch all accounts to avoid issues
        TransactionTemplate.filter({}),
      ]);
      // Categories come from shared context - no need to fetch again

      setTransactions(transactionsData);
      setAccounts(accountsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  }, [currentUser]);

  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.payee?.toLowerCase().includes(searchLower) ||
        t.memo?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.account !== "all") {
        filtered = filtered.filter(t => t.account_id === filters.account || t.to_account_id === filters.account);
    }

    if (filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.category !== "all") {
      filtered = filtered.filter(t => t.category_id === filters.category);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  // Effect to calculate Net Worth
  useEffect(() => {
    if (accounts.length > 0) {
      const calculatedNetWorth = accounts.reduce((sum, acc) => {
        // Debt accounts (loans, credit cards) are liabilities - subtract from net worth
        if (acc.type === 'loan' || acc.type === 'credit_card') {
          return sum - (acc.balance_eur || 0);
        }
        // All other account types (checking, savings, investment, brokerage, cash) are assets - add to net worth
        return sum + (acc.balance_eur || 0);
      }, 0);
      setNetWorth(calculatedNetWorth);
    } else {
      setNetWorth(0);
    }
  }, [accounts]);

  useEffect(() => {
    loadData();
    fetchExchangeRates();
  }, [loadData, fetchExchangeRates]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  // Centralized function to handle all balance updates
  const updateAccountBalances = useCallback(async (transaction, operation) => {
    if (!currentUser) {
      console.error("No current user found for balance update.");
      return;
    }
    
    // Multiplier is 1 for 'apply' (transaction affects balance normally)
    // Multiplier is -1 for 'revert' (undoing the transaction's effect)
    const multiplier = operation === 'apply' ? 1 : -1;
    
    // Helper to get amount in the target account's currency
    const getAmountInAccountCurrency = (trans, account, rates) => {
      if (!account || !trans) return 0; // Defensive check
      if (account.currency === trans.currency) {
          return trans.amount;
      }
      
      // Convert trans.amount (in trans.currency) to EUR
      const amountInEur = trans.amount * (rates[trans.currency] || 1);
      
      // Convert EUR to account.currency
      // Assuming rates[currency] stores currency_to_EUR. So EUR_to_Currency is 1 / currency_to_EUR.
      const eurToAccountRate = 1 / (rates[account.currency] || 1); 
      
      return amountInEur * eurToAccountRate;
    };

    // Fetch fresh account data to prevent stale data issues, especially during rapid updates
    const allAccounts = await Account.filter({});

    const fromAccount = allAccounts.find(a => a.id === transaction.account_id);
    const toAccount = transaction.to_account_id ? allAccounts.find(a => a.id === transaction.to_account_id) : null;
    
    // Determine if the 'from' account is a debt-type account (loan/credit card)
    const isFromAccountDebt = fromAccount && (fromAccount.type === 'loan' || fromAccount.type === 'credit_card');

    // Handle the primary account (source) for the transaction
    if (fromAccount) {
        const amountInFromAccountCurrency = getAmountInAccountCurrency(transaction, fromAccount, exchangeRates);
        let newBalance;

        if (transaction.type === 'income') {
            // Income on a debt account (e.g., refund) reduces the balance owed.
            // Income on an asset account increases the balance.
            newBalance = isFromAccountDebt 
                ? fromAccount.balance - (amountInFromAccountCurrency * multiplier)
                : fromAccount.balance + (amountInFromAccountCurrency * multiplier);
        } else if (transaction.type === 'expense') {
            // Expense from a debt account (e.g., using a credit card) increases the balance owed.
            // Expense from an asset account decreases the balance.
            newBalance = isFromAccountDebt
                ? fromAccount.balance + (amountInFromAccountCurrency * multiplier)
                : fromAccount.balance - (amountInFromAccountCurrency * multiplier);
        } else if (transaction.type === 'transfer') {
            // Transfer FROM a debt account (e.g., cash advance from credit card) increases the balance owed.
            // Transfer FROM an asset account decreases the balance.
             newBalance = isFromAccountDebt
                ? fromAccount.balance + (amountInFromAccountCurrency * multiplier)
                : fromAccount.balance - (amountInFromAccountCurrency * multiplier);
        }

        if (newBalance !== undefined) {
            await Account.update(fromAccount.id, {
                current_balance: newBalance
            });
        }
    }

    // Handle the destination account for transfers (if applicable)
    if (transaction.type === 'transfer' && toAccount) {
        const amountInToAccountCurrency = getAmountInAccountCurrency(transaction, toAccount, exchangeRates);
        // Determine if the 'to' account is a debt-type account
        const isToAccountDebt = toAccount.type === 'loan' || toAccount.type === 'credit_card';
        let newToBalance;
        
        // CRITICAL LOGIC FOR LOAN/DEBT ACCOUNTS:
        // When transferring TO a debt account (e.g., making a payment to a credit card or loan),
        // we REDUCE the balance owed (subtract the payment amount).
        // When transferring TO an asset account, we INCREASE its balance.
        newToBalance = isToAccountDebt
            ? toAccount.balance - (amountInToAccountCurrency * multiplier)
            : toAccount.balance + (amountInToAccountCurrency * multiplier);

        await Account.update(toAccount.id, {
            current_balance: newToBalance
        });
    }
  }, [currentUser, exchangeRates]);

  const handleDelete = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        // Backend automatically handles account balance updates
        await Transaction.delete(transactionId);

        // Reload data after successful deletion
        await loadData();
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Failed to delete transaction.");
      }
    }
  };

  const handleSave = async (formData) => {
    if (!currentUser) {
      alert("Error: No user logged in. Please refresh.");
      return;
    }
    try {
      console.log('=== HANDLE SAVE DEBUG ===');
      console.log('Form data received:', formData);
      console.log('payee:', formData.payee);
      console.log('memo:', formData.memo);
      console.log('========================');

      // --- SAVE TRANSACTION DATA ---
      // Backend automatically handles account balance updates
      const rate = exchangeRates[formData.currency] || 1;
      const amountEur = formData.amount * rate;
      const dataToSave = {
        ...formData,
        amount_eur: amountEur,
        exchange_rate: rate,
        user_id: currentUser.id,
      };

      console.log('Data to save:', dataToSave);
      console.log('Is update?', !!editingTransaction);

      if (editingTransaction) {
        await Transaction.update(editingTransaction.id, dataToSave);
      } else {
        await Transaction.create(dataToSave);
      }

      setIsFormOpen(false);
      setEditingTransaction(null);
      // Reload data after successful save
      await loadData();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction.");
      // Reload data to fetch latest state
      await loadData();
    }
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-1">Manage your income, expenses, and transfers</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              transaction={editingTransaction}
              accounts={accounts}
              categories={categories}
              templates={templates}
              exchangeRates={exchangeRates}
              onSubmit={handleSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200 bg-white/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalIncome, 'EUR', true, true)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 bg-white/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses, 'EUR', true, true)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 bg-white/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Net Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(netAmount, 'EUR', true, true)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 bg-white/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(netWorth, 'EUR', true, true)}
            </p>
          </CardContent>
        </Card>
      </div>

      <TransactionFilters
        filters={filters}
        accounts={accounts}
        categories={categories}
        onFiltersChange={setFilters}
      />

      <TransactionList
        transactions={filteredTransactions}
        accounts={accounts}
        categories={categories}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
