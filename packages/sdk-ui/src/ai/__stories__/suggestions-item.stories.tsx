/* eslint-disable import/no-extraneous-dependencies */
import { templateForComponent } from '../../__stories__/template';
import { Meta } from '@storybook/react';
import { SuggestionItem as SuggestionItemComponent } from '../suggestions';

const template = templateForComponent(SuggestionItemComponent);

const meta: Meta<typeof SuggestionItemComponent> = {
  title: 'AI/Components/Suggestions',
  component: SuggestionItemComponent,
};
export default meta;

export const SuggestionItem = template({
  question: 'What is the total number of unique brand IDs?',
  onClick: () => {},
});
