import { templateForComponent } from '../../__stories__/template';
import { Meta } from '@storybook/react';
import SuggestionDropdownListComponent from '../suggestions/suggestion-dropdown-list';

const template = templateForComponent(SuggestionDropdownListComponent);

const meta: Meta<typeof SuggestionDropdownListComponent> = {
  title: 'AI/Components/Suggestions/Dropdown',
  component: SuggestionDropdownListComponent,
};
export default meta;

export const DropdownList = template({
  suggestions: [
    'How many duplicate Visit IDs are there?',
    'What is the total revenue generated?',
    'What is the total quantity of items sold?',
  ],
  isLoading: false,
  onSelect() {},
});

export const DropdownListLoading = template({
  suggestions: [],
  isLoading: true,
  onSelect() {},
});
