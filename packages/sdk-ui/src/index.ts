/**
 * GLOBAL INITIALIZATION / SIDE EFFECTS
 * The following imports are executed immediately when the package is loaded.
 * They do not export members but are required for the SDK to function
 */

/** Injects global styles and CSS variables. */
import './index.css';

/** Sets up the internationalization engine and locales. */
import './infra/translation/initialize-i18n';

/**
 * Main entry point for @sisense/sdk-ui package.
 * All exports flow through the public-api gateway which organizes exports by stability level
 */
export * from './public-api';
