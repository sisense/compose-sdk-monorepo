import { getWidgetEntityId } from './widget-entity-id';

describe('getWidgetEntityId', () => {
  it('returns the widget id verbatim (no hash prefix) when present', () => {
    const entityId = getWidgetEntityId(
      { id: '691aed29bdeee48b73688330', dataOptions: {} },
      'chart',
      'line',
    );
    expect(entityId).toBe('691aed29bdeee48b73688330');
    expect(entityId).not.toMatch(/^hash:/);
  });

  it('ignores an empty id and falls back to the prefixed hash', () => {
    const entityId = getWidgetEntityId({ id: '' }, 'text', 'text');
    expect(entityId).toMatch(/^hash:\d+$/);
  });

  it('produces a deterministic hash for the same identity', () => {
    const props = {
      dataOptions: {
        category: [{ column: { name: 'Category' } }],
        value: [{ column: { name: 'Revenue' } }],
      },
      dataSource: 'Sample ECommerce',
    };
    const a = getWidgetEntityId(props, 'chart', 'column');
    const b = getWidgetEntityId({ ...props }, 'chart', 'column');
    expect(a).toBe(b);
  });

  it('changes the hash when the column names differ', () => {
    const base = { dataSource: 'Sample ECommerce' };
    const withRevenue = getWidgetEntityId(
      { ...base, dataOptions: { value: [{ column: { name: 'Revenue' } }] } },
      'chart',
      'column',
    );
    const withCost = getWidgetEntityId(
      { ...base, dataOptions: { value: [{ column: { name: 'Cost' } }] } },
      'chart',
      'column',
    );
    expect(withRevenue).not.toBe(withCost);
  });

  it('changes the hash when the data source differs', () => {
    const dataOptions = { rows: [{ column: { name: 'Category' } }] };
    const first = getWidgetEntityId({ dataOptions, dataSource: 'Cube A' }, 'pivot', 'pivot');
    const second = getWidgetEntityId({ dataOptions, dataSource: 'Cube B' }, 'pivot', 'pivot');
    expect(first).not.toBe(second);
  });

  it('changes the hash when the widget type/name differ', () => {
    const props = { dataOptions: { value: [{ column: { name: 'Revenue' } }] } };
    const asColumn = getWidgetEntityId(props, 'chart', 'column');
    const asLine = getWidgetEntityId(props, 'chart', 'line');
    expect(asColumn).not.toBe(asLine);
  });

  it('changes the hash when the widget title differs', () => {
    const props = {
      dataOptions: { value: [{ column: { name: 'Revenue' } }] },
      dataSource: 'Sample ECommerce',
    };
    const byMonth = getWidgetEntityId({ ...props, title: 'Revenue by Month' }, 'chart', 'column');
    const byYear = getWidgetEntityId({ ...props, title: 'Revenue by Year' }, 'chart', 'column');
    expect(byMonth).not.toBe(byYear);
  });

  it('handles bare (unstyled) columns and DataSourceInfo objects', () => {
    const entityId = getWidgetEntityId(
      {
        dataOptions: { value: [{ name: 'Revenue', aggregation: 'sum' }] },
        dataSource: { title: 'Sample ECommerce', type: 'elasticube' },
      },
      'chart',
      'column',
    );
    expect(entityId).toMatch(/^hash:\d+$/);
  });

  it('produces a stable hash for a text widget with no data options or data source', () => {
    const a = getWidgetEntityId({}, 'text', 'text');
    const b = getWidgetEntityId({}, 'text', 'text');
    expect(a).toBe(b);
  });
});
