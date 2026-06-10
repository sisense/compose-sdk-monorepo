import {
  CERTIFIED_DATA_MODEL_FOR_AI_DATA_SOURCE,
  CERTIFIED_DATA_MODEL_FOR_AI_TABLES,
} from '../../../__mocks__/nlq-v3-translator/data-schemas.js';
import { CERTIFIED_DATA_MODEL_FOR_AI_TOP_10_ACCOUNTS_BY_DEPLOYMENTS_COUNT_BAR_CHART_WIDGET } from '../../../__mocks__/nlq-v3-translator/example-widgets.js';
import { translateWidgetFromJSON } from '../nlq-v3-translator/widget/translate-widget-from-json.js';
import { CustomSuperJSON } from './custom-superjson.js';

describe('CustomSuperJSON — widgetProps with filters in customFormula context', () => {
  it('should round-trip widget props where DimensionalCalculatedMeasure context contains MembersFilter values', () => {
    const result = translateWidgetFromJSON({
      data: CERTIFIED_DATA_MODEL_FOR_AI_TOP_10_ACCOUNTS_BY_DEPLOYMENTS_COUNT_BAR_CHART_WIDGET,
      context: {
        dataSource: CERTIFIED_DATA_MODEL_FOR_AI_DATA_SOURCE,
        tables: CERTIFIED_DATA_MODEL_FOR_AI_TABLES,
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const widgetProps = result.data;
    expect(CustomSuperJSON.parse(CustomSuperJSON.stringify(widgetProps))).toStrictEqual(
      widgetProps,
    );
  });
});
