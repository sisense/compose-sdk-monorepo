import { templateForComponent } from '../../__stories__/template';
import { Meta } from '@storybook/react';
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
      description: 'Data Topic Description 1',
    },
    {
      title: 'Sample Retail',
      description: 'Data Topic Description 2',
    },
    {
      title: 'Sample Healthcare',
      description: 'Data Topic Description 3',
    },
  ],
});
