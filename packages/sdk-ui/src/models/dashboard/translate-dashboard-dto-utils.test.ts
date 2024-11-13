import {
  CascadingFilter,
  createDimension,
  filterFactory,
  measureFactory,
  MembersFilter,
} from '@sisense/sdk-data';
import * as DM from '../../__test-helpers__/sample-ecommerce';
import { filterToFilterDto } from '@/models/dashboard/translate-dashboard-dto-utils';
import { CascadingFilterDto, FilterDto } from '@/api/types/dashboard-dto';

describe('baseFilterToFilterDto', () => {
  it('should return correctly translated simple filter', () => {
    const filter = filterFactory.members(DM.Commerce.Gender, ['Male']);
    const result = filterToFilterDto(filter);
    expect(result).toEqual({
      jaql: {
        title: 'Gender',
        dim: '[Commerce.Gender]',
        datatype: 'text',
        filter: { members: ['Male'], multiSelection: true },
        table: 'Commerce',
        column: 'Gender',
      },
      disabled: false,
      instanceid: filter.guid,
      isCascading: false,
    });
  });

  it('should return correctly translated disabled filter', () => {
    const filter = filterFactory.members(DM.Commerce.Gender, ['Female']);
    filter.disabled = true;
    const result = filterToFilterDto(filter);
    expect(result).toEqual({
      jaql: {
        title: 'Gender',
        dim: '[Commerce.Gender]',
        datatype: 'text',
        filter: { members: ['Female'], multiSelection: true },
        table: 'Commerce',
        column: 'Gender',
      },
      disabled: true,
      instanceid: filter.guid,
      isCascading: false,
    });
  });

  it('should return correctly translated members filter with disabled members', () => {
    const filter = filterFactory.members(DM.Commerce.Gender, ['Female']) as MembersFilter;
    filter.deactivatedMembers = ['Male'];
    const result = filterToFilterDto(filter) as FilterDto;

    expect(result.jaql.filter).toEqual({
      members: ['Female', 'Male'],
      filter: { exclude: { members: ['Male'] }, turnedOff: true },
      multiSelection: true,
    });
  });

  it('should return correctly translated exclude members filter', () => {
    const filter = filterFactory.members(DM.Commerce.Gender, ['Female'], true);
    const result = filterToFilterDto(filter) as FilterDto;

    expect(result.jaql.filter).toEqual({
      exclude: {
        members: ['Female'],
      },
      multiSelection: true,
    });
  });

  it('should return correctly translated members filter with background filter', () => {
    const filter = filterFactory.members(
      DM.Commerce.Gender,
      ['Female'],
      false,
      undefined,
      undefined,
      filterFactory.members(DM.Commerce.Gender, ['Female', 'Male']),
    );
    const result = filterToFilterDto(filter) as FilterDto;

    expect(result.jaql.filter.filter).toEqual({
      members: ['Female', 'Male'],
      multiSelection: true,
    });
  });

  it('should return correctly translated ranking filter', () => {
    const filter = filterFactory.bottomRanking(
      DM.Commerce.AgeRange,
      measureFactory.sum(DM.Commerce.Revenue),
      5,
    );
    const result = filterToFilterDto(filter) as FilterDto;

    expect(result.jaql.filter).toEqual({
      bottom: 5,
      by: {
        agg: 'sum',
        column: 'Revenue',
        datatype: 'numeric',
        dim: '[Commerce.Revenue]',
        table: 'Commerce',
        title: 'sum Revenue',
      },
      rankingMessage: 'sum Revenue',
    });
  });

  it('should return correctly translated base filter', () => {
    const TextDim = createDimension({
      name: 'text',
      type: 'textdimension',
      expression: '[Text]',
    });

    const filter = filterFactory.doesntContain(TextDim, 'mem');
    const result = filterToFilterDto(filter) as FilterDto;

    expect(result.jaql.filter).toEqual({
      doesntContain: 'mem',
    });
  });

  it('should return correctly translated cascading filter', () => {
    const filter = new CascadingFilter([
      filterFactory.members(DM.Commerce.BrandID, ['1']),
      filterFactory.members(DM.Commerce.Gender, ['Female']),
    ]);
    const result = filterToFilterDto(filter) as CascadingFilterDto;

    expect(result).toEqual({
      isCascading: true,
      instanceid: 'cascading_[Commerce.Brand ID]_1,[Commerce.Gender]_Female',
      disabled: false,
      levels: [
        {
          title: 'Brand ID',
          dim: '[Commerce.Brand ID]',
          datatype: 'numeric',
          filter: { members: ['1'], multiSelection: true },
          table: 'Commerce',
          column: 'Brand ID',
        },
        {
          title: 'Gender',
          dim: '[Commerce.Gender]',
          datatype: 'text',
          filter: { members: ['Female'], multiSelection: true },
          table: 'Commerce',
          column: 'Gender',
        },
      ],
    });
  });
});
