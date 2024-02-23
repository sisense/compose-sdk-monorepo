import { templateForComponent } from '../../__stories__/template';
import { Meta } from '@storybook/react';
import { SuggestionListWithIntro as SuggestionListWithIntroComponent } from '../suggestions';

const meta: Meta<typeof SuggestionListWithIntroComponent> = {
  title: 'AI/Components/Suggestions',
  component: SuggestionListWithIntroComponent,
};
export default meta;

const suggestionListWithIntroTemp = templateForComponent(SuggestionListWithIntroComponent);

export const SuggestionListWithIntro = suggestionListWithIntroTemp({
  title: ' Sample Ecoommerce Dataset',
  questions: [
    'How many duplicate Visit IDs are there?',
    'What is the total revenue generated?',
    'What is the total quantity of items sold?',
    'What is the total quantity of items sold?',
    'What is the total quantity of items sold?',
  ],
  onSelection() {},
});
