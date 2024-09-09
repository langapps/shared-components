import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export interface SubscriptionInfoType {
  status: string;
  nextPaymentDate?: { seconds: number };
}

interface SubscriptionInfoProps {
  getSubscriptionInfo: () => Promise<SubscriptionInfoType>;
  cancelSubscription: () => Promise<void>;
  isUserLoggedIn: boolean;
}

/**
 * SubscriptionInfo Component
 * 
 * This component displays subscription information for authenticated users.
 * It fetches and presents the current subscription status, next payment date,
 * and provides an option to cancel an active subscription.
 * 
 * User Perspective:
 * - Users can view their current subscription status.
 * - For active subscriptions, users can see the next payment date.
 * - Users with active subscriptions have the option to cancel their subscription.
 * - The component handles loading states and potential errors during data fetching.
 * 
 * Usage:
 * - This component should be rendered only for authenticated users.
 * - It requires functions to fetch subscription info and cancel subscriptions.
 * - The component manages its own loading and error states.
 * 
 * Example:
 * <SubscriptionInfo
 *   getSubscriptionInfo={subscriptionService.getSubscriptionInfo}
 *   cancelSubscription={subscriptionService.cancelSubscription}
 *   isUserLoggedIn={!!user}
 * />
 * 
 * @component
 * @param {Object} props - The component props
 * @param {() => Promise<SubscriptionInfoType>} props.getSubscriptionInfo - Function to fetch subscription information
 * @param {() => Promise<void>} props.cancelSubscription - Function to cancel the current subscription
 * @param {boolean} props.isUserLoggedIn - Indicates if a user is currently logged in
 * 
 * @returns {React.ReactElement} The rendered SubscriptionInfo component
 */
const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({ 
  getSubscriptionInfo, 
  cancelSubscription, 
  isUserLoggedIn 
}) => {
  const { t } = useTranslation();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionInfo = useCallback(async () => {
    if (isUserLoggedIn) {
      try {
        setError(null);
        const result = await getSubscriptionInfo();
        console.log('Subscription info result:', result);
        setSubscriptionInfo(result);
      } catch (error: any) {
        console.error('Error fetching subscription info:', error);
        setError(error.message || t('subscription.fetchError'));
        setSubscriptionInfo(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [isUserLoggedIn, getSubscriptionInfo, t]);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, [fetchSubscriptionInfo]);

  const handleCancelSubscription = async () => {
    if (window.confirm(t('subscription.cancelConfirmation'))) {
      try {
        setError(null);
        await cancelSubscription();
        alert(t('subscription.cancelSuccess'));
        await fetchSubscriptionInfo();
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        setError(t('subscription.cancelError'));
      }
    }
  };

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!subscriptionInfo || subscriptionInfo.status === 'no_subscription') {
    return <div>{t('subscription.noActiveSubscription')}</div>;
  }

  const nextPaymentDate = subscriptionInfo.nextPaymentDate 
    ? new Date(subscriptionInfo.nextPaymentDate.seconds * 1000).toLocaleDateString()
    : null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">{t('subscription.info')}</h3>
      <p>{t('subscription.status')}: {t(`subscription.statusTypes.${subscriptionInfo.status}`)}</p>
      {nextPaymentDate && (
        <p>{t('subscription.nextPayment')}: {nextPaymentDate}</p>
      )}
      {subscriptionInfo.status === 'active' && (
        <button
          onClick={handleCancelSubscription}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          {t('subscription.cancelButton')}
        </button>
      )}
    </div>
  );
};

export default SubscriptionInfo;