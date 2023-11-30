/* eslint-disable import/no-extraneous-dependencies */
import { templateForComponent } from '../../__stories__/template';
import { Meta } from '@storybook/react';
import { DataTopicItem as DataTopicItemComponent } from '../data-topics';

const template = templateForComponent(DataTopicItemComponent);

const meta: Meta<typeof DataTopicItemComponent> = {
  title: 'AI/Components/DataTopics',
  component: DataTopicItemComponent,
};
export default meta;

export const DataTopicItem = template({
  title: 'Sample Retail',
  description: 'Data Topic Description',
});
