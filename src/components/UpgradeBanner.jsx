/**
 * Upgrade Banner Component
 * Shows upgrade prompt for premium features
 */

import React from 'react';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export default function UpgradeBanner({
  feature,
  description,
  onUpgrade,
  compact = false,
  className = ''
}) {
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border border-amber-200 dark:border-amber-800 rounded-lg ${className}`}>
        <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm text-amber-900 dark:text-amber-100">
          Premium Feature
        </span>
        <Button
          size="sm"
          variant="default"
          className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
          onClick={onUpgrade}
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className={`border-2 border-amber-200 dark:border-amber-800 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {feature || 'Premium Feature'}
              </h3>
              <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                Premium
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {description || 'This feature is only available for Premium users. Upgrade to unlock advanced capabilities.'}
            </p>
            <Button
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
              onClick={onUpgrade}
            >
              Upgrade to Premium
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Premium Feature Overlay
 * Shows as an overlay over locked content
 */
export function PremiumFeatureOverlay({
  featureName,
  onUpgrade,
  children
}) {
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none select-none opacity-40 blur-sm">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {featureName}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upgrade to Premium to unlock this feature
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
            onClick={onUpgrade}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Premium Badge
 * Small badge to indicate premium features
 */
export function PremiumBadge({ className = '' }) {
  return (
    <Badge
      variant="secondary"
      className={`bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs ${className}`}
    >
      <Crown className="w-3 h-3 mr-1" />
      Premium
    </Badge>
  );
}

/**
 * Limit Warning Banner
 * Shows when approaching or at limit
 */
export function LimitWarningBanner({
  limitType,
  current,
  limit,
  onUpgrade,
  className = ''
}) {
  const isAtLimit = current >= limit;
  const isNearLimit = current >= limit * 0.8;

  if (!isNearLimit) return null;

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg ${
      isAtLimit
        ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
        : 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'
    } ${className}`}>
      <div className="flex items-center gap-3">
        <Lock className={`w-5 h-5 ${
          isAtLimit
            ? 'text-red-600 dark:text-red-400'
            : 'text-amber-600 dark:text-amber-400'
        }`} />
        <div>
          <p className={`font-medium ${
            isAtLimit
              ? 'text-red-900 dark:text-red-100'
              : 'text-amber-900 dark:text-amber-100'
          }`}>
            {isAtLimit
              ? `${limitType} limit reached (${current}/${limit})`
              : `Approaching ${limitType} limit (${current}/${limit})`
            }
          </p>
          <p className={`text-sm ${
            isAtLimit
              ? 'text-red-700 dark:text-red-300'
              : 'text-amber-700 dark:text-amber-300'
          }`}>
            Upgrade to Premium for unlimited {limitType.toLowerCase()}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="default"
        className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
        onClick={onUpgrade}
      >
        Upgrade
      </Button>
    </div>
  );
}
