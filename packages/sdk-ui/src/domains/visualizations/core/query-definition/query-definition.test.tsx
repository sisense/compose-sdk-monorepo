import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import type { Attribute, FilterRelations, Measure } from '@sisense/sdk-data';
import { createAttribute, createMeasure, filterFactory } from '@sisense/sdk-data';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { i18nextInstance } from '@/infra/translation/initialize-i18n';

import { QueryDefinition } from './query-definition';
import { QueryPill } from './query-pill';
import type { QueryPillItem } from './types';

function renderWithI18n(ui: ReactElement) {
  return render(<I18nextProvider i18n={i18nextInstance}>{ui}</I18nextProvider>);
}

describe('QueryPill', () => {
  it('renders label and applies category styling', () => {
    const item: QueryPillItem = {
      type: 'pill',
      label: 'Sum of Sales',
      category: 'measure',
      id: 'm1',
    };
    renderWithI18n(<QueryPill item={item} />);
    expect(screen.getByText('Sum of Sales')).toBeInTheDocument();
  });

  it('renders dimension pill', () => {
    const item: QueryPillItem = { type: 'pill', label: 'Region', category: 'dimension' };
    renderWithI18n(<QueryPill item={item} />);
    expect(screen.getByText('Region')).toBeInTheDocument();
  });

  it('shows tooltip with Type and Formula for measure with name', async () => {
    const user = userEvent.setup();
    const item: QueryPillItem = {
      type: 'pill',
      label: 'Sum of Sales',
      category: 'measure',
      tooltipData: {
        name: 'Sum of Sales',
        aggregation: 'sum',
        attribute: {
          name: 'Revenue',
          composeCode: 'DM.Geography.Region',
        },
      } as unknown as Measure,
    };
    renderWithI18n(<QueryPill item={item} showTooltip />);
    await user.hover(screen.getByText('Sum of Sales'));
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Type: Measure');
      expect(screen.getByRole('tooltip')).toHaveTextContent('Formula:');
    });
  });

  it('shows dimension tooltip with column and formula from DM compose path', async () => {
    const user = userEvent.setup();
    const item: QueryPillItem = {
      type: 'pill',
      label: 'Product Category',
      category: 'dimension',
      tooltipData: {
        name: 'Product Category',
        attribute: { name: 'Product Category' },
        composeCode: 'DM.Category.Category',
      } as unknown as Attribute,
    };
    renderWithI18n(<QueryPill item={item} showTooltip />);
    await user.hover(screen.getByText('Product Category'));
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Type: Dimension');
      expect(screen.getByRole('tooltip')).toHaveTextContent('Column: Category');
      expect(screen.getByRole('tooltip')).toHaveTextContent('Formula: Category');
    });
  });

  it('shows filter tooltip with parsed composeCode formula', async () => {
    const user = userEvent.setup();
    const item: QueryPillItem = {
      type: 'pill',
      label: 'Region',
      category: 'filter',
      tooltipData: {
        composeCode: "filterFactory.members(DM.Geography.Region, ['North', 'South'])",
        attribute: { name: 'Region' },
      } as unknown as FilterRelations,
    };
    renderWithI18n(<QueryPill item={item} showTooltip />);
    await user.hover(screen.getByText('Region'));
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Type: Filter');
      expect(screen.getByRole('tooltip')).toHaveTextContent('Formula:');
      expect(screen.getByRole('tooltip')).not.toHaveTextContent('Formula: -');
    });
  });

  it('renders tooltip for real exclude filter', async () => {
    const user = userEvent.setup();
    const attr = createAttribute({
      name: 'Country',
      type: 'text-attribute',
      expression: '[Country.Country]',
    });
    const filter = filterFactory.exclude(
      filterFactory.members(attr, ['United States', 'United Kingdom']),
    );

    const item: QueryPillItem = {
      type: 'pill',
      label: 'Country',
      category: 'filter',
      tooltipData: filter,
    };
    renderWithI18n(<QueryPill item={item} showTooltip />);
    await user.hover(screen.getByText('Country'));
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Type: Filter');
    });
  });

  it('does not show tooltip when showTooltip is false', async () => {
    const user = userEvent.setup();
    const item: QueryPillItem = {
      type: 'pill',
      label: 'X',
      category: 'measure',
      tooltipData: { name: 'X' } as unknown as Measure,
    };
    renderWithI18n(<QueryPill item={item} showTooltip={false} />);
    await user.hover(screen.getByText('X'));
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});

describe('QueryDefinition', () => {
  it('returns null when query has no dimensions, measures, or filters', () => {
    const { container } = renderWithI18n(<QueryDefinition query={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders measures and dimensions with connectors', () => {
    const attr = createAttribute({
      name: 'Region',
      type: 'text-attribute',
      expression: '[Geography.Region]',
    });
    const measureAttr = createAttribute({
      name: 'Revenue',
      type: 'numeric',
      expression: '[Commerce.Revenue]',
    });
    const measure = createMeasure({
      name: 'Sum of Sales',
      aggregation: 'sum',
      attribute: measureAttr,
    });
    renderWithI18n(
      <QueryDefinition
        query={{
          measures: [measure],
          dimensions: [attr],
        }}
      />,
    );
    expect(screen.getByText('Sum of Sales')).toBeInTheDocument();
    expect(screen.getByText('Region')).toBeInTheDocument();
    expect(screen.getByText('by')).toBeInTheDocument();
  });

  it('shows "Show N more" when more than 4 pills; expands and collapses', async () => {
    const attr = createAttribute({
      name: 'Region',
      type: 'text-attribute',
      expression: '[Geography.Region]',
    });
    const measureAttr = createAttribute({
      name: 'Revenue',
      type: 'numeric',
      expression: '[Commerce.Revenue]',
    });
    const measure = createMeasure({
      name: 'Sum of Sales',
      aggregation: 'sum',
      attribute: measureAttr,
    });
    const dimensions = [
      attr,
      createAttribute({
        name: 'Category',
        type: 'text-attribute',
        expression: '[Category.Category]',
      }),
      createAttribute({
        name: 'Product',
        type: 'text-attribute',
        expression: '[Product.Name]',
      }),
      createAttribute({
        name: 'Year',
        type: 'date',
        expression: '[Date.Year]',
      }),
    ];
    renderWithI18n(
      <QueryDefinition
        query={{
          measures: [measure],
          dimensions,
        }}
      />,
    );
    const user = userEvent.setup();
    expect(screen.getByRole('button', { name: /Show 1 more/i })).toBeInTheDocument();
    expect(screen.queryByText('Year')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Show 1 more/i }));
    expect(screen.getByText('Year')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Show less/i }));
    expect(screen.queryByText('Year')).not.toBeInTheDocument();
  });

  it('renders filters with "where" connector', () => {
    const attr = createAttribute({
      name: 'Region',
      type: 'text-attribute',
      expression: '[Geography.Region]',
    });
    const filter = filterFactory.members(attr, ['North']);
    renderWithI18n(
      <QueryDefinition
        query={{
          dimensions: [attr],
          filters: [filter],
        }}
      />,
    );
    expect(screen.getByText('where')).toBeInTheDocument();
    expect(screen.getAllByText('Region')).toHaveLength(2);
  });
});
