import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DEPRECATED_Button } from './DEPRECATED_Button';

import '@testing-library/jest-dom';

describe('Button Component', () => {
  it('should render correctly with default props', () => {
    render(<DEPRECATED_Button text="Click Me" />);

    expect(screen.getByText('Click Me')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('btn');
  });

  it('should apply custom className when provided as prop', () => {
    render(<DEPRECATED_Button text="Click Me" className="custom-class" />);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('should render an DEPRECATED_Icon with correct props when provided', () => {
    const iconName = 'icon-name';
    const iconClassName = 'custom-icon-class';
    const hoverSuffix = 'hover-suffix';

    const { container } = render(
      <DEPRECATED_Button
        text="Button with Icon"
        iconName={iconName}
        iconClassName={iconClassName}
        hoverSuffix={hoverSuffix}
        disabled
      />,
    );

    const icon = container.querySelector(`.${iconClassName}`);
    expect(icon).toHaveClass('btn__icon');
    expect(icon).toHaveClass(iconClassName);
    expect(icon).toHaveAttribute('name', iconName);
    expect(icon).toHaveAttribute('disabled');
  });

  it('should render an DEPRECATED_Icon with correct hover suffix when provided', () => {
    const iconName = 'icon-name';
    const iconClassName = 'custom-icon-class';
    const hoverSuffix = 'hover-suffix';

    const { container } = render(
      <DEPRECATED_Button
        text="Button with Icon"
        iconName={iconName}
        iconClassName={iconClassName}
        hoverSuffix={hoverSuffix}
      />,
    );
    let icon = container.querySelector(`.${iconClassName}`) as Element;
    fireEvent.mouseEnter(icon);
    icon = container.querySelector(`.${iconClassName}`) as Element;

    expect(icon).toHaveClass('app-icon--icon-namehover-suffix');
  });

  it('should render a trailing DEPRECATED_Icon with correct props when trailingIconName is provided', () => {
    const trailingIconName = 'trailing-icon';
    const hoverSuffix = 'trailing-hover';

    const { container } = render(
      <DEPRECATED_Button
        text="Button with Trailing Icon"
        trailingIconName={trailingIconName}
        hoverSuffix={hoverSuffix}
      />,
    );
    const trailingIcon = container.querySelector('.app-icon.app-icon--trailing-icon.btn__icon');

    expect(trailingIcon).toBeInTheDocument();
    expect(trailingIcon).toHaveAttribute('name', trailingIconName);
  });

  it('should render only an DEPRECATED_Icon when no text is provided and passes correct props', () => {
    const iconName = 'icon-only';
    const { container } = render(<DEPRECATED_Button iconName={iconName} disabled />);

    const button = screen.getByRole('button');
    const icon = container.querySelector(".app-icon[class~='app-icon--icon-only']");

    expect(button).toHaveClass('btn--icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('name', iconName);
    expect(icon).toHaveAttribute('disabled');
  });

  it('should render both text and DEPRECATED_Icon with proper spacing', () => {
    const { container } = render(<DEPRECATED_Button text="Text with Icon" iconName="icon-name" />);

    const button = screen.getByRole('button');
    const icon = container.querySelector('.app-icon.app-icon--icon-name.btn__icon');

    expect(icon).toBeInTheDocument();
    expect(button).toHaveTextContent('Text with Icon');
  });

  it('should disable the button when disabled is true', () => {
    render(<DEPRECATED_Button text="Disabled" disabled />);

    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveClass('btn--disabled');
  });

  it('should call the onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<DEPRECATED_Button text="Click Me" onClick={handleClick} />);
    const button = screen.getByRole('button');

    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply the correct aria-label', () => {
    render(<DEPRECATED_Button text="Aria Test" ariaLabel="custom-label" />);

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-label', 'custom-label');
  });

  it('should set the title when button is disabled and allowDisabledTitle is true', () => {
    render(
      <DEPRECATED_Button
        title="Disabled Button Allowed"
        disabled
        allowDisabledTitle
        dataTestId="button"
      />,
    );

    const button = screen.getByTestId('button');

    expect(button).toHaveAttribute('title', 'Disabled Button Allowed');
  });

  it('should not set the title when button is disabled and allowDisabledTitle is false', () => {
    render(<DEPRECATED_Button title="Disabled Button" disabled dataTestId="button" />);

    const button = screen.getByTestId('button');

    expect(button).not.toHaveAttribute('title');
  });
});
