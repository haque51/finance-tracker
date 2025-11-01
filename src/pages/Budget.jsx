import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, Budget } from '@/api/entities';
import { useCurrentUser } from '../hooks/useCurrentUser'; // Use custom hook instead of User.me()
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths, addMonths } from 'date-fns';
import { PiggyBank, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import BudgetCategoryRow from '../components/budget/BudgetCategoryRow';
import BudgetSummary from '../components/budget/BudgetSummary';
import { Button } from '@/components/ui/button';
import { useApp } from '../context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function BudgetPage() {
  const { categories: sharedCategories } = useApp();
  const { user: currentUser } = useCurrentUser(); // Get user from AppContext
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  // Filter categories for budget page (expense type only, parent categories only)
  const categories = useMemo(() => {
    return sharedCategories.filter(c => c.type === 'expense' && !c.parent_id);
  }, [sharedCategories]);

  const monthString = useMemo(() => format(currentMonth, 'yyyy-MM'), [currentMonth]);

  const loadData = useCallback(async (user, month) => {
    setIsLoading(true);
    try {
      const [transactionsData, budgetsData] = await Promise.all([
        Transaction.filter({
          user_id: user.id,
          type: 'expense',
          // A bit wider range to be safe with timezones
          date: { gte: format(subMonths(new Date(month), 1), 'yyyy-MM-01'), lte: format(addMonths(new Date(month), 1), 'yyyy-MM-dd') }
        }),
        Budget.filter({ month: format(month, 'yyyy-MM') })
      ]);

      setTransactions(transactionsData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error("Error loading budget data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      // Wait for user to be available from AppContext
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        await loadData(currentUser, currentMonth);
      } catch (e) {
        setIsLoading(false);
      }
    };
    init();
  }, [currentMonth, loadData, currentUser]); // Add currentUser as dependency

  const handleBudgetUpdate = async (categoryId, newAmount) => {
    const existingBudget = budgets.find(b => b.category_id === categoryId && b.month === monthString);
    const amount = Number(newAmount) || 0;

    try {
      if (existingBudget) {
        await Budget.update(existingBudget.id, { amount });
      } else {
        await Budget.create({
          month: monthString,
          category_id: categoryId,
          amount, // Will be mapped to 'budgeted' by budgetService
        });
      }
      // Refresh budgets for the current month
      const updatedBudgets = await Budget.filter({ month: monthString });
      setBudgets(updatedBudgets);
    } catch (error) {
      console.error("Failed to update budget:", error);
    }
  };

  const handleAddBudget = async () => {
    if (!selectedCategory || !newBudgetAmount) {
      alert('Please select a category and enter a budget amount');
      return;
    }

    try {
      await Budget.create({
        month: monthString,
        category_id: selectedCategory,
        amount: Number(newBudgetAmount), // Will be mapped to 'budgeted' by budgetService
      });

      // Refresh budgets for the current month
      const updatedBudgets = await Budget.filter({ month: monthString });
      setBudgets(updatedBudgets);

      // Close dialog and reset form
      setIsAddDialogOpen(false);
      setSelectedCategory('');
      setNewBudgetAmount('');
    } catch (error) {
      console.error("Failed to add budget:", error);
      alert('Failed to add budget. Please try again.');
    }
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => addMonths(prev, offset));
  };
  
  const parentCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories]);

  const budgetData = useMemo(() => {
    return parentCategories.map(category => {
      const monthlyTransactions = transactions.filter(t => {
        return new Date(t.date).getUTCFullYear() === currentMonth.getUTCFullYear() &&
               new Date(t.date).getUTCMonth() === currentMonth.getUTCMonth();
      });

      const spent = monthlyTransactions
        .filter(t => t.category_id === category.id)
        .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

      const budgetEntry = budgets.find(b => b.category_id === category.id);
      const budgeted = budgetEntry ? budgetEntry.amount : 0;

      return {
        categoryId: category.id,
        name: category.name,
        budgeted,
        spent,
        remaining: budgeted - spent
      };
    }).filter(data => data.budgeted > 0); // Only show categories with budgets set
  }, [parentCategories, transactions, budgets, currentMonth]);

  // Get categories that don't have budgets yet
  const categoriesWithoutBudgets = useMemo(() => {
    return parentCategories.filter(category => {
      const budgetEntry = budgets.find(b => b.category_id === category.id);
      return !budgetEntry || budgetEntry.amount === 0;
    });
  }, [parentCategories, budgets]);

  const totalBudgeted = budgetData.reduce((sum, d) => sum + d.budgeted, 0);
  const totalSpent = budgetData.reduce((sum, d) => sum + d.spent, 0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Monthly Budget</h1>
            <p className="text-slate-600 mt-1">Plan your spending and track your progress.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="text-lg font-semibold text-slate-800 w-40 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <BudgetSummary totalBudgeted={totalBudgeted} totalSpent={totalSpent} />

      <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-lg border border-slate-200">
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Expense Categories</h3>
            {categoriesWithoutBudgets.length > 0 && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Budget
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>Add Budget for Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesWithoutBudgets.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Budget Amount (EUR)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newBudgetAmount}
                        onChange={(e) => setNewBudgetAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          setSelectedCategory('');
                          setNewBudgetAmount('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddBudget}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add Budget
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
        </div>
        <div className="divide-y divide-slate-100">
        {isLoading ? (
            Array.from({length: 5}).map((_, i) => <BudgetCategoryRow.Skeleton key={i} />)
        ) : budgetData.length === 0 ? (
            <div className="text-center py-16">
              <PiggyBank className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No budgets set for this month
              </h3>
              <p className="text-slate-500 mb-4">
                Create your first budget to start tracking your spending.
              </p>
            </div>
        ) : (
            budgetData.map(data => (
                <BudgetCategoryRow
                    key={data.categoryId}
                    name={data.name}
                    budgeted={data.budgeted}
                    spent={data.spent}
                    remaining={data.remaining}
                    onBudgetChange={(newAmount) => handleBudgetUpdate(data.categoryId, newAmount)}
                />
            ))
        )}
        </div>
      </div>
    </div>
  );
}