import ThumbsUpIcon from '@/ai/icons/thumbs-up-icon';
import Tooltip from '@/ai/common/tooltip';
import { useThemeContext } from '@/theme-provider/theme-context';
import IconButton from '@/ai/common/icon-button';

type ThumbsUpButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export default function ThumbsUpButton({ onClick, disabled }: ThumbsUpButtonProps) {
  const { themeSettings } = useThemeContext();
  return (
    <Tooltip title="Correct response">
      <IconButton
        aria-label="thumbs-up"
        onClick={onClick}
        $hoverColor={themeSettings.aiChat.icons.feedbackIcons.hoverColor}
        disabled={disabled}
      >
        <ThumbsUpIcon theme={themeSettings} />
      </IconButton>
    </Tooltip>
  );
}
