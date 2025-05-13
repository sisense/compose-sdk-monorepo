module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn when using `opacity: 0` to remind adding focus-visible for accessibility',
      category: 'Best Practices',
    },
    messages: {
      addFocusVisible:
        'If using opacity: 0, add \'&:focus-visible\': { opacity: 1; } for accessibility.\nIf it\'s already there, ignore this warning and add\n  // eslint-disable-line rulesdir/opacity-zero-needs-focus-visible\nto the same line.',
    },
    schema: [],
  },

  create(context) {
    return {
      // Handles styled.div`...` syntax
      TemplateLiteral(node) {
        const raw = node.quasis.map((q) => q.value.raw).join('');
        const regex = /opacity\s*:\s*0(?!\.)/g;
        let match;

        while ((match = regex.exec(raw)) !== null) {
          context.report({
            node,
            loc: {
              start: context.getSourceCode().getLocFromIndex(node.range[0] + match.index),
              end: context
                .getSourceCode()
                .getLocFromIndex(node.range[0] + match.index + match[0].length),
            },
            messageId: 'addFocusVisible',
          });
        }
      },

      // Handles styled('div')({ ... }) object styles
      Property(node) {
        if (
          node.key &&
          node.key.type === 'Identifier' &&
          node.key.name === 'opacity' &&
          node.value &&
          node.value.type === 'Literal' &&
          node.value.value === 0
        ) {
          context.report({
            node,
            loc: {
              start: node.key.loc.start,
              end: node.value.loc.end,
            },
            messageId: 'addFocusVisible',
          });
        }
      },
    };
  },
};
