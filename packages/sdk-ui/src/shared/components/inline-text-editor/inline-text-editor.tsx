import { useCallback, useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';
import InputBase from '@mui/material/InputBase';
import DOMPurify from 'dompurify';

import { useBlurOnPointerDownOutside } from './use-blur-on-pointer-down-outside.js';

/**
 * Props for the InlineTextEditor component.
 */
export interface InlineTextEditorProps {
  /** Current text value */
  value: string;
  /** Whether the editor is in editing mode */
  isEditing: boolean;
  /** Called when text is committed (on blur / Enter) */
  onCommit: (newValue: string) => void;
  /** Called to request entering/leaving edit mode */
  onEditingChange: (editing: boolean) => void;
  /** Called when editing is cancelled (on Escape). May be undefined if onEditingChange handles it. */
  onCancel?: () => void;
  /** Placeholder text when value is empty */
  placeholder?: string;
}

const StyledInputContainer = styled.div`
  display: inline-grid;
  grid-template-columns: 1fr;
  align-items: baseline;
  width: auto;
  min-width: 50px;
  max-width: 100%;
`;

const StyledHiddenText = styled.span`
  // Auto-growing input using a CSS Grid technique with sharing the same grid area as the hidden text
  grid-area: 1 / 1 / 2 / 2;
  visibility: hidden;
  white-space: pre;
  font: inherit;
  padding: 0;
`;

const StyledInputBase = styled(InputBase)`
  // Auto-growing input using a CSS Grid technique with sharing the same grid area as the hidden text
  grid-area: 1 / 1 / 2 / 2;
  width: 100%;
  font: inherit;
  color: inherit;

  & .MuiInputBase-input {
    padding: 0;
    font: inherit;
    color: inherit;
    width: 100%;

    &::placeholder {
      opacity: 0.5;
    }

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
`;

const StyledText = styled.span<{ isPlaceholder?: boolean }>`
  cursor: text;
  color: ${({ isPlaceholder }) => (isPlaceholder ? 'rgba(0, 0, 0, 0.38)' : 'inherit')};
`;

/**
 * Inline text editor for editable titles.
 * Renders as plain text when not editing; switches to an input when in edit mode.
 * Supports double-click to enter edit mode, Enter/blur to commit, Escape to cancel.
 *
 * @internal
 */
export function InlineTextEditor({
  value,
  isEditing,
  onCommit,
  onEditingChange,
  onCancel,
  placeholder,
}: InlineTextEditorProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draftValue, setDraftValue] = useState(value);

  // Sync draft when value changes externally (e.g. after commit) or when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setDraftValue(value);
    }
  }, [isEditing, value]);

  const handleCommit = useCallback(() => {
    const trimmed = draftValue.trim();
    const sanitized = DOMPurify.sanitize(trimmed, { ALLOWED_TAGS: [] });
    if (sanitized !== value) {
      // commit only if the value has changed
      onCommit(sanitized);
    }
    onEditingChange(false);
  }, [draftValue, onCommit, onEditingChange, value]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    onEditingChange(false);
  }, [onCancel, onEditingChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCommit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleCommit, handleCancel],
  );

  const handleBlur = useCallback(() => {
    handleCommit();
  }, [handleCommit]);

  const enterEditMode = useCallback(() => {
    onEditingChange(true);
  }, [onEditingChange]);

  const handleTextKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        enterEditMode();
      }
    },
    [enterEditMode],
  );

  // When entering edit mode: focus input and select all text
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useBlurOnPointerDownOutside(inputRef, isEditing);

  if (isEditing) {
    return (
      <StyledInputContainer>
        {/* Hidden text to ensure the input expands to fit the text content instead of cropping it or being fixed-width */}
        <StyledHiddenText>{draftValue || placeholder || ''}</StyledHiddenText>
        <StyledInputBase
          inputRef={inputRef}
          inputProps={{
            'data-component': 'inline-text-editor-input',
          }}
          value={draftValue}
          placeholder={placeholder}
          onChange={(e) => setDraftValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </StyledInputContainer>
    );
  }

  const isPlaceholder = !value && !!placeholder;
  return (
    <StyledText
      role="button"
      tabIndex={0}
      aria-label="Editable text. Double-click or press Enter or Space to edit."
      data-component="inline-text-editor-text"
      data-no-dnd
      onDoubleClick={enterEditMode}
      onKeyDown={handleTextKeyDown}
      isPlaceholder={isPlaceholder}
    >
      {value || placeholder || ''}
    </StyledText>
  );
}
