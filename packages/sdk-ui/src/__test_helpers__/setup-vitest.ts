import matchers, { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import 'vitest-canvas-mock';

// Add types for matchers from @testing-library/jest-dom
// https://github.com/testing-library/jest-dom/issues/439#issuecomment-1536524120
declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
}

// Manually extend Vitest's expect() with methods from @testing-library/jest-dom
expect.extend(matchers);

// Clean up mounted components after each test
// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => {
  cleanup();
});

vi.stubGlobal('__PACKAGE_VERSION__', '0.0.0');
