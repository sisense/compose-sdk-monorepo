import { screen } from '@testing-library/react';
import { setup } from '../../../__test_helpers__';
import { BasicMemberFilterTile, BasicMemberFilterTileProps } from './BasicMemberFilterTile';

const props: BasicMemberFilterTileProps = {
  title: 'Test Title',
  allMembers: [
    { key: '2013-01-01T00:00:00', title: '2013' },
    { key: '2014-01-01T00:00:00', title: '2014' },
    { key: '2015-01-01T00:00:00', title: '2015' },
  ],
  initialSelectedMembers: [
    { key: '2013-01-01T00:00:00', title: '2013' },
    { key: '2015-01-01T00:00:00', title: '2015', inactive: true },
  ],
};

it('renders pills in its initial state', () => {
  setup(<BasicMemberFilterTile {...props} />);

  const pill2013 = screen.getByRole('button', { name: '2013' });
  expect(pill2013).toBeInTheDocument();
});

it('renders a list of members when expanded', async () => {
  const { user } = setup(<BasicMemberFilterTile {...props} />);

  const pill2013 = screen.getByRole('button', { name: '2013' });
  expect(pill2013).toBeInTheDocument();

  await user.click(screen.getByLabelText('arrow-down'));

  expect(pill2013).not.toBeInTheDocument();
  expect(screen.queryByLabelText('2013')).toBeInTheDocument();
});
