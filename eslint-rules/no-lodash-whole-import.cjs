module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing directly from lodash or lodash-es. Use specific paths instead.',
    },
    messages: {
      avoidWholeLodash: `Avoid importing from "{{ name }}" directly.

Instead of:
  import { cloneDeep } from '{{ name }}';
Do this:
  import cloneDeep from '{{ name }}/cloneDeep';
`,
    },
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        console.log('[lodash rule] checking import from:', node.source.value);
        const source = node.source.value;

        if (source === 'lodash' || source === 'lodash-es') {
          context.report({
            node: node.source,
            messageId: 'avoidWholeLodash',
            data: {
              name: source,
            },
          });
        }
      },
    };
  },
};
