import { render, FunctionComponent, h } from 'preact';

export const preactRenderComponent = <P>(
  rootElement: HTMLDivElement,
  component: FunctionComponent<P>,
  componentProps: P,
) => {
  render(h(component, componentProps as P & h.JSX.HTMLAttributes), rootElement);
};
