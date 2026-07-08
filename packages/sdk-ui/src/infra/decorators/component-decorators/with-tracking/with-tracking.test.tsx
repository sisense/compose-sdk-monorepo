/** @vitest-environment jsdom */
import { ReactNode, StrictMode } from 'react';

import { trackProductEvent } from '@sisense/sdk-tracking';
import { render } from '@testing-library/react';

import { MockedSisenseContextProvider } from '../../../../__test-helpers__';
import { withTracking } from './with-tracking';

vi.mock('@sisense/sdk-tracking');
vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

/** Wraps a trivial children-rendering component with the tracking decorator. */
const tracked = (componentName: string, config: { transparent?: boolean } = {}) =>
  withTracking({ componentName, config })(({ children }: { children?: ReactNode }) => (
    <>{children}</>
  ));

/** Component names for which an `sdkComponentInit` event was fired. */
const initComponentNames = (): string[] =>
  vi
    .mocked(trackProductEvent)
    .mock.calls.filter((args) => args[0] === 'sdkComponentInit')
    .map((args) => (args[1] as { componentName: string }).componentName);

describe('withTracking nested tracking suppression', () => {
  beforeEach(() => {
    vi.mocked(trackProductEvent).mockReset();
    vi.mocked(trackProductEvent).mockResolvedValue(undefined);
  });

  it('does not re-fire sdkComponentInit for a component nested under a transparent provider that is itself nested under a tracked component', async () => {
    const Parent = tracked('Parent');
    const Transparent = tracked('Transparent', { transparent: true });
    const Nested = tracked('Nested');

    render(
      <MockedSisenseContextProvider>
        <Parent>
          <Transparent>
            <Nested />
          </Transparent>
        </Parent>
      </MockedSisenseContextProvider>,
    );
    // Flush promises so the tracking effects settle.
    await new Promise(setImmediate);

    const names = initComponentNames();
    // Only the top-level tracked component is tracked; the transparent provider must not
    // un-suppress its nested descendants.
    expect(names).toContain('Parent');
    expect(names).not.toContain('Transparent');
    expect(names).not.toContain('Nested');
  });

  it('still tracks a component nested directly under a top-level transparent provider (e.g. <ThemeProvider><Chart/></ThemeProvider>)', async () => {
    const TopTransparent = tracked('TopTransparent', { transparent: true });
    const Child = tracked('Child');

    render(
      <MockedSisenseContextProvider>
        <TopTransparent>
          <Child />
        </TopTransparent>
      </MockedSisenseContextProvider>,
    );
    await new Promise(setImmediate);

    // No tracking context above the transparent provider, so the real nested component is tracked.
    expect(initComponentNames()).toContain('Child');
  });
});

describe('withTracking single-fire guarantee', () => {
  beforeEach(() => {
    vi.mocked(trackProductEvent).mockReset();
    vi.mocked(trackProductEvent).mockResolvedValue(undefined);
  });

  it('fires sdkComponentInit only once in case of rerender or StrictMode', async () => {
    const Solo = tracked('Solo');

    render(
      <StrictMode>
        <MockedSisenseContextProvider>
          <Solo />
        </MockedSisenseContextProvider>
      </StrictMode>,
    );
    // Flush promises so any (erroneously) scheduled duplicate tracking would have run.
    await new Promise(setImmediate);

    // StrictMode runs the init effect twice (mount → unmount → mount). The guard must be set
    // synchronously, not in the async tracking promise, or the second run fires a duplicate.
    const soloCount = initComponentNames().filter((name) => name === 'Solo').length;
    expect(soloCount).toBe(1);
  });
});
