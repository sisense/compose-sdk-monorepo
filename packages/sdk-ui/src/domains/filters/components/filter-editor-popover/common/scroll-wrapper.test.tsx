import { render } from '@testing-library/react';

import { ScrollWrapper } from './scroll-wrapper.js';

describe('ScrollWrapper', () => {
  it('should render correctly and and trigger onScroll on scroll', () => {
    const childrenText = 'childrenText';
    const onScrollMock = vi.fn((event) => {
      expect(event).toEqual({ top: Infinity, direction: 'down' });
    });
    const { container, findByText } = render(
      <ScrollWrapper onScroll={onScrollMock}>
        <div
          style={{
            height: 1000,
          }}
        >
          {childrenText}
        </div>
      </ScrollWrapper>,
    );

    expect(findByText(childrenText)).toBeTruthy();

    const wrapper = container.children[0];
    wrapper.scrollTop = 10;
    wrapper.dispatchEvent(new Event('scroll'));

    expect(onScrollMock).toHaveBeenCalled();
  });
});
