import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setup } from '../../../__test_helpers__';
import { MemberList, MemberListProps } from './MemberList';

const props: MemberListProps = {
  members: [
    { key: '2013-01-01T00:00:00', title: '2013' },
    { key: '2014-01-01T00:00:00', title: '2014' },
    { key: '2015-01-01T00:00:00', title: '2015' },
  ],
  selectedMembers: [
    { key: '2013-01-01T00:00:00', title: '2013' },
    { key: '2015-01-01T00:00:00', title: '2015', inactive: true },
  ],
  disabled: false,
  onSelectMember: jest.fn(),
  selectAllMembers: jest.fn(),
  clearAllMembers: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('"change all" checkbox', () => {
  it('renders unchecked and executes the correct callback when clicked', async () => {
    const { user } = setup(<MemberList {...props} />);

    const changeAllCheckbox = screen.getByRole('checkbox', { name: 'change-all' });
    expect(changeAllCheckbox).not.toBeChecked();

    await user.click(changeAllCheckbox);
    expect(props.selectAllMembers).toHaveBeenCalledTimes(1);
  });

  it('renders checked and executes the correct callback when clicked', async () => {
    const propsWithAllSelected: MemberListProps = {
      ...props,
      selectedMembers: [...props.selectedMembers, { key: '2014-01-01T00:00:00', title: '2014' }],
    };
    const { user } = setup(<MemberList {...propsWithAllSelected} />);

    const changeAllCheckbox = screen.getByRole('checkbox', { name: 'change-all' });
    expect(changeAllCheckbox).toBeChecked();

    await user.click(changeAllCheckbox);
    expect(props.clearAllMembers).toHaveBeenCalledTimes(1);
  });
});

it('renders unchecked and checked member rows', () => {
  setup(<MemberList {...props} />);

  expect(screen.getByLabelText('2013', { selector: 'input' })).toBeChecked();
  expect(screen.getByLabelText('2014', { selector: 'input' })).not.toBeChecked();
  expect(screen.getByLabelText('2015', { selector: 'input' })).toBeChecked();
});

describe('when disabled', () => {
  it('renders unclickable "change-all" checkbox', () => {
    setup(<MemberList {...props} disabled />);

    expect(screen.getByRole('checkbox', { name: 'change-all' })).toBeDisabled();
  });

  it('renders unclickable member rows', async () => {
    const { user } = setup(<MemberList {...props} disabled />);

    const row2013 = screen.getByLabelText('2013', { selector: 'input' });
    expect(row2013).toBeDisabled();

    await user.click(row2013);
    expect(props.onSelectMember).not.toHaveBeenCalled();

    expect(screen.getByLabelText('2014', { selector: 'input' })).toBeDisabled();
    expect(screen.getByLabelText('2015', { selector: 'input' })).toBeDisabled();
  });

  it('renders disabled search box', async () => {
    setup(<MemberList {...props} disabled />);

    const searchBox = screen.getByRole('searchbox');
    expect(searchBox).toBeDisabled();

    await userEvent.click(searchBox);
    await userEvent.type(searchBox, '20');

    expect(searchBox).not.toHaveFocus();
    expect(searchBox).not.toHaveValue('20');
  });
});

describe('when enabled', () => {
  // https://testing-library.com/docs/using-fake-timers/
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders clickable member rows', async () => {
    const { user } = setup(<MemberList {...props} />, true);

    const row2013 = screen.getByLabelText('2013', { selector: 'input' });
    expect(row2013).toBeEnabled();

    await user.click(row2013);
    expect(props.onSelectMember).toHaveBeenCalledTimes(1);

    expect(screen.getByLabelText('2014', { selector: 'input' })).toBeEnabled();
    expect(screen.getByLabelText('2015', { selector: 'input' })).toBeEnabled();
  });

  it('renders searchable search box that filters members', async () => {
    const { user } = setup(<MemberList {...props} />, true);

    const searchBox = screen.getByRole('searchbox');

    await user.click(searchBox);
    await user.type(searchBox, '2014');

    expect(searchBox).toHaveFocus();
    expect(searchBox).toHaveValue('2014');

    // We need to trigger the debounced onChange by advancing timers by the
    // specified delay. This will in turn cause an update to the searchString
    // React state, which needs to be wrapped in act().
    //
    // This is talked about more here:
    // https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#1-when-using-jestusefaketimers
    act(() => jest.advanceTimersByTime(300));

    expect(screen.queryByLabelText('2013')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('2014')).toBeInTheDocument();
    expect(screen.queryByLabelText('2015')).not.toBeInTheDocument();
  });
});
