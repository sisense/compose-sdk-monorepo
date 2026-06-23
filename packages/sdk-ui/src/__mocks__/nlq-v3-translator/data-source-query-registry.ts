import { QueryInput } from '@/modules/analytics-composer/index-node.js';

import {
  BENCHMARK_SNOWFLAKE_DATA_SOURCE,
  BENCHMARK_SNOWFLAKE_TABLES,
  CERTIFIED_DATA_MODEL_FOR_AI_DATA_SOURCE,
  CERTIFIED_DATA_MODEL_FOR_AI_TABLES,
  SAMPLE_ECOMMERCE_DATA_SOURCE,
  SAMPLE_ECOMMERCE_TABLES,
  SAMPLE_HEALTHCARE_DATA_SOURCE,
  SAMPLE_HEALTHCARE_TABLES,
  SAMPLE_LEAD_GENERATION_DATA_SOURCE,
  SAMPLE_LEAD_GENERATION_TABLES,
  SAMPLE_RETAIL_DATA_SOURCE,
  SAMPLE_RETAIL_TABLES,
} from './data-schemas.js';
import {
  BENCHMARK_SNOWFLAKE_DEFAULT_QUERY,
  BENCHMARK_SNOWFLAKE_TOTAL_PRICE_AND_QUANTITY_GROWTH_SUMMARY_QUERY,
  CERTIFIED_DATA_MODEL_FOR_AI_CUBE_SIZE_BY_LICENSE_ATOBI_QUERY,
  CERTIFIED_DATA_MODEL_FOR_AI_TOP_10_ACCOUNTS_BY_DEPLOYMENTS_COUNT_QUERY,
  SAMPLE_ECOMMERCE_COMPLEX_QUERY,
  SAMPLE_ECOMMERCE_MEASURED_VALUE_REVENUE_BY_GENDER_QUERY,
  SAMPLE_ECOMMERCE_QUERY_WITH_NESTED_FILTER_RELATIONS,
  SAMPLE_ECOMMERCE_QUERY_WITH_STYLED_COLUMNS,
  SAMPLE_ECOMMERCE_QUERY_WITH_TREND_AND_FORECAST_MEASURES,
  SAMPLE_ECOMMERCE_QUERY_WITH_TREND_AND_FORECAST_PROPS,
  SAMPLE_ECOMMERCE_SIMPLE_QUERY,
  SAMPLE_HEALTHCARE_AVG_DAYS_ADMITTED_WITH_ANNUAL_CHANGE,
  SAMPLE_HEALTHCARE_DEFAULT_QUERY,
} from './example-queries.js';

/**
 * Creates a fresh empty query data object.
 * Returns a new object instance each time to prevent shared-reference mutations.
 *
 * @returns A new empty query data object with empty arrays for dimensions, measures, and filters
 */
function createEmptyQueryData() {
  return { dimensions: [], measures: [], filters: [] };
}

