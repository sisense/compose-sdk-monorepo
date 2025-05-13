module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing from @mui/material. Use direct component paths instead.',
    },
    messages: {
      avoidBarrel: `Avoid importing from '@mui/material' — it pulls in the whole package.

Instead of:
  import { Button } from '@mui/material';
Do this:
  import Button from '@mui/material/Button';`,
    },
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;

        if (source === '@mui/material') {
          context.report({
            node: node.source,
            messageId: 'avoidBarrel',
          });
        }
      },
    };
  },
};
