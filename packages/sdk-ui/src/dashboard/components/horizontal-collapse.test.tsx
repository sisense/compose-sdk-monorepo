import { HorizontalCollapse } from './horizontal-collapse';
import { fireEvent, render } from '@testing-library/react';

describe('HorizontalCollapse', () => {
  it('should render with children in collapsed view and trigger onCollapsedChange', () => {
    const TEST_TITLE = 'Test Title';
    const onCollapsedChangeMock = vi.fn();
    const { getByText, container } = render(
      <HorizontalCollapse collapsed={true} onCollapsedChange={onCollapsedChangeMock}>
        <div>{TEST_TITLE}</div>
      </HorizontalCollapse>,
    );

    // Verify the presence of children
    expect(getByText(TEST_TITLE)).toBeInTheDocument();

    // Ensure the collapse button is rendered
    const collapseButton = container.querySelector('.arrow-wrapper') as HTMLElement;
    expect(collapseButton).toBeInTheDocument();

    // Confirm that onCollapsedChange is triggered when the collapse button is clicked
    fireEvent.click(collapseButton);
    expect(onCollapsedChangeMock).toHaveBeenCalledWith(false);

    // Validate that the width is correct when the component is collapsed
    const wrapperStyles = window.getComputedStyle(collapseButton.nextElementSibling!);
    expect(wrapperStyles.width).toBe('8px');
  });
});
