import noLodashWholeImport from './no-lodash-whole-import.cjs';
import noMuiBarrelImport from './no-mui-barrel-import.cjs';
import opacityZeroNeedsFocusVisible from './opacity-zero-needs-focus-visible.cjs';
import preferCustomPopover from './prefer-custom-popover.cjs';

/**
 * Local ESLint plugin exposing the repo's custom rules under the `rulesdir/*` id,
 * preserving the rule ids used while these were loaded via eslint-plugin-rulesdir.
 *
 * @type { import("eslint").ESLint.Plugin }
 */
export default {
  rules: {
    'opacity-zero-needs-focus-visible': opacityZeroNeedsFocusVisible,
    'no-lodash-whole-import': noLodashWholeImport,
    'no-mui-barrel-import': noMuiBarrelImport,
    'prefer-custom-popover': preferCustomPopover,
  },
};
