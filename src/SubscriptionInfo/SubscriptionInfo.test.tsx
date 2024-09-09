import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SubscriptionInfo from './SubscriptionInfo';
import exp from 'constants';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' },
    }),
}));

describe('SubscriptionInfo', () => {
    let mockGetSubscriptionInfo: jest.Mock;
    let mockCancelSubscription: jest.Mock;
    let originalConsoleLog: typeof console.log;

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
          />
        );
    
        expect(screen.getByText('common.loading')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('subscription.noActiveSubscription')).toBeInTheDocument();
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
          />
        );

        await waitFor(() => {
            expect(screen.getByText('subscription.info')).toBeInTheDocument();
            expect(screen.getByText('subscription.status: subscription.statusTypes.active')).toBeInTheDocument();
            expect(screen.getByText(/subscription.nextPayment:/)).toBeInTheDocument();
            expect(screen.getByText((content) => {
                return content.startsWith('subscription.nextPayment:') &&
                    content.includes('1') &&
                    content.includes('1') &&
                    content.includes('2023');
            })).toBeInTheDocument();
            expect(screen.getByText('subscription.cancelButton')).toBeInTheDocument();
        });
    });

    it('displays no active subscription message when appropriate', async () => {
        mockGetSubscriptionInfo.mockResolvedValue({ status: 'no_subscription' });
    
        render(
          <SubscriptionInfo 
            getSubscriptionInfo={mockGetSubscriptionInfo}
            cancelSubscription={mockCancelSubscription}
            isUserLoggedIn={true} 
          />
        );
    
        await waitFor(() => {
            expect(screen.getByText('subscription.noActiveSubscription')).toBeInTheDocument();
        });
    });

    it('calls cancelSubscription when cancel button is clicked', async () => {
        const mockSubscriptionInfo = {
            status: 'active',
            nextPaymentDate: { seconds: Date.now() / 1000 },
        };

        mockGetSubscriptionInfo
            .mockResolvedValueOnce(mockSubscriptionInfo)
            .mockResolvedValueOnce({ ...mockSubscriptionInfo, status: 'cancelled' });

        mockCancelSubscription.mockResolvedValue(undefined);

        window.confirm = jest.fn().mockReturnValue(true);
        window.alert = jest.fn();

        render(
          <SubscriptionInfo 
            getSubscriptionInfo={mockGetSubscriptionInfo}
            cancelSubscription={mockCancelSubscription}
            isUserLoggedIn={true} 
          />
        );

        await waitFor(() => {
            expect(screen.getByText('subscription.cancelButton')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('subscription.cancelButton'));

        await waitFor(() => {
            expect(mockCancelSubscription).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('subscription.cancelSuccess');
        });

        expect(screen.getByText('subscription.noActiveSubscription')).toBeInTheDocument();
        //expect(screen.getByText(/subscription\.statusTypes\.cancelled/)).toBeInTheDocument();
    });

    it('does not fetch subscription info when user is not logged in', async () => {
        render(
          <SubscriptionInfo 
            getSubscriptionInfo={mockGetSubscriptionInfo}
            cancelSubscription={mockCancelSubscription}
            isUserLoggedIn={false} 
          />
        );

        await waitFor(() => {
            expect(mockGetSubscriptionInfo).not.toHaveBeenCalled();
            expect(screen.queryByText('common.loading')).not.toBeInTheDocument();
        });
    });
});