import { Filter, filterFactory } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { FilterRelationsRules } from '@/shared/utils/filter-relations';

const countryFilter = filterFactory.members(DM.Country.Country, []);
const yearsFilter = filterFactory.members(DM.Commerce.Date.Years, []);
const revenueFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 0);
const conditionFilter = filterFactory.members(DM.Commerce.Condition, ['Unspecified']);
const genderFilter = filterFactory.members(DM.Commerce.Gender, []);

export const filtersMock: Filter[] = [
  countryFilter,
  yearsFilter,
  revenueFilter,
  conditionFilter,
  genderFilter,
];

export const relationsMock: FilterRelationsRules = {
  left: {
    left: {
      instanceid: countryFilter.config.guid,
    },
    right: {
      instanceid: yearsFilter.config.guid,
    },
    operator: 'OR',
  },
  right: {
    left: {
      instanceid: revenueFilter.config.guid,
    },
    right: {
      left: {
        instanceid: conditionFilter.config.guid,
      },
      right: {
        instanceid: genderFilter.config.guid,
      },
      operator: 'AND',
    },
    operator: 'OR',
  },
  operator: 'AND',
};
