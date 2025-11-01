import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export default function MonthlyTrendChart({ transactions, isLoading }) {
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const monthlyData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate >= monthStart && transDate <= monthEnd;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

    return {
      month: format(month, 'MMM'),
      income: Math.round(income),
      expenses: Math.round(expenses),
      savings: Math.round(income - expenses)
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium chart-value" style={{ color: entry.color }}>
              {entry.name}: €{entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="chart-container border-0 premium-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="chart-title flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Monthly Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoading ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <defs>
                <linearGradient id="incomeLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="expenseLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <linearGradient id="savingsLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="month"
                fontSize={12}
                fontFamily="Inter, sans-serif"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                fontSize={12}
                fontFamily="Inter, sans-serif"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  paddingTop: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="url(#incomeLineGradient)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                name="Income"
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6 }}
                animationDuration={400}
                animationEasing="ease-in-out"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="url(#expenseLineGradient)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                name="Expenses"
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6 }}
                animationDuration={400}
                animationEasing="ease-in-out"
              />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="url(#savingsLineGradient)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                name="Savings"
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6 }}
                animationDuration={400}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Loading monthly trends...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}