import ThumbsDownIcon from '@/ai/icons/thumbs-down-icon';
import Tooltip from '@/ai/common/tooltip';
import { useThemeContext } from '@/theme-provider/theme-context';
import IconButton from '@/ai/common/icon-button';
import { useTranslation } from 'react-i18next';

type ThumbsDownButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export default function ThumbsDownButton({ onClick, disabled }: ThumbsDownButtonProps) {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();

  return (
    <Tooltip title={t('ai.buttons.incorrectResponse')}>
      <IconButton
        aria-label="thumbs-down"
        onClick={onClick}
        $hoverColor={themeSettings.aiChat.icons.feedbackIcons.hoverColor}
        disabled={disabled}
      >
        <ThumbsDownIcon theme={themeSettings} />
      </IconButton>
    </Tooltip>
  );
}
