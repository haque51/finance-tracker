import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp } from "lucide-react";

// Design System Colors - Green for income, Red for expenses
const COLORS = ['#10b981', '#ef4444'];

export default function IncomeExpenseChart({ income, expenses, isLoading }) {
  const data = [
    { name: 'Income', value: income, color: '#10b981' },
    { name: 'Expenses', value: expenses, color: '#ef4444' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="chart-tooltip">
          <p className="font-medium">{data.name}</p>
          <p className="text-lg font-bold chart-value" style={{ color: data.payload.color }}>
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
          <TrendingUp className="w-5 h-5" />
          Income vs Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoading && (income > 0 || expenses > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                animationBegin={0}
                animationDuration={400}
                animationEasing="ease-in-out"
              >
                <Cell key="cell-0" fill="url(#incomeGradient)" />
                <Cell key="cell-1" fill="url(#expenseGradient)" />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  paddingTop: '16px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No transaction data for this month</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}