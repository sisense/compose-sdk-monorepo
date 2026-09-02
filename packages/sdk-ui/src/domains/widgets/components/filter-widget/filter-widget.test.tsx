/** @vitest-environment jsdom */
import { createAttribute, filterFactory } from '@sisense/sdk-data';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';

import { FilterWidget } from './filter-widget.js';

vi.mock('@/infra/decorators/component-decorators/as-sisense-component', () => ({
  // any: passthrough HOC mock — the wrapped component's concrete shape is irrelevant here.
  asSisenseComponent: () => (Component: any) => Component,
}));

vi.mock('@/domains/widgets/hooks/use-track-widget-init', () => ({
  useTrackWidgetInit: () => {},
}));

// Stub the title feature: it returns the header config carrying a title item, so the widget's
// composition can be asserted without pulling in the inline editor and i18n.
vi.mock('@/domains/widgets/shared/widget-header/features/use-widget-header-title', () => ({
  useWidgetHeaderTitle: (headerConfig: object | undefined, { title }: { title?: string }) => ({
    ...headerConfig,
    items: [
      {
        id: 'widget-header-title',
        component: () => <div data-component="title">{title}</div>,
      },
    ],
  }),
}));

// Stub the container so we can assert whether it wraps the dropdown, and render the header items it
// was given — the widget's title now reaches the header as an item, not as a container prop.
vi.mock('@/domains/widgets/shared/widget-container/widget-container.js', () => ({
  // any: lightweight stub reading only the props under test; full prop typing adds no value here.
  WidgetContainer: ({ headerConfig, styleOptions, children }: any) => (
    <div
      data-testid="widget-container"
      data-bg={styleOptions?.backgroundColor ?? ''}
      data-header-bg={styleOptions?.header?.backgroundColor ?? ''}
      data-header-item-ids={(headerConfig?.items ?? []).map((i: any) => i.id).join(',')}
    >
      {(headerConfig?.items ?? []).map((item: any) => (
        <div key={item.id} data-testid={`header-item-${item.id}`}>
          {item.component({ size: { width: 28, height: 28 } })}
        </div>
      ))}
      {children}
    </div>
  ),
}));

// Stub the dropdown; expose its wiring props so we can trigger the widget's onChange bridge.
vi.mock('@/infra/contexts/theme-provider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/infra/contexts/theme-provider')>();
  return {
    ...actual,
    // any: stub records only the chart background under test.
    ThemeProvider: ({ theme, children }: any) => (
      <div data-testid="content-theme" data-chart-bg={theme?.chart?.backgroundColor ?? ''}>
        {children}
      </div>
    ),
  };
});

vi.mock('./filter-widget-dropdown', () => ({
  // any: stub only forwards the wiring callbacks under test; full prop typing adds no value here.
  FilterWidgetDropdown: ({ onFilterUpdate, onDateLevelChange, isMultiselect }: any) => (
    <div data-testid="dropdown" data-multiselect={String(isMultiselect)}>
      <button
        data-testid="fire-filter"
        onClick={() => onFilterUpdate(filterFactory.members(attr, ['France']))}
      />
      <button data-testid="fire-filter-null" onClick={() => onFilterUpdate(null)} />
      <button data-testid="fire-datelevel" onClick={() => onDateLevelChange({ name: 'Years' })} />
    </div>
  ),
}));

const attr = createAttribute({ name: 'Country', expression: '[Country.Country]', type: 'text' });

