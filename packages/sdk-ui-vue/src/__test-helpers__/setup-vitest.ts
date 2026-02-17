import { cleanup } from '@testing-library/vue';
import { vi } from 'vitest';

afterEach(() => {
  // Clean up mounted Vue components after each test
  cleanup();

  // Clear all timers to prevent debounced callbacks from firing after test teardown
  vi.clearAllTimers();
});

vi.stubGlobal('__PACKAGE_VERSION__', '0.0.0');

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);
