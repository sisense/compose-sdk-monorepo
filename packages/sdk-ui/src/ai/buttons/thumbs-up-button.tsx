import ThumbsUpIcon from '@/ai/icons/thumbs-up-icon';
import Tooltip from '@/ai/common/tooltip';
import { useThemeContext } from '@/theme-provider/theme-context';
import IconButton from '@/ai/common/icon-button';
import { useTranslation } from 'react-i18next';

type ThumbsUpButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export default function ThumbsUpButton({ onClick, disabled }: ThumbsUpButtonProps) {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();
  return (
    <Tooltip title={t('ai.buttons.correctResponse')}>
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
