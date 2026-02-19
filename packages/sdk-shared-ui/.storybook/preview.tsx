import React, { useEffect } from 'react';

import { type Preview } from '@storybook/react';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    options: {
      storySort: {
        order: [
          'Inputs',
          'Data Display',
          'Feedback',
          'Date - Time',
          'Surfaces',
          'Navigation',
          'Layout',
          'Utils',
          'Deprecated',
        ],
      },
    },
  },
  decorators: [
    (Story) => {
      return <Story />;
    },
  ],
};

(function loadStories() {
  document.body.className += 'sis-scope';
})();

export default preview;
