import { Meta } from '@storybook/react-vite';

import { templateForComponent } from '../../__stories__/template';
import { SuggestionListSkeleton } from '../suggestions';

const template = templateForComponent(SuggestionListSkeleton);

const meta: Meta<typeof SuggestionListSkeleton> = {
  title: 'AI/Components/Suggestions/Skeleton',
  component: SuggestionListSkeleton,
};
export default meta;

export const Skeleton = template({});
