import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterWidgetSkeleton } from './filter-widget-skeleton.js';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

describe('FilterWidgetSkeleton', () => {
  it('is announced as a loading status', () => {
    render(<FilterWidgetSkeleton />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('aria-label', 'loadingOverlay.label');
  });

  it('takes the size and corner radius the control will have', () => {
    render(<FilterWidgetSkeleton controlStyleOptions={{ size: 'xl', cornerRadius: 'none' }} />);

    expect(screen.getByTestId('filter-widget-skeleton-field')).toHaveStyle({
      height: '40px',
      borderRadius: '0',
    });
  });
});
