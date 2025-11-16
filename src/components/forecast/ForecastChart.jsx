import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BrainCircuit } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="font-medium">Year {label}</p>
        <p className="text-sm">
          Net Worth:{" "}
          <span className="font-bold chart-value" style={{ color: '#2563EB' }}>
            €{payload[0].value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ForecastChart({ data, isLoading }) {
  return (
    <Card className="chart-container border-0 premium-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="chart-title flex items-center gap-2">
          <BrainCircuit className="w-5 h-5" />
          Net Worth Projection
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          This chart projects the growth of your net worth over time based on
          your assumptions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <div className="text-center">
              <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Calculating your financial future...</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <defs>
                <linearGradient id="forecastLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
                <linearGradient id="forecastAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="year"
                label={{
                  value: "Years from Now",
                  position: "insideBottom",
                  offset: -5,
                  style: { fontFamily: 'Inter, sans-serif', fontSize: 12, fill: 'hsl(var(--muted-foreground))' }
                }}
                fontSize={12}
                fontFamily="Inter, sans-serif"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
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
                dataKey="netWorth"
                stroke="url(#forecastLineGradient)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                name="Projected Net Worth"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                animationDuration={400}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
