import React from 'react';

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DEPRECATED_Checkbox } from './DEPRECATED_Checkbox';

describe('DEPRECATED_Checkbox', () => {
  it('should render the checkbox with the provided text', () => {
    render(<DEPRECATED_Checkbox checked={false} text="Checkbox Label" onChange={vi.fn()} />);

    expect(screen.getByText('Checkbox Label')).toBeInTheDocument();
  });

  it('should render as checked when the checked prop is true', () => {
    render(<DEPRECATED_Checkbox checked={true} text="Checked Checkbox" onChange={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toBeChecked();
  });

  it('should trigger onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<DEPRECATED_Checkbox checked={false} onChange={handleChange} dataTestId="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalled();
  });

  it('should render the title when provided and not disabled', () => {
    render(<DEPRECATED_Checkbox checked={false} title="Checkbox Title" onChange={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toHaveAttribute('title', 'Checkbox Title');
  });

  it('should not render the title when disabled', () => {
    render(
      <DEPRECATED_Checkbox checked={false} title="Checkbox Title" disabled onChange={vi.fn()} />,
    );

    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toHaveAttribute('title');
  });

  it('should apply the correct classes for inline and transparent props', () => {
    const { container } = render(
      <DEPRECATED_Checkbox
        checked={false}
        inline
        transparent
        onChange={vi.fn()}
        className="custom-class"
      />,
    );

    const checkboxContainer = container.querySelector(`.custom-checkbox--inline`);

    expect(checkboxContainer).toHaveClass('custom-checkbox');
    expect(checkboxContainer).toHaveClass('custom-checkbox--inline');
    expect(checkboxContainer).toHaveClass('custom-class');
  });

  it('should call onDescriptionClick when the description is clicked', () => {
    const handleDescriptionClick = vi.fn();
    render(
      <DEPRECATED_Checkbox
        checked={false}
        text="Clickable Description"
        onChange={vi.fn()}
        onDescriptionClick={handleDescriptionClick}
      />,
    );

    fireEvent.click(screen.getByText('Clickable Description'));

    expect(handleDescriptionClick).toHaveBeenCalled();
  });

  it('should render an icon if iconName is provided', () => {
    const { container } = render(
      <DEPRECATED_Checkbox
        checked={false}
        iconName="test-icon"
        onChange={vi.fn()}
        dataTestId="checkbox"
      />,
    );

    const icon = container.querySelector(`.app-icon.app-icon--test-icon`);

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('app-icon app-icon--test-icon');
  });

  it('should call onDescriptionClick when the icon is clicked', () => {
    const handleDescriptionClick = vi.fn();
    const { container } = render(
      <DEPRECATED_Checkbox
        checked={false}
        iconName="test-icon"
        onChange={vi.fn()}
        onDescriptionClick={handleDescriptionClick}
      />,
    );
    const icon = container.querySelector(`.app-icon.app-icon--test-icon`);

    fireEvent.click(icon as Element);

    expect(handleDescriptionClick).toHaveBeenCalled();
  });

  it('should apply additional class names to the input checkbox element', () => {
    render(
      <DEPRECATED_Checkbox
        checked={false}
        inputCheckboxClassName="additional-input-class"
        onChange={vi.fn()}
      />,
    );
    const inputWrapper = screen.getByRole('checkbox').closest('div');

    expect(inputWrapper).toHaveClass('additional-input-class');
  });
});
