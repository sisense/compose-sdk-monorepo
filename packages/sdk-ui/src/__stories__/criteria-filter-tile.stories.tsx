import { templateForComponent } from './template.js';
import { CriteriaFilterTile } from '../filters/components/criteria-filter-tile/criteria-filter-tile.js';
import { Filter, NumericFilter, createAttribute, filters } from '@sisense/sdk-data';

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

export const VerticalWithSingleInput = template({
  title: 'VerticalWithSingleInput',
  filter: (filters.equals(mockAttribute, 0) as NumericFilter).serializable(),
  onUpdate,
});
