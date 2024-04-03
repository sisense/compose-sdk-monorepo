import { render } from '@testing-library/react';
import AlertBox from './alert-box';

describe('AlertBox component', () => {
  it('renders alerts correctly', () => {
    const alerts = ['Alert 1', 'Alert 2'];
    const { container } = render(<AlertBox alerts={alerts} />);
    expect(container).toMatchSnapshot();
  });

  it('renders no alerts when alerts array is empty', () => {
    const { container } = render(<AlertBox alerts={[]} />);
    expect(container).toMatchSnapshot();
  });

  it('renders no alerts when alerts property is not provided', () => {
    const { container } = render(<AlertBox />);
    expect(container).toMatchSnapshot();
  });
});
