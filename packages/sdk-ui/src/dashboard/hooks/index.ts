export {
  type JumpToDashboardConfig,
  type JumpToDashboardConfigForPivot,
  type JtdTarget,
  type TriggerMethod,
} from './jtd';

/**
 * Internal JTD hook for dashboard composition
 * @internal
 */
export { useJtdInternal } from './use-jtd';

/**
 * Internal function to apply JTD functionality to widget props
 * Used by framework adapters (Vue, Angular)
 * @internal
 */
export { applyJtdToWidget } from './use-jtd';

/**
 * Internal function to normalize JTD config
 * Used by framework adapters (Vue, Angular)
 * @internal
 */
export { normalizeToJtdConfig } from './jtd/jtd-config-transformers';

// Export JTD hook that should be public
export { useJtdWidget } from './use-jtd-widget';
