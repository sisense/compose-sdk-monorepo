import { useTranslation } from 'react-i18next';

import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context';
import IconButton from '@/modules/ai/common/icon-button';
import Tooltip from '@/modules/ai/common/tooltip';
import ThumbsUpIcon from '@/modules/ai/icons/thumbs-up-icon';

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
