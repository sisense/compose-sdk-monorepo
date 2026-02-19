import { DateFilter } from '../domains/filters';
import { templateForComponent } from './template';

const template = templateForComponent(DateFilter);
const minDate = '2020-01-01';
const maxDate = '2020-12-31';

export default {
  title: 'filters/date',
  component: DateFilter,
};

export const DateRangeFilter = template({
  onChange(filter) {
    console.log('onChange', filter);
  },
  value: {
    from: minDate,
    to: maxDate,
  },
  limit: {
    maxDate,
    minDate,
  },
});

export const DateRangeFilterWithParentFilters = template({
  onChange(filter) {
    console.log('onChange', filter);
  },
  value: {
    from: minDate,
    to: maxDate,
  },
  limit: {
    maxDate,
    minDate,
  },
  isDependent: true,
});
