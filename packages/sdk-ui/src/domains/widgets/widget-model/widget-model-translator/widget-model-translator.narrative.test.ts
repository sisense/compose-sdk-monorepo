import { describe, expect, it } from 'vitest';

import { narrativeWidgetDto } from '@/domains/widgets/components/widget-by-id/__mocks__/narrative-widget-dto.js';

import {
  fromNarrativeWidgetProps,
  fromWidgetDto,
  fromWidgetProps,
  toChartWidgetProps,
  toNarrativeWidgetProps,
  toWidgetDto,
  toWidgetProps,
} from './widget-model-translator.js';

describe('widgetModelTranslator — dashboard narrative widget', () => {
  it('reads the Fusion `dashboardnarrative` DTO as a `narrative` widget with no data options', () => {
    const model = fromWidgetDto(narrativeWidgetDto);

    expect(model.widgetType).toBe('narrative');
    expect(model.chartType).toBeUndefined();
    expect(model.customWidgetType).toBe('');
    expect(model.dataOptions).toEqual({});
    expect(model.title).toBe('Dashboard Narrative');
  });

  it('produces narrative widget props carrying the title and container style only', () => {
    const props = toWidgetProps(fromWidgetDto(narrativeWidgetDto));

    expect(props).toMatchObject({
      widgetType: 'narrative',
      id: narrativeWidgetDto.oid,
      title: 'Dashboard Narrative',
    });
    expect(props).not.toHaveProperty('dataOptions');
    expect(props).not.toHaveProperty('customWidgetType');
  });

  it('carries the title and the container style options into narrative widget props', () => {
    const model = fromWidgetDto(narrativeWidgetDto);
    const styleOptions = { border: true, borderColor: '#D5D5D5', header: { dividerLine: true } };

    const props = toNarrativeWidgetProps({ ...model, styleOptions });

    expect(props).toEqual({ title: 'Dashboard Narrative', styleOptions });
  });

  it('round-trips back to a `dashboardnarrative` DTO with no data panels', () => {
    const model = fromWidgetDto(narrativeWidgetDto);

    const dto = toWidgetDto(model);

    expect(dto.type).toBe('dashboardnarrative');
    expect(dto.subtype).toBe('dashboardnarrative');
    // The DTO pipeline appends the generic `filters` panel to every widget; nothing else may appear.
    expect(dto.metadata.panels.filter((panel) => panel.name !== 'filters')).toEqual([]);
    expect(dto.title).toBe('Dashboard Narrative');
  });

  it('builds a model from code-composed narrative widget props', () => {
    const model = fromWidgetProps({
      id: 'narrative-1',
      widgetType: 'narrative',
      title: 'AI Dashboard Summary',
    });

    expect(model.oid).toBe('narrative-1');
    expect(model.widgetType).toBe('narrative');
    expect(model.title).toBe('AI Dashboard Summary');
    expect(model.dataOptions).toEqual({});
  });

  it('needs the dashboard data source to become a DTO from code-composed props', () => {
    const model = fromNarrativeWidgetProps({ title: 'AI Dashboard Summary' });

    // No data source of its own — the caller (the dashboard) must supply one.
    expect(() => toWidgetDto(model)).toThrow();

    const dto = toWidgetDto(model, {
      title: 'Sample ECommerce',
      id: 'localhost_aSampleIAAaECommerce',
      address: 'LocalHost',
    });

    expect(dto.type).toBe('dashboardnarrative');
    expect(dto.title).toBe('AI Dashboard Summary');
    expect(dto.datasource).toMatchObject({ id: 'localhost_aSampleIAAaECommerce' });
  });

  it('refuses chart translations for the narrative widget', () => {
    const model = fromWidgetDto(narrativeWidgetDto);

    expect(() => toChartWidgetProps(model)).toThrow();
  });
});