describe('FilterWidget', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders inside WidgetContainer by default, titled from the attribute name', () => {
    const { getByTestId, getByText } = render(<FilterWidget attribute={attr} />);
    expect(getByTestId('widget-container')).toBeInTheDocument();
    expect(getByText('Country')).toBeInTheDocument();
    expect(getByTestId('dropdown')).toBeInTheDocument();
  });

  it('uses the explicit title when provided', () => {
    const { getByText } = render(<FilterWidget attribute={attr} title="My Filter" />);
    expect(getByText('My Filter')).toBeInTheDocument();
  });

  it('composes only the header features it needs — no info button is created', () => {
    const { getByTestId } = render(<FilterWidget attribute={attr} />);

    // A filter control has no query result to describe or refresh.
    expect(getByTestId('widget-container').getAttribute('data-header-item-ids')).toBe(
      'widget-header-title',
    );
  });

  it('renders without a container when containerless', () => {
    const { getByTestId, queryByTestId } = render(
      <FilterWidget attribute={attr} containerless={true} />,
    );
    expect(queryByTestId('widget-container')).toBeNull();
    expect(getByTestId('dropdown')).toBeInTheDocument();
  });

  it('bridges a dropdown selection to a filter/changed event', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <FilterWidget attribute={attr} containerless={true} onChange={onChange} />,
    );
    fireEvent.click(getByTestId('fire-filter'));
    const event = onChange.mock.calls.map((c) => c[0]).find((e) => e.type === 'filter/changed');
    expect(event).toBeDefined();
    expect(event.payload.filter.members).toEqual(['France']);
  });

  it('bridges a cleared selection (null) to a filter/changed event', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <FilterWidget attribute={attr} containerless={true} onChange={onChange} />,
    );
    fireEvent.click(getByTestId('fire-filter-null'));
    expect(onChange).toHaveBeenCalledWith({ type: 'filter/changed', payload: { filter: null } });
  });

  it('bridges a granularity change to a dateLevel/changed event', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <FilterWidget attribute={attr} containerless={true} onChange={onChange} />,
    );
    fireEvent.click(getByTestId('fire-datelevel'));
    expect(onChange).toHaveBeenCalledWith({
      type: 'dateLevel/changed',
      payload: { attribute: { name: 'Years' } },
    });
  });

  it('passes isMultiselect through to the dropdown', () => {
    const { getByTestId } = render(
      <FilterWidget attribute={attr} containerless={true} isMultiselect={false} />,
    );
    expect(getByTestId('dropdown').getAttribute('data-multiselect')).toBe('false');
  });

  it('persists the attribute name as the title when no title is set', () => {
    const onChange = vi.fn();
    render(<FilterWidget attribute={attr} containerless={true} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'Country' },
    });
  });

  it('does not override an explicitly provided title', () => {
    const onChange = vi.fn();
    render(
      <FilterWidget attribute={attr} title="My Filter" containerless={true} onChange={onChange} />,
    );
    expect(onChange).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'title/changed' }));
  });

  it('does not repeatedly emit the default title on re-render', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <FilterWidget attribute={attr} containerless={true} onChange={onChange} />,
    );
    rerender(<FilterWidget attribute={attr} containerless={true} onChange={onChange} />);
    const titleEvents = onChange.mock.calls.filter((c) => c[0]?.type === 'title/changed');
    expect(titleEvents).toHaveLength(1);
  });

  /* A date level is part of the attribute's name (`Years in Date`), so a widget that follows the
     name renames itself — and any host-linked filter tile that mirrors that name — every time
     the reader picks a different granularity. A name is given once and belongs to the reader. */
  it('does not rename itself when only the date level changes', () => {
    const onChange = vi.fn();
    const years = createAttribute({
      name: 'Years in Date',
      expression: '[Commerce.Date (Calendar)]',
      type: 'datelevel',
    });
    const quarters = createAttribute({
      name: 'Quarters in Date',
      expression: '[Commerce.Date (Calendar)]',
      type: 'datelevel',
    });
    const { rerender } = render(
      <FilterWidget attribute={years} containerless={true} onChange={onChange} />,
    );
    onChange.mockClear();

    rerender(<FilterWidget attribute={quarters} containerless={true} onChange={onChange} />);

    expect(onChange.mock.calls.filter((c) => c[0]?.type === 'title/changed')).toHaveLength(0);
  });

  it('still names an unnamed widget after the field, when the field itself changes', () => {
    const onChange = vi.fn();
    const brand = createAttribute({ name: 'Brand', expression: '[Brand.Brand]', type: 'text' });
    const { rerender } = render(
      <FilterWidget attribute={attr} containerless={true} onChange={onChange} />,
    );
    onChange.mockClear();

    rerender(<FilterWidget attribute={brand} containerless={true} onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'Brand' },
    });
  });
});

/**
 * The widget's surface follows the theme's filter panel colour, so it reads as the filters it
 * belongs with. A background set in Widget Style has to keep winning over that default — the
 * two used to compete as CSS rules, where the theme default outranked the reader's choice.
 */
describe('filter widget chrome background', () => {
  const attr = createAttribute({
    name: 'Country',
    expression: '[Commerce.Country]',
    type: 'text',
  });

  it('defaults the card and header to the theme’s filter panel colour', () => {
    render(<FilterWidget attribute={attr} />);

    const container = screen.getByTestId('widget-container');
    const expected = getDefaultThemeSettings().filter.panel.backgroundColor;
    expect(container.getAttribute('data-bg')).toBe(expected);
    expect(container.getAttribute('data-header-bg')).toBe(expected);
  });

  it('lets a Widget Style background outrank the theme default', () => {
    render(
      <FilterWidget
        attribute={attr}
        styleOptions={{ backgroundColor: '#00FF00', header: { backgroundColor: '#0000FF' } }}
      />,
    );

    const container = screen.getByTestId('widget-container');
    expect(container.getAttribute('data-bg')).toBe('#00FF00');
    expect(container.getAttribute('data-header-bg')).toBe('#0000FF');
  });
});

/**
 * Regression: painting the chrome with the filter panel colour must not move the control's
 * background with it. WidgetContainer republishes its own background as `chart.backgroundColor`
 * for its content, and the control's `Background` token resolves from that — so the chrome
 * default leaked into the control and disagreed with what the Filter Style panel displayed.
 */
describe('filter control background is independent of the chrome', () => {
  const attr = createAttribute({
    name: 'Country',
    expression: '[Commerce.Country]',
    type: 'text',
  });

  it('keeps the control on the widget background role, not the panel colour', () => {
    render(<FilterWidget attribute={attr} />);

    const theme = getDefaultThemeSettings();
    expect(screen.getByTestId('content-theme').getAttribute('data-chart-bg')).toBe(
      theme.chart.backgroundColor,
    );
    // The chrome still takes the panel colour — the two are deliberately different roles.
    expect(screen.getByTestId('widget-container').getAttribute('data-bg')).toBe(
      theme.filter.panel.backgroundColor,
    );
  });
});
