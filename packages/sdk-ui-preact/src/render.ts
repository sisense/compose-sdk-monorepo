import {
  render,
  h,
  type FunctionComponent,
  type ComponentChildren,
  type VNode,
  type ComponentChild,
} from 'preact';

export const preactRenderComponent = <P>(
  rootElement: HTMLDivElement,
  component: FunctionComponent<P>,
  componentProps: P,
) => {
  render(h(component, componentProps as P & h.JSX.HTMLAttributes), rootElement);
};

export const createElement = <P>(
  component: FunctionComponent<P>,
  props: P & h.JSX.HTMLAttributes,
  children: ComponentChildren = [],
): VNode => {
  const childrenArray = Array.isArray(children) ? (children as ComponentChild[]) : [children];
  return h(component, props, ...childrenArray) as VNode;
};
