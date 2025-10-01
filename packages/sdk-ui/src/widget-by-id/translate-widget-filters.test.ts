/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MetadataTypes } from '@ethings-os/sdk-data';
import { extractWidgetFilters } from './translate-widget-filters.js';
import { Panel } from './types.js';

describe('extractFilters', () => {
  test('should extract filters from the widget panel', () => {
    const panels = [
      {
        name: 'filters',
        items: [
          {
            jaql: {
              filter: {
                members: ['val1', 'val2'],
              },
            },
          },
          {
            jaql: {
              filter: {},
            },
            disabled: true,
          },
        ],
      },
    ] as Panel[];

    const filters = extractWidgetFilters(panels);

    expect(filters).toHaveLength(1);
    expect(filters[0].jaql().jaql).toEqual(panels[0].items[0].jaql);
    expect(filters[0].jaql().panel).toBe('scope');
    expect(MetadataTypes.isFilter(filters[0])).toBeTruthy();
  });

  test('should extract filter with additional "background" filter from the widget panel', () => {
    const filter = {
      members: ['val2'],
    };
    const backgroundFilter = {
      members: ['val1', 'val2', 'val3'],
    };
    const panels = [
      {
        name: 'filters',
        items: [
          {
            jaql: {
              filter: {
                ...filter,
                filter: backgroundFilter,
              },
            },
          },
        ],
      },
    ] as Panel[];

    const filters = extractWidgetFilters(panels);

    // verifies filter
    expect(filters[0].jaql().jaql).toEqual({
      filter,
    });
    // verifies background filter
    expect(filters[1].jaql().jaql).toEqual({
      filter: backgroundFilter,
    });
  });

  test('should extract filter with "turnedOff" configuration from the widget panel', () => {
    const filter = {
      members: ['val1', 'val2', 'val3'],
    };
    const turnOffFilter = {
      turnedOff: true,
      exclude: {
        members: ['val3'],
      },
    };
    const panels = [
      {
        name: 'filters',
        items: [
          {
            jaql: {
              filter: {
                ...filter,
                filter: turnOffFilter,
              },
            },
          },
        ],
      },
    ] as Panel[];

    const filters = extractWidgetFilters(panels);

    expect(filters[0].jaql().jaql).toEqual(panels[0].items[0].jaql);
  });
});
