import { rgbToHex } from '@mui/material';
import { screen } from '@testing-library/react';
import { getDefaultThemeSettings } from '../../../chart-options-processor/theme_option_service';
import { setup } from '../../../__test_helpers__';
import { PillSection, PillSectionProps } from './PillSection';

const props: PillSectionProps = {
  membersSize: 3,
  selectedMembers: [
    { key: '2013-01-01T00:00:00', title: '2013' },
    { key: '2015-01-01T00:00:00', title: '2015', inactive: true },
  ],
  onToggleSelectedMember: jest.fn(),
  disabled: false,
};

const defaultThemeSettings = getDefaultThemeSettings();

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders selected members as active and inactive pills', () => {
  setup(<PillSection {...props} />);

  const pill2013 = screen.getByRole('button', { name: '2013' });
  const pill2015 = screen.getByRole('button', { name: '2015' });

  const { brandColor } = defaultThemeSettings.general;

  expect(rgbToHex(pill2013.style.backgroundColor)).toBe(brandColor);
  expect(rgbToHex(pill2015.style.backgroundColor)).not.toBe(brandColor);
});

it('executes correct callback when pill is clicked', async () => {
  const { user } = setup(<PillSection {...props} />);

  const pill2013 = screen.getByRole('button', { name: '2013' });

  await user.click(pill2013);
  expect(props.onToggleSelectedMember).toHaveBeenCalledTimes(1);
  expect(props.onToggleSelectedMember).toHaveBeenCalledWith('2013-01-01T00:00:00');
});

it('when selected members matches size of members, the "Include all" pill is shown', () => {
  setup(<PillSection {...props} membersSize={2} />);

  expect(screen.queryByRole('button', { name: '2013' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '2015' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Include all' })).toBeInTheDocument();
});

it('when no members are selected, the "Include all" pill is shown', () => {
  setup(<PillSection {...props} selectedMembers={[]} />);

  expect(screen.getByRole('button', { name: 'Include all' })).toBeInTheDocument();
});