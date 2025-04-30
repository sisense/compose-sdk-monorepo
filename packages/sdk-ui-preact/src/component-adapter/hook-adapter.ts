/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ComponentAdapter } from './component-adapter';
import { ContextConnector } from './context-connector';
import { HookWrapperComponent } from './hook-wrapper-component';
import { AnyHookFunction, ContextData } from './types';
import { DataObserver } from './utils';

/** @internal */
export class HookAdapter<Hook extends AnyHookFunction> {
  private rootElement: HTMLElement = document.createElement('div');

  private componentAdapter: ComponentAdapter<typeof HookWrapperComponent>;

  private resultObserver = new DataObserver<ReturnType<Hook>>();

  private params: Parameters<Hook>;

  constructor(private hook: Hook, contextConnectors: ContextConnector<ContextData>[] = []) {
    this.componentAdapter = new ComponentAdapter(HookWrapperComponent, contextConnectors);
  }

  private handleHookResult(result: ReturnType<Hook>) {
    this.resultObserver.setValue(result);
  }

  run(...params: Parameters<Hook>) {
    this.params = params;
    this.componentAdapter.render(this.rootElement, {
      hook: this.hook,
      params: this.params,
      onResult: this.handleHookResult.bind(this),
    });
  }

  subscribe(listener: (result: ReturnType<Hook>) => void) {
    return this.resultObserver.subscribe(listener);
  }

  destroy() {
    this.componentAdapter.destroy();
    this.resultObserver.destroy();
    this.rootElement.remove();
  }
}
