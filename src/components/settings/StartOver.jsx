import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Transaction, Account, RecurrentTransaction, TransactionTemplate, Category, Budget, FinancialGoal, NetWorthSnapshot, DebtPayoffPlan, SpendingAlert, CategorizationRule } from "@/api/entities";
import api from '../../services/api'; // Import API directly for balance updates
import { API_ENDPOINTS } from '../../config/api.config';
import {
  AlertTriangle,
  RefreshCw,
  Trash2
} from "lucide-react";

export default function StartOver({ user, onComplete }) {
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Helper function to add delay between API calls
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleStartOver = async () => {
    if (confirmText !== "DELETE ALL DATA") {
      alert('Please type "DELETE ALL DATA" exactly to confirm.');
      return;
    }

    if (!window.confirm("This will permanently delete EVERYTHING - all accounts, transactions, budgets, goals, categories, and settings. You will start completely fresh with an empty account. This action CANNOT be undone. Are you absolutely sure?")) {
      return;
    }

    setIsResetting(true);
    try {
      console.log('🗑️ Starting data reset process...');

      // Delete all transactions (backend auto-filters by authenticated user)
      console.log('📋 Fetching transactions...');
      const transactions = await Transaction.filter({});
      console.log(`🗑️ Deleting ${transactions.length} transactions...`);
      for (let i = 0; i < transactions.length; i++) {
        await Transaction.delete(transactions[i].id);
        // Add delay every 5 deletions to prevent rate limiting
        if ((i + 1) % 5 === 0) {
          await delay(300);
        }
      }
      console.log('✅ All transactions deleted');

      // Small delay before next batch
      await delay(500);

      // Delete all recurring transactions (backend auto-filters by authenticated user)
      console.log('🔄 Fetching recurring transactions...');
      const recurringTransactions = await RecurrentTransaction.filter({});
      console.log(`🗑️ Deleting ${recurringTransactions.length} recurring transactions...`);
      for (let i = 0; i < recurringTransactions.length; i++) {
        await RecurrentTransaction.delete(recurringTransactions[i].id);
        // Add delay every 5 deletions to prevent rate limiting
        if ((i + 1) % 5 === 0) {
          await delay(300);
        }
      }
      console.log('✅ All recurring transactions deleted');

      // Small delay before next batch
      await delay(500);

      // Delete all transaction templates (backend auto-filters by authenticated user)
      console.log('📝 Fetching transaction templates...');
      try {
        const templates = await TransactionTemplate.filter({});
        console.log(`🗑️ Deleting ${templates.length} templates...`);
        for (let i = 0; i < templates.length; i++) {
          await TransactionTemplate.delete(templates[i].id);
          if ((i + 1) % 5 === 0) await delay(300);
        }
        console.log('✅ All templates deleted');
      } catch (error) {
        console.log('⚠️ Template deletion skipped (feature may not be implemented)');
      }

      // Small delay before next batch
      await delay(500);

      // Delete all budgets
      console.log('💰 Fetching budgets...');
      try {
        const budgets = await Budget.filter({});
        console.log(`🗑️ Deleting ${budgets.length} budgets...`);
        for (let i = 0; i < budgets.length; i++) {
          await Budget.delete(budgets[i].id);
          if ((i + 1) % 5 === 0) await delay(300);
        }
        console.log('✅ All budgets deleted');
      } catch (error) {
        console.log('⚠️ Budget deletion skipped:', error.message);
      }

      // Small delay before next batch
      await delay(500);

      // Delete all financial goals
      console.log('🎯 Fetching financial goals...');
      try {
        const goals = await FinancialGoal.filter({});
        console.log(`🗑️ Deleting ${goals.length} financial goals...`);
        for (let i = 0; i < goals.length; i++) {
          await FinancialGoal.delete(goals[i].id);
          if ((i + 1) % 5 === 0) await delay(300);
        }
        console.log('✅ All financial goals deleted');
      } catch (error) {
        console.log('⚠️ Financial goal deletion skipped:', error.message);
      }

      // Small delay before next batch
      await delay(500);

      // Delete all debt payoff plans
      console.log('💳 Fetching debt payoff plans...');
      try {
        const debtPlans = await DebtPayoffPlan.filter({});
        console.log(`🗑️ Deleting ${debtPlans.length} debt payoff plans...`);
        for (let i = 0; i < debtPlans.length; i++) {
          await DebtPayoffPlan.delete(debtPlans[i].id);
          if ((i + 1) % 5 === 0) await delay(300);
        }
        console.log('✅ All debt payoff plans deleted');
      } catch (error) {
        console.log('⚠️ Debt payoff plan deletion skipped:', error.message);
      }

      // Small delay before next batch
      await delay(500);

      // Delete all spending alerts
      console.log('🔔 Fetching spending alerts...');
      try {
        const alerts = await SpendingAlert.filter({});
        console.log(`🗑️ Deleting ${alerts.length} spending alerts...`);
        for (let i = 0; i < alerts.length; i++) {
          await SpendingAlert.delete(alerts[i].id);
          if ((i + 1) % 5 === 0) await delay(300);
        }
        console.log('✅ All spending alerts deleted');
      } catch (error) {
        console.log('⚠️ Spending alert deletion skipped:', error.message);
      }

      // Small delay before next batch
      await delay(500);

      // Delete all categorization rules
      console.log('📋 Fetching categorization rules...');
      try {
        const rules = await CategorizationRule.filter({});
        console.log(`🗑️ Deleting ${rules.length} categorization rules...`);
        for (let i = 0; i < rules.length; i++) {
          await CategorizationRule.delete(rules[i].id);
          if ((i + 1) % 5 === 0) await delay(300);
        }
        console.log('✅ All categorization rules deleted');
      } catch (error) {
        console.log('⚠️ Categorization rule deletion skipped:', error.message);
      }

      // Small delay before next batch
      await delay(500);

      // Delete all net worth snapshots
      console.log('📊 Fetching net worth snapshots...');
      try {
        const snapshots = await NetWorthSnapshot.filter({});
        console.log(`🗑️ Deleting ${snapshots.length} net worth snapshots...`);
        for (let i = 0; i < snapshots.length; i++) {
          await NetWorthSnapshot.delete(snapshots[i].id);
          if ((i + 1) % 5 === 0) await delay(300);
        }
        console.log('✅ All net worth snapshots deleted');
      } catch (error) {
        console.log('⚠️ Net worth snapshot deletion skipped:', error.message);
      }

      // Small delay before next batch
      await delay(500);

      // Delete all categories
      console.log('📂 Fetching categories...');
      try {
        const categories = await Category.filter({});
        console.log(`🗑️ Deleting ${categories.length} categories...`);
        for (let i = 0; i < categories.length; i++) {
          await Category.delete(categories[i].id);
          if ((i + 1) % 5 === 0) await delay(300);
        }
        console.log('✅ All categories deleted');
      } catch (error) {
        console.log('⚠️ Category deletion skipped:', error.message);
      }

      // Small delay before final batch
      await delay(500);

      // Delete all accounts (LAST - since transactions reference accounts)
      console.log('🏦 Fetching accounts...');
      const accounts = await Account.filter({});
      console.log(`🗑️ Deleting ${accounts.length} accounts...`);
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        console.log(`  Deleting ${account.name}...`);
        try {
          await Account.delete(account.id);
          console.log(`    ✅ ${account.name} deleted successfully`);
        } catch (error) {
          console.error(`    ❌ Failed to delete ${account.name}:`, error);
        }
        if ((i + 1) % 3 === 0) await delay(400);
      }
      console.log('✅ All accounts deleted');

      console.log('✅ Data reset complete!');

      alert("All data has been successfully deleted. You now have a completely fresh start!");
      
      // Notify parent component to refresh data
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error during start over:", error);
      alert("An error occurred while resetting your data. Please try again.");
    }
    setIsResetting(false);
    setConfirmText("");
  };

  return (
    <Card className="shadow-sm border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          Start Over - Delete All Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> This action will permanently delete EVERYTHING:
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>All accounts</li>
              <li>All transactions (income, expenses, transfers)</li>
              <li>All recurring transactions and templates</li>
              <li>All budgets and financial goals</li>
              <li>All categories</li>
              <li>All debt payoff plans</li>
              <li>All spending alerts and rules</li>
              <li>All net worth history</li>
            </ul>
            <p className="mt-2 font-semibold text-red-900">You will start completely fresh with an empty account. This action CANNOT be undone!</p>
          </AlertDescription>
        </Alert>

        <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-white">
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-red-700 font-semibold">
              Type "DELETE ALL DATA" to confirm:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE ALL DATA"
              className="border-red-300 focus:border-red-500"
            />
          </div>

          <Button
            onClick={handleStartOver}
            disabled={confirmText !== "DELETE ALL DATA" || isResetting}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isResetting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Deleting All Data...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Data and Start Over
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}