/* eslint-disable import/no-extraneous-dependencies */
import { Meta } from '@storybook/react';
import { templateForComponent } from '../../__stories__/template';
import ToolbarComponent from '../toolbar';

const ToolbarComponentTemplate = templateForComponent(ToolbarComponent);

const meta: Meta<typeof ToolbarComponent> = {
  title: 'AI/Components/Toolbar',
  component: ToolbarComponent,
};
export default meta;

export const Toolbar = ToolbarComponentTemplate({
  title: 'Sisense Analytics',
  leftNav: <p>left-icon</p>,
});
