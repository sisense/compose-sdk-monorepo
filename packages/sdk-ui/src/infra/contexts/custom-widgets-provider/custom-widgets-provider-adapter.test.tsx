import { useContext } from 'react';

import { render } from '@testing-library/react';

import { CustomWidgetsContext } from './custom-widgets-context';
import { CustomWidgetsProviderAdapter } from './custom-widgets-provider-adapter';
import { CustomWidgetComponent } from './types';

const CustomWidgetsCount = () => {
  const customWidgetsMap = useContext(CustomWidgetsContext);
  return <div>{customWidgetsMap?.size ?? 0}</div>;
};

describe('CustomWidgetsProviderAdapter', () => {
  it('throws when error is provided', () => {
    const error = new Error('adapter error');

    expect(() =>
      render(
        <CustomWidgetsProviderAdapter error={error}>
          <div />
        </CustomWidgetsProviderAdapter>,
      ),
    ).toThrow(error);
  });

  it('provides customWidgetsMap to children', () => {
    const widget: CustomWidgetComponent = () => null;
    const customWidgetsMap = new Map<string, CustomWidgetComponent>([['example', widget]]);

    const { getByText } = render(
      <CustomWidgetsProviderAdapter context={{ customWidgetsMap }}>
        <CustomWidgetsCount />
      </CustomWidgetsProviderAdapter>,
    );

    expect(getByText('1')).toBeInTheDocument();
  });
});
