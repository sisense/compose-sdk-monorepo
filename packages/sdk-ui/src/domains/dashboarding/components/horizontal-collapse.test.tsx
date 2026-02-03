import { fireEvent, render } from '@testing-library/react';

import { HorizontalCollapse } from './horizontal-collapse.js';

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

  it('should render with children in expanded view', () => {
    const TEST_TITLE = 'Test Title';
    const onCollapsedChangeMock = vi.fn();
    const { getByText, container } = render(
      <HorizontalCollapse collapsed={false} onCollapsedChange={onCollapsedChangeMock}>
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
    expect(onCollapsedChangeMock).toHaveBeenCalledWith(true);

    // Validate that the width is auto when the component is expanded
    const contentWrapper = collapseButton.nextElementSibling!;
    const wrapperStyles = window.getComputedStyle(contentWrapper);
    expect(wrapperStyles.width).toBe('auto');
  });

  it('should hide collapse arrow when hideCollapseArrow is true', () => {
    const TEST_TITLE = 'Test Title';
    const onCollapsedChangeMock = vi.fn();
    const { getByText, container } = render(
      <HorizontalCollapse
        collapsed={true}
        onCollapsedChange={onCollapsedChangeMock}
        hideCollapseArrow={true}
      >
        <div>{TEST_TITLE}</div>
      </HorizontalCollapse>,
    );

    // Verify the presence of children
    expect(getByText(TEST_TITLE)).toBeInTheDocument();

    // Ensure the collapse button is NOT rendered when hideCollapseArrow is true
    const collapseButton = container.querySelector('.arrow-wrapper');
    expect(collapseButton).toBeNull();
  });

  it('should render correctly when collapsed and hideCollapseArrow is true', () => {
    const TEST_TITLE = 'Test Title';
    const { getByText, container } = render(
      <HorizontalCollapse collapsed={true} onCollapsedChange={vi.fn()} hideCollapseArrow={true}>
        <div data-testid="content">{TEST_TITLE}</div>
      </HorizontalCollapse>,
    );

    // Verify the presence of children
    expect(getByText(TEST_TITLE)).toBeInTheDocument();

    // Test the behavior: when collapsed and hideCollapseArrow is true,
    // the content should be in the collapsed wrapper
    const contentWrapper = container.querySelector('div > div');
    expect(contentWrapper).toBeInTheDocument();
    // The component should render correctly with the collapsed and hideCollapseArrow props
    expect(container.querySelector('.arrow-wrapper')).toBeNull();
  });

  it('should render correctly when expanded and hideCollapseArrow is true', () => {
    const TEST_TITLE = 'Test Title';
    const { getByText, container } = render(
      <HorizontalCollapse collapsed={false} onCollapsedChange={vi.fn()} hideCollapseArrow={true}>
        <div data-testid="content">{TEST_TITLE}</div>
      </HorizontalCollapse>,
    );

    // Verify the presence of children
    expect(getByText(TEST_TITLE)).toBeInTheDocument();

    // Test the behavior: when expanded and hideCollapseArrow is true,
    // the content should be in the expanded wrapper
    const contentWrapper = container.querySelector('div > div');
    expect(contentWrapper).toBeInTheDocument();
    // The component should render correctly with the collapsed and hideCollapseArrow props
    expect(container.querySelector('.arrow-wrapper')).toBeNull();
  });

  it('should render arrow with correct orientation based on collapsed state', () => {
    const TEST_TITLE = 'Test Title';
    const { container, rerender } = render(
      <HorizontalCollapse collapsed={false} onCollapsedChange={vi.fn()}>
        <div>{TEST_TITLE}</div>
      </HorizontalCollapse>,
    );

    // When expanded, arrow should not be reversed
    let collapseButton = container.querySelector('.arrow-wrapper') as HTMLElement;
    expect(collapseButton).toBeInTheDocument();
    expect(collapseButton).toHaveAttribute('data-reversed', 'false');

    // When collapsed, arrow should be reversed
    rerender(
      <HorizontalCollapse collapsed={true} onCollapsedChange={vi.fn()}>
        <div>{TEST_TITLE}</div>
      </HorizontalCollapse>,
    );

    collapseButton = container.querySelector('.arrow-wrapper') as HTMLElement;
    expect(collapseButton).toHaveAttribute('data-reversed', 'true');
  });

  it('should handle default props correctly', () => {
    const TEST_TITLE = 'Test Title';
    const { getByText, container } = render(
      <HorizontalCollapse>
        <div>{TEST_TITLE}</div>
      </HorizontalCollapse>,
    );

    // Verify the presence of children
    expect(getByText(TEST_TITLE)).toBeInTheDocument();

    // Ensure the collapse button is rendered (hideCollapseArrow defaults to false)
    const collapseButton = container.querySelector('.arrow-wrapper');
    expect(collapseButton).toBeInTheDocument();

    // Validate that the width is auto when not collapsed (collapsed defaults to false)
    const contentWrapper = collapseButton!.nextElementSibling!;
    const wrapperStyles = window.getComputedStyle(contentWrapper);
    expect(wrapperStyles.width).toBe('auto');
  });
});
