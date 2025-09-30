import { templateForComponent } from '../../__stories__/template';
import { Meta } from '@storybook/react-vite';
import { SuggestionList as SuggestionListComponent } from '../suggestions';

const template = templateForComponent(SuggestionListComponent);

const meta: Meta<typeof SuggestionListComponent> = {
  title: 'AI/Components/Suggestions',
  component: SuggestionListComponent,
};
export default meta;

export const SuggestionList = template({
  questions: [
    'How many duplicate Visit IDs are there?',
    'What is the total revenue generated?',
    'What is the total quantity of items sold?',
  ],
  onSelection: () => {},
});

export const SuggestionListSeeMore = template({
  questions: [
    'How many duplicate Visit IDs are there?',
    'What is the total revenue generated?',
    'What is the total quantity of items sold?',
    'How many duplicate Visit IDs are there?',
    'What is the total revenue generated?',
    'What is the total quantity of items sold?',
    'How many duplicate Visit IDs are there?',
    'What is the total revenue generated?',
    'What is the total quantity of items sold?',
  ],
  onSelection: () => {},
});
