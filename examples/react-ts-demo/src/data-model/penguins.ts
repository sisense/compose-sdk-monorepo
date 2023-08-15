import {
  Dimension,
  DateDimension,
  Attribute,
  createAttribute,
  createDateDimension,
  createDimension,
} from '@sisense/sdk-data';

export const DataSource = 'Penguins';

interface penguincsvDimension extends Dimension {
  BodyMass: Attribute;
  ClutchCompletion: Attribute;
  Comments: Attribute;
  CulmenDepth: Attribute;
  CulmenLength: Attribute;
  Delta13Cooo: Attribute;
  Delta15Nooo: Attribute;
  FlipperLength: Attribute;
  IndividualID: Attribute;
  Island: Attribute;
  Region: Attribute;
  SampleNumber: Attribute;
  Sex: Attribute;
  Species: Attribute;
  Stage: Attribute;
  studyName: Attribute;
  DateEgg: DateDimension;
}
export const penguins = createDimension({
  name: 'penguin.csv',
  BodyMass: createAttribute({
    name: 'BodyMass',
    type: 'numeric-attribute',
    expression: '[penguin.csv.Body Mass (g)]',
  }),
  ClutchCompletion: createAttribute({
    name: 'ClutchCompletion',
    type: 'text-attribute',
    expression: '[penguin.csv.Clutch Completion]',
  }),
  Comments: createAttribute({
    name: 'Comments',
    type: 'text-attribute',
    expression: '[penguin.csv.Comments]',
  }),
  CulmenDepth: createAttribute({
    name: 'CulmenDepth',
    type: 'numeric-attribute',
    expression: '[penguin.csv.Culmen Depth (mm)]',
  }),
  CulmenLength: createAttribute({
    name: 'CulmenLength',
    type: 'numeric-attribute',
    expression: '[penguin.csv.Culmen Length (mm)]',
  }),
  Delta13Cooo: createAttribute({
    name: 'Delta13Cooo',
    type: 'numeric-attribute',
    expression: '[penguin.csv.Delta 13 C (o/oo)]',
  }),
  Delta15Nooo: createAttribute({
    name: 'Delta15Nooo',
    type: 'numeric-attribute',
    expression: '[penguin.csv.Delta 15 N (o/oo)]',
  }),
  FlipperLength: createAttribute({
    name: 'FlipperLength',
    type: 'numeric-attribute',
    expression: '[penguin.csv.Flipper Length (mm)]',
  }),
  IndividualID: createAttribute({
    name: 'IndividualID',
    type: 'text-attribute',
    expression: '[penguin.csv.Individual ID]',
  }),
  Island: createAttribute({
    name: 'Island',
    type: 'text-attribute',
    expression: '[penguin.csv.Island]',
  }),
  Region: createAttribute({
    name: 'Region',
    type: 'text-attribute',
    expression: '[penguin.csv.Region]',
  }),
  SampleNumber: createAttribute({
    name: 'SampleNumber',
    type: 'numeric-attribute',
    expression: '[penguin.csv.Sample Number]',
  }),
  Sex: createAttribute({
    name: 'Sex',
    type: 'text-attribute',
    expression: '[penguin.csv.Sex]',
  }),
  Species: createAttribute({
    name: 'Species',
    type: 'text-attribute',
    expression: '[penguin.csv.Species]',
  }),
  Stage: createAttribute({
    name: 'Stage',
    type: 'text-attribute',
    expression: '[penguin.csv.Stage]',
  }),
  studyName: createAttribute({
    name: 'studyName',
    type: 'text-attribute',
    expression: '[penguin.csv.studyName]',
  }),
  DateEgg: createDateDimension({
    name: 'DateEgg',
    expression: '[penguin.csv.Date Egg (Calendar)]',
  }),
}) as penguincsvDimension;
