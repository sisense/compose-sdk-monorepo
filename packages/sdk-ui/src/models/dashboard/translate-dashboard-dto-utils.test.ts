import { filterFactory, measureFactory, MembersFilter } from '@ethings-os/sdk-data';
import * as DM from '../../__test-helpers__/sample-ecommerce';
import { filterToFilterDto } from '@/models/dashboard/translate-dashboard-dto-utils';
import { CascadingFilterDto, FilterDto } from '@/api/types/dashboard-dto';
import { layoutToLayoutDto } from '@/models/dashboard/translate-dashboard-dto-utils';

describe('baseFilterToFilterDto', () => {
  it('should return correctly translated simple filter', () => {
    const filter = filterFactory.members(DM.Commerce.Gender, ['Male']);
    const result = filterToFilterDto(filter);
    expect(withoutInstanceId(result)).toMatchSnapshot();
  });

  it('should return correctly translated disabled filter', () => {
    const filter = filterFactory.members(DM.Commerce.Gender, ['Female'], {
      guid: 'filter-id',
      disabled: true,
    });
    const result = filterToFilterDto(filter);
    expect(withoutInstanceId(result)).toMatchSnapshot();
  });

  it('should return correctly translated members filter with disabled members', () => {
    const filter = filterFactory.members(DM.Commerce.Gender, ['Female']) as MembersFilter;
    filter.config.deactivatedMembers = ['Male'];
    const result = filterToFilterDto(filter) as FilterDto;

    expect(result.jaql.filter).toMatchSnapshot();
  });

  it('should return correctly translated exclude members filter', () => {
    const config = { excludeMembers: true };
    const filter = filterFactory.members(DM.Commerce.Gender, ['Female'], config);
    const result = filterToFilterDto(filter) as FilterDto;

    expect(result.jaql.filter).toMatchSnapshot();
  });

  it('should return correctly translated members filter with background filter', () => {
    const config = {
      excludeMembers: false,
      backgroundFilter: filterFactory.members(DM.Commerce.Gender, ['Female', 'Male']),
    };

    const filter = filterFactory.members(DM.Commerce.Gender, ['Female'], config);
    const result = filterToFilterDto(filter) as FilterDto;

    expect(result.jaql.filter.filter).toMatchSnapshot();
  });

  it('should return correctly translated ranking filter', () => {
    const filter = filterFactory.bottomRanking(
      DM.Commerce.AgeRange,
      measureFactory.sum(DM.Commerce.Revenue),
      5,
    );
    const result = filterToFilterDto(filter) as FilterDto;

    expect(result.jaql.filter).toMatchSnapshot();
  });

  it('should return correctly translated cascading filter', () => {
    const filter = filterFactory.cascading(
      [
        filterFactory.members(DM.Commerce.BrandID, ['1'], { guid: 'BRAND_FILTER_ID' }),
        filterFactory.members(DM.Commerce.Gender, ['Female'], { guid: 'GENDER_FILTER_ID' }),
      ],
      { guid: 'CASCADING_FILTER_ID' },
    );
    const result = filterToFilterDto(filter);

    expect(result).toMatchSnapshot();
  });
});

