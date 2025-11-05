import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FolderTree } from "lucide-react";

export default function CategorySpendingChart({ transactions, categories, isLoading }) {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const categorySpending = expenseTransactions.reduce((acc, transaction) => {
    const category = categories.find(c => c.id === transaction.category_id);
    const categoryName = category ? category.name : 'Uncategorized';

    acc[categoryName] = (acc[categoryName] || 0) + (transaction.amount_eur || 0);
    return acc;
  }, {});

  const data = Object.entries(categorySpending)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .reverse(); // Reverse so largest is at bottom

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="chart-tooltip">
          <p className="font-medium">{data.name}</p>
          <p className="text-lg font-bold chart-value" style={{ color: data.payload.fill }}>
            €{data.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="chart-container border-0 premium-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="chart-title flex items-center gap-2">
          <FolderTree className="w-5 h-5" />
          Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoading && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <defs>
                {data.map((entry, index) => {
                  const colors = [
                    ['#ef4444', '#dc2626'], // red
                    ['#f59e0b', '#d97706'], // orange
                    ['#eab308', '#ca8a04'], // yellow
                    ['#84cc16', '#65a30d'], // lime
                    ['#10b981', '#059669'], // green
                    ['#06b6d4', '#0891b2'], // cyan
                    ['#3b82f6', '#2563eb'], // blue
                    ['#6366f1', '#4f46e5'], // indigo
                    ['#8b5cf6', '#7c3aed'], // violet
                    ['#d946ef', '#c026d3'], // fuchsia
                  ];
                  const [color1, color2] = colors[index % colors.length];
                  return (
                    <linearGradient key={`gradient-${index}`} id={`dashboardBarGradient${index}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={color1} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={color2} stopOpacity={0.7} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                domain={[0, 'dataMax']}
                tickFormatter={(value) => `€${value.toFixed(0)}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                radius={[0, 8, 8, 0]}
                maxBarSize={40}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#dashboardBarGradient${index})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <div className="text-center">
              <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No expense data for this month</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
