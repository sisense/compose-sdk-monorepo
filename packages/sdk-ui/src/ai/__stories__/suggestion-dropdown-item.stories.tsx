/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable sonarjs/no-duplicate-string */
import { templateForComponent } from '../../__stories__/template';
import { Meta } from '@storybook/react';
import SuggestionDropdownItem from '../suggestions/suggestion-dropdown-item';

const template = templateForComponent(SuggestionDropdownItem);

const meta: Meta<typeof SuggestionDropdownItem> = {
  title: 'AI/Components/Suggestions/Dropdown',
  component: SuggestionDropdownItem,
};
export default meta;

export const DropdownItem = template({
  onClick() {},
  text: 'How many duplicate Visit IDs are there?',
});
