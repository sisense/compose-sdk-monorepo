import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { i18nextInstance } from '@/infra/translation/initialize-i18n';

import { QueryPill } from './query-pill';
import type { QueryPillItem } from './types';

function renderWithI18n(ui: ReactElement) {
  return render(<I18nextProvider i18n={i18nextInstance}>{ui}</I18nextProvider>);
}

describe('GroupedFilterTooltip', () => {
  it('collapses to 10 rows and expands on Show more', async () => {
    const user = userEvent.setup();
    const lines = Array.from({ length: 11 }, (_, i) => ({
      column: 'Country',
      value: `V${i}`,
    }));
    const item: QueryPillItem = {
      type: 'pill',
      label: 'Dashboard Filters',
      category: 'filter',
      groupedTooltipLines: lines,
    };
    renderWithI18n(<QueryPill item={item} showTooltip />);
    await user.hover(screen.getByText('Dashboard Filters'));
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Country: V0');
    expect(tooltip).toHaveTextContent('Country: V9');
    expect(tooltip).not.toHaveTextContent('Country: V10');
    const showMore = screen.getByRole('button', { name: /Show 1 more/i });
    expect(showMore).toHaveStyle({ color: '#1FAFF3' });
    await user.click(showMore);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Country: V10');
    expect(screen.queryByRole('button', { name: /Show less/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Show 1 more/i })).not.toBeInTheDocument();
  });
});
