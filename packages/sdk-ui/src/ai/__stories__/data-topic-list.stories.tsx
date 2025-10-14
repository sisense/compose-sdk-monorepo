import { Meta } from '@storybook/react-vite';

import { templateForComponent } from '../../__stories__/template';
import { DataTopicList as DataTopicListComponent } from '../data-topics';

const template = templateForComponent(DataTopicListComponent);

const meta: Meta<typeof DataTopicListComponent> = {
  title: 'AI/Components/DataTopics',
  component: DataTopicListComponent,
};
export default meta;

export const DataTopicList = template({
  dataTopics: [
    {
      title: 'Sample E-Commerce',
    },
    {
      title: 'Sample Retail',
    },
    {
      title: 'Sample Healthcare',
    },
  ],
});
