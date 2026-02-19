/* eslint-disable sonarjs/no-duplicate-string */
import {
  DateLevels,
  DimensionalLevelAttribute,
  Filter,
  filterFactory,
  RelativeDateFilter,
} from '@sisense/sdk-data';

import { RelativeDateFilterTile } from '../domains/filters/components/date-filter/relative-date-filter-tile/index.js';
import { templateForComponent } from './template.js';

const template = templateForComponent(RelativeDateFilterTile);

export default {
  title: 'filters/RelativeDateFilterTile',
  component: RelativeDateFilterTile,
};

const mockAttributeDays = new DimensionalLevelAttribute(
  DateLevels.Days,
  '[Commerce.Date (Calendar)]',
  DateLevels.Days,
);
const mockAttributeYears = new DimensionalLevelAttribute(
  'Years',
  '[Commerce.Date (Calendar)]',
  DateLevels.Years,
);

const onUpdate = (filter: Filter | null) => {
  console.log('onUpdate:', filter);
};

export const Vertical = template({
  title: 'Relative Date: Vertical',
  filter: filterFactory.dateRelativeTo(mockAttributeDays, 0, 2) as RelativeDateFilter,
  arrangement: 'vertical',
  onUpdate,
  limit: {
    maxDate: '2025-01-01',
    minDate: '2019-01-01',
  },
});

export const Horizontal = template({
  title: 'Relative Date: Horizontal',
  filter: filterFactory.dateRelativeFrom(mockAttributeYears, 0, 1) as RelativeDateFilter,
  arrangement: 'horizontal',
  onUpdate,
});
