import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatsCards({ title, value, icon: Icon, bgColor, trendValue, trendText, trendDirection, onClick }) {
  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;
  const trendColor = trendDirection === 'up' ? 'text-emerald-600' : trendDirection === 'down' ? 'text-red-500' : 'text-gray-500';

  const gradientClasses = {
    'bg-emerald-500': 'from-emerald-500 to-green-600',
    'bg-red-500': 'from-red-500 to-rose-600',
    'bg-blue-500': 'from-blue-500 to-indigo-600',
    'bg-purple-500': 'from-purple-500 to-violet-600'
  };

  return (
    <Card 
        className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white cursor-pointer"
        onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-2xl currency-large text-foreground mb-4">
              {value}
            </p>
            {trendValue && (
              <div className="flex items-center text-sm">
                <TrendIcon className={`w-4 h-4 mr-1 ${trendColor}`} />
                <span className="font-semibold currency text-foreground">{trendValue}</span>
                {trendText && <span className="text-muted-foreground ml-1">{trendText}</span>}
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClasses[bgColor] || 'from-gray-400 to-gray-500'} flex items-center justify-center shadow-sm`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}