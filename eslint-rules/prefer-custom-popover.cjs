module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn against using MUI Popover, suggest custom popover instead',
    },
    messages: {
      useCustomPopover: `Use the custom Popover instead of MUI's.

Instead of:
  import Popover from '@mui/material/Popover';
Use:
  import { Popover } from '@/common/components/popover';

If you absolutely sure you need to use MUI's Popover, add
  // eslint-disable-next-line rulesdir/prefer-custom-popover
to the line above.

Don't forget to add explanatory comment why you need to use MUI's Popover instead of the custom one.
  `,

    },
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source === '@mui/material/Popover') {
          context.report({
            node,
            messageId: 'useCustomPopover',
          });
        }
      },
    };
  },
};
