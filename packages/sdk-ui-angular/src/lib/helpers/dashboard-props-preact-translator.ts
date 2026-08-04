import type {
  DashboardByIdProps as DashboardByIdPropsPreact,
  DashboardHeaderConfig as DashboardHeaderConfigPreact,
  DashboardHeaderItemComponent as DashboardHeaderItemComponentPreact,
  DashboardHeaderItemsTransform as DashboardHeaderItemsTransformPreact,
  DashboardProps as DashboardPropsPreact,
} from '@sisense/sdk-ui-preact';

import type { DashboardByIdProps, DashboardProps } from '../components/dashboard';
import type {
  DashboardHeaderConfig,
  DashboardHeaderItemComponent,
  DashboardHeaderItemsTransform,
} from '../components/dashboard/dashboard-header-config';
import type { ComponentTranslator } from '../services/component-translator.service';
import { toPreactWidgetProps, toWidgetProps } from './widget-props-preact-translator';

/** A header item in either flavor, with its `component` swapped for `C`. */
type WithComponent<I, C> = Omit<I, 'component'> & { component: C };

/**
 * Converts the `component` of every header item to its preact counterpart. Without a component
 * translator the items are only re-typed — their components are carried through as they are.
 */
function toPreactHeaderItems<I extends { component: DashboardHeaderItemComponent }>(
  items: ReadonlyArray<I>,
  componentTranslator?: ComponentTranslator,
): WithComponent<I, DashboardHeaderItemComponentPreact>[] {
  if (!componentTranslator) {
    // structure-only mode: the item shapes match, only the component flavor differs
    return items as unknown as WithComponent<I, DashboardHeaderItemComponentPreact>[];
  }
  return items.map((item) => ({
    ...item,
    component: componentTranslator.toPreactComponent(item.component),
  }));
}

/** Mirror of {@link toPreactHeaderItems} for the preact -> Angular direction. */
function toHeaderItems<I extends { component: DashboardHeaderItemComponentPreact }>(
  items: ReadonlyArray<I>,
  componentTranslator?: ComponentTranslator,
): WithComponent<I, DashboardHeaderItemComponent>[] {
  if (!componentTranslator) {
    // structure-only mode: the item shapes match, only the component flavor differs
    return items as unknown as WithComponent<I, DashboardHeaderItemComponent>[];
  }
  return items.map((item) => ({
    ...item,
    component: componentTranslator.fromPreactComponent(item.component),
  }));
}

/**
 * Wraps the consumer's `beforeRender` so the renderer can call it with preact items.
 *
 * With a component translator the wrapper is two-way: the resolved list is converted to Angular
 * components on the way in, and the list the consumer returns is converted back to preact
 * components on the way out — so consumers only ever see Angular components. Without a translator
 * the items pass through untouched.
 */
function toPreactHeaderItemsTransform(
  beforeRender: DashboardHeaderItemsTransform,
  componentTranslator?: ComponentTranslator,
): DashboardHeaderItemsTransformPreact {
  return (resolvedItems) =>
    toPreactHeaderItems(
      beforeRender(toHeaderItems(resolvedItems, componentTranslator)),
      componentTranslator,
    );
}

/** Mirror of {@link toPreactHeaderItemsTransform} for the preact -> Angular direction. */
function toHeaderItemsTransform(
  onBeforeRender: DashboardHeaderItemsTransformPreact,
  componentTranslator?: ComponentTranslator,
): DashboardHeaderItemsTransform {
  return (resolvedItems) =>
    toHeaderItems(
      onBeforeRender(toPreactHeaderItems(resolvedItems, componentTranslator)),
      componentTranslator,
    );
}

function toPreactHeaderConfig(
  header: DashboardHeaderConfig,
  componentTranslator?: ComponentTranslator,
): DashboardHeaderConfigPreact {
  const { items, beforeRender, ...rest } = header;
  return {
    ...rest,
    ...(items && { items: toPreactHeaderItems(items, componentTranslator) }),
    // omitted entirely when the consumer provided no transform, so the renderer can skip it
    ...(beforeRender && {
      onBeforeRender: toPreactHeaderItemsTransform(beforeRender, componentTranslator),
    }),
  };
}

