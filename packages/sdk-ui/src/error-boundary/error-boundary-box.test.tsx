import ErrorBoundaryBox from './error-boundary-box';
import { fireEvent, render } from '@testing-library/react';
import { ThemeContext } from '@/theme-provider';
import { CompleteThemeSettings } from '@/types';

describe('ErrorBoundaryBox', () => {
  it('should render error correctly', () => {
    const { container } = render(<ErrorBoundaryBox error="error" />);
    expect(container).toMatchSnapshot();
  });

  it('should render error with theme settings correctly', () => {
    const { container } = render(
      <ThemeContext.Provider
        value={{
          themeSettings: {
            general: {
              backgroundColor: 'red',
              brandColor: 'blue',
            },
            typography: {
              fontFamily: 'Roboto',
              primaryTextColor: 'green',
            },
          } as CompleteThemeSettings,
        }}
      >
        <ErrorBoundaryBox error="error" />
      </ThemeContext.Provider>,
    );

    fireEvent.mouseOver(container.firstChild as Element);

    expect(container).toMatchSnapshot();
  });
});
