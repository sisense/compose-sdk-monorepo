import { Meta } from '@storybook/react';
import { templateForComponent } from '../../__stories__/template';
import ToolbarComponent from '../common/toolbar';

const ToolbarComponentTemplate = templateForComponent(ToolbarComponent);

const meta: Meta<typeof ToolbarComponent> = {
  title: 'AI/Components/Toolbar',
  component: ToolbarComponent,
};
export default meta;

export const Toolbar = ToolbarComponentTemplate({
  title: 'Sisense Analytics',
  leftNav: <p>left-icon</p>,
  style: {
    textColor: '#262E3D',
    backgroundColor: '#FFFFFF',
  },
});
