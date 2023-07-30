/**
 * Common test utilities
 */
import { ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

type UserSetupFn = (typeof userEvent)['setup'];
interface SetupResult extends RenderResult {
  user: ReturnType<UserSetupFn>;
}
/**
 * This helper method combines the userEvent.setup() and render() calls at the
 * start of a unit test using @testing-library/react.
 *
 * Based on recommendation by: https://testing-library.com/docs/user-event/intro/#writing-tests-with-userevent
 *
 * @param jsx - React component instance to test, passed directly to render()
 * @param useFakeTimers - true if Jest fake timers are enabled
 * @returns
 */
export function setup(jsx: ReactElement, useFakeTimers = false): SetupResult {
  return {
    // Need to set "advanceTimers" if we're using Jest's fake timers.
    // https://github.com/testing-library/user-event/issues/833#issuecomment-1171452841
    user: userEvent.setup(useFakeTimers ? { advanceTimers: jest.advanceTimersByTime } : undefined),
    ...render(jsx),
  };
}
