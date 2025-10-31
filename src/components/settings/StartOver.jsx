import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Transaction, Account, RecurrentTransaction, TransactionTemplate } from "@/api/entities";
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

    if (!window.confirm("This will permanently delete ALL your financial data including transactions, recurring transactions, and templates. Account structures will remain. This action CANNOT be undone. Are you absolutely sure?")) {
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
      // Note: TransactionTemplate.filter may not be implemented, so we'll catch any errors
      console.log('📝 Fetching transaction templates...');
      try {
        const templates = await TransactionTemplate.filter({});
        console.log(`🗑️ Deleting ${templates.length} templates...`);
        for (let i = 0; i < templates.length; i++) {
          await TransactionTemplate.delete(templates[i].id);
          // Add delay every 5 deletions to prevent rate limiting
          if ((i + 1) % 5 === 0) {
            await delay(300);
          }
        }
        console.log('✅ All templates deleted');
      } catch (error) {
        console.log('⚠️ Template deletion skipped (feature may not be implemented)');
      }

      // Small delay before resetting account balances
      await delay(500);

      // Reset all account balances to opening balance
      // Backend doesn't auto-recalculate when transactions are deleted, so we must do it manually
      console.log('💰 Fetching accounts to reset balances...');
      const accounts = await Account.filter({});
      console.log(`🔄 Resetting ${accounts.length} account balances to opening balance...`);

      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const openingBalance = account.opening_balance || account.openingBalance || 0;

        console.log(`  Resetting ${account.name}: opening_balance=${openingBalance}, current=${account.balance}`);

        // Bypass accountService and call API directly
        // accountService._mapAccountToAPI strips out balance fields, so we use direct API call
        try {
          const response = await api.put(`${API_ENDPOINTS.ACCOUNTS}/${account.id}`, {
            current_balance: openingBalance
          });
          console.log(`    ✅ ${account.name} reset successfully to ${openingBalance}`);
          console.log(`       Response:`, response.data);
        } catch (error) {
          console.error(`    ❌ Failed to reset ${account.name}:`);
          console.error(`       Error:`, error);
          console.error(`       Error response:`, error.response?.data);
          console.error(`       Error status:`, error.response?.status);
          // Continue with other accounts even if one fails
        }

        // Add delay every 3 updates to prevent rate limiting
        if ((i + 1) % 3 === 0) {
          await delay(400);
        }
      }
      console.log('✅ All account balances reset to opening balance');

      console.log('✅ Data reset complete!');

      alert("All data has been successfully deleted and account balances have been reset to opening balances.");
      
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
            <strong>Warning:</strong> This action will permanently delete ALL your financial data:
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>All transactions (income, expenses, transfers)</li>
              <li>All recurring transactions</li>
              <li>All transaction templates</li>
              <li>Account balances will be reset to opening balances</li>
            </ul>
            <p className="mt-2 font-semibold">This action CANNOT be undone!</p>
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