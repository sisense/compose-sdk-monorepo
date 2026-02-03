/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { FilterJaql } from '@sisense/sdk-data';

import {
  CascadingFilterDto,
  DashboardDto,
  FilterDto,
} from '../../../../infra/api/types/dashboard-dto.js';
import {
  extractCombinedFilters,
  extractDashboardFiltersForWidget,
} from './translate-dashboard-filters.js';
import { PanelItem, WidgetDashboardFilterMode, WidgetDto } from './types.js';

let dummyDashboard: DashboardDto;
let dummyWidget: WidgetDto;

beforeEach(() => {
  dummyDashboard = {
    filters: [
      {
        jaql: {
          dim: '[Commerce.Age Range]',
          filter: {
            members: ['0-18', '19-24', '65+'],
          },
        },
        instanceid: 'filter-1',
      },
      {
        jaql: {
          dim: '[Commerce.Gender]',
          filter: {
            members: ['Male', 'Female'],
          },
        },
        instanceid: 'filter-2',
      },
    ],
  } as DashboardDto;

  dummyWidget = {
    type: 'chart/column',
    metadata: {
      ignore: {
        all: false,
        ids: ['not existed filter id'],
      },
      panels: [
        {
          name: 'categories',
          items: [
            {
              jaql: {
                dim: '[Commerce.Age Range]',
              },
            },
            {
              jaql: {
                dim: '[Commerce.Gender]',
              },
            },
          ],
        },
      ],
    },
    options: {
      dashboardFiltersMode: WidgetDashboardFilterMode.SELECT,
    },
  } as WidgetDto;
});

describe('extractCombinedFilters', () => {
  it('should extract and merge dashboard and widget filters', () => {
    const widgetFilterJaql = {
      dim: '[Commerce.Brand]',
      filter: {
        members: ['ABC'],
      },
    } as FilterJaql;

    dummyWidget.metadata.panels.push({
      name: 'filters',
      items: [
        {
          jaql: widgetFilterJaql,
        } as PanelItem,
      ],
    });

    const { filters, highlights } = extractCombinedFilters(dummyDashboard, dummyWidget);
    expect(filters).toHaveLength(1);
    expect(highlights).toHaveLength(2);
    expect(filters[0].jaql().jaql).toMatchObject({
      dim: widgetFilterJaql.dim,
      filter: widgetFilterJaql.filter,
    });
    expect(highlights[0].jaql().jaql).toMatchObject({
      dim: (dummyDashboard.filters![0] as FilterDto).jaql.dim,
      filter: (dummyDashboard.filters![0] as FilterDto).jaql.filter,
    });
    expect(highlights[1].jaql().jaql).toMatchObject({
      dim: (dummyDashboard.filters![1] as FilterDto).jaql.dim,
      filter: (dummyDashboard.filters![1] as FilterDto).jaql.filter,
    });
  });
});

