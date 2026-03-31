import semverSatisfies from 'semver/functions/satisfies';

import { Plugin, PluginValidationResult } from './types.js';

/**
 * Normalizes SDK version for range comparison: strips prerelease suffix so only x.y.z is used.
 * e.g. "2.20.0-alpha.1" → "2.20.0", "3.0.0-internal.2" → "3.0.0"
 *
 * @param sdkVersion - Raw SDK version (may include prerelease, e.g. "2.20.0-alpha.1")
 * @returns Version string suitable for comparison (x.y.z only)
 */
const normalizeSdkVersion = (sdkVersion: string): string => {
  const base = sdkVersion.split('-')[0].trim();
  return base || sdkVersion;
};

/**
 * Checks if the SDK version satisfies the required version range string.
 * Uses semver for full range support (^, ~, >=, ||, etc.).
 *
 * @param sdkVersion - Current SDK version
 * @param requiredRange - Semver range string (e.g. ">1.2.3 <=2.3.1 || ^3.0.0")
 * @returns true if SDK version satisfies the range
 */
const isVersionCompatible = (sdkVersion: string, requiredRange: string): boolean => {
  const trimmed = requiredRange.trim();
  if (!trimmed) {
    return false;
  }
  return semverSatisfies(sdkVersion, trimmed);
};

/**
 * Validates an array of plugins according to the following rules:
 * 1. Plugin names must be unique (duplicates after the first are filtered out)
 * 2. Plugin requiredApiVersion must match the current SDK version
 *
 * @param plugins - Array of plugins to validate
 * @param sdkVersion - Current SDK version
 * @returns Array of validation results
 */
const validatePlugins = (plugins: Plugin[], sdkVersion: string): PluginValidationResult[] => {
  const seenNames = new Set<string>();
  const results: PluginValidationResult[] = [];
  const normalizedSdkVersion = normalizeSdkVersion(sdkVersion);

  for (const plugin of plugins) {
    // Check for duplicate names
    if (seenNames.has(plugin.name)) {
      results.push({
        plugin,
        isValid: false,
        reason: `Plugin "${plugin.name}" is duplicated. Only the first occurrence will be loaded.`,
      });
      continue;
    }

    seenNames.add(plugin.name);

    // Check version compatibility (using normalized version)
    if (!isVersionCompatible(normalizedSdkVersion, plugin.requiredApiVersion)) {
      results.push({
        plugin,
        isValid: false,
        reason: `Plugin "${plugin.name}" requires API versions ${plugin.requiredApiVersion}, but current SDK version is ${sdkVersion}.`,
      });
      continue;
    }

    // Plugin is valid
    results.push({
      plugin,
      isValid: true,
    });
  }

  return results;
};

/**
 * Logs validation warnings to the console for invalid plugins
 *
 * @param validationResults - Results from validatePlugins
 */
const logPluginValidationWarnings = (validationResults: PluginValidationResult[]): void => {
  validationResults
    .filter((result) => !result.isValid)
    .forEach((result) => {
      console.warn(`[Plugin] ${result.reason}`);
    });
};

/**
 * Validates and returns only valid plugins.
 *
 * @param plugins - Array of plugins to validate
 * @param sdkVersion - Current SDK version
 * @returns Array of valid plugins
 */
export const getValidPlugins = (plugins: Plugin[], sdkVersion: string): Plugin[] => {
  if (!plugins || plugins.length === 0) {
    return [];
  }

  const validationResults = validatePlugins(plugins, sdkVersion);

  logPluginValidationWarnings(validationResults);

  return validationResults.filter((result) => result.isValid).map((result) => result.plugin);
};
