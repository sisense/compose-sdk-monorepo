import { act } from 'react';

import { attributeFactory, filterFactory, MembersFilter, MetadataTypes } from '@sisense/sdk-data';
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { ChartWidgetProps } from '@/domains/widgets/components/chart-widget/types';
import {
  isChartWidgetProps,
  isFilterWidgetProps,
  isTextWidgetProps,
} from '@/domains/widgets/components/widget-by-id/utils';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { WidgetHeaderTargets } from '@/domains/widgets/shared/widget-header/widget-header-targets';
import { MenuOptions } from '@/infra/contexts/menu-provider/types';
import { DataPointEventHandler, DataPointsEventHandler } from '@/props';
import { CartesianChartDataOptions, DataPoint } from '@/types';

import { useCommonFilters } from './use-common-filters.js';

describe('useCommonFilters', () => {
  it('should initialize with initial filters', () => {
    const initialFilters = [filterFactory.members(DM.Commerce.AgeRange, ['0-18'])];
    const { result } = renderHook(() => useCommonFilters({ initialFilters }));

    expect(result.current.filters).toEqual(initialFilters);
  });

  describe('setFilters()', () => {
    it('should set all filters', async () => {
      const { result } = renderHook(() => useCommonFilters());
      const newFilters = [filterFactory.members(DM.Commerce.Gender, ['Male'])];
      act(() => {
        result.current.setFilters(newFilters);
      });
      await waitFor(() => {
        expect(result.current.filters).toEqual(newFilters);
      });
    });
  });

  describe('addFilters()', () => {
    it('should add new filter', () => {
      const initialFilters = [filterFactory.members(DM.Commerce.AgeRange, ['0-18'])];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const newFilter = filterFactory.members(DM.Commerce.Gender, ['Male']);
      act(() => {
        result.current.addFilter(newFilter);
      });

      expect(result.current.filters).toEqual([...initialFilters, newFilter]);
    });

    it('should replace existing filter by a new one with the same dimension', () => {
      const initialFilters = [filterFactory.members(DM.Commerce.AgeRange, ['0-18'])];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const newFilter = filterFactory.members(DM.Commerce.AgeRange, ['19-24']);
      act(() => {
        result.current.addFilter(newFilter);
      });

      expect(result.current.filters).toEqual([newFilter]);
    });
  });

  /**
   * Helper function to get property from widget props
   */
  const getProperty = (widget: WidgetProps, key: keyof WidgetProps | keyof ChartWidgetProps) => {
    return isTextWidgetProps(widget)
      ? key === 'dataOptions'
        ? {}
        : []
      : // Dynamic property access across a widget-props union in a test helper; `any` mirrors the
        // previous (implicit-any) behavior so call sites can spread/index the result freely.
        (widget as any)[key];
  };

  /**
   * Helper function to get data point related callback from chart widget props
   */
  const getChartDataPointHandler = (
    widget: WidgetProps,
    key: 'onDataPointClick' | 'onDataPointsSelected',
  ) => {
    // Dynamic handler lookup on chart-widget props in a test helper; `any` mirrors the previous
    // (implicit-any) behavior so the result is assignable to the various handler types.
    return isChartWidgetProps(widget) ? (widget as any)[key] : undefined;
  };

  /**
   * Helper reading the "clear selection" built-in header item input off connected widget props.
   */
  const getClearSelectionButtonItem = (widget: WidgetProps) =>
    isChartWidgetProps(widget)
      ? widget.config?.header?.items?.find(
          (item) => item.id === WidgetHeaderTargets.ClearSelectionButton,
        )
      : undefined;

  describe('connectToWidgetProps()', () => {
    let widgetPropsMock: WidgetProps;
    beforeEach(() => {
      widgetPropsMock = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: {
          category: [DM.Commerce.AgeRange, DM.Commerce.Gender],
          value: [],
          breakBy: [],
        } as CartesianChartDataOptions,
        filters: [],
        highlights: [],
      };
    });

    it('should connect common filters as highlights to widget props by default', () => {
      const initialFilters = [filterFactory.members(DM.Commerce.AgeRange, ['0-18'])];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetProps(widgetPropsMock);

      expect(getProperty(connectedWidget, 'highlights')).toEqual(initialFilters);
      expect(getProperty(connectedWidget, 'filters')).toEqual(
        getProperty(widgetPropsMock, 'filters'),
      );
    });

    it("should ignore 'Include all' filters as highlights", () => {
      const widgetPropsWithTwoCategories = {
        ...widgetPropsMock,
        dataOptions: {
          ...getProperty(widgetPropsMock, 'dataOptions'),
          category: [DM.Commerce.AgeRange, DM.Commerce.Gender],
        },
      };
      const emptyIncludeAllFilter = filterFactory.members(DM.Commerce.Gender, []);
      const meaningfulFilter = filterFactory.members(DM.Commerce.AgeRange, ['0-18']);
      const { result } = renderHook(() =>
        useCommonFilters({ initialFilters: [emptyIncludeAllFilter, meaningfulFilter] }),
      );
      const connectedWidget = result.current.connectToWidgetProps(widgetPropsWithTwoCategories);

      expect(getProperty(connectedWidget, 'highlights')).toEqual([meaningfulFilter]);
      expect(getProperty(connectedWidget, 'filters')).toEqual([]);
    });

    it('should connect common filters as filters to table widget props by default', () => {
      const initialFilters = [filterFactory.members(DM.Commerce.AgeRange, ['0-18'])];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetProps({
        ...widgetPropsMock,
        widgetType: 'chart',
        chartType: 'table',
        dataOptions: {
          columns: [DM.Commerce.AgeRange],
        },
      } as unknown as WidgetProps);

      expect(getProperty(connectedWidget, 'highlights')).toEqual(
        getProperty(widgetPropsMock, 'highlights'),
      );
      expect(getProperty(connectedWidget, 'filters')).toEqual(initialFilters);
    });

    it('should connect common filters as filters to widget props', () => {
      const initialFilters = [filterFactory.members(DM.Commerce.AgeRange, ['0-18'])];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        applyMode: 'filter',
      });

      expect(getProperty(connectedWidget, 'filters')).toEqual(initialFilters);
      expect(getProperty(connectedWidget, 'highlights')).toEqual(
        getProperty(widgetPropsMock, 'highlights'),
      );
    });

    it('should ignore connected filter by id', () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: '123' }),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        ignoreFilters: { ids: ['123'] },
      });

      expect(getProperty(connectedWidget, 'highlights')).toEqual(
        getProperty(widgetPropsMock, 'highlights'),
      );
      expect(getProperty(connectedWidget, 'filters')).toEqual(
        getProperty(widgetPropsMock, 'filters'),
      );
    });

    it('should ignore all connected filters', () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: '123' }),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        ignoreFilters: { all: true },
      });

      expect(getProperty(connectedWidget, 'highlights')).toEqual(
        getProperty(widgetPropsMock, 'highlights'),
      );
      expect(getProperty(connectedWidget, 'filters')).toEqual(
        getProperty(widgetPropsMock, 'filters'),
      );
    });

    it('should select new filter via connected onDataPointClick handler', () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: '123' }),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      let connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      const onDataPointClickHandler: DataPointEventHandler = getChartDataPointHandler(
        connectedWidget,
        'onDataPointClick',
      );

      expect(onDataPointClickHandler).toBeDefined();

      act(() => {
        onDataPointClickHandler?.(
          {
            entries: {
              category: [
                {
                  attribute: DM.Commerce.AgeRange,
                  value: '65+',
                },
              ],
            },
          } as DataPoint,
          {} as PointerEvent,
        );
      });
      // need to reconnect widget to get the latest changes
      connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      expect((getProperty(connectedWidget, 'highlights')?.[0] as MembersFilter).members).toEqual([
        '65+',
      ]);
      expect(
        (getProperty(connectedWidget, 'highlights')?.[0] as MembersFilter).config.guid,
      ).toEqual(initialFilters[0].config.guid);
      expect(getProperty(connectedWidget, 'filters')).toEqual(
        getProperty(widgetPropsMock, 'filters'),
      );
    });

    it('creates a calculated-dimension cross-filter via connected onDataPointClick handler', () => {
      const cdAgeRange = attributeFactory.customFormula(
        'left([Age Range], 2)',
        'left([ageRange], 2)',
        { ageRange: DM.Commerce.AgeRange },
      );
      const cdWidgetProps = {
        ...widgetPropsMock,
        dataOptions: {
          ...(getProperty(widgetPropsMock, 'dataOptions') as CartesianChartDataOptions),
          category: [cdAgeRange],
        },
      } as WidgetProps;

      const { result } = renderHook(() => useCommonFilters());
      let connectedWidget = result.current.connectToWidgetProps(cdWidgetProps, {
        shouldAffectFilters: true,
      });

      const onDataPointClickHandler: DataPointEventHandler = getChartDataPointHandler(
        connectedWidget,
        'onDataPointClick',
      );

      // A widget backed by a calculated dimension must still participate in cross-filtering,
      // so the click handler is registered.
      expect(onDataPointClickHandler).toBeDefined();

      act(() => {
        onDataPointClickHandler?.(
          {
            entries: {
              category: [{ dataOption: cdAgeRange, attribute: cdAgeRange, value: '65' }],
              value: [],
            },
          } as DataPoint,
          {} as PointerEvent,
        );
      });
      // reconnect to observe the resulting filter state
      connectedWidget = result.current.connectToWidgetProps(cdWidgetProps, {
        shouldAffectFilters: true,
      });

      // Matches the widget's own dimension, so it applies as a highlight (like a regular field).
      const highlight = getProperty(connectedWidget, 'highlights')?.[0] as MembersFilter;
      expect(highlight.members).toEqual(['65']);
      // The created filter is a real calculated-dimension filter.
      expect(MetadataTypes.isCalculatedAttribute(highlight.attribute)).toBe(true);
      expect(highlight.attribute.expression).toEqual(cdAgeRange.expression);
      expect(highlight.jaql().jaql.type).toBe('calculated_dimension');
    });

    it('should select new filter via connected onDataPointsSelected handler', () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: '123' }),
      ];

      // openMenu mock that automatically makes the selections
      const openMenu = (options: MenuOptions) => options.itemSections[1].items?.[0].onClick?.();

      const { result } = renderHook(() => useCommonFilters({ initialFilters, openMenu }));
      let connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      const onDataPointsSelectedHandler: DataPointsEventHandler = getChartDataPointHandler(
        connectedWidget,
        'onDataPointsSelected',
      );

      expect(onDataPointsSelectedHandler).toBeDefined();

      act(() => {
        onDataPointsSelectedHandler?.(
          [
            {
              entries: {
                category: [
                  {
                    attribute: DM.Commerce.AgeRange,
                    value: '19-24',
                    displayValue: '19-24',
                  },
                ],
              },
            },
            {
              entries: {
                category: [
                  {
                    attribute: DM.Commerce.AgeRange,
                    value: '65+',
                    displayValue: '65+',
                  },
                ],
              },
            },
          ] as DataPoint[],
          {} as PointerEvent,
        );
      });
      connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      expect((getProperty(connectedWidget, 'highlights')?.[0] as MembersFilter).members).toEqual([
        '19-24',
        '65+',
      ]);
      expect(
        (getProperty(connectedWidget, 'highlights')?.[0] as MembersFilter).config.guid,
      ).toEqual(initialFilters[0].config.guid);
      expect(getProperty(connectedWidget, 'filters')).toEqual(
        getProperty(widgetPropsMock, 'filters'),
      );
    });

    it('should select new filter via connected onDataPointContextMenu handler', () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: '123' }),
      ];
      // openMenu mock that automatically makes the selections
      const openMenu = (options: MenuOptions) => options.itemSections[1].items?.[0].onClick?.();

      const { result } = renderHook(() => useCommonFilters({ initialFilters, openMenu }));
      let connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      const onDataPointContextMenuHandler: DataPointEventHandler = getProperty(
        connectedWidget,
        'onDataPointContextMenu',
      );

      expect(onDataPointContextMenuHandler).toBeDefined();

      act(() => {
        onDataPointContextMenuHandler?.(
          {
            entries: {
              category: [
                {
                  attribute: DM.Commerce.AgeRange,
                  value: '65+',
                  displayValue: '65+',
                },
              ],
            },
          } as DataPoint,
          {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
          } as unknown as PointerEvent,
        );
      });
      connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      expect((getProperty(connectedWidget, 'highlights')[0] as MembersFilter).members).toEqual([
        '65+',
      ]);
      expect((getProperty(connectedWidget, 'highlights')[0] as MembersFilter).config.guid).toEqual(
        initialFilters[0].config.guid,
      );
      expect(getProperty(connectedWidget, 'filters')).toEqual(
        getProperty(connectedWidget, 'filters'),
      );
    });

    it('should assign onBeforeMenuOpen to widget props', () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: '123' }),
      ];
      // openMenu mock that automatically makes the selections
      const openMenu = (options: MenuOptions) => options.itemSections[1].items?.[0].onClick?.();

      const onBeforeMenuOpen = (options: MenuOptions) => options;

      const { result } = renderHook(() =>
        useCommonFilters({ initialFilters, openMenu, onBeforeMenuOpen }),
      );
      const connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      expect(connectedWidget.onBeforeMenuOpen).toBeDefined();
      expect(connectedWidget.onBeforeMenuOpen).toEqual(onBeforeMenuOpen);
    });

    it('should clear selected filters via the connected clear-selection input', async () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: '123' }),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      let connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      const clearSelectionItem = getClearSelectionButtonItem(connectedWidget);

      expect(clearSelectionItem).toBeDefined();
      if (!clearSelectionItem) return;

      render(<>{clearSelectionItem.component({ size: { width: 28, height: 28 } })}</>);

      expect(await screen.findByText('commonFilter.clearSelectionButton')).toBeInTheDocument();

      fireEvent.click(screen.getByText('commonFilter.clearSelectionButton'));

      connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      expect(getProperty(connectedWidget, 'highlights')).toEqual([]);
      expect(getProperty(connectedWidget, 'filters')).toEqual(
        getProperty(widgetPropsMock, 'filters'),
      );
    });

    it('should connect background filter as slice filters by default', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: '123', backgroundFilter }),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetProps(widgetPropsMock);

      expect(getProperty(connectedWidget, 'highlights')).toEqual(initialFilters);
      expect(getProperty(connectedWidget, 'filters')).toEqual([backgroundFilter]);
    });

    it('should connect filter without separate background filter if "filter" mode selected', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: '123', backgroundFilter }),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        applyMode: 'filter',
      });

      expect(getProperty(connectedWidget, 'highlights')).toEqual(
        getProperty(widgetPropsMock, 'highlights'),
      );
      expect(getProperty(connectedWidget, 'filters')).toEqual(initialFilters);
    });

    it('should connect background filter even if containing filter is disabled', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18'], {
        guid: '123',
        backgroundFilter,
        disabled: true,
      });
      const initialFilters = [filter];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetProps(widgetPropsMock);

      expect(getProperty(connectedWidget, 'highlights')).toEqual(
        getProperty(widgetPropsMock, 'highlights'),
      );
      expect(getProperty(connectedWidget, 'filters')).toEqual([backgroundFilter]);
    });

    it('should connect background filter even if containing filter is ignored by "ignoreFilters" rules', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18'], {
        guid: '123',
        backgroundFilter,
      });
      const initialFilters = [filter];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        ignoreFilters: { all: true },
      });

      expect(getProperty(connectedWidget, 'highlights')).toEqual(
        getProperty(widgetPropsMock, 'highlights'),
      );
      expect(getProperty(connectedWidget, 'filters')).toEqual([backgroundFilter]);
    });

    it('should select new filter with keeping background filter via connected onDataPointClick handler', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18'], {
        guid: '123',
        backgroundFilter,
      });
      const initialFilters = [filter];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      let connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      const onDataPointClickHandler: DataPointEventHandler = getChartDataPointHandler(
        connectedWidget,
        'onDataPointClick',
      );

      expect(onDataPointClickHandler).toBeDefined();

      act(() => {
        onDataPointClickHandler?.(
          {
            entries: {
              category: [
                {
                  attribute: DM.Commerce.AgeRange,
                  value: '19-24',
                },
              ],
            },
          } as DataPoint,
          {} as PointerEvent,
        );
      });
      // need to reconnect widget to get the latest changes
      connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      expect((getProperty(connectedWidget, 'highlights')?.[0] as MembersFilter).members).toEqual([
        '19-24',
      ]);
      expect(
        (getProperty(connectedWidget, 'highlights')?.[0] as MembersFilter).config.guid,
      ).toEqual(initialFilters[0].config.guid);
      expect(getProperty(connectedWidget, 'filters')).toEqual([backgroundFilter]);
    });

    it('should clear selected filters with keeping background filters via the connected clear-selection input', async () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const filter = filterFactory.members(DM.Commerce.AgeRange, ['0-18'], {
        guid: '123',
        backgroundFilter,
      });
      const initialFilters = [filter];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      let connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      const clearSelectionItem = getClearSelectionButtonItem(connectedWidget);

      expect(clearSelectionItem).toBeDefined();
      if (!clearSelectionItem) return;

      render(<>{clearSelectionItem.component({ size: { width: 28, height: 28 } })}</>);

      expect(await screen.findByText('commonFilter.clearSelectionButton')).toBeInTheDocument();

      fireEvent.click(screen.getByText('commonFilter.clearSelectionButton'));

      connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      expect(getProperty(connectedWidget, 'highlights')).toEqual([]);
      expect(getProperty(connectedWidget, 'filters')).toEqual([backgroundFilter]);
    });
  });

  describe('connectToWidgetProps() for a FilterWidget', () => {
    const filterWidgetProps = {
      id: 'fw-1',
      widgetType: 'filter',
      attribute: DM.Commerce.Gender,
    } as unknown as WidgetProps;

    it('injects the attribute-matching common filter as the widget filter (adoption)', () => {
      const linked = filterFactory.members(DM.Commerce.Gender, ['Male']);
      const { result } = renderHook(() => useCommonFilters({ initialFilters: [linked] }));

      const connected = result.current.connectToWidgetProps(filterWidgetProps) as unknown as {
        filter: MembersFilter | null;
      };
      expect(connected.filter).toBe(linked);
    });

    it('writes a filter/changed selection back into the common filters', async () => {
      const { result } = renderHook(() => useCommonFilters());
      const selected = filterFactory.members(DM.Commerce.Gender, ['Female']);

      act(() => {
        const connected = result.current.connectToWidgetProps(filterWidgetProps) as unknown as {
          onChange: (e: unknown) => void;
        };
        connected.onChange({ type: 'filter/changed', payload: { filter: selected } });
      });

      await waitFor(() => {
        expect(result.current.filters).toContainEqual(selected);
      });
    });

    it('forwards every event to the widget original onChange', () => {
      const originalOnChange = vi.fn();
      const { result } = renderHook(() => useCommonFilters());

      const connected = result.current.connectToWidgetProps({
        ...filterWidgetProps,
        onChange: originalOnChange,
      } as unknown as WidgetProps) as unknown as { onChange: (e: unknown) => void };
      const titleEvent = { type: 'title/changed', payload: { title: 'X' } };
      act(() => {
        connected.onChange(titleEvent);
      });

      expect(originalOnChange).toHaveBeenCalledWith(titleEvent);
    });

    describe('dashboard filters as parentFilters', () => {
      const ageFilter = filterFactory.members(DM.Commerce.AgeRange, ['0-18'], {
        guid: 'f-age',
      });
      const conditionFilter = filterFactory.contains(DM.Commerce.Condition, 'New', {
        guid: 'f-condition',
      });
      const ownFilter = filterFactory.members(DM.Commerce.Gender, ['Male'], { guid: 'f-own' });

      type ConnectToWidgetProps = ReturnType<typeof useCommonFilters>['connectToWidgetProps'];
      type ConnectOptions = Parameters<ConnectToWidgetProps>[1];

      const connect = (options?: ConnectOptions, props: WidgetProps = filterWidgetProps) => {
        const { result } = renderHook(() =>
          useCommonFilters({ initialFilters: [ageFilter, conditionFilter, ownFilter] }),
        );
        const connected = result.current.connectToWidgetProps(props, options);
        if (!isFilterWidgetProps(connected)) {
          throw new Error('expected connectToWidgetProps to return FilterWidgetProps');
        }
        return connected;
      };

      it('injects applicable common filters when ignoreFilters.all is false', () => {
        const connected = connect({ ignoreFilters: { all: false, ids: [] } });

        expect(connected.parentFilters?.map((f) => f.config.guid)).toEqual([
          'f-age',
          'f-condition',
        ]);
      });

      it('excludes per-widget ignored filter ids', () => {
        const connected = connect({ ignoreFilters: { all: false, ids: ['f-condition'] } });

        expect(connected.parentFilters?.map((f) => f.config.guid)).toEqual(['f-age']);
      });

      it('never includes a filter on the widget own attribute (no self-filtering)', () => {
        const connected = connect({ ignoreFilters: { all: false, ids: [] } });

        expect(connected.parentFilters?.map((f) => f.config.guid)).not.toContain('f-own');
      });

      it('injects nothing when the toggle is off (all true) or options are absent', () => {
        expect(connect({ ignoreFilters: { all: true, ids: [] } }).parentFilters).toBeUndefined();
        expect(connect().parentFilters).toBeUndefined();
      });

      it('merges with the widget own widget-filters already present on the props', () => {
        const widgetFilter = filterFactory.members(DM.Category.Category, ['TV'], {
          guid: 'f-widget',
        });
        if (!isFilterWidgetProps(filterWidgetProps)) {
          throw new Error('fixture must be FilterWidgetProps');
        }
        const connected = connect(
          { ignoreFilters: { all: false, ids: [] } },
          { ...filterWidgetProps, parentFilters: [widgetFilter] },
        );

        expect(connected.parentFilters?.map((f) => f.config.guid)).toEqual([
          'f-widget',
          'f-age',
          'f-condition',
        ]);
      });

      it('preserves pre-supplied parentFilters untouched when the toggle is off or options are absent', () => {
        const widgetFilter = filterFactory.members(DM.Category.Category, ['TV'], {
          guid: 'f-widget',
        });
        if (!isFilterWidgetProps(filterWidgetProps)) {
          throw new Error('fixture must be FilterWidgetProps');
        }
        const props = { ...filterWidgetProps, parentFilters: [widgetFilter] };
        // toBe proves no new array is returned; the snapshot proves no in-place mutation.
        const snapshot = [...props.parentFilters];

        const toggledOff = connect({ ignoreFilters: { all: true, ids: [] } }, props).parentFilters;
        const noOptions = connect(undefined, props).parentFilters;

        expect(toggledOff).toBe(props.parentFilters);
        expect(noOptions).toBe(props.parentFilters);
        expect(props.parentFilters).toEqual(snapshot);
      });
    });
  });
});
