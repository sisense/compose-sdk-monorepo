import { createElement, type ReactElement } from 'react';

import type {
  ErasedVisualizationProps,
  ErasedWidgetDefinition,
  VisualizationLikeProps,
  WidgetDefinition,
} from './types';

/**
 * Erases the prop types of a strict widget definition so it can be stored next to definitions of
 * other widget types.
 *
 * This is the only cast between strict and erased definitions. `visualization.Component` and
 * `designPanel.Component` take `Props` as a parameter, so they are contravariant in `Props`: a
 * `WidgetDefinition<LineChartProps>` is not assignable to any common type that keeps a callable
 * component. Erasure is safe because readers only forward props, through {@link renderWidgetBody}.
 *
 * @param definition - The strict widget definition.
 * @returns The same definition, typed as an {@link ErasedWidgetDefinition}.
 * @internal
 */
export function eraseWidgetDefinition<Props extends VisualizationLikeProps>(
  definition: WidgetDefinition<Props>,
): ErasedWidgetDefinition {
  // Widen to `unknown` first: the strict and erased component types do not overlap.
  const opaque: unknown = definition;
  return opaque as ErasedWidgetDefinition;
}

/**
 * Renders the body of an erased widget definition. This is the one way to render an erased
 * definition; callers forward props and never read prop types from it.
 *
 * @param definition - The erased widget definition.
 * @param props - Props forwarded to the body.
 * @returns The rendered body element.
 * @internal
 */
export function renderWidgetBody(
  definition: ErasedWidgetDefinition,
  props: ErasedVisualizationProps,
): ReactElement {
  return createElement(definition.visualization.Component, props);
}
