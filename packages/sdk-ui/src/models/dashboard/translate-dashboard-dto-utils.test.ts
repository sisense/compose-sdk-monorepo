import { CascadingFilter, filterFactory, measureFactory, MembersFilter } from '@sisense/sdk-data';
import * as DM from '../../__test-helpers__/sample-ecommerce';
import { filterToFilterDto } from '@/models/dashboard/translate-dashboard-dto-utils';
import { CascadingFilterDto, FilterDto } from '@/api/types/dashboard-dto';

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
    const filter = new CascadingFilter(
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

/** Removes the instanceid from the filter dto */
function withoutInstanceId<T extends FilterDto | CascadingFilterDto>(
  filter: T,
): Omit<T, 'instanceid'> {
  // eslint-disable-next-line no-unused-vars
  const { instanceid, ...rest } = filter;
  return rest;
}
