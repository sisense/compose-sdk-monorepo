import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InlineTextEditor } from './inline-text-editor.js';

describe('InlineTextEditor', () => {
  it('renders text span when not editing', () => {
    render(
      <InlineTextEditor
        value="My Title"
        isEditing={false}
        onCommit={vi.fn()}
        onEditingChange={vi.fn()}
      />,
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders input when editing', () => {
    render(
      <InlineTextEditor
        value="My Title"
        isEditing={true}
        onCommit={vi.fn()}
        onEditingChange={vi.fn()}
      />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('data-component', 'inline-text-editor-input');
    expect(input).toHaveValue('My Title');
  });

  it('calls onEditingChange when double-clicked', () => {
    const onEditingChange = vi.fn();
    render(
      <InlineTextEditor
        value="My Title"
        isEditing={false}
        onCommit={vi.fn()}
        onEditingChange={onEditingChange}
      />,
    );
    fireEvent.doubleClick(screen.getByText('My Title'));
    expect(onEditingChange).toHaveBeenCalledWith(true);
  });

  it('calls onEditingChange when Enter is pressed on the text surface', () => {
    const onEditingChange = vi.fn();
    render(
      <InlineTextEditor
        value="My Title"
        isEditing={false}
        onCommit={vi.fn()}
        onEditingChange={onEditingChange}
      />,
    );
    const textSurface = screen.getByRole('button');
    fireEvent.keyDown(textSurface, { key: 'Enter' });
    expect(onEditingChange).toHaveBeenCalledWith(true);
  });

  it('calls onEditingChange when Space is pressed on the text surface', () => {
    const onEditingChange = vi.fn();
    render(
      <InlineTextEditor
        value="My Title"
        isEditing={false}
        onCommit={vi.fn()}
        onEditingChange={onEditingChange}
      />,
    );
    const textSurface = screen.getByRole('button');
    fireEvent.keyDown(textSurface, { key: ' ' });
    expect(onEditingChange).toHaveBeenCalledWith(true);
  });

  it('calls onCommit with new value on blur', () => {
    const onCommit = vi.fn();
    render(
      <InlineTextEditor
        value="My Title"
        isEditing={true}
        onCommit={onCommit}
        onEditingChange={vi.fn()}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith('New Title');
  });

  it('calls onCommit when pointerdown occurs outside the input (e.g. chart)', () => {
    const onCommit = vi.fn();
    const onEditingChange = vi.fn();
    render(
      <div>
        <InlineTextEditor
          value="My Title"
          isEditing={true}
          onCommit={onCommit}
          onEditingChange={onEditingChange}
        />
        <div data-testid="outside" />
      </div>,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Edited Title' } });
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onCommit).toHaveBeenCalledWith('Edited Title');
    expect(onEditingChange).toHaveBeenCalledWith(false);
  });

  it('calls onCommit with new value on Enter key', () => {
    const onCommit = vi.fn();
    const onEditingChange = vi.fn();
    render(
      <InlineTextEditor
        value="My Title"
        isEditing={true}
        onCommit={onCommit}
        onEditingChange={onEditingChange}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith('New Title');
    expect(onEditingChange).toHaveBeenCalledWith(false);
  });

  it('calls onCancel and exits edit mode on Escape key', () => {
    const onCancel = vi.fn();
    const onEditingChange = vi.fn();
    const onCommit = vi.fn();
    render(
      <InlineTextEditor
        value="My Title"
        isEditing={true}
        onCommit={onCommit}
        onEditingChange={onEditingChange}
        onCancel={onCancel}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Changed' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
    expect(onEditingChange).toHaveBeenCalledWith(false);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('trims value on commit', () => {
    const onCommit = vi.fn();
    render(
      <InlineTextEditor
        value="My Title"
        isEditing={true}
        onCommit={onCommit}
        onEditingChange={vi.fn()}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  Trimmed  ' } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith('Trimmed');
  });

  it('displays placeholder when value is empty and not editing', () => {
    render(
      <InlineTextEditor
        value=""
        isEditing={false}
        onCommit={vi.fn()}
        onEditingChange={vi.fn()}
        placeholder="ADD TITLE"
      />,
    );
    expect(screen.getByText('ADD TITLE')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays placeholder in input when value is empty and editing', () => {
    render(
      <InlineTextEditor
        value=""
        isEditing={true}
        onCommit={vi.fn()}
        onEditingChange={vi.fn()}
        placeholder="ADD TITLE"
      />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'ADD TITLE');
    expect(input).toHaveValue('');
  });

  it('allows double-clicking placeholder to enter edit mode', () => {
    const onEditingChange = vi.fn();
    render(
      <InlineTextEditor
        value=""
        isEditing={false}
        onCommit={vi.fn()}
        onEditingChange={onEditingChange}
        placeholder="ADD TITLE"
      />,
    );
    fireEvent.doubleClick(screen.getByText('ADD TITLE'));
    expect(onEditingChange).toHaveBeenCalledWith(true);
  });

  it('commits empty value when placeholder is cleared', () => {
    const onCommit = vi.fn();
    render(
      <InlineTextEditor
        value="Some Title"
        isEditing={true}
        onCommit={onCommit}
        onEditingChange={vi.fn()}
        placeholder="ADD TITLE"
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith('');
  });

  it('displays value instead of placeholder when value exists', () => {
    render(
      <InlineTextEditor
        value="My Title"
        isEditing={false}
        onCommit={vi.fn()}
        onEditingChange={vi.fn()}
        placeholder="ADD TITLE"
      />,
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.queryByText('ADD TITLE')).not.toBeInTheDocument();
  });

  it('works without placeholder prop when value is empty', () => {
    render(
      <InlineTextEditor value="" isEditing={false} onCommit={vi.fn()} onEditingChange={vi.fn()} />,
    );
    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('');
  });

  it('syncs draft value when entering edit mode', () => {
    const { rerender } = render(
      <InlineTextEditor
        value="Initial Value"
        isEditing={false}
        onCommit={vi.fn()}
        onEditingChange={vi.fn()}
      />,
    );
    rerender(
      <InlineTextEditor
        value="Initial Value"
        isEditing={true}
        onCommit={vi.fn()}
        onEditingChange={vi.fn()}
      />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Initial Value');
  });
});
