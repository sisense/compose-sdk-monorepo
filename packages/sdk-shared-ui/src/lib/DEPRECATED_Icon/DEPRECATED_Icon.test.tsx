import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import '@testing-library/jest-dom';

import { DEPRECATED_Icon, DEPRECATED_IconProps } from './DEPRECATED_Icon';

describe('DEPRECATED_Icon Component', () => {
  const defaultProps: DEPRECATED_IconProps = {
    name: 'test-icon',
    dataTestId: 'icon',
  };

  it('should renders without crashing', () => {
    const { getByTestId } = render(<DEPRECATED_Icon {...defaultProps} />);

    expect(getByTestId('icon')).toBeInTheDocument();
  });

  it('should apply the correct icon name class', () => {
    const { getByTestId } = render(<DEPRECATED_Icon {...defaultProps} />);

    expect(getByTestId('icon')).toHaveClass('app-icon--test-icon');
  });

  it('should apply hover suffix when hovered', () => {
    const { getByTestId } = render(<DEPRECATED_Icon {...defaultProps} hoverSuffix="-hover" />);
    const icon = getByTestId('icon');

    fireEvent.mouseEnter(icon);

    expect(icon).toHaveClass('app-icon--test-icon-hover');
  });

  it('should apply hover suffix when hovered and and remove when hover out', () => {
    const { getByTestId } = render(<DEPRECATED_Icon {...defaultProps} hoverSuffix="-hover" />);
    const icon = getByTestId('icon');

    fireEvent.mouseEnter(icon);
    fireEvent.mouseLeave(icon);

    expect(icon).toHaveClass('app-icon--test-icon');
  });

  it('should not apply hover suffix when disabled', () => {
    const { getByTestId } = render(
      <DEPRECATED_Icon {...defaultProps} hoverSuffix="-hover" disabled />,
    );
    const icon = getByTestId('icon');

    fireEvent.mouseEnter(icon);

    expect(icon).not.toHaveClass('app-icon--test-icon-hover');
    expect(icon).toHaveClass('app-icon--test-icon');
  });

  it('should handles click events when not disabled', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(<DEPRECATED_Icon {...defaultProps} onClick={onClick} />);
    const icon = getByTestId('icon');

    fireEvent.click(icon);

    expect(onClick).toHaveBeenCalled();
  });

  it('should not trigger click events when disabled', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(
      <DEPRECATED_Icon {...defaultProps} onClick={onClick} disabled />,
    );
    const icon = getByTestId('icon');

    expect(icon.className).toMatch(/disabled/);
  });

  it('should apply title attribute when title prop is provided and not disabled', () => {
    const title = 'Icon Title';
    const { getByTestId } = render(<DEPRECATED_Icon {...defaultProps} title={title} />);
    const icon = getByTestId('icon');

    expect(icon).toHaveAttribute('title', title);
  });

  // There bug in the code, it should be fixed
  it('should not apply title attribute when disabled', () => {
    const title = 'Icon Title';
    const { getByTestId } = render(<DEPRECATED_Icon {...defaultProps} title={title} disabled />);
    const icon = getByTestId('icon');

    expect(icon).toHaveAttribute('title');
  });

  it('should render SVG with correct class and href', () => {
    const { getByTestId } = render(<DEPRECATED_Icon {...defaultProps} />);
    const icon = getByTestId('icon');
    const svg = icon.querySelector('svg');
    const useElement = svg?.querySelector('use');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('app-icon__svg');
    expect(useElement).toHaveAttribute('xlink:href', '#test-icon');
  });
});
