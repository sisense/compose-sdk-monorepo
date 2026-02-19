import { MetadataItem } from '@sisense/sdk-data';

export const MOCK_METADATA = [
  {
    jaql: {
      table: 'fact_table',
      column: 'property_name',
      dim: '[fact_table.property_name]',
      datatype: 'text',
      merged: true,
      title: 'Property',
    },
    panel: 'rows',
    field: {
      id: '[fact_table.property_name]',
      index: 0,
    },
    instanceid: 'D00EC-DDCC-05',
    format: {
      width: 219.703125,
    },
    handlers: [],
  },
  {
    jaql: {
      table: 'fact_table',
      column: 'tenant_name',
      dim: '[fact_table.tenant_name]',
      datatype: 'text',
      merged: true,
      title: 'Tenant',
      sort: 'asc',
      sortDetails: {
        field: 0,
        dir: 'asc',
        measurePath: null,
        sortingLastDimension: true,
        initialized: true,
      },
    },
    panel: 'rows',
    field: {
      id: '[fact_table.tenant_name]',
      index: 1,
    },
    disabled: false,
    format: {
      width: 180.0833282470703,
    },
    instanceid: '7C77C-7A38-38',
    handlers: [],
  },
  {
    jaql: {
      table: 'fact_table',
      column: 'pre_payments',
      dim: '[fact_table.pre_payments]',
      datatype: 'numeric',
      agg: 'sum',
      title: 'Pre-Payments ($)',
    },
    panel: 'measures',
    field: {
      id: '[fact_table.pre_payments]_sum',
      index: 2,
    },
    format: {
      mask: {
        abbreviations: {
          t: false,
          b: false,
          m: false,
          k: false,
        },
        decimals: 0,
        currency: {
          symbol: '$',
          position: 'pre',
        },
        abbreviateAll: false,
      },
      color: {
        type: 'color',
        color: 'transparent',
      },
    },
    instanceid: 'D9BC7-D782-EB',
    handlers: [{}, {}],
  },
  {
    jaql: {
      type: 'measure',
      formula: 'Contribution([8B052-023])',
      context: {
        '[8B052-023]': {
          table: 'fact_table',
          column: 'thirty',
          dim: '[fact_table.thirty]',
          datatype: 'numeric',
          agg: 'sum',
          title: '0-30 Days ($) (1)',
        },
      },
      datatype: 'numeric',
      title: '0-30 Days Contribution (%)',
    },
    format: {
      mask: {
        decimals: 2,
        percent: true,
      },
      color: {
        type: 'color',
        color: 'transparent',
      },
      width: 154.859375,
    },
    panel: 'measures',
    field: {
      id: '[fact_table.thirty]_sum',
      index: 3,
    },
    instanceid: '84C45-44A5-F1',
    originalJaql: {
      table: 'fact_table',
      column: 'thirty',
      dim: '[fact_table.thirty]',
      datatype: 'numeric',
      agg: 'sum',
      title: '0-30 Days ($) (1)',
    },
    quickFunction: 'Contribution',
    handlers: [{}, {}],
  },
  {
    jaql: {
      table: 'fact_table',
      column: 'thirty',
      dim: '[fact_table.thirty]',
      datatype: 'numeric',
      agg: 'sum',
      title: '0-30 Days ($)',
    },
    format: {
      mask: {
        abbreviations: {
          t: false,
          b: false,
          m: false,
          k: false,
        },
        decimals: 0,
        currency: {
          symbol: '$',
          position: 'pre',
        },
      },
      color: {
        type: 'color',
        color: 'transparent',
      },
    },
    panel: 'measures',
    field: {
      id: '[fact_table.thirty]_sum',
      index: 4,
    },
    instanceid: '84C45-44A5-F1',
    handlers: [{}, {}],
  },
  {
    jaql: {
      table: 'fact_table',
      column: 'sixty',
      dim: '[fact_table.sixty]',
      datatype: 'numeric',
      agg: 'sum',
      title: '31-60 Days ($)',
    },
    format: {
      mask: {
        abbreviations: {
          t: false,
          b: false,
          m: false,
          k: false,
        },
        decimals: 0,
        currency: {
          symbol: '$',
          position: 'pre',
        },
      },
      color: {
        type: 'color',
        color: 'transparent',
      },
    },
    panel: 'measures',
    field: {
      id: '[fact_table.sixty]_sum',
      index: 5,
    },
    instanceid: 'C1CCD-0086-2C',
    handlers: [{}, {}],
  },
  {
    jaql: {
      table: 'fact_table',
      column: 'ninety',
      dim: '[fact_table.ninety]',
      datatype: 'numeric',
      agg: 'sum',
      title: '61-90 Days ($)',
    },
    format: {
      mask: {
        abbreviations: {
          t: false,
          b: false,
          m: false,
          k: false,
        },
        decimals: 0,
        currency: {
          symbol: '$',
          position: 'pre',
        },
      },
      color: {
        type: 'color',
        color: 'transparent',
      },
    },
    panel: 'measures',
    field: {
      id: '[fact_table.ninety]_sum',
      index: 6,
    },
    instanceid: '5455B-CA08-F4',
    handlers: [{}, {}],
  },
  {
    jaql: {
      type: 'measure',
      formula: '[76069-DDA]',
      context: {
        '[76069-DDA]': {
          table: 'fact_table',
          column: 'over_ninety',
          dim: '[fact_table.over_ninety]',
          datatype: 'numeric',
          agg: 'sum',
          title: 'Total over_ninety',
        },
      },
      title: '90+ Days ($)',
      datatype: 'numeric',
    },
    format: {
      mask: {
        abbreviations: {
          t: false,
          b: false,
          m: false,
          k: false,
        },
        decimals: 0,
        currency: {
          symbol: '$',
          position: 'pre',
        },
      },
      color: {
        type: 'color',
        color: 'transparent',
      },
      width: 133.0625,
    },
    panel: 'measures',
    field: {
      id: '[fact_table.over]_sum',
      index: 7,
    },
    instanceid: '546F3-F044-F4',
    handlers: [{}, {}],
  },
  {
    jaql: {
      table: 'fact_table',
      column: 'total_delinquency',
      dim: '[fact_table.total_delinquency]',
      datatype: 'numeric',
      agg: 'sum',
      title: 'Total Delinquency ($)',
    },
    instanceid: '3C86F-F49C-15',
    panel: 'measures',
    field: {
      id: '[fact_table.total_delinquency]_sum',
      index: 8,
    },
    format: {
      mask: {
        abbreviations: {
          t: false,
          b: false,
          m: false,
          k: false,
        },
        decimals: 0,
        currency: {
          symbol: '$',
          position: 'pre',
        },
        abbreviateAll: false,
      },
      color: {
        type: 'color',
        color: 'transparent',
      },
      width: 197.03125,
    },
    handlers: [{}, {}],
  },
] as unknown as MetadataItem[];
