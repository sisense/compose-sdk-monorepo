import { Meta, StoryObj } from '@storybook/react-vite';

import Collapsible from '../common/collapsible.js';

const meta: Meta<typeof Collapsible> = {
  title: 'AI/Components/Collapsible',
  component: Collapsible,
};
export default meta;

type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  args: {
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate.',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
};
