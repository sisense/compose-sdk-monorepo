import { render } from '@testing-library/react';
import { DashboardHeader } from './dashboard-header';

describe('DashboardHeader', () => {
  it('should render and contain provided title', () => {
    const TEST_TITLE = 'Test Title';
    const { getByText } = render(<DashboardHeader title={TEST_TITLE} />);

    expect(getByText(TEST_TITLE)).toBeInTheDocument();
  });
});
