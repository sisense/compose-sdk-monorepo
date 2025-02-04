import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Typography } from '../Typography';
import { Button } from './Button';

import '@testing-library/jest-dom';

describe('Button Component', () => {
  it('should render the Button with default props', () => {
    render(<Button variant="text">Click Me</Button>);

    const button = screen.getByRole('button', { name: 'Click Me' });

    expect(button).toBeInTheDocument();
  });

  it('should match the snapshot when variant gray', () => {
    render(<Button variant="gray">Variant Gray</Button>);

    const button = screen.getByRole('button', { name: 'Variant Gray' });

    expect(button).toMatchSnapshot();
  });

  it('should match the snapshot when variant primary', () => {
    render(<Button variant="primary">Variant Primary</Button>);

    const button = screen.getByRole('button', { name: 'Variant Primary' });

    expect(button).toMatchSnapshot();
  });

  it('should match the snapshot when variant secondary', () => {
    render(<Button variant="secondary">Variant Secondary</Button>);

    const button = screen.getByRole('button', { name: 'Variant Secondary' });

    expect(button).toMatchSnapshot();
  });

  it('should match the snapshot when variant text', () => {
    render(<Button variant="text">Variant Text</Button>);

    const button = screen.getByRole('button', { name: 'Variant Text' });

    expect(button).toMatchSnapshot();
  });

  it('should apply custom themes correctly', () => {
    const customTheme = {
      styleOverrides: {
        root: {
          backgroundColor: 'rgb(0, 0, 255)',
        },
      },
    };

    render(
      <Button theme={customTheme} variant="text">
        Custom Theme
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Custom Theme' });

    expect(button).toHaveStyle('background-color: rgb(0, 0, 255)');
  });

  it('should use the default buttons theme when no theme is provided', () => {
    render(<Button>Default Theme</Button>);
    const button = screen.getByRole('button', { name: 'Default Theme' });

    expect(button).toHaveStyle('background-color: ButtonFace');
  });

  it('should pass additional props to the MUI Button', () => {
    render(
      <Button type="submit" variant="text">
        Submit
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Submit' });

    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should handle click events', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} variant="text">
        Click Event Handler
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Click Event Handler' });

    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should forward refs correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} variant="text">
        With Ref
      </Button>,
    );

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('should render with a custom className', () => {
    render(
      <Button className="custom-class" variant="text">
        Styled Button
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Styled Button' });

    expect(button).toHaveClass('custom-class');
  });

  it('should render children correctly', async () => {
    render(
      <Button className="custom-class" variant="text">
        <Typography variant={'bodyUI'}>Children</Typography>
      </Button>,
    );

    expect(await screen.findByText('Children')).toBeInTheDocument();
  });
});
