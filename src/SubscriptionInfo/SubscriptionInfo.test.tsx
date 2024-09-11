import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SubscriptionInfo from './SubscriptionInfo';

describe('SubscriptionInfo', () => {
    let mockGetSubscriptionInfo: jest.Mock;
    let mockCancelSubscription: jest.Mock;
    let originalConsoleLog: typeof console.log;

    const defaultTexts = {
        loading: 'Loading...',
        fetchError: 'Error fetching subscription info',
        cancelConfirmation: 'Are you sure you want to cancel?',
        cancelSuccess: 'Subscription cancelled successfully',
        cancelError: 'Error cancelling subscription',
        noActiveSubscription: 'No active subscription',
        info: 'Subscription Information',
        status: 'Status',
        nextPayment: 'Next Payment',
        cancelButton: 'Cancel Subscription',
        statusTypes: {
            active: 'Active',
            cancelled: 'Cancelled',
            no_subscription: 'No Subscription'
        },
    };

    beforeAll(() => {
        originalConsoleLog = console.log;
        console.log = jest.fn();
    });

    afterAll(() => {
        console.log = originalConsoleLog;
    });

    beforeEach(() => {
        mockGetSubscriptionInfo = jest.fn();
        mockCancelSubscription = jest.fn();
    });

    it('renders loading state initially', async () => {
        mockGetSubscriptionInfo.mockResolvedValue({ status: 'no_subscription' });
    
        render(
          <SubscriptionInfo 
            getSubscriptionInfo={mockGetSubscriptionInfo}
            cancelSubscription={mockCancelSubscription}
            isUserLoggedIn={true}
            texts={defaultTexts}
          />
        );
    
        expect(screen.getByText(defaultTexts.loading)).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText(defaultTexts.noActiveSubscription)).toBeInTheDocument();
        });
    });

    it('displays subscription info when data is loaded', async () => {
        const mockSubscriptionInfo = {
            status: 'active',
            nextPaymentDate: { seconds: 1672531200 }, // January 1, 2023
        };

        mockGetSubscriptionInfo.mockResolvedValue(mockSubscriptionInfo);

        render(
          <SubscriptionInfo 
            getSubscriptionInfo={mockGetSubscriptionInfo}
            cancelSubscription={mockCancelSubscription}
            isUserLoggedIn={true}
            texts={defaultTexts}
          />
        );

        await waitFor(() => {
            expect(screen.getByText(defaultTexts.info)).toBeInTheDocument();
            expect(screen.getByText(`${defaultTexts.status}: ${defaultTexts.statusTypes.active}`)).toBeInTheDocument();
            expect(screen.getByText((content) => content.startsWith(defaultTexts.nextPayment))).toBeInTheDocument();
            expect(screen.getByText(defaultTexts.cancelButton)).toBeInTheDocument();
        });
    });

    it('displays no active subscription message when appropriate', async () => {
        mockGetSubscriptionInfo.mockResolvedValue({ status: 'no_subscription' });
    
        render(
          <SubscriptionInfo 
            getSubscriptionInfo={mockGetSubscriptionInfo}
            cancelSubscription={mockCancelSubscription}
            isUserLoggedIn={true}
            texts={defaultTexts}
          />
        );
    
        await waitFor(() => {
            expect(screen.getByText(defaultTexts.noActiveSubscription)).toBeInTheDocument();
        });
    });

    it('calls cancelSubscription when cancel button is clicked', async () => {
        const mockSubscriptionInfo = {
            status: 'active',
            nextPaymentDate: { seconds: Date.now() / 1000 },
        };

        mockGetSubscriptionInfo
            .mockResolvedValueOnce(mockSubscriptionInfo)
            .mockResolvedValueOnce({ status: 'cancelled' }); // Update this line

        mockCancelSubscription.mockResolvedValue(undefined);

        window.confirm = jest.fn().mockReturnValue(true);
        window.alert = jest.fn();

        render(
          <SubscriptionInfo 
            getSubscriptionInfo={mockGetSubscriptionInfo}
            cancelSubscription={mockCancelSubscription}
            isUserLoggedIn={true}
            texts={defaultTexts}
          />
        );

        await waitFor(() => {
            expect(screen.getByText(defaultTexts.cancelButton)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(defaultTexts.cancelButton));

        await waitFor(() => {
            expect(mockCancelSubscription).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(defaultTexts.cancelSuccess);
        });

        // Update these expectations
        await waitFor(() => {
            expect(screen.getByText(`${defaultTexts.status}: ${defaultTexts.statusTypes.cancelled}`)).toBeInTheDocument();
        });
        expect(screen.queryByText(defaultTexts.cancelButton)).not.toBeInTheDocument();
    });

    it('does not fetch subscription info when user is not logged in', async () => {
        render(
          <SubscriptionInfo 
            getSubscriptionInfo={mockGetSubscriptionInfo}
            cancelSubscription={mockCancelSubscription}
            isUserLoggedIn={false}
            texts={defaultTexts}
          />
        );

        await waitFor(() => {
            expect(mockGetSubscriptionInfo).not.toHaveBeenCalled();
            expect(screen.queryByText(defaultTexts.loading)).not.toBeInTheDocument();
        });
    });
});