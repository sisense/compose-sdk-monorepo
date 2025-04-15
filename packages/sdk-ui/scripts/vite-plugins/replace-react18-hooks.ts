function toGlobalRegExp(str: string): RegExp {
  const escapedStr = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedStr, 'g');
}

/**
 * Get a safe replacement for a React hook name that can't be simplified by bundlers
 * to just `React.useId`, `React.useInsertionEffect`, etc.
 * Returned string is a JavaScript expression that unsolvable by bundlers optimisations.
 *
 * @example
 * 'useId' => `useId${Math.random()}`.slice(0, 'useId'.length) // still 'useId' after evaluation
 */
function getSafeReactHookNameReplacement(hookName: string): string {
  return `\`${hookName}\${Math.random()}\`.slice(0, '${hookName}'.length)`;
}

/**
 * A Rollup plugin that replaces problematic tries to get React 18 hooks from `React`
 * (such as useId and useInsertionEffect) with safe workarounds.
 */
export function replaceReact18Hooks() {
  // Define the patterns to search for along with the hook name to process.
  const replacements: Array<{ pattern: string; hook: string }> = [
    {
      // Workaround in MUI for webpack to support React18 API
      // https://github.com/webpack/webpack/issues/14814
      // https://github.com/mui/material-ui/issues/41190
      // can be simplified to 'useId' by some bundlers.
      pattern: "['useId'.toString()]",
      hook: 'useId',
    },
    {
      // Workaround in Emotion for webpack to support React18 API
      // can be simplified to 'useInsertionEffect' by some bundlers.
      pattern: "['useInsertion' + 'Effect']",
      hook: 'useInsertionEffect',
    },
    {
      // New versions of Emotion forgot to include the workaround for useInsertionEffect
      // so even not trying to fool webpack and just getting the hook directly via `.` notation.
      pattern: '.useInsertionEffect',
      hook: 'useInsertionEffect',
    },
  ];

  return {
    name: 'replace-react18-hooks',
    transform(code: string) {
      let transformed = code;
      replacements.forEach(({ pattern, hook }) => {
        if (transformed.includes(pattern)) {
          const safeReplacement = `[${getSafeReactHookNameReplacement(hook)}]`;
          transformed = transformed.replace(toGlobalRegExp(pattern), safeReplacement);
        }
      });
      return { code: transformed, map: null };
    },
  };
}