describe('extractDashboardFiltersForWidget', () => {
  it('should extract all "highlight" filters', () => {
    const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

    expect(filters).toHaveLength(0);
    expect(highlights).toHaveLength(2);
    expect(highlights[0].jaql().jaql.dim).toEqual(
      (dummyDashboard.filters![0] as FilterDto).jaql.dim,
    );
    expect(highlights[0].jaql().jaql.filter).toEqual(
      (dummyDashboard.filters![0] as FilterDto).jaql.filter,
    );
    expect(highlights[1].jaql().jaql.dim).toEqual(
      (dummyDashboard.filters![1] as FilterDto).jaql.dim,
    );
    expect(highlights[1].jaql().jaql.filter).toEqual(
      (dummyDashboard.filters![1] as FilterDto).jaql.filter,
    );
  });

  it('should extract "highlight" filters that not disabled in widget options', () => {
    // disables second dashboard filter
    dummyWidget.metadata.ignore?.ids.push(dummyDashboard.filters![1].instanceid!);

    const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

    expect(filters).toHaveLength(0);
    expect(highlights).toHaveLength(1);
    expect(highlights[0].jaql().jaql.dim).toEqual(
      (dummyDashboard.filters![0] as FilterDto).jaql.dim,
    );
    expect(highlights[0].jaql().jaql.filter).toEqual(
      (dummyDashboard.filters![0] as FilterDto).jaql.filter,
    );
  });

  it('should extract "highlight" filters that applicable to widget, other will be "slice" filters', () => {
    // removes "Commerce.Gender" category that blocks corresponding filter to be highlight one
    dummyWidget.metadata.panels[0].items.pop();
    const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

    expect(filters).toHaveLength(1);
    expect(highlights).toHaveLength(1);
    expect(highlights[0].jaql().jaql.dim).toEqual(
      (dummyDashboard.filters![0] as FilterDto).jaql.dim,
    );
    expect(highlights[0].jaql().jaql.filter).toEqual(
      (dummyDashboard.filters![0] as FilterDto).jaql.filter,
    );
    expect(filters[0].jaql().jaql.dim).toEqual((dummyDashboard.filters![1] as FilterDto).jaql.dim);
    expect(filters[0].jaql().jaql.filter).toEqual(
      (dummyDashboard.filters![1] as FilterDto).jaql.filter,
    );
  });

  it('should extract no filters when all dashboard filters are blocked in widget options', () => {
    // set widget to ignore all dashboard filters
    dummyWidget.metadata.ignore!.all = true;
    const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

    expect(filters).toHaveLength(0);
    expect(highlights).toHaveLength(0);
  });

  it('should extract all "slice" filters', () => {
    // set "filter/slice" mode in widget options
    dummyWidget.options!.dashboardFiltersMode = WidgetDashboardFilterMode.FILTER;
    const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

    expect(filters).toHaveLength(2);
    expect(highlights).toHaveLength(0);
    expect(filters[0].jaql().jaql.dim).toEqual((dummyDashboard.filters![0] as FilterDto).jaql.dim);
    expect(filters[0].jaql().jaql.filter).toEqual(
      (dummyDashboard.filters![0] as FilterDto).jaql.filter,
    );
    expect(filters[1].jaql().jaql.dim).toEqual((dummyDashboard.filters![1] as FilterDto).jaql.dim);
    expect(filters[1].jaql().jaql.filter).toEqual(
      (dummyDashboard.filters![1] as FilterDto).jaql.filter,
    );
  });

  it('should extract "slice" filters that not disabled in widget options', () => {
    dummyWidget.options!.dashboardFiltersMode = WidgetDashboardFilterMode.FILTER;
    // disables second dashboard filter
    dummyWidget.metadata.ignore?.ids.push(dummyDashboard.filters![1].instanceid!);

    const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

    expect(filters).toHaveLength(1);
    expect(highlights).toHaveLength(0);
    expect(filters[0].jaql().jaql.dim).toEqual((dummyDashboard.filters![0] as FilterDto).jaql.dim);
    expect(filters[0].jaql().jaql.filter).toEqual(
      (dummyDashboard.filters![0] as FilterDto).jaql.filter,
    );
  });

  it('should extract no filters when all dashboard filters are disabled', () => {
    // disables dashboard filters
    dummyDashboard.filters?.forEach((filterDto) => {
      filterDto.disabled = true;
    });
    const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

    expect(filters).toHaveLength(0);
    expect(highlights).toHaveLength(0);
  });

  describe('Cascading filters', () => {
    beforeEach(() => {
      dummyDashboard.filters = [
        {
          isCascading: true,
          instanceid: 'cascading-filter-1',
          levels: [
            {
              dim: '[Commerce.Age Range]',
              filter: {
                members: ['0-18', '19-24', '65+'],
              },
            },
            {
              dim: '[Commerce.Gender]',
              filter: {
                members: ['Male', 'Female'],
              },
            },
          ],
        } as CascadingFilterDto,
      ];
    });

    it('should extract all "highlight" filters', () => {
      const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

      expect(filters).toHaveLength(0);
      expect(highlights).toHaveLength(2);
      expect(highlights[0].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[0].dim,
      );
      expect(highlights[0].jaql().jaql.filter).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[0].filter,
      );
      expect(highlights[1].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[1].dim,
      );
      expect(highlights[1].jaql().jaql.filter).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[1].filter,
      );
    });

    it('should extract all "slice" filters', () => {
      // set "filter/slice" mode in widget options
      dummyWidget.options!.dashboardFiltersMode = WidgetDashboardFilterMode.FILTER;

      const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

      expect(filters).toHaveLength(2);
      expect(highlights).toHaveLength(0);
      expect(filters[0].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[0].dim,
      );
      expect(filters[0].jaql().jaql.filter).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[0].filter,
      );
      expect(filters[1].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[1].dim,
      );
      expect(filters[1].jaql().jaql.filter).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[1].filter,
      );
    });

    it('should extract filters', () => {
      // set "filter/slice" mode in widget options
      dummyWidget.options!.dashboardFiltersMode = WidgetDashboardFilterMode.FILTER;

      const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

      expect(filters).toHaveLength(2);
      expect(highlights).toHaveLength(0);
      expect(filters[0].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[0].dim,
      );
      expect(filters[0].jaql().jaql.filter).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[0].filter,
      );
      expect(filters[1].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[1].dim,
      );
      expect(filters[1].jaql().jaql.filter).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[1].filter,
      );
    });

    it('should extract "highlight" filters that applicable to widget, other will be "slice" filters', () => {
      // removes "Commerce.Gender" category that blocks corresponding filter to be highlight one
      dummyWidget.metadata.panels[0].items.pop();

      const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

      expect(filters).toHaveLength(1);
      expect(highlights).toHaveLength(1);
      expect(highlights[0].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[0].dim,
      );
      expect(highlights[0].jaql().jaql.filter).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[0].filter,
      );
      expect(filters[0].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[1].dim,
      );
      expect(filters[0].jaql().jaql.filter).toEqual(
        (dummyDashboard.filters![0] as CascadingFilterDto).levels[1].filter,
      );
    });

    it('should extract no filters when cascading dashboard filters is disabled', () => {
      // disables dashboard filters
      dummyDashboard.filters?.forEach((filterDto) => {
        filterDto.disabled = true;
      });
      const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

      expect(filters).toHaveLength(0);
      expect(highlights).toHaveLength(0);
    });
  });

  describe('Background filters', () => {
    beforeEach(() => {
      dummyDashboard.filters = [
        {
          jaql: {
            dim: '[Commerce.Age Range]',
            filter: {
              members: ['0-18'],
              // background filter
              filter: {
                members: ['0-18', '19-24', '65+'],
              },
            },
          },
          instanceid: 'filter-1',
        },
        {
          jaql: {
            dim: '[Commerce.Gender]',
            filter: {
              members: ['Female'],
              filter: {
                members: ['Male', 'Female'],
              },
            },
          },
          instanceid: 'filter-2',
        },
      ] as FilterDto[];
    });

    it('should extract background filters as "slice" filters', () => {
      const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

      const dashboardFiltersSplited = dummyDashboard.filters!.map((filterItem) => {
        const { filter: backgroundFilter, ...filter } = (filterItem as FilterDto).jaql.filter;
        return {
          filter,
          backgroundFilter,
        };
      });

      expect(filters).toHaveLength(2);
      expect(highlights).toHaveLength(2);
      expect(highlights[0].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as FilterDto).jaql.dim,
      );
      expect(highlights[0].jaql().jaql.filter).toEqual(dashboardFiltersSplited[0].filter);
      expect(highlights[1].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![1] as FilterDto).jaql.dim,
      );
      expect(highlights[1].jaql().jaql.filter).toEqual(dashboardFiltersSplited[1].filter);
      // background filters check
      expect(filters[0].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as FilterDto).jaql.dim,
      );
      expect(filters[0].jaql().jaql.filter).toEqual(dashboardFiltersSplited[0].backgroundFilter);
      expect(filters[1].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![1] as FilterDto).jaql.dim,
      );
      expect(filters[1].jaql().jaql.filter).toEqual(dashboardFiltersSplited[1].backgroundFilter);
    });

    it('should extract background filters even when dashboard filters disabled in widget options', () => {
      // set widget to ignore all dashboard filters
      dummyWidget.metadata.ignore!.all = true;
      const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

      expect(filters).toHaveLength(2);
      expect(highlights).toHaveLength(0);

      // background filters check
      expect(filters[0].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as FilterDto).jaql.dim,
      );
      expect(filters[0].jaql().jaql.filter).toEqual(
        (dummyDashboard.filters![0] as FilterDto).jaql.filter.filter,
      );
      expect(filters[1].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![1] as FilterDto).jaql.dim,
      );
      expect(filters[1].jaql().jaql.filter).toEqual(
        (dummyDashboard.filters![1] as FilterDto).jaql.filter.filter,
      );
    });

    it('should extract only background filters when dashboard filters are disabled', () => {
      // disables dashboard filters
      dummyDashboard.filters?.forEach((filterDto) => {
        filterDto.disabled = true;
      });
      const { filters, highlights } = extractDashboardFiltersForWidget(dummyDashboard, dummyWidget);

      const dashboardFiltersSplited = dummyDashboard.filters!.map((filterItem) => {
        const { filter: backgroundFilter, ...filter } = (filterItem as FilterDto).jaql.filter;
        return {
          filter,
          backgroundFilter,
        };
      });

      expect(filters).toHaveLength(2);
      expect(highlights).toHaveLength(0);
      // background filters check
      expect(filters[0].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![0] as FilterDto).jaql.dim,
      );
      expect(filters[0].jaql().jaql.filter).toEqual(dashboardFiltersSplited[0].backgroundFilter);
      expect(filters[1].jaql().jaql.dim).toEqual(
        (dummyDashboard.filters![1] as FilterDto).jaql.dim,
      );
      expect(filters[1].jaql().jaql.filter).toEqual(dashboardFiltersSplited[1].backgroundFilter);
    });
  });
});
