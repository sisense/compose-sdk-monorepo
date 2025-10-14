import { filterFactory } from '@sisense/sdk-data';
import { render, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { DashboardDto } from '@/api/types/dashboard-dto.js';
import type { WidgetProps } from '@/props';

import * as dashboardJSON from '../__mocks__/data/mock-dashboard.json';
import * as jaqlDrilldown from '../__mocks__/data/mock-jaql-drilldown.json';
import { mockToken, mockUrl, server } from '../__mocks__/msw.js';
import { SisenseContextProvider } from '../sisense-context/sisense-context-provider.js';
import { WidgetById } from './widget-by-id.js';

// Create a spy to capture Widget props
const widgetSpy = vi.fn();

// Mock the Widget component to spy on props while allowing actual rendering
vi.mock('@/widgets/widget.js', async () => {
  const actual = await vi.importActual<typeof import('@/widgets/widget.js')>('@/widgets/widget.js');
  return {
    Widget: vi.fn((props: WidgetProps) => {
      widgetSpy(props);
      return actual.Widget(props);
    }),
  };
});

const dashboard = dashboardJSON as DashboardDto;
const dashboardId = dashboard.oid;
const widgetId = dashboard.widgets![0].oid;

// Helper function to normalize props for stable snapshots
const normalizePropsForSnapshot = (props: any) => {
  const normalized = JSON.parse(JSON.stringify(props));

  // Recursively replace all GUID values with stable placeholders
  const replaceGuids = (obj: any): any => {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(replaceGuids);
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'guid' && typeof value === 'string') {
          result[key] = 'STABLE-GUID-PLACEHOLDER';
        } else {
          result[key] = replaceGuids(value);
        }
      }
      return result;
    }
    return obj;
  };

  return replaceGuids(normalized);
};

