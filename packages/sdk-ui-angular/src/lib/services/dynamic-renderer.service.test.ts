/** @vitest-environment jsdom */
import { ApplicationRef, EnvironmentInjector, Injector } from '@angular/core';
import { type PreactNode } from '@sisense/sdk-ui-preact';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, type Mocked, vi } from 'vitest';

import { DynamicRenderer } from './dynamic-renderer.service';
import { type PreactComponent, wrapInAngularComponent } from './preact-backed-component';
import { type SisenseContextService } from './sisense-context.service';
import { type ThemeService } from './theme.service';

const preactStub: PreactComponent<{ label: string }> = (props) =>
  props.label as unknown as PreactNode;

/**
 * These tests cover the routing of a Preact-backed Angular wrapper to the Preact renderer. They do
 * not assert rendered markup: the Sisense and theme context providers only render their children
 * once their contexts resolve, which needs a live Sisense app rather than a unit-test environment.
 */
describe('DynamicRenderer', () => {
  let renderer: DynamicRenderer;

  beforeEach(() => {
    // the context services are mocked: constructing the real ones initializes a Sisense app,
    // which is neither available nor needed to exercise the routing
    const appMock = { settings: { translationConfig: {} } };
    const sisenseContextService = {
      getApp: vi.fn().mockResolvedValue(appMock),
      getApp$: vi.fn().mockReturnValue(of({ app: appMock })),
      getConfig: vi.fn().mockReturnValue({ showRuntimeErrors: false, appConfig: {} }),
      isInitialized: true,
    } as unknown as Mocked<SisenseContextService>;
    const themeService = {
      themeSettings$: new BehaviorSubject({}),
    } as unknown as Mocked<ThemeService>;

    renderer = new DynamicRenderer(
      // the Preact path uses none of the Angular injectors
      {} as ApplicationRef,
      {} as Injector,
      {} as EnvironmentInjector,
      sisenseContextService,
      themeService,
    );
  });

  describe('Preact-backed Angular wrapper', () => {
    it('renders it into an element of its own', () => {
      const component = wrapInAngularComponent(preactStub);

      const rendered = renderer.renderComponent(component, { label: 'FIRST' });

      expect(rendered.element).toBeInstanceOf(HTMLElement);
      expect(rendered.element.style.width).toBe('100%');
      expect(rendered.element.style.height).toBe('100%');
    });

    it('reports no Angular component reference, since there is no Angular instance', () => {
      const component = wrapInAngularComponent(preactStub);

      const rendered = renderer.renderComponent(component, { label: 'FIRST' });

      expect(rendered.componentRef).toBeUndefined();
    });

    it('exposes update and destroy that run without an Angular instance', () => {
      const component = wrapInAngularComponent(preactStub);
      const rendered = renderer.renderComponent(component, { label: 'FIRST' });

      expect(() => rendered.update({ label: 'SECOND' })).not.toThrow();
      expect(() => rendered.destroy()).not.toThrow();
    });

    it('renders each type independently', () => {
      const first = wrapInAngularComponent(preactStub);
      const second = wrapInAngularComponent(preactStub);

      const renderedFirst = renderer.renderComponent(first, { label: 'FIRST' });
      const renderedSecond = renderer.renderComponent(second, { label: 'SECOND' });

      expect(renderedFirst.element).not.toBe(renderedSecond.element);
    });
  });
});
