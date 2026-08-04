import type {
  DashboardByIdConfig as DashboardByIdConfigPreact,
  DashboardByIdProps as DashboardByIdPropsPreact,
  DashboardConfig as DashboardConfigPreact,
  DashboardHeaderConfig as DashboardHeaderConfigPreact,
  DashboardHeaderItemComponent as DashboardHeaderItemComponentPreact,
  DashboardHeaderItemsTransform as DashboardHeaderItemsTransformPreact,
  DashboardProps as DashboardPropsPreact,
} from '@sisense/sdk-ui-preact';

import type { DashboardProps } from '../components/dashboard/dashboard';
import type { DashboardConfig } from '../components/dashboard/dashboard';
import type {
  DashboardByIdConfig,
  DashboardByIdProps,
} from '../components/dashboard/dashboard-by-id';
import type {
  DashboardHeaderConfig,
  DashboardHeaderItemComponent,
  DashboardHeaderItemsTransform,
} from '../components/dashboard/dashboard-header-config';
import type { ComponentTranslator } from './component-translator';

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
  })) as WithComponent<I, DashboardHeaderItemComponentPreact>[];
}

/** Mirror of {@link toPreactHeaderItems} for the preact -> Vue direction. */
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
  })) as WithComponent<I, DashboardHeaderItemComponent>[];
}

/**
 * Wraps the consumer's `onBeforeRender` so the renderer can call it with preact items.
 *
 * With a component translator the wrapper is two-way: the resolved list is converted to Vue
 * components on the way in, and the list the consumer returns is converted back to preact
 * components on the way out — so consumers only ever see Vue components. Without a translator the
 * items pass through untouched.
 */
function toPreactHeaderItemsTransform(
  onBeforeRender: DashboardHeaderItemsTransform,
  componentTranslator?: ComponentTranslator,
): DashboardHeaderItemsTransformPreact {
  return (resolvedItems) =>
    toPreactHeaderItems(
      onBeforeRender(toHeaderItems(resolvedItems, componentTranslator)),
      componentTranslator,
    );
}

/** Mirror of {@link toPreactHeaderItemsTransform} for the preact -> Vue direction. */
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

/** Converts a Vue-flavored header config into the preact shape, including `items` and `onBeforeRender`. */
function toPreactHeaderConfig(
  header: DashboardHeaderConfig,
  componentTranslator?: ComponentTranslator,
): DashboardHeaderConfigPreact {
  const { items, onBeforeRender, ...rest } = header;
  return {
    ...rest,
    ...(items && { items: toPreactHeaderItems(items, componentTranslator) }),
    // omitted entirely when the consumer provided no transform, so the renderer can skip it
    ...(onBeforeRender && {
      onBeforeRender: toPreactHeaderItemsTransform(onBeforeRender, componentTranslator),
    }),
  };
}

/** Mirror of {@link toPreactHeaderConfig} for the preact -> Vue direction. */
function toHeaderConfig(
  header: DashboardHeaderConfigPreact,
  componentTranslator?: ComponentTranslator,
): DashboardHeaderConfig {
  const { items, onBeforeRender, ...rest } = header;
  return {
    ...rest,
    ...(items && { items: toHeaderItems(items, componentTranslator) }),
    ...(onBeforeRender && {
      onBeforeRender: toHeaderItemsTransform(onBeforeRender, componentTranslator),
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
    // sibling sections are shared with preact verbatim; only `header` carries Vue components
  };
}

/** Mirror of {@link toPreactConfig} for the preact -> Vue direction. */
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
 * Converts Vue `Dashboard` props into the preact props rendered by the underlying component.
 *
 * The object structure is always translated — for Vue that is the `config.header` section, whose
 * shape matches preact's apart from the flavor of the components it carries.
 *
 * `componentTranslator` additionally converts the components carried in the props (today the custom
 * `config.header` items) into preact components. Pass it whenever the result will be **rendered**.
 * Omit it for pure props manipulation — filter helpers, dashboard model translation, prop
 * composition — where the components are never rendered and are carried through as they are.
 */
export function toPreactDashboardProps(
  vueProps: DashboardProps,
  componentTranslator?: ComponentTranslator,
): DashboardPropsPreact {
  const { config, ...rest } = vueProps;
  return {
    ...rest,
    ...(config && { config: toPreactConfig(config, componentTranslator) }),
  } as DashboardPropsPreact;
}

/**
 * Converts preact `Dashboard` props into Vue props.
 *
 * `componentTranslator` additionally resolves the components carried in the props back to the Vue
 * components they wrap. Omit it for pure props manipulation, where the components are carried
 * through as they are.
 */
export function toDashboardProps(
  preactProps: DashboardPropsPreact,
  componentTranslator?: ComponentTranslator,
): DashboardProps {
  const { config, ...rest } = preactProps;
  return {
    ...rest,
    ...(config && { config: toConfig(config, componentTranslator) }),
  } as DashboardProps;
}

/**
 * Converts Vue `DashboardById` props into the preact props rendered by the underlying component.
 *
 * Behaves like {@link toPreactDashboardProps}: the structure is always translated, and
 * `componentTranslator` additionally converts the components carried in `config.header`.
 */
export function toPreactDashboardByIdProps(
  vueProps: DashboardByIdProps,
  componentTranslator?: ComponentTranslator,
): DashboardByIdPropsPreact {
  const { config, ...rest } = vueProps;
  return {
    ...rest,
    ...(config && {
      config: toPreactConfig(config, componentTranslator),
    }),
  };
}

/** Mirror of {@link toPreactDashboardByIdProps} for the preact -> Vue direction. */
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
