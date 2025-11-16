/**
 * Subscription Management Component
 * Allows users to view and upgrade their subscription tier
 */

import React, { useState } from 'react';
import { Crown, Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import {
  getTierDisplayName,
  isPremiumUser,
  getPremiumFeatures,
  SUBSCRIPTION_TIERS,
  BASIC_LIMITS
} from '@/utils/featureAccess';

export default function SubscriptionManagement() {
  const { user, updateUser } = useApp();
  const toast = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const currentTier = getTierDisplayName(user);
  const isPremium = isPremiumUser(user);
  const premiumFeatures = getPremiumFeatures();

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // TODO: Integrate with payment provider (Stripe, etc.)
      // For now, just update the user tier locally
      updateUser({ subscription_tier: SUBSCRIPTION_TIERS.PREMIUM });
      toast.success('Successfully upgraded to Premium!');
    } catch (error) {
      console.error('Upgrade failed:', error);
      toast.error('Failed to upgrade subscription');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleDowngrade = async () => {
    if (window.confirm('Are you sure you want to downgrade to Basic? You will lose access to premium features.')) {
      try {
        updateUser({ subscription_tier: SUBSCRIPTION_TIERS.BASIC });
        toast.success('Downgraded to Basic plan');
      } catch (error) {
        console.error('Downgrade failed:', error);
        toast.error('Failed to downgrade subscription');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Plan
            {isPremium && (
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            You are currently on the {currentTier} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isPremium ? (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                      Premium Member
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      You have access to all features and unlimited usage
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Basic Plan Limits
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Up to {BASIC_LIMITS.MAX_ACCOUNTS} accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Up to {BASIC_LIMITS.MAX_CATEGORIES} custom categories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Transaction history limited to {BASIC_LIMITS.TRANSACTION_HISTORY_MONTHS} months</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Up to {BASIC_LIMITS.MAX_BUDGET_CATEGORIES} budget categories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>No access to advanced features</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {!isPremium && (
        <Card className="border-2 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Upgrade to Premium
            </CardTitle>
            <CardDescription>
              Unlock all features and remove limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Premium Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {premiumFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <span className="text-xl">{feature.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {feature.name}
                      </p>
                    </div>
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-amber-900 dark:text-amber-100">
                      $9.99
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                    Cancel anytime. No hidden fees.
                  </p>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold"
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? (
                      <>Upgrading...</>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                    Note: This is a demo. No payment will be processed.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Actions */}
      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>
              Change your subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Your premium subscription gives you unlimited access to all features.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDowngrade}
                >
                  Downgrade to Basic
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
