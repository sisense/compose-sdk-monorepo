import omit from 'lodash-es/omit';

import type { WidgetConfig } from '@/domains/widgets/components/widget/types.js';

import type {
  DataSchemaContext,
  NlqTranslationInput,
  NlqTranslationResult,
} from '../../../types.js';
import type { DataSourceJSON } from '../../types.js';
import type { WidgetMeta } from './to-widget-props.js';

const WIDGET_ENVELOPE_OMIT_KEYS = [
  'widgetType',
  'id',
  'title',
  'description',
  'dataSource',
  'config',
  'highlightSelectionDisabled',
] as const;

type WidgetEnvelopeJSON = {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly dataSource?: DataSourceJSON;
  readonly config?: WidgetConfig;
  readonly highlightSelectionDisabled?: boolean;
};

/**
 * Strips widget envelope fields and delegates to a chart/pivot sub-translator,
 * then maps component props to widget props with metadata.
 *
 * @internal
 */
export const translateEnvelopeWidgetFromJSON = <
  TWidgetJSON extends WidgetEnvelopeJSON,
  TPayload,
  TComponentProps,
  TWidgetProps,
>(
  widgetJSON: TWidgetJSON,
  context: DataSchemaContext,
  translate: (
    input: NlqTranslationInput<TPayload, DataSchemaContext>,
  ) => NlqTranslationResult<TComponentProps>,
  toWidgetProps: (props: TComponentProps, meta: WidgetMeta) => TWidgetProps,
): NlqTranslationResult<TWidgetProps> => {
  const { id, title, description, dataSource, config, highlightSelectionDisabled } = widgetJSON;
  const payload = omit(widgetJSON, WIDGET_ENVELOPE_OMIT_KEYS) as TPayload;
  const result = translate({ data: payload, context });
  if (!result.success) {
    return result;
  }
  return {
    success: true,
    data: toWidgetProps(result.data, {
      id,
      title,
      description,
      dataSource,
      config,
      highlightSelectionDisabled,
    }),
  };
};
