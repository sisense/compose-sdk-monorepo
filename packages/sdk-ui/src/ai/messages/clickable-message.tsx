import { useChatStyle } from '../chat-style-provider.js';

type Props = {
  children: string | JSX.Element;
  align: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
};

export default function ClickableMessage({ children, align, onClick, disabled }: Props) {
  const { primaryTextColor, messageBackgroundColor } = useChatStyle();

  const baseStyle =
    'csdk-text-ai-sm csdk-text-text-content csdk-bg-background-priority csdk-rounded-[20px] csdk-border csdk-border-text-content csdk-p-0 csdk-select-none';

  const enabledStyle =
    'enabled:csdk-cursor-pointer enabled:hover:csdk-text-white enabled:hover:csdk-bg-text-content';

  const disabledStyle = 'disabled:csdk-opacity-70';

  const alignStyle =
    align === 'right' ? 'csdk-ml-auto csdk-text-right' : 'only:csdk-mr-auto csdk-text-left';

  return (
    <button
      className={`${baseStyle} ${enabledStyle} ${disabledStyle} ${alignStyle} `}
      style={{
        backgroundColor: messageBackgroundColor,
        color: primaryTextColor,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