describe('layoutToLayoutDto', () => {
  it('should correctly translate a simple layout with one column and one row', () => {
    const layout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  height: '200px',
                  widgetId: 'widget-1',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = layoutToLayoutDto(layout);

    expect(result).toEqual({
      columns: [
        {
          width: 100,
          cells: [
            {
              subcells: [
                {
                  width: 100,
                  elements: [
                    {
                      height: '200px',
                      widgetid: 'widget-1',
                      minWidth: 128,
                      maxWidth: 2048,
                      minHeight: 60,
                      maxHeight: 1500,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should correctly translate a layout with multiple columns and rows', () => {
    const layout = {
      columns: [
        {
          widthPercentage: 50,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  height: 300,
                  widgetId: 'widget-1',
                },
              ],
            },
            {
              cells: [
                {
                  widthPercentage: 50,
                  height: '250px',
                  widgetId: 'widget-2',
                },
                {
                  widthPercentage: 50,
                  height: '250px',
                  widgetId: 'widget-3',
                },
              ],
            },
          ],
        },
        {
          widthPercentage: 50,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  height: '400px',
                  widgetId: 'widget-4',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = layoutToLayoutDto(layout);

    expect(result).toEqual({
      columns: [
        {
          width: 50,
          cells: [
            {
              subcells: [
                {
                  width: 100,
                  elements: [
                    {
                      height: 300,
                      widgetid: 'widget-1',
                      minWidth: 128,
                      maxWidth: 2048,
                      minHeight: 60,
                      maxHeight: 1500,
                    },
                  ],
                },
              ],
            },
            {
              subcells: [
                {
                  width: 50,
                  elements: [
                    {
                      height: '250px',
                      widgetid: 'widget-2',
                      minWidth: 128,
                      maxWidth: 2048,
                      minHeight: 60,
                      maxHeight: 1500,
                    },
                  ],
                },
                {
                  width: 50,
                  elements: [
                    {
                      height: '250px',
                      widgetid: 'widget-3',
                      minWidth: 128,
                      maxWidth: 2048,
                      minHeight: 60,
                      maxHeight: 1500,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          width: 50,
          cells: [
            {
              subcells: [
                {
                  width: 100,
                  elements: [
                    {
                      height: '400px',
                      widgetid: 'widget-4',
                      minWidth: 128,
                      maxWidth: 2048,
                      minHeight: 60,
                      maxHeight: 1500,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should correctly translate an empty layout', () => {
    const layout = {
      columns: [],
    };

    const result = layoutToLayoutDto(layout);

    expect(result).toEqual({
      columns: [],
    });
  });

  it('should correctly translate a layout with default height', () => {
    const layout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  widgetId: 'widget-1',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = layoutToLayoutDto(layout);

    expect(result).toEqual({
      columns: [
        {
          width: 100,
          cells: [
            {
              subcells: [
                {
                  width: 100,
                  elements: [
                    {
                      height: '500px',
                      widgetid: 'widget-1',
                      minWidth: 128,
                      maxWidth: 2048,
                      minHeight: 60,
                      maxHeight: 1500,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should correctly translate layout with custom minWidth, maxWidth, minHeight, maxHeight properties', () => {
    const layout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 50,
                  height: '300px',
                  widgetId: 'widget-1',
                  minWidth: 200,
                  maxWidth: 800,
                  minHeight: 100,
                  maxHeight: 600,
                },
                {
                  widthPercentage: 50,
                  height: '250px',
                  widgetId: 'widget-2',
                  minWidth: 150,
                  maxWidth: 1000,
                  minHeight: 80,
                  maxHeight: 500,
                },
              ],
            },
          ],
        },
      ],
    };

    const result = layoutToLayoutDto(layout);

    expect(result).toEqual({
      columns: [
        {
          width: 100,
          cells: [
            {
              subcells: [
                {
                  width: 50,
                  elements: [
                    {
                      height: '300px',
                      widgetid: 'widget-1',
                      minWidth: 200,
                      maxWidth: 800,
                      minHeight: 100,
                      maxHeight: 600,
                    },
                  ],
                },
                {
                  width: 50,
                  elements: [
                    {
                      height: '250px',
                      widgetid: 'widget-2',
                      minWidth: 150,
                      maxWidth: 1000,
                      minHeight: 80,
                      maxHeight: 500,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should correctly translate layout with default values for minWidth, maxWidth, minHeight, maxHeight when not provided', () => {
    const layout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  height: '400px',
                  widgetId: 'widget-1',
                },
              ],
            },
          ],
        },
      ],
    };

    const result = layoutToLayoutDto(layout);

    expect(result).toEqual({
      columns: [
        {
          width: 100,
          cells: [
            {
              subcells: [
                {
                  width: 100,
                  elements: [
                    {
                      height: '400px',
                      widgetid: 'widget-1',
                      minWidth: 128,
                      maxWidth: 2048,
                      minHeight: 60,
                      maxHeight: 1500,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should correctly translate layout with mixed custom and default values', () => {
    const layout = {
      columns: [
        {
          widthPercentage: 60,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  height: '350px',
                  widgetId: 'widget-1',
                  minWidth: 300,
                  maxHeight: 800,
                },
              ],
            },
          ],
        },
        {
          widthPercentage: 40,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  height: '200px',
                  widgetId: 'widget-2',
                  maxWidth: 1200,
                  minHeight: 120,
                },
              ],
            },
          ],
        },
      ],
    };

    const result = layoutToLayoutDto(layout);

    expect(result).toEqual({
      columns: [
        {
          width: 60,
          cells: [
            {
              subcells: [
                {
                  width: 100,
                  elements: [
                    {
                      height: '350px',
                      widgetid: 'widget-1',
                      minWidth: 300,
                      maxWidth: 2048,
                      minHeight: 60,
                      maxHeight: 800,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          width: 40,
          cells: [
            {
              subcells: [
                {
                  width: 100,
                  elements: [
                    {
                      height: '200px',
                      widgetid: 'widget-2',
                      minWidth: 128,
                      maxWidth: 1200,
                      minHeight: 120,
                      maxHeight: 1500,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should correctly translate layout with edge case values for min/max properties', () => {
    const layout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  height: '500px',
                  widgetId: 'widget-1',
                  minWidth: 0,
                  maxWidth: 9999,
                  minHeight: 1,
                  maxHeight: 2000,
                },
              ],
            },
          ],
        },
      ],
    };

    const result = layoutToLayoutDto(layout);

    expect(result).toEqual({
      columns: [
        {
          width: 100,
          cells: [
            {
              subcells: [
                {
                  width: 100,
                  elements: [
                    {
                      height: '500px',
                      widgetid: 'widget-1',
                      minWidth: 0,
                      maxWidth: 9999,
                      minHeight: 1,
                      maxHeight: 2000,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should correctly translate complex layout with multiple rows and cells having different min/max properties', () => {
    const layout = {
      columns: [
        {
          widthPercentage: 70,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 60,
                  height: '300px',
                  widgetId: 'widget-1',
                  minWidth: 200,
                  maxWidth: 600,
                  minHeight: 100,
                  maxHeight: 500,
                },
                {
                  widthPercentage: 40,
                  height: '300px',
                  widgetId: 'widget-2',
                  minWidth: 150,
                  maxWidth: 400,
                  minHeight: 100,
                  maxHeight: 500,
                },
              ],
            },
            {
              cells: [
                {
                  widthPercentage: 100,
                  height: '200px',
                  widgetId: 'widget-3',
                  minWidth: 300,
                  maxWidth: 800,
                  minHeight: 80,
                  maxHeight: 400,
                },
              ],
            },
          ],
        },
        {
          widthPercentage: 30,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  height: '400px',
                  widgetId: 'widget-4',
                  minWidth: 100,
                  maxWidth: 500,
                  minHeight: 150,
                  maxHeight: 600,
                },
              ],
            },
          ],
        },
      ],
    };

    const result = layoutToLayoutDto(layout);

    expect(result).toEqual({
      columns: [
        {
          width: 70,
          cells: [
            {
              subcells: [
                {
                  width: 60,
                  elements: [
                    {
                      height: '300px',
                      widgetid: 'widget-1',
                      minWidth: 200,
                      maxWidth: 600,
                      minHeight: 100,
                      maxHeight: 500,
                    },
                  ],
                },
                {
                  width: 40,
                  elements: [
                    {
                      height: '300px',
                      widgetid: 'widget-2',
                      minWidth: 150,
                      maxWidth: 400,
                      minHeight: 100,
                      maxHeight: 500,
                    },
                  ],
                },
              ],
            },
            {
              subcells: [
                {
                  width: 100,
                  elements: [
                    {
                      height: '200px',
                      widgetid: 'widget-3',
                      minWidth: 300,
                      maxWidth: 800,
                      minHeight: 80,
                      maxHeight: 400,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          width: 30,
          cells: [
            {
              subcells: [
                {
                  width: 100,
                  elements: [
                    {
                      height: '400px',
                      widgetid: 'widget-4',
                      minWidth: 100,
                      maxWidth: 500,
                      minHeight: 150,
                      maxHeight: 600,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});

/** Removes the instanceid from the filter dto */
function withoutInstanceId<T extends FilterDto | CascadingFilterDto>(
  filter: T,
): Omit<T, 'instanceid'> {
  // eslint-disable-next-line no-unused-vars
  const { instanceid, ...rest } = filter;
  return rest;
}
