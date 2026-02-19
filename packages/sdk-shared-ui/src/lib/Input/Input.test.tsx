import React from 'react';

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Input } from './Input';
import styles from './Input.module.scss';

describe('Input Component', () => {
  it('should render correctly with basic props', () => {
    render(<Input onChange={vi.fn()} placeholder={'Enter text'} />);

    const input = screen.getByPlaceholderText('Enter text');

    expect(input).toBeInTheDocument();
  });

  it('should handle onChange and updates input value', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} placeholder={'Enter text'} />);

    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(onChange).toHaveBeenCalledWith('test');
    expect(input).toHaveValue('test');
  });

  it('should clear input when clearable and clear icon is clicked', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Input onChange={onChange} placeholder={'Enter text'} clearable={true} value={'clear me'} />,
    );

    const clearIcon = container.querySelector('.app-icon.app-icon--general-x');
    fireEvent.click(clearIcon as Element);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should render input in password mode', () => {
    render(
      <Input
        onChange={vi.fn()}
        placeholder={'Enter text'}
        clearable={true}
        value={'clear me'}
        password={true}
      />,
    );

    const input = screen.getByPlaceholderText('Enter text');

    expect(input).toHaveAttribute('type', 'password');
  });

  it('should toggle password visibility', () => {
    const { container } = render(
      <Input
        onChange={vi.fn()}
        placeholder={'Enter text'}
        clearable={true}
        value={'clear me'}
        password={true}
      />,
    );

    const input = screen.getByPlaceholderText('Enter text');
    const toggleIcon = container.querySelector('.app-icon.app-icon--general-show');
    fireEvent.click(toggleIcon as Element);

    expect(input).toHaveAttribute('type', 'text');
  });

  it('should render search icon when `search` is true', () => {
    const { container } = render(
      <Input onChange={vi.fn()} placeholder={'Enter text'} search={true} />,
    );
    const searchIcon = container.querySelector('.app-icon.app-icon--general-search-small');

    expect(searchIcon).toBeInTheDocument();
  });

  it('should render custom icon when `icon` prop is passed', () => {
    const { container } = render(
      <Input
        onChange={vi.fn()}
        placeholder={'Enter text'}
        search={true}
        icon={{ placement: 'left', name: 'custom-icon' }}
      />,
    );

    const customIcon = container.querySelector('.app-icon.app-icon--custom-icon');

    expect(customIcon).toBeInTheDocument();
  });

  it('should apply className  correctly', () => {
    const { container } = render(
      <Input onChange={vi.fn()} placeholder={'Enter text'} className={'custom-class'} />,
    );

    const wrapper = container.querySelector('.custom-class');

    expect(wrapper).toHaveClass('custom-class');
  });

  it('should apply inputClassName correctly', () => {
    render(
      <Input onChange={vi.fn()} placeholder={'Enter text'} inputClassName={'custom-input-class'} />,
    );

    const input = screen.getByPlaceholderText('Enter text');

    expect(input).toHaveClass('custom-input-class');
  });

  it('should handle disabled state correctly', () => {
    render(<Input onChange={vi.fn()} placeholder={'Enter text'} disabled={true} />);
    const input = screen.getByPlaceholderText('Enter text');

    expect(input).toBeDisabled();
  });

  it('should trim input when trimInput is true', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} placeholder={'Enter text'} trimInput={true} />);
    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: '  trimmed text  ' } });

    expect(onChange).toHaveBeenCalledWith('trimmed text');
  });

  it('should prevent default behavior on mouse down for the clear icon', () => {
    const { container } = render(<Input clearable value="test" onChange={vi.fn()} />);
    const clearIcon = container.querySelector('.app-icon.app-icon--general-x');
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(mouseDownEvent, 'preventDefault');

    clearIcon?.dispatchEvent(mouseDownEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should prevent default behavior on mouse down for the password visibility icon', () => {
    const { container } = render(<Input password value="test" onChange={vi.fn()} />);
    const passwordIcon = container.querySelector('.app-icon.app-icon--general-show');
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(mouseDownEvent, 'preventDefault');

    (passwordIcon as Element).dispatchEvent(mouseDownEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should apply "withLeftIcon" class when icon is present and placement is left', () => {
    render(
      <Input
        placeholder={'Enter text'}
        icon={{ name: 'test-icon', placement: 'left' }}
        onChange={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText('Enter text');

    expect(input).toHaveClass(styles.withLeftIcon);
  });
});
