import { act } from 'react';

import { filterFactory, MembersFilter } from '@sisense/sdk-data';
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { MenuOptions } from '@/common/components/menu/types';
import { isChartWidgetProps, isTextWidgetProps } from '@/widget-by-id/utils';

import {
  CartesianChartDataOptions,
  ChartWidgetProps,
  DataPoint,
  DataPointEventHandler,
  DataPointsEventHandler,
  RenderToolbarHandler,
  WidgetProps,
} from '..';
import { useCommonFilters } from './use-common-filters';

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
    return isTextWidgetProps(widget) ? (key === 'dataOptions' ? {} : []) : widget[key];
  };

  /**
   * Helper function to get data point related callback from chart widget props
   */
  const getChartDataPointHandler = (
    widget: WidgetProps,
    key: 'onDataPointClick' | 'onDataPointsSelected' | 'onRenderToolbar',
  ) => {
    return isChartWidgetProps(widget) ? widget[key] : undefined;
  };

  /**
   * Helper function to render toolbar callback from chart widget props
   */
  const getRenderToolbarHandler = (widget: WidgetProps) => {
    return isChartWidgetProps(widget) ? widget.styleOptions?.header?.renderToolbar : undefined;
  };

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

    it('should clear selected filters via connected onRenderToolbar handler', async () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], { guid: '123' }),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      let connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      const onRenderToolbar: RenderToolbarHandler | undefined =
        getRenderToolbarHandler(connectedWidget);

      expect(onRenderToolbar).toBeDefined();
      if (!onRenderToolbar) return;

      render(onRenderToolbar(() => {}, null as unknown as JSX.Element));

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

    it('should clear selected filters with keeping background filters via connected onRenderToolbar handler', async () => {
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

      const onRenderToolbar: RenderToolbarHandler | undefined =
        getRenderToolbarHandler(connectedWidget);

      expect(onRenderToolbar).toBeDefined();
      if (!onRenderToolbar) return;

      render(onRenderToolbar(() => {}, null as unknown as JSX.Element));

      expect(await screen.findByText('commonFilter.clearSelectionButton')).toBeInTheDocument();

      fireEvent.click(screen.getByText('commonFilter.clearSelectionButton'));

      connectedWidget = result.current.connectToWidgetProps(widgetPropsMock, {
        shouldAffectFilters: true,
      });

      expect(getProperty(connectedWidget, 'highlights')).toEqual([]);
      expect(getProperty(connectedWidget, 'filters')).toEqual([backgroundFilter]);
    });
  });
});
