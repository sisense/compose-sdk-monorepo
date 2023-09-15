import type { Meta } from '@storybook/react';
import { ThemeProvider } from '../components/theme-provider';
import { BasicMemberFilterTile } from '../filters';
import type {
  Member,
  SelectedMember,
} from '../filters/components/member-filter-tile/members-reducer';
import { templateForComponent } from './template';

const template = templateForComponent(BasicMemberFilterTile);

const meta: Meta<typeof BasicMemberFilterTile> = {
  title: 'filters/BasicMemberFilterTile',
  component: BasicMemberFilterTile,
};

export default meta;

const allMembers: Member[] = [
  'ID0',
  'ID1',
  'ID2',
  'ID3',
  'ID4',
  'ID5',
  'ID6',
  'ID7',
  'ID8',
  'ID9',
  'ID10',
  'ID11',
  'ID12',
  'ID13',
  'ID14',
  'ID15',
  'ID16',
  'ID17',
  'ID18',
].map((m) => ({ key: m, title: m }));

const selectedMembers: SelectedMember[] = ['ID10', 'ID13', 'ID12', 'ID11'].map((m) => ({
  key: m,
  title: m,
}));

export const WithInitialSelectedMembers = template({
  title: 'dim1',
  allMembers,
  initialSelectedMembers: selectedMembers,
});

export const WithAllMembersExceedingMaxAllowed = template({
  title: 'dim1',
  allMembers,
  initialSelectedMembers: selectedMembers,
  maxAllowedMembers: 10,
});

export const WithDuplicateMembers = template({
  title: 'dim1',
  allMembers: allMembers.concat(allMembers.slice(2, 6)),
  initialSelectedMembers: selectedMembers,
});

const inactiveSelectedMembers: SelectedMember[] = ['ID10', 'ID13'].map((m) => ({
  key: m,
  title: m,
  inactive: true,
}));
const activeSelectedMembers: SelectedMember[] = ['ID12', 'ID11'].map((m) => ({ key: m, title: m }));
export const WithCustomThemeSettings = template(
  {
    title: 'dim1',
    allMembers,
    initialSelectedMembers: inactiveSelectedMembers.concat(activeSelectedMembers),
  },
  [
    (Story) => (
      <ThemeProvider
        theme={{
          general: {
            brandColor: '#c31b36',
            backgroundColor: '#e7a7a7',
            primaryButtonTextColor: '#54df72',
          },
        }}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
);
