/**
 * Premium Page Wrapper
 * Wraps premium pages and shows upgrade prompt for basic users
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { hasFeatureAccess } from '@/utils/featureAccess';
import { PremiumFeatureOverlay } from './UpgradeBanner';

export default function PremiumPageWrapper({
  feature,
  featureName,
  children,
  showOverlay = true
}) {
  const { user } = useApp();
  const navigate = useNavigate();
  const hasAccess = hasFeatureAccess(user, feature);

  const handleUpgrade = () => {
    navigate('/settings?tab=subscription');
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showOverlay) {
    return null;
  }

  return (
    <PremiumFeatureOverlay
      featureName={featureName}
      onUpgrade={handleUpgrade}
    >
      {children}
    </PremiumFeatureOverlay>
  );
}
