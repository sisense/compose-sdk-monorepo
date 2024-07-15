import { act } from 'react';
import { filterFactory, MembersFilter } from '@sisense/sdk-data';
import { render, renderHook, screen, fireEvent } from '@testing-library/react';
import { useCommonFilters } from './use-common-filters';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import {
  CartesianChartDataOptions,
  DataPointEventHandler,
  DataPointsEventHandler,
  RenderToolbarHandler,
  WidgetModel,
} from '..';
import { Mock } from 'vitest';

type MockedFn = Mock<any, any>;

describe('useCommonFilters', () => {
  it('should initialize with initial filters', () => {
    const initialFilters = [filterFactory.members(DM.Commerce.AgeRange, ['0-18'])];
    const { result } = renderHook(() => useCommonFilters({ initialFilters }));

    expect(result.current.filters).toEqual(initialFilters);
  });

  describe('setFilters()', () => {
    it('should set all filters', () => {
      const { result } = renderHook(() => useCommonFilters());
      const newFilters = [filterFactory.members(DM.Commerce.Gender, ['Male'])];
      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.filters).toEqual(newFilters);
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

  describe('connectToWidgetModel()', () => {
    let widgetModelMock: WidgetModel;
    beforeEach(() => {
      widgetModelMock = {
        widgetType: 'chart/column',
        dataOptions: {
          category: [DM.Commerce.AgeRange],
          value: [],
          breakBy: [],
        } as CartesianChartDataOptions,
        filters: [],
        highlights: [],
        registerComponentDataPointClickHandler: vi.fn(),
        registerComponentDataPointsSelectedHandler: vi.fn(),
        registerComponentRenderToolbarHandler: vi.fn(),
      } as unknown as WidgetModel;
    });

    it('should connect common filters as highlights to widget model by default', () => {
      const initialFilters = [filterFactory.members(DM.Commerce.AgeRange, ['0-18'])];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetModel(widgetModelMock);

      expect(connectedWidget.highlights).toEqual(initialFilters);
      expect(connectedWidget.filters).toEqual(widgetModelMock.filters);
    });

    it('should connect common filters as filters to table widget model by default', () => {
      const initialFilters = [filterFactory.members(DM.Commerce.AgeRange, ['0-18'])];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetModel({
        ...widgetModelMock,
        widgetType: 'tablewidget',
        dataOptions: {
          columns: [DM.Commerce.AgeRange],
        },
      } as unknown as WidgetModel);

      expect(connectedWidget.highlights).toEqual(widgetModelMock.highlights);
      expect(connectedWidget.filters).toEqual(initialFilters);
    });

    it('should connect common filters as filters to widget model', () => {
      const initialFilters = [filterFactory.members(DM.Commerce.AgeRange, ['0-18'])];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        applyMode: 'filter',
      });

      expect(connectedWidget.filters).toEqual(initialFilters);
      expect(connectedWidget.highlights).toEqual(widgetModelMock.highlights);
    });

    it('should ingore connected filter by id', () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], false, '123', []),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        ignoreFilters: { ids: ['123'] },
      });

      expect(connectedWidget.highlights).toEqual(widgetModelMock.highlights);
      expect(connectedWidget.filters).toEqual(widgetModelMock.filters);
    });

    it('should ignore all connected filters', () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], false, '123', []),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        ignoreFilters: { all: true },
      });

      expect(connectedWidget.highlights).toEqual(widgetModelMock.highlights);
      expect(connectedWidget.filters).toEqual(widgetModelMock.filters);
    });

    it('should select new filter via connected onDataPointClick handler', () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], false, '123', []),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      let connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        shouldAffectFilters: true,
      });

      const onDataPointClickHandler: DataPointEventHandler = (
        connectedWidget.registerComponentDataPointClickHandler as MockedFn
      ).mock.calls[0][0];

      expect(onDataPointClickHandler).toBeDefined();

      act(() => {
        onDataPointClickHandler?.({ value: 111, categoryValue: '65+' }, {} as PointerEvent);
      });
      // need to reconnect widget to get the latest changes
      connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        shouldAffectFilters: true,
      });

      expect((connectedWidget.highlights[0] as MembersFilter).members).toEqual(['65+']);
      expect((connectedWidget.highlights[0] as MembersFilter).guid).toEqual(initialFilters[0].guid);
      expect(connectedWidget.filters).toEqual(widgetModelMock.filters);
    });

    it('should select new filter via connected onDataPointsSelected handler', () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], false, '123', []),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      let connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        shouldAffectFilters: true,
      });

      const onDataPointsSelectedHandler: DataPointsEventHandler = (
        connectedWidget.registerComponentDataPointsSelectedHandler as MockedFn
      ).mock.calls[0][0];

      expect(onDataPointsSelectedHandler).toBeDefined();

      act(() => {
        onDataPointsSelectedHandler?.(
          [
            { value: 111, categoryValue: '19-24' },
            { value: 112, categoryValue: '65+' },
          ],
          {} as PointerEvent,
        );
      });
      connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        shouldAffectFilters: true,
      });

      expect((connectedWidget.highlights[0] as MembersFilter).members).toEqual(['19-24', '65+']);
      expect((connectedWidget.highlights[0] as MembersFilter).guid).toEqual(initialFilters[0].guid);
      expect(connectedWidget.filters).toEqual(widgetModelMock.filters);
    });

    it('should clear selected filters via connected onRenderTooltip handler', async () => {
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], false, '123', []),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      let connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        shouldAffectFilters: true,
      });

      const onRenderToolbar: RenderToolbarHandler = (
        connectedWidget.registerComponentRenderToolbarHandler as MockedFn
      ).mock.calls[0][0];

      expect(onRenderToolbar).toBeDefined();

      render(onRenderToolbar(() => {}, null as unknown as JSX.Element));

      expect(await screen.findByText('commonFilter.clearSelectionButton')).toBeInTheDocument();

      fireEvent.click(screen.getByText('commonFilter.clearSelectionButton'));

      connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        shouldAffectFilters: true,
      });

      expect((connectedWidget.highlights[0] as MembersFilter).members).toEqual([]);
      expect((connectedWidget.highlights[0] as MembersFilter).guid).toEqual(initialFilters[0].guid);
      expect(connectedWidget.filters).toEqual(widgetModelMock.filters);
    });

    it('should connect background filter as slice filters by default', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], false, '123', [], backgroundFilter),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetModel(widgetModelMock);

      expect(connectedWidget.highlights).toEqual(initialFilters);
      expect(connectedWidget.filters).toEqual([backgroundFilter]);
    });

    it('should connect filter without separate background filter if "filter" mode selected', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const initialFilters = [
        filterFactory.members(DM.Commerce.AgeRange, ['0-18'], false, '123', [], backgroundFilter),
      ];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        applyMode: 'filter',
      });

      expect(connectedWidget.highlights).toEqual(widgetModelMock.highlights);
      expect(connectedWidget.filters).toEqual(initialFilters);
    });

    it('should connect background filter even if containing filter is disabled', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const filter = filterFactory.members(
        DM.Commerce.AgeRange,
        ['0-18'],
        false,
        '123',
        [],
        backgroundFilter,
      );
      filter.disabled = true;
      const initialFilters = [filter];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetModel(widgetModelMock);

      expect(connectedWidget.highlights).toEqual(widgetModelMock.highlights);
      expect(connectedWidget.filters).toEqual([backgroundFilter]);
    });

    it('should connect background filter even if containing filter is ignored by "ignoreFilters" rules', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const filter = filterFactory.members(
        DM.Commerce.AgeRange,
        ['0-18'],
        false,
        '123',
        [],
        backgroundFilter,
      );
      const initialFilters = [filter];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      const connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        ignoreFilters: { all: true },
      });

      expect(connectedWidget.highlights).toEqual(widgetModelMock.highlights);
      expect(connectedWidget.filters).toEqual([backgroundFilter]);
    });

    it('should select new filter with keeping background filter via connected onDataPointClick handler', () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const filter = filterFactory.members(
        DM.Commerce.AgeRange,
        ['0-18'],
        false,
        '123',
        [],
        backgroundFilter,
      );
      const initialFilters = [filter];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      let connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        shouldAffectFilters: true,
      });

      const onDataPointClickHandler: DataPointEventHandler = (
        connectedWidget.registerComponentDataPointClickHandler as MockedFn
      ).mock.calls[0][0];

      expect(onDataPointClickHandler).toBeDefined();

      act(() => {
        onDataPointClickHandler?.({ value: 111, categoryValue: '19-24' }, {} as PointerEvent);
      });
      // need to reconnect widget to get the latest changes
      connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        shouldAffectFilters: true,
      });

      expect((connectedWidget.highlights[0] as MembersFilter).members).toEqual(['19-24']);
      expect((connectedWidget.highlights[0] as MembersFilter).guid).toEqual(initialFilters[0].guid);
      expect(connectedWidget.filters).toEqual([backgroundFilter]);
    });

    it('should clear selected filters with keeping background filters via connected onRenderTooltip handler', async () => {
      const backgroundFilter = filterFactory.members(DM.Commerce.AgeRange, [
        '0-18',
        '19-24',
        '25-34',
      ]);
      const filter = filterFactory.members(
        DM.Commerce.AgeRange,
        ['0-18'],
        false,
        '123',
        [],
        backgroundFilter,
      );
      const initialFilters = [filter];
      const { result } = renderHook(() => useCommonFilters({ initialFilters }));
      let connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        shouldAffectFilters: true,
      });

      const onRenderToolbar: RenderToolbarHandler = (
        connectedWidget.registerComponentRenderToolbarHandler as MockedFn
      ).mock.calls[0][0];

      expect(onRenderToolbar).toBeDefined();

      render(onRenderToolbar(() => {}, null as unknown as JSX.Element));

      expect(await screen.findByText('commonFilter.clearSelectionButton')).toBeInTheDocument();

      fireEvent.click(screen.getByText('commonFilter.clearSelectionButton'));

      connectedWidget = result.current.connectToWidgetModel(widgetModelMock, {
        shouldAffectFilters: true,
      });

      expect((connectedWidget.highlights[0] as MembersFilter).members).toEqual([]);
      expect((connectedWidget.highlights[0] as MembersFilter).guid).toEqual(initialFilters[0].guid);
      expect(connectedWidget.filters).toEqual([backgroundFilter]);
    });
  });
});