function toHeaderConfig(
  header: DashboardHeaderConfigPreact,
  componentTranslator?: ComponentTranslator,
): DashboardHeaderConfig {
  const { items, onBeforeRender, ...rest } = header;
  return {
    ...rest,
    ...(items && { items: toHeaderItems(items, componentTranslator) }),
    ...(onBeforeRender && {
      beforeRender: toHeaderItemsTransform(onBeforeRender, componentTranslator),
    }),
  };
}

/**
 * Translates the header section of a dashboard config, leaving every sibling section untouched.
 * Generic over the input `C` so the output type tracks it, rather than being cast to an
 * unconstrained free type parameter supplied by the caller.
 */
function toPreactConfig<C extends { header?: DashboardHeaderConfig }>(
  config: C,
  componentTranslator?: ComponentTranslator,
): Omit<C, 'header'> & { header?: DashboardHeaderConfigPreact } {
  const { header, ...rest } = config;
  return {
    ...rest,
    ...(header && { header: toPreactHeaderConfig(header, componentTranslator) }),
    // sibling sections are shared with preact verbatim; only `header` carries Angular components
  };
}

/** Mirror of {@link toPreactConfig} for the preact -> Angular direction. */
function toConfig<C extends { header?: DashboardHeaderConfigPreact }>(
  config: C,
  componentTranslator?: ComponentTranslator,
): Omit<C, 'header'> & { header?: DashboardHeaderConfig } {
  const { header, ...rest } = config;
  return {
    ...rest,
    ...(header && { header: toHeaderConfig(header, componentTranslator) }),
  };
}

/**
 * Converts Angular `Dashboard` props into the preact props rendered by the underlying component.
 *
 * The object structure is always translated: widget props, and the `header.beforeRender` ->
 * `header.onBeforeRender` naming difference.
 *
 * `componentTranslator` additionally converts the components carried in the props (today the custom
 * `config.header` items) into preact components. Pass it whenever the result will be **rendered**.
 * Omit it for pure props manipulation — filter helpers, dashboard model translation, prop
 * composition — where the components are never rendered and are carried through as they are.
 */
export function toPreactDashboardProps(
  angularProps: DashboardProps,
  componentTranslator?: ComponentTranslator,
): DashboardPropsPreact {
  const { widgets, config, ...rest } = angularProps;
  return {
    ...rest,
    widgets: widgets.map(toPreactWidgetProps),
    ...(config && { config: toPreactConfig(config, componentTranslator) }),
  };
}

/**
 * Converts preact `Dashboard` props into Angular props.
 *
 * The object structure is always translated: widget props, and the `header.onBeforeRender` ->
 * `header.beforeRender` naming difference.
 *
 * `componentTranslator` additionally resolves the components carried in the props back to the
 * Angular component classes they wrap. Omit it for pure props manipulation, where the components
 * are carried through as they are.
 */
export function toDashboardProps(
  preactProps: DashboardPropsPreact,
  componentTranslator?: ComponentTranslator,
): DashboardProps {
  const { widgets, config, ...rest } = preactProps;
  return {
    ...rest,
    widgets: widgets.map(toWidgetProps),
    ...(config && { config: toConfig(config, componentTranslator) }),
  };
}

/**
 * Converts Angular `DashboardById` props into the preact props rendered by the underlying
 * component.
 *
 * Behaves like {@link toPreactDashboardProps}: the structure is always translated, and
 * `componentTranslator` additionally converts the components carried in `config.header`.
 */
export function toPreactDashboardByIdProps(
  angularProps: DashboardByIdProps,
  componentTranslator?: ComponentTranslator,
): DashboardByIdPropsPreact {
  const { config, ...rest } = angularProps;
  return {
    ...rest,
    ...(config && {
      config: toPreactConfig(config, componentTranslator),
    }),
  };
}

/**
 * Converts preact `DashboardById` props into Angular props.
 *
 * Behaves like {@link toDashboardProps}: the structure is always translated, and
 * `componentTranslator` additionally resolves the components carried in `config.header`.
 */
export function toDashboardByIdProps(
  preactProps: DashboardByIdPropsPreact,
  componentTranslator?: ComponentTranslator,
): DashboardByIdProps {
  const { config, ...rest } = preactProps;
  return {
    ...rest,
    ...(config && { config: toConfig(config, componentTranslator) }),
  };
}
