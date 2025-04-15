/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ComponentAdapter } from './component-adapter';
import { ContextConnector } from './context-connector';
import { HookWrapperComponent } from './hook-wrapper-component';
import { AnyHookFunction, ContextData } from './types';

/** @internal */
export class HookAdapter<Hook extends AnyHookFunction> {
  private rootElement: HTMLElement = document.createElement('div');

  private componentAdapter: ComponentAdapter<typeof HookWrapperComponent>;

  private resultSubscribeFn: ((result: ReturnType<Hook>) => void) | null = null;

  private params: Parameters<Hook>;

  constructor(private hook: Hook, contextConnectors: ContextConnector<ContextData>[] = []) {
    this.componentAdapter = new ComponentAdapter(HookWrapperComponent, contextConnectors);
  }

  private handleHookResult(result: ReturnType<Hook>) {
    this.resultSubscribeFn?.(result);
  }

  run(...params: Parameters<Hook>) {
    this.params = params;
    this.componentAdapter.render(this.rootElement, {
      hook: this.hook,
      params: this.params,
      onResult: this.handleHookResult.bind(this),
    });
  }

  subscribe(hookResultSubscribeFn: (result: ReturnType<Hook>) => void) {
    this.resultSubscribeFn = hookResultSubscribeFn;
  }

  destroy() {
    this.componentAdapter.destroy();
    this.resultSubscribeFn = null;
    this.rootElement.remove();
  }
}
