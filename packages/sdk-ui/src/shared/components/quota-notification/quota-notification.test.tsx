import { I18nextProvider } from 'react-i18next';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { i18nextInstance } from '../../../infra/translation/initialize-i18n.js';
import { translation } from '../../../infra/translation/resources/en.js';
import * as useQuotaNotificationModule from '../../hooks/use-quota-notification.js';
import { QuotaNotification } from './quota-notification.js';

// Mock the useQuotaNotification hook
vi.mock('../../hooks/use-quota-notification');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <I18nextProvider i18n={i18nextInstance}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </I18nextProvider>
  );
};

describe('QuotaNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when loading', () => {
    vi.spyOn(useQuotaNotificationModule, 'useQuotaNotification').mockReturnValue({
      enabled: true,
      quotaState: null,
      isLoading: true,
      error: null,
    });

    const { container } = render(<QuotaNotification />, { wrapper: createWrapper() });
    expect(container.firstChild).toBeNull();
  });

  it('returns null when quotaState is null', () => {
    vi.spyOn(useQuotaNotificationModule, 'useQuotaNotification').mockReturnValue({
      enabled: true,
      quotaState: null,
      isLoading: false,
      error: null,
    });

    const { container } = render(<QuotaNotification />, { wrapper: createWrapper() });
    expect(container.firstChild).toBeNull();
  });

  it('shows error banner when credit is exceeded', () => {
    vi.spyOn(useQuotaNotificationModule, 'useQuotaNotification').mockReturnValue({
      enabled: true,
      quotaState: {
        initialBalance: 100,
        currentBalance: 0,
        usagePercentage: 100,
        isWarning: false,
        isExceeded: true,
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(<QuotaNotification />, { wrapper: createWrapper() });
    expect(container).toMatchSnapshot();
    expect(screen.getByText(translation.ai.quota.exceededErrorTitle)).toBeInTheDocument();
    expect(screen.getByText(translation.ai.quota.exceededErrorDescription)).toBeInTheDocument();
  });

  it('shows warning banner when credit usage >= 85%', () => {
    vi.spyOn(useQuotaNotificationModule, 'useQuotaNotification').mockReturnValue({
      enabled: true,
      quotaState: {
        initialBalance: 100,
        currentBalance: 10,
        usagePercentage: 90,
        isWarning: true,
        isExceeded: false,
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(<QuotaNotification />, { wrapper: createWrapper() });
    expect(container).toMatchSnapshot();
    expect(
      screen.getByText(
        translation.ai.quota.warningDescription.replace('{{usagePercentage}}', '90'),
      ),
    ).toBeInTheDocument();
  });

  it('hides warning banner after close button is clicked', async () => {
    vi.spyOn(useQuotaNotificationModule, 'useQuotaNotification').mockReturnValue({
      enabled: true,
      quotaState: {
        initialBalance: 100,
        currentBalance: 10,
        usagePercentage: 90,
        isWarning: true,
        isExceeded: false,
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(<QuotaNotification />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByLabelText('Dismiss alert'));
    expect(container.firstChild).toBeNull();
  });

  it('returns null when credit is normal', () => {
    vi.spyOn(useQuotaNotificationModule, 'useQuotaNotification').mockReturnValue({
      enabled: true,
      quotaState: {
        initialBalance: 100,
        currentBalance: 50,
        usagePercentage: 50,
        isWarning: false,
        isExceeded: false,
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(<QuotaNotification />, { wrapper: createWrapper() });
    expect(container.firstChild).toBeNull();
  });

  it('returns null when disabled', () => {
    vi.spyOn(useQuotaNotificationModule, 'useQuotaNotification').mockReturnValue({
      enabled: false,
      quotaState: null,
      isLoading: false,
      error: null,
    });

    const { container } = render(<QuotaNotification enabled={false} />, {
      wrapper: createWrapper(),
    });
    expect(container.firstChild).toBeNull();
  });

  it('returns null when feature flags disable quota notification', () => {
    vi.spyOn(useQuotaNotificationModule, 'useQuotaNotification').mockReturnValue({
      enabled: false,
      quotaState: null,
      isLoading: false,
      error: null,
    });

    const { container } = render(<QuotaNotification />, { wrapper: createWrapper() });
    expect(container.firstChild).toBeNull();
  });
});