export const DATA_SOURCE_QUERY_REGISTRY: Record<string, Record<string, QueryInput>> = {
  'Sample ECommerce': {
    'Simple Query': {
      data: SAMPLE_ECOMMERCE_SIMPLE_QUERY,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Complex Query': {
      data: SAMPLE_ECOMMERCE_COMPLEX_QUERY,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Styled Columns': {
      data: SAMPLE_ECOMMERCE_QUERY_WITH_STYLED_COLUMNS,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Trend and Forecast as Measures': {
      data: SAMPLE_ECOMMERCE_QUERY_WITH_TREND_AND_FORECAST_MEASURES,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Trend and Forecast as Props': {
      data: SAMPLE_ECOMMERCE_QUERY_WITH_TREND_AND_FORECAST_PROPS,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Nested filter relations (OR/AND)': {
      data: SAMPLE_ECOMMERCE_QUERY_WITH_NESTED_FILTER_RELATIONS,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    'Measured Value - Revenue by Gender': {
      data: SAMPLE_ECOMMERCE_MEASURED_VALUE_REVENUE_BY_GENDER_QUERY,
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
    Empty: {
      data: createEmptyQueryData(),
      context: {
        dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
        tables: SAMPLE_ECOMMERCE_TABLES,
      },
    },
  },
  'Sample Retail': {
    Default: {
      data: createEmptyQueryData(),
      context: {
        dataSource: SAMPLE_RETAIL_DATA_SOURCE,
        tables: SAMPLE_RETAIL_TABLES,
      },
    },
    Empty: {
      data: createEmptyQueryData(),
      context: {
        dataSource: SAMPLE_RETAIL_DATA_SOURCE,
        tables: SAMPLE_RETAIL_TABLES,
      },
    },
  },
  'Sample Healthcare': {
    Default: {
      data: SAMPLE_HEALTHCARE_DEFAULT_QUERY,
      context: {
        dataSource: SAMPLE_HEALTHCARE_DATA_SOURCE,
        tables: SAMPLE_HEALTHCARE_TABLES,
      },
    },
    'Avg Days Admitted with Annual Change': {
      data: SAMPLE_HEALTHCARE_AVG_DAYS_ADMITTED_WITH_ANNUAL_CHANGE,
      context: {
        dataSource: SAMPLE_HEALTHCARE_DATA_SOURCE,
        tables: SAMPLE_HEALTHCARE_TABLES,
      },
    },
    Empty: {
      data: createEmptyQueryData(),
      context: {
        dataSource: SAMPLE_HEALTHCARE_DATA_SOURCE,
        tables: SAMPLE_HEALTHCARE_TABLES,
      },
    },
  },
  'Sample Lead Generation': {
    Default: {
      data: createEmptyQueryData(),
      context: {
        dataSource: SAMPLE_LEAD_GENERATION_DATA_SOURCE,
        tables: SAMPLE_LEAD_GENERATION_TABLES,
      },
    },
    Empty: {
      data: createEmptyQueryData(),
      context: {
        dataSource: SAMPLE_LEAD_GENERATION_DATA_SOURCE,
        tables: SAMPLE_LEAD_GENERATION_TABLES,
      },
    },
  },
  Benchmark_test_snowflake: {
    Default: {
      data: BENCHMARK_SNOWFLAKE_DEFAULT_QUERY,
      context: {
        dataSource: BENCHMARK_SNOWFLAKE_DATA_SOURCE,
        tables: BENCHMARK_SNOWFLAKE_TABLES,
      },
    },
    'Total Price and Quantity Growth Summary': {
      data: BENCHMARK_SNOWFLAKE_TOTAL_PRICE_AND_QUANTITY_GROWTH_SUMMARY_QUERY,
      context: {
        dataSource: BENCHMARK_SNOWFLAKE_DATA_SOURCE,
        tables: BENCHMARK_SNOWFLAKE_TABLES,
      },
    },
    Empty: {
      data: createEmptyQueryData(),
      context: {
        dataSource: BENCHMARK_SNOWFLAKE_DATA_SOURCE,
        tables: BENCHMARK_SNOWFLAKE_TABLES,
      },
    },
  },
  certified_data_model_for_ai: {
    'CUBE_SIZE_GB by License for ATOBI': {
      data: CERTIFIED_DATA_MODEL_FOR_AI_CUBE_SIZE_BY_LICENSE_ATOBI_QUERY,
      context: {
        dataSource: CERTIFIED_DATA_MODEL_FOR_AI_DATA_SOURCE,
        tables: CERTIFIED_DATA_MODEL_FOR_AI_TABLES,
      },
    },
    'Top 10 Accounts by Deployments Count': {
      data: CERTIFIED_DATA_MODEL_FOR_AI_TOP_10_ACCOUNTS_BY_DEPLOYMENTS_COUNT_QUERY,
      context: {
        dataSource: CERTIFIED_DATA_MODEL_FOR_AI_DATA_SOURCE,
        tables: CERTIFIED_DATA_MODEL_FOR_AI_TABLES,
      },
    },
    Empty: {
      data: createEmptyQueryData(),
      context: {
        dataSource: CERTIFIED_DATA_MODEL_FOR_AI_DATA_SOURCE,
        tables: CERTIFIED_DATA_MODEL_FOR_AI_TABLES,
      },
    },
  },
};
