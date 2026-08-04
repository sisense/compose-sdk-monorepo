import { Type } from '@angular/core';
import { type PreactNode } from '@sisense/sdk-ui-preact';

/**
 * A Preact component. Its render output matches the Preact-facing component interfaces, so a
 * component produced by `ComponentTranslator.toPreactComponent` can be handed to any of them
 * (custom widget map, dashboard header item, ...).
 *
 * @internal
 */
export type PreactComponent<Props> = (props: Props) => PreactNode;

/**
 * Brand under which a Preact-backed Angular wrapper carries the Preact component it renders.
 *
 * Module-private and symbol-keyed, so no foreign component class can carry it — not by accident
 * and not by declaring a property of the same name.
 */
const preactComponentKey: unique symbol = Symbol('preactComponent');

/** An Angular component type that carries the Preact component it wraps. */
type PreactBackedComponentType<Props> = Type<Props> & {
  readonly [preactComponentKey]: PreactComponent<Props>;
};

/**
 * Wraps a Preact component in an Angular component type that stands for it.
 *
 * The result is a *Preact-backed Angular wrapper*: an Angular `Type<Props>` for every purpose the
 * public interfaces need — it is what consumers receive wherever the SDK hands a component back,
 * such as the dashboard header `beforeRender`, so items can be identified, reordered, removed, or
 * passed back to the SDK — while what it actually renders is the Preact component it wraps. The
 * Preact component is carried on the class itself, so the pairing needs no registry and lives
 * exactly as long as the class does.
 *
 * NOTE: it is a wrapper rather than a compiled Angular component. It declares no template and has
 * no component definition, because Angular has no public API for producing one at runtime — so
 * Angular cannot instantiate it itself (`NgComponentOutlet`, `createComponent`). It is rendered by
 * {@link DynamicRenderer}, which recognizes it through {@link getPreactComponent} and renders the
 * Preact component behind it. Translating one back with `ComponentTranslator.toPreactComponent`
 * unwraps it to that Preact component instead of wrapping it a second time.
 *
 * @internal
 */
export function wrapInAngularComponent<Props>(
  preactComponent: PreactComponent<Props>,
): Type<Props> {
  class PreactBacked {
    static readonly [preactComponentKey] = preactComponent;
  }

  // gives the wrapper a readable identity in devtools and in Angular error messages
  Object.defineProperty(PreactBacked, 'name', {
    value: `PreactBacked(${preactComponent.name || 'anonymous'})`,
  });

  // the wrapper stands in for a component rendering `Props`; it is never instantiated as a class
  return PreactBacked as unknown as Type<Props>;
}

/**
 * Returns the Preact component an Angular component type wraps, or `undefined` if it is not a
 * Preact-backed wrapper produced by {@link wrapInAngularComponent}.
 *
 * Checks for an own property, so a class extending a wrapper is not mistaken for one.
 *
 * @internal
 */
export function getPreactComponent<Props>(
  component: Type<Props>,
): PreactComponent<Props> | undefined {
  return Object.hasOwn(component, preactComponentKey)
    ? (component as PreactBackedComponentType<Props>)[preactComponentKey]
    : undefined;
}
