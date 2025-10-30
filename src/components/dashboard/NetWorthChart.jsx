import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet } from "lucide-react";

export default function NetWorthChart({ accounts, isLoading }) {
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (!acc[type]) {
      acc[type] = 0;
    }
    
    // For debts, we want negative values
    if (account.type === 'loan' || account.type === 'credit_card') {
      acc[type] -= (account.balance_eur || 0);
    } else {
      acc[type] += (account.balance_eur || 0);
    }
    
    return acc;
  }, {});

  const data = Object.entries(accountsByType).map(([type, balance]) => ({
    type,
    balance: Math.round(balance),
    color: balance >= 0 ? '#10b981' : '#ef4444'
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="chart-tooltip">
          <p className="font-medium">{label}</p>
          <p className={`text-lg font-bold chart-value ${value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            €{Math.abs(value).toFixed(2)}
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
          <Wallet className="w-5 h-5" />
          Net Worth by Account Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoading && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <defs>
                <linearGradient id="positiveBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="negativeBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="type"
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
              <Bar
                dataKey="balance"
                fill="url(#positiveBarGradient)"
                radius={[8, 8, 0, 0]}
                animationDuration={300}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.balance >= 0 ? 'url(#positiveBarGradient)' : 'url(#negativeBarGradient)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No account data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}