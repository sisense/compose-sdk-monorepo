module.exports = {
  extends: ['@sisense/commitlint-config'],
  rules: {
    'jira-task-id': [2, 'always'],
    'body-max-line-length': [2, 'always', 1000],
  },
  plugins: [
    {
      rules: {
        'jira-task-id': ({ subject }) => {
          return [
            subject && /\((SNS|ONYX)-\d+\)/.test(subject),
            `Your subject should contain Jira task id (SNS-xxx or ONYX-xxx)`,
          ];
        },
      },
    },
  ],
};
