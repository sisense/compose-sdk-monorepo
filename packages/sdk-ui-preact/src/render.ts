import {
  type ComponentChild,
  type ComponentChildren,
  type FunctionComponent,
  h,
  render,
  type VNode,
} from 'preact';

import { CustomElement } from './component-adapter';

/** @internal */
export const preactRenderComponent = <P>(
  rootElement: HTMLDivElement,
  component: FunctionComponent<P>,
  componentProps: P,
) => {
  render(h(component, componentProps as P & h.JSX.HTMLAttributes), rootElement);
};

/** @internal */
export const createElement = <P>(
  component: FunctionComponent<P>,
  props: P,
  children: ComponentChildren = [],
): VNode => {
  const childrenArray = Array.isArray(children) ? (children as ComponentChild[]) : [children];
  return h(component, props as P & h.JSX.HTMLAttributes, ...childrenArray) as VNode;
};

/** @internal */
export const createWrapperElement = <R = VNode>(
  nativeElement: HTMLDivElement,
  onDestroy?: () => void,
): R => createElement(CustomElement, { nativeElement, onDestroy }) as R;

type AnyObject = Record<string, any>;

/** @internal */
export const createWrapperElementHandler = <P extends AnyObject>(
  handler: (props: P) => HTMLDivElement,
) => {
  return (props: P) => {
    const nativeElement = handler(props);
    return createWrapperElement(nativeElement);
  };
};

/** @internal */
export type ComponentRenderer = (containerElement: HTMLDivElement) => void;

/** @internal */
export const createComponentRenderer = (component: VNode): ComponentRenderer => {
  return (containerElement: HTMLDivElement) => {
    render(component, containerElement);
  };
};
