import {
  Dimension,
  DateDimension,
  Attribute,
  createAttribute,
  createDateDimension,
  createDimension,
} from '@sisense/sdk-data';

export const DataSource = 'Olympics';

interface athletesDimension extends Dimension {
  bronze: Attribute;
  gold: Attribute;
  height: Attribute;
  athletes_id: Attribute;
  info: Attribute;
  athletes_name: Attribute;
  nationality: Attribute;
  sex: Attribute;
  silver: Attribute;
  sport: Attribute;
  weight: Attribute;
  date_of_birth: DateDimension;
}
export const athletes = createDimension({
  name: 'athletes',
  bronze: createAttribute({
    name: 'bronze',
    type: 'numeric-attribute',
    expression: '[athletes.bronze]',
  }),
  gold: createAttribute({
    name: 'gold',
    type: 'numeric-attribute',
    expression: '[athletes.gold]',
  }),
  height: createAttribute({
    name: 'height',
    type: 'numeric-attribute',
    expression: '[athletes.height]',
  }),
  athletes_id: createAttribute({
    name: 'athletes_id',
    type: 'numeric-attribute',
    expression: '[athletes.id]',
  }),
  info: createAttribute({
    name: 'info',
    type: 'text-attribute',
    expression: '[athletes.info]',
  }),
  athletes_name: createAttribute({
    name: 'athletes_name',
    type: 'text-attribute',
    expression: '[athletes.name]',
  }),
  nationality: createAttribute({
    name: 'nationality',
    type: 'text-attribute',
    expression: '[athletes.nationality]',
  }),
  sex: createAttribute({
    name: 'sex',
    type: 'text-attribute',
    expression: '[athletes.sex]',
  }),
  silver: createAttribute({
    name: 'silver',
    type: 'numeric-attribute',
    expression: '[athletes.silver]',
  }),
  sport: createAttribute({
    name: 'sport',
    type: 'text-attribute',
    expression: '[athletes.sport]',
  }),
  weight: createAttribute({
    name: 'weight',
    type: 'numeric-attribute',
    expression: '[athletes.weight]',
  }),
  date_of_birth: createDateDimension({
    name: 'date_of_birth',
    expression: '[athletes.date_of_birth (Calendar)]',
  }),
}) as athletesDimension;
