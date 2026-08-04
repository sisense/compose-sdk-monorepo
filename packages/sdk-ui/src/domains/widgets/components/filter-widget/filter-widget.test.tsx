/** @vitest-environment jsdom */
import { createAttribute, filterFactory } from '@sisense/sdk-data';
import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FilterWidget } from './filter-widget.js';

vi.mock('@/infra/decorators/component-decorators/as-sisense-component', () => ({
  // any: passthrough HOC mock — the wrapped component's concrete shape is irrelevant here.
  asSisenseComponent: () => (Component: any) => Component,
}));

vi.mock('@/domains/widgets/hooks/use-track-widget-init', () => ({
  useTrackWidgetInit: () => {},
}));

vi.mock('@/domains/widgets/hooks/use-widget-header-management', () => ({
  useWidgetHeaderManagement: () => ({ headerConfig: {}, titleEditor: undefined }),
}));

// Stub the container so we can assert whether it wraps the dropdown and with what title.
vi.mock('@/domains/widgets/shared/widget-container/widget-container.js', () => ({
  // any: lightweight stub reading only the props under test; full prop typing adds no value here.
  WidgetContainer: ({ title, dataSetName, children }: any) => (
    <div data-testid="widget-container" data-title={title} data-dataset={dataSetName ?? ''}>
      {children}
    </div>
  ),
}));

// Stub the dropdown; expose its wiring props so we can trigger the widget's onChange bridge.
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
    const { getByTestId } = render(<FilterWidget attribute={attr} />);
    const container = getByTestId('widget-container');
    expect(container).toBeInTheDocument();
    expect(container.getAttribute('data-title')).toBe('Country');
    expect(getByTestId('dropdown')).toBeInTheDocument();
  });

  it('uses the explicit title when provided', () => {
    const { getByTestId } = render(<FilterWidget attribute={attr} title="My Filter" />);
    expect(getByTestId('widget-container').getAttribute('data-title')).toBe('My Filter');
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
});
