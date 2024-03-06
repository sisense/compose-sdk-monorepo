export const dimensionalModelECommerce = {
  name: 'Sample ECommerce',
  dataSource: 'Sample ECommerce',
  metadata: [
    {
      attributes: [
        {
          expression: '[Brand.Brand]',
          name: 'Brand',
          type: 'text-attribute',
        },
        {
          expression: '[Brand.Brand ID]',
          name: 'Brand ID',
          type: 'numeric-attribute',
        },
      ],
      dimensions: [],
      name: 'Brand',
      type: 'dimension',
    },
    {
      attributes: [
        {
          expression: '[Category.Category]',
          name: 'Category',
          type: 'text-attribute',
        },
        {
          expression: '[Category.Category ID]',
          name: 'Category ID',
          type: 'numeric-attribute',
        },
      ],
      dimensions: [],
      name: 'Category',
      type: 'dimension',
    },
    {
      attributes: [
        {
          expression: '[Commerce.Age Range]',
          name: 'Age Range',
          type: 'text-attribute',
        },
        {
          expression: '[Commerce.Brand ID]',
          name: 'Brand ID',
          type: 'numeric-attribute',
        },
        {
          expression: '[Commerce.Category ID]',
          name: 'Category ID',
          type: 'numeric-attribute',
        },
        {
          expression: '[Commerce.Condition]',
          name: 'Condition',
          type: 'text-attribute',
        },
        {
          expression: '[Commerce.Cost]',
          name: 'Cost',
          type: 'numeric-attribute',
        },
        {
          expression: '[Commerce.Country ID]',
          name: 'Country ID',
          type: 'numeric-attribute',
        },
        {
          expression: '[Commerce.Date (Month)]',
          name: 'Date (Month)',
          type: 'numeric-attribute',
        },
        {
          expression: '[Commerce.Gender]',
          name: 'Gender',
          type: 'text-attribute',
        },
        {
          expression: '[Commerce.Quantity]',
          name: 'Quantity',
          type: 'numeric-attribute',
        },
        {
          expression: '[Commerce.Revenue]',
          name: 'Revenue',
          type: 'numeric-attribute',
        },
        {
          expression: '[Commerce.Visit ID]',
          name: 'Visit ID',
          type: 'numeric-attribute',
        },
      ],
      dimensions: [
        {
          expression: '[Commerce.Date (Calendar)]',
          name: 'Date',
          type: 'datedimension',
        },
      ],
      name: 'Commerce',
      type: 'dimension',
    },
    {
      attributes: [
        {
          expression: '[Country.Country]',
          name: 'Country',
          type: 'text-attribute',
        },
        {
          expression: '[Country.Country ID]',
          name: 'Country ID',
          type: 'numeric-attribute',
        },
      ],
      dimensions: [],
      name: 'Country',
      type: 'dimension',
    },
  ],
};
