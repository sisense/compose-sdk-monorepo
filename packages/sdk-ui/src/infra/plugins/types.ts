import type { WidgetPlugin } from './widget-plugins/types.js';

/**
 * Base plugin information
 *
 * @sisenseInternal
 */
export interface BasePluginInfo {
  /**
   * Unique name identifier for the plugin
   */
  name: string;

  /**
   * Semantic version of the plugin
   */
  version: string;

  /**
   * Required SDK API version range using simplified semver with standard AND/OR logic.
   * - **OR**: `||` separates alternative ranges (version must match at least one).
   * - **AND**: space-separated comparators (version must match all in that group).
   *
   * Supported comparators: `^x.y.z`, `~x.y.z`, `x.y.z`, `>=x.y.z`, `>x.y.z`, `<=x.y.z`, `<x.y.z`
   *
   * @example "^2.9.0" — any 2.x from 2.9.0 up (same major)
   * @example "2.20.0" — exact version only
   * @example "~2.9.0" — 2.9.x only (same major and minor)
   * @example ">=2.0.0" — minimum version
   * @example "^2.0.0 || ^3.0.0" — 2.x from 2.0.0 or 3.x from 3.0.0 (OR)
   * @example ">1.2.3 <=2.3.1" — between 1.2.3 and 2.3.1 inclusive (AND)
   * @example ">1.2.3 <=2.3.1 || ^3.0.0" — that range or any 3.x (AND + OR)
   */
  requiredApiVersion: string;
}

/**
 * Result of plugin validation
 *
 * @sisenseInternal
 */
export interface PluginValidationResult {
  /**
   * The validated plugin
   */
  plugin: Plugin;

  /**
   * Whether the plugin is valid and should be loaded
   */
  isValid: boolean;

  /**
   * Reason for invalidation if isValid is false
   */
  reason?: string;
}

/**
 * Plugin declaration.
 * Currently only widget plugins are supported.
 *
 * @sisenseInternal
 */
export type Plugin = WidgetPlugin;
