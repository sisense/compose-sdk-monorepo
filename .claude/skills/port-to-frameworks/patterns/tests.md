# Pattern: Test scaffolds

Generate minimal Vitest tests that exercise the port against mocked preact. File naming convention for both Angular and Vue is **`.test.ts`** (not `.spec.ts`) — match the rest of the repo.

## Angular component — `<kebab-name>.component.test.ts`

```typescript
/** @vitest-environment jsdom */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { <SymbolName>Component } from './<kebab-name>.component';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';

vi.mock('@sisense/sdk-ui-preact', async (orig) => {
  const actual = await orig<typeof import('@sisense/sdk-ui-preact')>();
  return {
    ...actual,
    <SymbolName>: vi.fn(),
    ComponentAdapter: vi.fn().mockImplementation(() => ({
      render: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});

describe('<SymbolName>Component', () => {
  let fixture: ComponentFixture<<SymbolName>Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [<SymbolName>Component],
      providers: [
        { provide: SisenseContextService, useValue: { getApp: vi.fn(), getApp$: vi.fn() } },
        { provide: ThemeService, useValue: { getThemeSettings$: vi.fn() } },
      ],
    });
    fixture = TestBed.createComponent(<SymbolName>Component);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders preact component on view init', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

## Angular service method — extend existing test

Append a new `describe` block to the existing `<name>.service.test.ts`:

```typescript
describe('<newMethod>', () => {
  it('calls preact <executor> with mapped params', async () => {
    <preactExecutorMock>.mockResolvedValue(<fixtureData>);

    const result = await service.<newMethod>({
      dataSource: 'Sample ECommerce',
      dimensions: [],
      measures: [],
      filters: [],
    });

    expect(sisenseContextServiceMock.getApp).toHaveBeenCalled();
    expect(<preactExecutorMock>).toHaveBeenCalledWith(
      expect.objectContaining({ dataSource: 'Sample ECommerce' }),
      expect.any(Object),
      expect.any(Object),
    );
    expect(result.data).toBeDefined();
  });

  it('propagates errors from preact executor', async () => {
    <preactExecutorMock>.mockRejectedValue(new Error('boom'));
    await expect(service.<newMethod>(<params>)).rejects.toThrow('boom');
  });
});
```

Add the new executor to the top-level `vi.mock('@sisense/sdk-ui-preact', ...)` call.

## Vue component — `<kebab-name>.test.ts`

```typescript
/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import { <SymbolName> } from './<kebab-name>';

vi.mock('../../helpers/setup-helper', () => ({
  setupHelper: vi.fn(() => () => null),
}));

describe('<SymbolName>', () => {
  it('mounts without error', () => {
    const wrapper = mount(<SymbolName>, {
      props: { /* minimal required props */ },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('passes props to setupHelper', () => {
    const { setupHelper } = require('../../helpers/setup-helper');
    mount(<SymbolName>, { props: { /* ... */ } });
    expect(setupHelper).toHaveBeenCalled();
  });
});
```

## Vue composable — `use-<kebab-name>.test.ts`

```typescript
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, nextTick } from 'vue';

import { <useHook> } from './use-<kebab-name>';

vi.mock('@sisense/sdk-ui-preact', async (orig) => {
  const actual = await orig<typeof import('@sisense/sdk-ui-preact')>();
  return {
    ...actual,
    <useHookInternal>: vi.fn(),
    HookAdapter: vi.fn().mockImplementation(() => ({
      subscribe: vi.fn((cb) => { (HookAdapter as any)._cb = cb; return { unsubscribe: vi.fn() }; }),
      run: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});

vi.mock('../helpers/context-connectors/sisense-context-connector', () => ({
  createSisenseContextConnector: vi.fn(() => ({ propsObserver: { setValue: vi.fn() }, providerComponent: vi.fn() })),
}));

describe('<useHook>', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns initial loading state', () => {
    const params = ref({ /* valid shape */ });
    const result = <useHook>(params);
    expect(result.isLoading.value).toBe(true);
  });

  it('updates state when hook adapter emits', async () => {
    const params = ref({ /* valid shape */ });
    const result = <useHook>(params);
    const { HookAdapter } = await import('@sisense/sdk-ui-preact');
    (HookAdapter as any)._cb?.({ isLoading: false, isSuccess: true, data: <fixture> });
    await nextTick();
    expect(result.isLoading.value).toBe(false);
  });
});
```

## What to cover (minimum)

- Happy path (mocked preact resolves, state becomes success)
- Error path (mocked preact rejects, state becomes error) — at least for services/composables
- Cleanup (destroy called on unmount) — only if the code path is non-trivial

Don't write tests for TSDoc, type aliases, or re-exports.

## Pitfalls

- **Don't use `TestBed.configureTestingModule` in Vitest without `@angular/core/testing` imports compiled** — ensure `jsdom` environment comment at top.
- **Vue tests need `@vitest-environment jsdom`** or `defineConfig({ test: { environment: 'jsdom' } })` globally; the repo sets the latter — a directive at the top is still safe.
- **Don't mock the entire `@sisense/sdk-ui-preact`** — always spread `...actual` so unmocked exports still work (Vue's `HookAdapter` wrapper needs it).
- **TrackableService decorator** — Angular service tests should mock it to a no-op so tracking side effects don't leak:
  ```typescript
  vi.mock('../decorators/trackable.decorator', () => ({ TrackableService: (t: any) => t }));
  ```
