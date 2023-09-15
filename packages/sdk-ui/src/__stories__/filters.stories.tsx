import { templateForComponent } from './template';
import { DateFilter } from '../filters';

const template = templateForComponent(DateFilter);

export default {
  title: 'filters/date',
  component: DateFilter,
};

export const DateRangeFilter = template({
  onChange(filter) {
    console.log('onChange', filter);
  },
  value: {
    from: '2020-01-01',
    to: '2020-12-31',
  },
  limit: {
    maxDate: '2020-12-31',
    minDate: '2020-01-01',
  },
});
