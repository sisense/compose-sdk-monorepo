import { templateForComponent } from './template.js';
import { CriteriaFilterTile } from '../filters/components/criteria-filter-tile/criteria-filter-tile.js';
import { Filter, NumericFilter, TextFilter, createAttribute, filters } from '@sisense/sdk-data';

const template = templateForComponent(CriteriaFilterTile);

export default {
  title: 'filters/CriteriaFilterTile',
  component: CriteriaFilterTile,
};

const mockAttribute = createAttribute({
  name: 'BrandID',
  type: 'numeric-attribute',
  expression: '[Commerce.Brand ID]',
});

const onUpdate = (filter: Filter | null) => {
  console.log('onUpdate:', filter);
};

export const VerticalWithTextInput = template({
  title: 'VerticalWithTextInput',
  filter: (filters.doesntContain(mockAttribute, 'foo') as TextFilter).serializable(),
  onUpdate,
});

export const VerticalWithSingleInput = template({
  title: 'VerticalWithSingleInput',
  filter: (filters.equals(mockAttribute, 0) as NumericFilter).serializable(),
  onUpdate,
});

export const VerticalWithDoubleInput = template({
  title: 'VerticalWithDoubleInput',
  filter: (filters.between(mockAttribute, 0, 100) as NumericFilter).serializable(),
  onUpdate,
});

export const HorizontalWithSingleInput = template({
  title: 'HorizontalWithSingleInput',
  filter: (filters.lessThanOrEqual(mockAttribute, 10) as NumericFilter).serializable(),
  arrangement: 'horizontal',
  onUpdate,
});

export const HorizontalWithDoubleInput = template({
  title: 'HorizontalWithDoubleInput',
  filter: (filters.between(mockAttribute, 0, 100) as NumericFilter).serializable(),
  arrangement: 'horizontal',
  onUpdate,
});

export const HorizontalWithTextInput = template({
  title: 'HorizontalWithTextInput',
  filter: (filters.doesntStartWith(mockAttribute, 'bar') as TextFilter).serializable(),
  arrangement: 'horizontal',
  onUpdate,
});