describe('WidgetById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    widgetSpy.mockClear();

    server.use(
      http.get('*/api/v1/dashboards/:dashboardId', ({ request }) => {
        const url = new URL(request.url);
        const hasFiltersParam = url.searchParams.get('fields')?.includes('filters');

        const dashboardResponse = hasFiltersParam
          ? dashboard
          : { ...dashboard, filters: undefined };

        return HttpResponse.json(dashboardResponse);
      }),
      http.get('*/api/v1/dashboards/:dashboardId/widgets', () =>
        HttpResponse.json(dashboard.widgets),
      ),
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDrilldown)),
    );
  });

  it('should render widget by id', async () => {
    const { container } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById widgetOid={widgetId} dashboardOid={dashboardId} />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    // Verify the widget was rendered
    expect(container.firstChild).toBeTruthy();

    // Capture and verify props snapshot
    const widgetProps = widgetSpy.mock.calls[0][0];
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot('basic-widget-props');
  });

  it('should pass external filters to Widget component', async () => {
    const externalFilters = [
      filterFactory.members(DM.Commerce.AgeRange, ['18-24', '25-34']),
      filterFactory.greaterThan(DM.Commerce.Revenue, 1000),
    ];

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById widgetOid={widgetId} dashboardOid={dashboardId} filters={externalFilters} />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];
    expect(widgetProps.filters).toEqual(expect.arrayContaining(externalFilters));
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot('widget-props-with-filters');
  });

  it('should pass external highlights to Widget component', async () => {
    const externalHighlights = [
      filterFactory.members(DM.Commerce.Gender, ['Male']),
      filterFactory.lessThan(DM.Commerce.Cost, 500),
    ];

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById
          widgetOid={widgetId}
          dashboardOid={dashboardId}
          highlights={externalHighlights}
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];
    expect(widgetProps.highlights).toEqual(expect.arrayContaining(externalHighlights));
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot('widget-props-with-highlights');
  });

  it('should override widget title and description', async () => {
    const customTitle = 'Custom Widget Title';
    const customDescription = 'Custom widget description for testing';

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById
          widgetOid={widgetId}
          dashboardOid={dashboardId}
          title={customTitle}
          description={customDescription}
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];
    expect(widgetProps.title).toBe(customTitle);
    expect(widgetProps.description).toBe(customDescription);
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot(
      'widget-props-with-title-description',
    );
  });

  it('should merge external style options with widget style options', async () => {
    const customStyleOptions = {
      width: 800,
      height: 600,
      header: {
        backgroundColor: '#f0f0f0',
        titleTextColor: '#333333',
      },
    };

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById
          widgetOid={widgetId}
          dashboardOid={dashboardId}
          styleOptions={customStyleOptions}
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];
    expect(widgetProps.styleOptions).toEqual(
      expect.objectContaining({
        width: 800,
        height: 600,
        header: expect.objectContaining({
          backgroundColor: '#f0f0f0',
          titleTextColor: '#333333',
        }),
      }),
    );
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot(
      'widget-props-with-style-options',
    );
  });

  it('should pass drilldown options to Widget component', async () => {
    const drilldownOptions = {
      drilldownPaths: [DM.Commerce.AgeRange, DM.Commerce.Gender],
      drilldownSelections: [
        {
          nextDimension: DM.Commerce.Gender,
          points: [{ categoryValue: '18-24', categoryDisplayValue: '18-24' }],
        },
      ],
    };

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById
          widgetOid={widgetId}
          dashboardOid={dashboardId}
          drilldownOptions={drilldownOptions}
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];
    expect(widgetProps.drilldownOptions).toEqual(expect.objectContaining(drilldownOptions));
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot(
      'widget-props-with-drilldown-options',
    );
  });

  it('should handle filters merge strategy correctly', async () => {
    const externalFilters = [filterFactory.members(DM.Commerce.AgeRange, ['18-24'])];

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById
          widgetOid={widgetId}
          dashboardOid={dashboardId}
          filters={externalFilters}
          filtersMergeStrategy="codeFirst"
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];
    // Verify that filters are present (exact merge logic depends on implementation)
    expect(widgetProps.filters).toBeDefined();
    expect(Array.isArray(widgetProps.filters)).toBe(true);
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot(
      'widget-props-with-filters-merge-strategy',
    );
  });

  it('should include dashboard filters when includeDashboardFilters is true', async () => {
    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById
          widgetOid={widgetId}
          dashboardOid={dashboardId}
          includeDashboardFilters={true}
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot(
      'widget-props-with-dashboard-filters-included',
    );
  });

  it('should exclude dashboard filters when includeDashboardFilters is false', async () => {
    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById
          widgetOid={widgetId}
          dashboardOid={dashboardId}
          includeDashboardFilters={false}
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot(
      'widget-props-with-dashboard-filters-excluded',
    );
  });

  it('should pass through additional widget props', async () => {
    const onDataPointClick = vi.fn();
    const onBeforeRender = vi.fn((options) => options);

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById
          widgetOid={widgetId}
          dashboardOid={dashboardId}
          onDataPointClick={onDataPointClick}
          onBeforeRender={onBeforeRender}
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];
    expect(widgetProps.onDataPointClick).toBe(onDataPointClick);
    expect(widgetProps.onBeforeRender).toBe(onBeforeRender);
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot(
      'widget-props-with-additional-props',
    );
  });

  it('should preserve widget id from dashboard configuration', async () => {
    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById widgetOid={widgetId} dashboardOid={dashboardId} />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];
    expect(widgetProps.id).toBe(widgetId);
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot(
      'widget-props-with-preserved-id',
    );
  });

  it('should handle complex prop combinations correctly', async () => {
    const externalFilters = [filterFactory.members(DM.Commerce.AgeRange, ['25-34'])];
    const externalHighlights = [filterFactory.members(DM.Commerce.Gender, ['Female'])];
    const customTitle = 'Complex Test Widget';
    const customStyleOptions = {
      width: 1000,
      header: { backgroundColor: '#e0e0e0' },
    };
    const drilldownOptions = {
      drilldownPaths: [DM.Commerce.Category],
    };

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById
          widgetOid={widgetId}
          dashboardOid={dashboardId}
          filters={externalFilters}
          highlights={externalHighlights}
          title={customTitle}
          styleOptions={customStyleOptions}
          drilldownOptions={drilldownOptions}
          filtersMergeStrategy="widgetFirst"
          includeDashboardFilters={true}
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];

    // Verify all props are correctly passed and merged
    expect(widgetProps.id).toBe(widgetId);
    expect(widgetProps.title).toBe(customTitle);
    expect(widgetProps.filters).toEqual(expect.arrayContaining(externalFilters));
    expect(widgetProps.highlights).toEqual(expect.arrayContaining(externalHighlights));
    expect(widgetProps.styleOptions).toEqual(expect.objectContaining(customStyleOptions));
    expect(widgetProps.drilldownOptions).toEqual(expect.objectContaining(drilldownOptions));
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot(
      'widget-props-complex-combination',
    );
  });

  it('should throw error when widget with given OID is not found in dashboard', async () => {
    const nonExistentWidgetId = 'non-existent-widget-id';

    // Mock console.error to capture the error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById widgetOid={nonExistentWidgetId} dashboardOid={dashboardId} />
      </SisenseContextProvider>,
    );

    // Wait for the error to be thrown and caught by error boundary
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should omit undefined values from external props', async () => {
    render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById
          widgetOid={widgetId}
          dashboardOid={dashboardId}
          title={undefined}
          description={undefined}
          filters={undefined}
          highlights={undefined}
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(widgetSpy).toHaveBeenCalled();
    });

    const widgetProps = widgetSpy.mock.calls[0][0];

    // Verify that undefined values don't override existing widget properties
    expect(widgetProps.title).toBe(dashboard.widgets![0].title); // Should use original title
    expect(widgetProps.id).toBe(widgetId);
    expect(normalizePropsForSnapshot(widgetProps)).toMatchSnapshot(
      'widget-props-with-undefined-values-omitted',
    );
  });
});
