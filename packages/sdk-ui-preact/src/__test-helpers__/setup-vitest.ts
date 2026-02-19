import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/preact';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  // Clean up mounted components after each test
  // https://testing-library.com/docs/react-testing-library/api/#cleanup
  cleanup();

  // Clear all timers to prevent debounced callbacks from firing after test teardown
  // This prevents "window is not defined" errors from async operations
  vi.clearAllTimers();
});

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);
