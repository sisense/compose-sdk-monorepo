import { Meta, StoryObj } from '@storybook/react';
import { SuggestionsWithIntro } from '../suggestions';

const meta: Meta<typeof SuggestionsWithIntro> = {
  title: 'AI/Components/Suggestions',
  component: SuggestionsWithIntro,
};
export default meta;

type Story = StoryObj<typeof SuggestionsWithIntro>;

export const Success: Story = {
  args: {
    questions: [
      'How many duplicate Visit IDs are there?',
      'What is the total revenue generated?',
      'What is the total quantity of items sold?',
      'What is the total quantity of items sold?',
      'What is the total quantity of items sold?',
    ],
    isLoading: false,
    onSelection: () => {},
  },
};

export const Loading: Story = {
  args: {
    questions: [],
    isLoading: true,
    onSelection: () => {},
  },
};

export const NoQuestions: Story = {
  args: {
    questions: [],
    isLoading: false,
    onSelection: () => {},
  },
};
