import { I18nextProvider } from 'react-i18next';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { i18nextInstance } from '../../../infra/translation/initialize-i18n.js';
import { translation } from '../../../infra/translation/resources/en.js';
import * as useQuotaNotificationModule from '../../hooks/use-quota-notification.js';
import * as useQuotaWarningDismissedModule from '../../hooks/use-quota-warning-dismissed.js';
import { QuotaNotification } from './quota-notification.js';

// Mock the useQuotaNotification hook
vi.mock('../../hooks/use-quota-notification');
// Mock the useQuotaWarningDismissed hook to avoid sessionStorage in tests
vi.mock('../../hooks/use-quota-warning-dismissed');

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
    vi.spyOn(useQuotaWarningDismissedModule, 'useQuotaWarningDismissed').mockReturnValue([
      false,
      vi.fn(),
    ]);
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

  it('does not show warning banner when dismissed', () => {
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

    const { container } = render(<QuotaNotification warningDismissed={true} />, {
      wrapper: createWrapper(),
    });
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

  it('calls onDismissWarning when warning banner is clicked (uncontrolled)', () => {
    const setPersistedDismissed = vi.fn();
    vi.spyOn(useQuotaWarningDismissedModule, 'useQuotaWarningDismissed').mockReturnValue([
      false,
      setPersistedDismissed,
    ]);
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

    render(<QuotaNotification />, { wrapper: createWrapper() });
    const alert = screen.getByRole('alert');
    fireEvent.click(alert);

    expect(setPersistedDismissed).toHaveBeenCalledWith(true);
  });

  it('calls onDismissWarning when warning banner is clicked (controlled)', () => {
    const onDismissWarning = vi.fn();
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

    render(<QuotaNotification warningDismissed={false} onDismissWarning={onDismissWarning} />, {
      wrapper: createWrapper(),
    });
    const alert = screen.getByRole('alert');
    fireEvent.click(alert);

    expect(onDismissWarning).toHaveBeenCalledTimes(1);
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
