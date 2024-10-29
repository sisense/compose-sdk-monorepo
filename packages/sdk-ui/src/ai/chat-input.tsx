import { ChangeEvent, KeyboardEvent, useCallback, useLayoutEffect, useRef, useState } from 'react';

import MessageIcon from './icons/message-icon';
import ClearChatIcon from './icons/clear-chat-icon';
import { useChatConfig } from './chat-config';
import styled from '@emotion/styled';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider';
import { css } from '@emotion/react';
import ChatDropup, { isCommand } from './chat-dropup';
import Tooltip from './common/tooltip';
import { CHAT_INPUT_MAX_LENGTH } from './common/constants';
import { useTranslation } from 'react-i18next';

const ChatInputContainer = styled.div<Themable>`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;

  background-color: ${({ theme }) => theme.aiChat.backgroundColor};
`;

const ClearHistoryButton = styled.button`
  height: 34px;
  background-color: inherit;
  cursor: pointer;
  border: none;
`;

const TextInput = styled.textarea<Themable>`
  font-size: inherit;
  line-height: inherit;
  resize: none;
  overflow-y: auto;
  box-sizing: border-box;
  // size style
  max-height: 88px;
  width: 100%;
  // spacing style
  padding-top: 7px;
  padding-bottom: 7px;
  padding-left: 16px;
  padding-right: 16px;
  margin-left: 10px;
  margin-right: 10px;
  // border style
  border-width: 1px;
  border-color: rgb(38 46 61 / 0.15);
  border-radius: 0.5rem;
  &:focus {
    outline: 1px solid ${({ theme }) => theme.aiChat.input.focus.outlineColor};
  }
  font-family: inherit;

  color: ${({ theme }) => theme.aiChat.primaryTextColor};

  background-color: ${({ theme }) => theme.aiChat.input.backgroundColor};
`;

const SendMessageButton = styled.button<Themable & { disabled: boolean }>`
  height: 34px;
  background-color: inherit;
  border-style: none;

  color: ${({ theme }) => theme.aiChat.primaryTextColor};

  ${({ disabled }) =>
    disabled
      ? css`
          opacity: 0.3;
          cursor: not-allowed;
        `
      : css`
          opacity: 1;
          cursor: pointer;
        `}
`;

export type ChatInputProps = {
  onSendMessage: (message: string) => void;
  onClearHistoryClick?: () => void;
  disabled?: boolean;
  recentPrompts: string[];
  suggestions: string[];
  isLoading: boolean;
  recommendationsError: boolean;
  onChange?: (text: string) => void;
};

const MIN_TEXTAREA_HEIGHT = 34;

export default function ChatInput({
  onSendMessage,
  onClearHistoryClick,
  disabled,
  recentPrompts,
  suggestions,
  isLoading,
  recommendationsError,
  onChange,
}: ChatInputProps) {
  const [text, setText] = useState('');

  const { inputPromptText } = useChatConfig();

  const handleSendMessage = useCallback(() => {
    if (disabled) return;

    if (isCommand(text)) {
      setText('');
      return;
    }

    const finalText = text.trim();
    if (finalText.length === 0) return;
    onSendMessage(finalText);
    setText('');
  }, [disabled, onSendMessage, text]);

  const handleDropupSelect = useCallback(
    (selection: string) => {
      onSendMessage(selection);
      setText('');
    },
    [onSendMessage],
  );

  const onKeyDownInput = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
      } else if (e.key === 'Escape' && isCommand(text)) {
        setText('');
      }
    },
    [handleSendMessage, text],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
      setText(e.target.value);
    },
    [onChange],
  );

  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      // Reset height - important to shrink on delete
      ref.current.style.height = 'inherit';
      // Set height
      ref.current.style.height = `${Math.max(
        ref.current.scrollHeight + 2, // account for 1px top/bottom border
        MIN_TEXTAREA_HEIGHT,
      )}px`;
    }
  }, [text]);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.focus({ preventScroll: true });
    }
  }, []);

  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();

  return (
    <ChatInputContainer theme={themeSettings}>
      <ChatDropup
        recentPrompts={recentPrompts}
        suggestions={suggestions}
        isLoading={isLoading}
        onSelection={handleDropupSelect}
        anchorEl={ref.current}
        text={text}
        recommendationsError={recommendationsError}
      />
      {onClearHistoryClick && (
        <Tooltip title={t('ai.buttons.clearChat')} placement="bottom-start">
          <ClearHistoryButton aria-label="clear history" onClick={onClearHistoryClick}>
            <ClearChatIcon theme={themeSettings} />
          </ClearHistoryButton>
        </Tooltip>
      )}
      <TextInput
        aria-label="chat input"
        onBlur={(e) => {
          if (document.getElementById('csdk-chatbot-frame')?.contains(e.relatedTarget)) {
            e.target.focus({ preventScroll: true });
          }
        }}
        maxLength={CHAT_INPUT_MAX_LENGTH}
        ref={ref}
        rows={1}
        onChange={handleChange}
        spellCheck={'true'}
        placeholder={inputPromptText}
        value={text}
        onKeyDown={onKeyDownInput}
        theme={themeSettings}
      />
      <SendMessageButton
        aria-label="send chat message"
        disabled={disabled || text.length === 0}
        onClick={handleSendMessage}
        theme={themeSettings}
      >
        <span data-state="closed">
          <MessageIcon theme={themeSettings} />
        </span>
      </SendMessageButton>
    </ChatInputContainer>
  );
}
