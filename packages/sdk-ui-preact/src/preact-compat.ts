/**
 * Re-exports preact/compat so plugins can import from @sisense/sdk-ui-preact/preact/compat
 * and share the same Preact instance. preact/compat uses "export =" (single default), so
 * we cannot use "export * from 'preact/compat'"; we re-export the default and named APIs explicitly.
 * Mirrors all runtime exports from preact/compat/src/index.d.ts (React namespace).
 */
import React from 'preact/compat';

export default React;

const {
  // Hooks
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
  useContext,
  useLayoutEffect,
  useReducer,
  useImperativeHandle,
  useDebugValue,
  useId,
  useInsertionEffect,
  useTransition,
  useDeferredValue,
  useSyncExternalStore,
  // Core
  createElement,
  Component,
  PureComponent,
  Fragment,
  createContext,
  cloneElement,
  createRef,
  createFactory,
  // Compat / render
  version,
  render,
  hydrate,
  unmountComponentAtNode,
  createPortal,
  // Element checks (isElement is runtime-only alias for isValidElement, not in React namespace types)
  isValidElement,
  isFragment,
  isMemo,
  findDOMNode,
  // Components & HOCs
  memo,
  forwardRef,
  StrictMode,
  lazy,
  Suspense,
  SuspenseList,
  // Scheduling
  startTransition,
  flushSync,
  // React API name (intentionally not camelCase)
  unstable_batchedUpdates, // eslint-disable-line @typescript-eslint/naming-convention
  // Children
  Children,
} = React;

export {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
  useContext,
  useLayoutEffect,
  useReducer,
  useImperativeHandle,
  useDebugValue,
  useId,
  useInsertionEffect,
  useTransition,
  useDeferredValue,
  useSyncExternalStore,
  createElement,
  Component,
  PureComponent,
  Fragment,
  createContext,
  cloneElement,
  createRef,
  createFactory,
  version,
  render,
  hydrate,
  unmountComponentAtNode,
  createPortal,
  isValidElement,
  isFragment,
  isMemo,
  findDOMNode,
  memo,
  forwardRef,
  StrictMode,
  lazy,
  Suspense,
  SuspenseList,
  startTransition,
  flushSync,
  unstable_batchedUpdates, // eslint-disable-line @typescript-eslint/naming-convention
  Children,
};
