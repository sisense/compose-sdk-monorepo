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
          description: 'Brand name',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: '[Brand.Brand ID]',
          name: 'Brand ID',
          type: 'numeric-attribute',
          description: 'Brand ID',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
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
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: "[Category.'Category ID']",
          name: 'Category ID',
          type: 'numeric-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
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
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: '[Commerce.Brand ID]',
          name: 'Brand ID',
          type: 'numeric-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: "[Commerce.'Category ID']",
          name: 'Category ID',
          type: 'numeric-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: '[Commerce.Condition]',
          name: 'Condition',
          type: 'text-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: '[Commerce.Cost]',
          name: 'Cost',
          type: 'numeric-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: '[Commerce.Country ID]',
          name: 'Country ID',
          type: 'numeric-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: '[Commerce.Date (Month)]',
          name: 'Date (Month)',
          type: 'numeric-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: '[Commerce.Gender]',
          name: 'Gender',
          type: 'text-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: '[Commerce.Quantity]',
          name: 'Quantity',
          type: 'numeric-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: '[Commerce.Revenue]',
          name: 'Revenue',
          type: 'numeric-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: '[Commerce.Visit ID]',
          name: 'Visit ID',
          type: 'numeric-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
      ],
      dimensions: [
        {
          expression: '[Commerce.Date (Calendar)]',
          name: 'Date',
          type: 'datedimension',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
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
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
        {
          expression: '[Country.Country ID]',
          name: 'Country ID',
          type: 'numeric-attribute',
          dataSource: {
            title: 'Sample ECommerce',
            live: false,
          },
        },
      ],
      dimensions: [],
      name: 'Country',
      type: 'dimension',
    },
  ],
};
