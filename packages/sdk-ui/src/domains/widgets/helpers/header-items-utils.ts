import type { HeaderItem } from '@/domains/shared/header';

import type { WidgetProps } from '../components/widget/types';
import type { WidgetHeaderConfig, WidgetHeaderItemsTransform } from '../shared/widget-header/types';

/**
 * Transformer: appends items to a header config's `items` (pure, non-mutating).
 *
 * Features contribute their built-in items through the same public array users do; what lets them
 * claim a reserved {@link WidgetHeaderTargets} id is the `asBuiltInHeaderItem` marking on the item
 * itself, not a separate config channel.
 *
 * @param items - The items to append.
 * @returns A transformer that maps a WidgetHeaderConfig to one carrying the extra items.
 * @internal
 */
export function withHeaderItemsInConfig(
  items: readonly HeaderItem[],
): (headerConfig: WidgetHeaderConfig) => WidgetHeaderConfig {
  return (headerConfig) => ({
    ...headerConfig,
    items: [...(headerConfig.items ?? []), ...items],
  });
}

/**
 * Adds items to a widget's `config.header.items` (transforms full WidgetProps).
 *
 * @param items - The items to append.
 * @returns A transformer that maps WidgetProps to WidgetProps carrying the extra items.
 * @internal
 */
export function withHeaderItems(
  items: readonly HeaderItem[],
): (props: Readonly<WidgetProps>) => WidgetProps {
  return (props) => ({
    ...props,
    config: {
      ...props.config,
      header: withHeaderItemsInConfig(items)(props.config?.header ?? {}),
    },
  });
}

/**
 * Transformer: adds an internal items transform to a header config, running it *after* the config's
 * own `onBeforeRender` (pure, non-mutating).
 *
 * Internal transforms run last on purpose: a feature that decorates built-in items (e.g. the
 * editable layout's drag handle) has to keep working on whatever list the consumer's
 * `onBeforeRender` produced, rather than being undone by it.
 *
 * @param transform - The items transform to add.
 * @returns A transformer that maps a WidgetHeaderConfig to one running `transform` last.
 * @internal
 */
export function withHeaderItemsTransformInConfig(
  transform: WidgetHeaderItemsTransform,
): (headerConfig: WidgetHeaderConfig) => WidgetHeaderConfig {
  return (headerConfig) => {
    const { onBeforeRender } = headerConfig;
    return {
      ...headerConfig,
      onBeforeRender: onBeforeRender ? (items) => transform(onBeforeRender(items)) : transform,
    };
  };
}

/**
 * Adds an internal items transform to a widget's `config.header.onBeforeRender` (transforms full
 * WidgetProps).
 *
 * @param transform - The items transform to add.
 * @returns A transformer that maps WidgetProps to WidgetProps running `transform` last.
 * @internal
 */
export function withHeaderItemsTransform(
  transform: WidgetHeaderItemsTransform,
): (props: Readonly<WidgetProps>) => WidgetProps {
  return (props) => ({
    ...props,
    config: {
      ...props.config,
      header: withHeaderItemsTransformInConfig(transform)(props.config?.header ?? {}),
    },
  });
}
