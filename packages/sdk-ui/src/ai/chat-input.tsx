import { KeyboardEvent, useState } from 'react';

import MessageIcon from './icons/message-icon';
import ClearChatIcon from './icons/clear-chat-icon';

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
  const [textareaHeight, setTextareaHeight] = useState<number>(MIN_TEXTAREA_HEIGHT);

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

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.clientHeight <= MIN_TEXTAREA_HEIGHT) {
      setTextareaHeight(MIN_TEXTAREA_HEIGHT);
    }
    const newHeight = event.target.scrollHeight;
    setText(event.target.value);
    // Compare scrollHeight and clientHeight to check if a new line is needed
    if (event.target.value === '') {
      setTextareaHeight(MIN_TEXTAREA_HEIGHT);
    } else if (newHeight > event.target.clientHeight) {
      setTextareaHeight(newHeight);
    }
  };

  const disabledSendStyling =
    text.length === 0 || disabled
      ? 'csdk-opacity-30 csdk-cursor-not-allowed '
      : 'csdk-opacity-100 csdk-cursor-pointer';
  const iconPositionStyling = textareaHeight > 40 ? 'csdk-items-end' : 'csdk-items-center';

  const textareaSizeStyle = 'csdk-max-h-[88px] csdk-w-full';
  const textareaSpacingStyle = 'csdk-py-[7px] csdk-px-[16px] csdk-mx-[10px]';
  const textareaBorderStyle =
    'csdk-border csdk-border-[#262E3D]/[.15] csdk-rounded-lg focus:csdk-outline-[#262E3D]/50';

  return (
    <div
      className={`csdk-input csdk-flex ${iconPositionStyling} csdk-content-center csdk-w-full csdk-relative csdk-px-[16px]`}
    >
      {onClearHistoryClick && (
        <button
          className="csdk-h-[34px] csdk-bg-inherit csdk-cursor-pointer"
          onClick={onClearHistoryClick}
        >
          <ClearChatIcon />
        </button>
      )}
      <textarea
        className={`csdk-text-ai-sm csdk-text-text-content csdk-resize-none csdk-overflow-y-auto ${textareaSizeStyle} ${textareaSpacingStyle} ${textareaBorderStyle}`}
        onChange={handleTextareaChange}
        spellCheck={'true'}
        placeholder="Ask a question"
        value={text}
        onKeyDown={onKeyDownInput}
        style={{ height: textareaHeight }}
      />
      <button
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
