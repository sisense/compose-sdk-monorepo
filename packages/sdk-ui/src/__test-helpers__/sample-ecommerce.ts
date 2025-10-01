import {
  Dimension,
  DateDimension,
  Attribute,
  createAttribute,
  createDateDimension,
  createDimension,
} from '@ethings-os/sdk-data';

export const DataSource = 'Sample ECommerce';

interface BrandDimension extends Dimension {
  Brand: Attribute;
  BrandID: Attribute;
}
export const Brand = createDimension({
  name: 'Brand',
  Brand: createAttribute({
    name: 'Brand',
    type: 'text-attribute',
    expression: '[Brand.Brand]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  BrandID: createAttribute({
    name: 'Brand ID',
    type: 'numeric-attribute',
    expression: '[Brand.Brand ID]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
}) as BrandDimension;

interface CategoryDimension extends Dimension {
  Category: Attribute;
  CategoryID: Attribute;
}
export const Category = createDimension({
  name: 'Category',
  Category: createAttribute({
    name: 'Category',
    type: 'text-attribute',
    expression: '[Category.Category]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  CategoryID: createAttribute({
    name: 'Category ID',
    type: 'numeric-attribute',
    expression: '[Category.Category ID]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
}) as CategoryDimension;

interface CommerceDimension extends Dimension {
  AgeRange: Attribute;
  BrandID: Attribute;
  CategoryID: Attribute;
  Condition: Attribute;
  Cost: Attribute;
  CountryID: Attribute;
  DateMonth: Attribute;
  Gender: Attribute;
  Quantity: Attribute;
  Revenue: Attribute;
  VisitID: Attribute;
  Date: DateDimension;
}
export const Commerce = createDimension({
  name: 'Commerce',
  AgeRange: createAttribute({
    name: 'Age Range',
    type: 'text-attribute',
    expression: '[Commerce.Age Range]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  BrandID: createAttribute({
    name: 'Brand ID',
    type: 'numeric-attribute',
    expression: '[Commerce.Brand ID]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  CategoryID: createAttribute({
    name: 'Category ID',
    type: 'numeric-attribute',
    expression: '[Commerce.Category ID]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  Condition: createAttribute({
    name: 'Condition',
    type: 'text-attribute',
    expression: '[Commerce.Condition]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  Cost: createAttribute({
    name: 'Cost',
    type: 'numeric-attribute',
    expression: '[Commerce.Cost]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  CountryID: createAttribute({
    name: 'Country ID',
    type: 'numeric-attribute',
    expression: '[Commerce.Country ID]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  DateMonth: createAttribute({
    name: 'DateMonth',
    type: 'numeric-attribute',
    expression: '[Commerce.Date (Month)]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  Gender: createAttribute({
    name: 'Gender',
    type: 'text-attribute',
    expression: '[Commerce.Gender]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  Quantity: createAttribute({
    name: 'Quantity',
    type: 'numeric-attribute',
    expression: '[Commerce.Quantity]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  Revenue: createAttribute({
    name: 'Revenue',
    type: 'numeric-attribute',
    expression: '[Commerce.Revenue]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  VisitID: createAttribute({
    name: 'Visit ID',
    type: 'numeric-attribute',
    expression: '[Commerce.Visit ID]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  Date: createDateDimension({
    name: 'Date',
    expression: '[Commerce.Date (Calendar)]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
}) as CommerceDimension;

interface CountryDimension extends Dimension {
  Country: Attribute;
  CountryID: Attribute;
}
export const Country = createDimension({
  name: 'Country',
  Country: createAttribute({
    name: 'Country',
    type: 'text-attribute',
    expression: '[Country.Country]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
  CountryID: createAttribute({
    name: 'Country ID',
    type: 'numeric-attribute',
    expression: '[Country.Country ID]',
    dataSource: {
      title: 'Sample ECommerce',
      live: false,
    },
  }),
}) as CountryDimension;
