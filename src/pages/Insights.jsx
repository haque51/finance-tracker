
import React, { useState, useEffect, useCallback } from "react";
import { User, Transaction, Account } from "@/api/entities";
import { Zap, TrendingUp, Brain, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "../context/AppContext";

import SpendingInsights from "../components/insights/SpendingInsights";
import AIInsights from "../components/insights/AIInsights";
import PeriodComparison from "../components/insights/PeriodComparison";
import HistoricalData from "../components/insights/HistoricalData";
import PremiumPageWrapper from "../components/PremiumPageWrapper";
import { FEATURES } from "../utils/featureAccess";

function InsightsPageContent() {
  const { categories: sharedCategories } = useApp();
  const [currentUser, setCurrentUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use shared categories from AppContext
  const categories = sharedCategories;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [transactionsData, accountsData] = await Promise.all([
        Transaction.filter({}, '-date'),
        Account.filter({ is_active: true })
      ]);

      setTransactions(transactionsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error("Error loading insights data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Insights</h1>
          <p className="text-slate-600 mt-1">Smart analysis and automation for your finances.</p>
        </div>
      </div>

      <Tabs defaultValue="spending" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="spending" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Spending</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Compare</span>
          </TabsTrigger>
          <TabsTrigger value="historical" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Historical</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spending">
          <SpendingInsights
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="comparison">
          <PeriodComparison
            transactions={transactions}
            categories={categories}
            accounts={accounts}
          />
        </TabsContent>

        <TabsContent value="historical">
          <HistoricalData
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AIInsights
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <PremiumPageWrapper feature={FEATURES.AI_INSIGHTS} featureName="AI-Powered Insights">
      <InsightsPageContent />
    </PremiumPageWrapper>
  );
}
