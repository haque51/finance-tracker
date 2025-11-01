
import React, { useState, useEffect, useCallback } from "react";
import { Account, Transaction, User } from "@/api/entities"; // Added User import
import { format, startOfMonth, subMonths, eachMonthOfInterval } from "date-fns";
import { fetchExchangeRates, convertCurrency } from "../utils/exchangeRateApi";

import ForecastControls from "../components/forecast/ForecastControls";
import ForecastChart from "../components/forecast/ForecastChart";
import ForecastSummary from "../components/forecast/ForecastSummary";

export default function ForecastPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentNetWorth, setCurrentNetWorth] = useState(0);
  const [currentUser, setCurrentUser] = useState(null); // Added currentUser state
  const [initialMonthlySavings, setInitialMonthlySavings] = useState(500);
  const [projectionData, setProjectionData] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({ EUR: 1 }); // Real-time exchange rates

  const [forecastParams, setForecastParams] = useState({
    monthlySavings: 500,
    annualGrowthRate: 7,
    forecastYears: 10,
  });

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get current user first
      const user = await User.me();
      setCurrentUser(user);

      // Fetch real-time exchange rates
      console.log('📡 Fetching real-time exchange rates...');
      const rates = await fetchExchangeRates('EUR', ['USD', 'BDT']);
      setExchangeRates(rates);
      console.log('✅ Exchange rates loaded:', rates);

      // Filter data by current user - only active accounts
      const [accountsData, transactionsData] = await Promise.all([
        Account.filter({ is_active: true }),
        Transaction.filter({}),
      ]);

      console.log('=== FORECAST NET WORTH CALCULATION ===');
      console.log('Active accounts found:', accountsData.length);

      const netWorth = accountsData.reduce((sum, acc) => {
        // Get balance in account's native currency
        let balanceInOriginalCurrency = acc.balance || acc.currentBalance || 0;
        let balanceInEUR;

        // Use balance_eur if available, otherwise convert
        if (acc.balance_eur !== undefined && acc.balance_eur !== null) {
          balanceInEUR = acc.balance_eur;
          console.log(`${acc.name} (${acc.type}): €${balanceInEUR.toFixed(2)} (pre-converted)`);
        } else if (balanceInOriginalCurrency > 0) {
          const currency = acc.currency || 'EUR';
          balanceInEUR = convertCurrency(balanceInOriginalCurrency, currency, 'EUR', rates);
          console.log(`${acc.name} (${acc.type}): ${balanceInOriginalCurrency.toLocaleString()} ${currency} → €${balanceInEUR.toFixed(2)} (rate: ${rates[currency] || 'N/A'})`);
        } else {
          balanceInEUR = 0;
          console.log(`${acc.name} (${acc.type}): €0.00 (no balance)`);
        }

        if (acc.type === "loan" || acc.type === "credit_card") {
          console.log(`  → Subtracting debt: €${sum.toFixed(2)} - €${balanceInEUR.toFixed(2)} = €${(sum - balanceInEUR).toFixed(2)}`);
          return sum - balanceInEUR;
        }
        console.log(`  → Adding asset: €${sum.toFixed(2)} + €${balanceInEUR.toFixed(2)} = €${(sum + balanceInEUR).toFixed(2)}`);
        return sum + balanceInEUR;
      }, 0);

      console.log('💰 Final Net Worth: €' + netWorth.toFixed(2));
      setCurrentNetWorth(netWorth);

      // Calculate average savings over last 6 months
      const last6Months = eachMonthOfInterval({
        start: subMonths(new Date(), 6),
        end: subMonths(new Date(), 1),
      });

      const totalSavingsLast6Months = last6Months.reduce((total, month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const monthTransactions = transactionsData.filter((t) => {
          const transDate = new Date(t.date);
          return transDate >= monthStart && transDate <= monthEnd;
        });

        const income = monthTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => {
            if (t.amount_eur) return sum + t.amount_eur;
            const amount = t.amount || 0;
            const currency = t.currency || 'EUR';
            return sum + convertCurrency(amount, currency, 'EUR', rates);
          }, 0);
        const expenses = monthTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => {
            if (t.amount_eur) return sum + t.amount_eur;
            const amount = t.amount || 0;
            const currency = t.currency || 'EUR';
            return sum + convertCurrency(amount, currency, 'EUR', rates);
          }, 0);
        
        return total + (income - expenses);
      }, 0);
      
      const avgSavings = last6Months.length > 0 ? totalSavingsLast6Months / last6Months.length : 500;
      setInitialMonthlySavings(avgSavings);
      setForecastParams(prev => ({ ...prev, monthlySavings: Math.round(avgSavings) }));

    } catch (error) {
      console.error("Error loading forecast data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  useEffect(() => {
    if (isLoading) return;

    const data = [];
    let lastYearNetWorth = currentNetWorth;
    
    data.push({ year: 0, netWorth: Math.round(lastYearNetWorth) });

    for (let i = 1; i <= forecastParams.forecastYears; i++) {
      const yearSavings = forecastParams.monthlySavings * 12;
      const growthFactor = 1 + forecastParams.annualGrowthRate / 100;
      
      const newNetWorth = (lastYearNetWorth + yearSavings) * growthFactor;
      data.push({ year: i, netWorth: Math.round(newNetWorth) });
      lastYearNetWorth = newNetWorth;
    }
    setProjectionData(data);
  }, [forecastParams, currentNetWorth, isLoading]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Financial Forecast</h1>
        <p className="text-slate-600 mt-1">
          Project your future net worth and experiment with different scenarios.
        </p>
      </div>

      <ForecastSummary
        projectionData={projectionData}
        forecastYears={forecastParams.forecastYears}
      />

      <ForecastControls
        params={forecastParams}
        setParams={setForecastParams}
        initialMonthlySavings={initialMonthlySavings}
      />

      <ForecastChart data={projectionData} isLoading={isLoading} />
    </div>
  );
}
