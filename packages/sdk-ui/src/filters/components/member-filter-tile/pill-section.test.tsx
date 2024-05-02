import { getDefaultThemeSettings } from '@/theme-provider/default-theme-settings';
import { rgbToHex } from '@mui/system/colorManipulator';
import { screen } from '@testing-library/react';
import { setup } from '../../../__test-helpers__';
import { PillSection, PillSectionProps } from './pill-section';

const props: PillSectionProps = {
  selectedMembers: [
    { key: '2013-01-01T00:00:00', title: '2013' },
    { key: '2015-01-01T00:00:00', title: '2015', inactive: true },
  ],
  onToggleSelectedMember: vi.fn(),
  disabled: false,
};

const defaultThemeSettings = getDefaultThemeSettings();

beforeEach(() => {
  vi.clearAllMocks();
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

it('when selected members matches size is zero, the "Include all" pill is shown', () => {
  setup(<PillSection {...props} selectedMembers={[]} />);

  expect(screen.queryByRole('button', { name: '2013' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '2015' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Include all' })).toBeInTheDocument();
});

it('when no members are selected, the "Include all" pill is shown', () => {
  setup(<PillSection {...props} selectedMembers={[]} />);

  expect(screen.getByRole('button', { name: 'Include all' })).toBeInTheDocument();
});
