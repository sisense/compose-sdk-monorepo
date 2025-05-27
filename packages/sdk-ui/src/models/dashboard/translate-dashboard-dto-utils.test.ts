import { filterFactory, measureFactory, MembersFilter } from '@sisense/sdk-data';
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
                    },
                  ],
                },
                {
                  width: 50,
                  elements: [
                    {
                      height: '250px',
                      widgetid: 'widget-3',
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
