import React, { useState, useEffect, useCallback } from 'react';

export interface SubscriptionInfoType {
  status: string;
  nextPaymentDate?: { seconds: number };
}

export interface SubscriptionInfoProps {
  getSubscriptionInfo: () => Promise<SubscriptionInfoType>;
  cancelSubscription: () => Promise<void>;
  isUserLoggedIn: boolean;
  texts: {
    loading: string;
    fetchError: string;
    cancelConfirmation: string;
    cancelSuccess: string;
    cancelError: string;
    noActiveSubscription: string;
    info: string;
    status: string;
    nextPayment: string;
    cancelButton: string;
    statusTypes: {
      [key: string]: string;
    };
  };
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
 * - All text content is provided via the `texts` prop for easy localization.
 * 
 * Example:
 * <SubscriptionInfo
 *   getSubscriptionInfo={subscriptionService.getSubscriptionInfo}
 *   cancelSubscription={subscriptionService.cancelSubscription}
 *   isUserLoggedIn={!!user}
 *   texts={{
 *     loading: 'Loading subscription info...',
 *     fetchError: 'Failed to fetch subscription information',
 *     cancelConfirmation: 'Are you sure you want to cancel your subscription?',
 *     cancelSuccess: 'Subscription successfully cancelled',
 *     cancelError: 'Failed to cancel subscription',
 *     noActiveSubscription: 'You have no active subscription',
 *     info: 'Subscription Information',
 *     status: 'Status',
 *     nextPayment: 'Next payment',
 *     cancelButton: 'Cancel Subscription',
 *     statusTypes: {
 *       active: 'Active',
 *       cancelled: 'Cancelled',
 *       no_subscription: 'No Subscription'
 *     }
 *   }}
 * />
 * 
 * @component
 * @param {Object} props - The component props
 * @param {() => Promise<SubscriptionInfoType>} props.getSubscriptionInfo - Function to fetch subscription information
 * @param {() => Promise<void>} props.cancelSubscription - Function to cancel the current subscription
 * @param {boolean} props.isUserLoggedIn - Indicates if a user is currently logged in
 * @param {Object} props.texts - Object containing all text content for the component
 * 
 * @returns {React.ReactElement} The rendered SubscriptionInfo component
 */
export const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({ 
  getSubscriptionInfo, 
  cancelSubscription, 
  isUserLoggedIn,
  texts
}) => {
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
        setError(error.message || texts.fetchError);
        setSubscriptionInfo(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [isUserLoggedIn, getSubscriptionInfo, texts.fetchError]);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, [fetchSubscriptionInfo]);

  const handleCancelSubscription = async () => {
    if (window.confirm(texts.cancelConfirmation)) {
      try {
        setError(null);
        await cancelSubscription();
        alert(texts.cancelSuccess);
        await fetchSubscriptionInfo();
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        setError(texts.cancelError);
      }
    }
  };

  if (loading) {
    return <div>{texts.loading}</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!subscriptionInfo || subscriptionInfo.status === 'no_subscription') {
    return <div>{texts.noActiveSubscription}</div>;
  }

  const nextPaymentDate = subscriptionInfo.nextPaymentDate 
    ? new Date(subscriptionInfo.nextPaymentDate.seconds * 1000).toLocaleDateString()
    : null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">{texts.info}</h3>
      <p>{texts.status}: {texts.statusTypes[subscriptionInfo.status] || subscriptionInfo.status}</p>
      {nextPaymentDate && (
        <p>{texts.nextPayment}: {nextPaymentDate}</p>
      )}
      {subscriptionInfo.status === 'active' && (
        <button
          onClick={handleCancelSubscription}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          {texts.cancelButton}
        </button>
      )}
    </div>
  );
};

export default SubscriptionInfo;