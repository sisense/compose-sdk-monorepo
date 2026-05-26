import * as downloadBlobAsFile from './download-blob-as-file';
import * as headerMenuUtils from './header-menu-utils';

/**
 * Widget helpers
 * @internal
 */
export const widgetHelpers = {
  ...headerMenuUtils,
  ...downloadBlobAsFile,
};
