/* eslint-disable import/no-extraneous-dependencies */
import { templateForComponent } from '../../__stories__/template';
import { Meta } from '@storybook/react';
import ChatInput from '../chat-input';

const template = templateForComponent(ChatInput);

const meta: Meta<typeof ChatInput> = {
  title: 'AI/Components/ChatInput',
  component: ChatInput,
};
export default meta;

export const Default = template({
  onSendMessage: (message) => {
    console.log(message);
  },
});
