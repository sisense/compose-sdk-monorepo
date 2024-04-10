/* eslint-disable max-lines-per-function */
import { KeyboardEvent, useLayoutEffect, useRef, useState } from 'react';

import MessageIcon from './icons/message-icon';
import ClearChatIcon from './icons/clear-chat-icon';
import { useChatStyle } from './chat-style-provider';
import { useChatConfig } from './chat-config';

export type ChatInputProps = {
  onSendMessage: (message: string) => void;
  onClearHistoryClick?: () => void;
  disabled?: boolean;
};

const MIN_TEXTAREA_HEIGHT = 34;

export default function ChatInput({
  onSendMessage,
  onClearHistoryClick,
  disabled,
}: ChatInputProps) {
  const [text, setText] = useState('');

  const { inputPromptText } = useChatConfig();

  const handleSendMessage = () => {
    if (disabled) return;
    const finalText = text.trim();
    if (finalText.length === 0) return;
    onSendMessage(finalText);
    setText('');
  };

  const onKeyDownInput = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      // Reset height - important to shrink on delete
      textareaRef.current.style.height = 'inherit';
      // Set height
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight + 2, // account for 1px top/bottom border
        MIN_TEXTAREA_HEIGHT,
      )}px`;
    }
  }, [text]);

  const disabledSendStyling =
    text.length === 0 || disabled
      ? 'csdk-opacity-30 csdk-cursor-not-allowed '
      : 'csdk-opacity-100 csdk-cursor-pointer';
  const textareaSizeStyle = 'csdk-max-h-[88px] csdk-w-full';
  const textareaSpacingStyle = 'csdk-py-[7px] csdk-px-[16px] csdk-mx-[10px]';
  const textareaBorderStyle =
    'csdk-border csdk-border-[#262E3D]/[.15] csdk-rounded-lg focus:csdk-outline-[#262E3D]/50';

  const { primaryTextColor, inputBackgroundColor } = useChatStyle();

  return (
    <div className="csdk-flex csdk-items-end csdk-content-center csdk-w-full csdk-relative csdk-px-[16px]">
      {onClearHistoryClick && (
        <button
          aria-label="clear history"
          className="csdk-h-[34px] csdk-bg-inherit csdk-cursor-pointer"
          onClick={onClearHistoryClick}
        >
          <ClearChatIcon />
        </button>
      )}
      <textarea
        ref={textareaRef}
        rows={1}
        className={`csdk-text-ai-sm csdk-text-text-content csdk-resize-none csdk-overflow-y-auto ${textareaSizeStyle} ${textareaSpacingStyle} ${textareaBorderStyle}`}
        onChange={(e) => setText(e.target.value)}
        spellCheck={'true'}
        placeholder={inputPromptText}
        value={text}
        onKeyDown={onKeyDownInput}
        style={{
          color: primaryTextColor,
          backgroundColor: inputBackgroundColor,
        }}
      />
      <button
        aria-label="send chat message"
        disabled={disabled}
        className={`csdk-h-[34px] csdk-bg-inherit ${disabledSendStyling}`}
        onClick={handleSendMessage}
      >
        <span data-state="closed">
          <MessageIcon />
        </span>
      </button>
    </div>
  );
}
