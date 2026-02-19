export {
  type JumpToDashboardConfig,
  type JumpToDashboardConfigForPivot,
  type JtdTarget,
  type TriggerMethod,
} from './jtd/index.js';

/**
 * Internal JTD hook for dashboard composition
 * @internal
 */
export { useJtdInternal } from './use-jtd.js';

/**
 * Internal function to apply JTD functionality to widget props
 * Used by framework adapters (Vue, Angular)
 * @internal
 */
export { applyJtdToWidget } from './use-jtd.js';

/**
 * Internal function to normalize JTD config
 * Used by framework adapters (Vue, Angular)
 * @internal
 */
export { normalizeToJtdConfig } from './jtd/jtd-config-transformers.js';

// Export JTD hook that should be public
export { useJtdWidget } from './use-jtd-widget.js';
