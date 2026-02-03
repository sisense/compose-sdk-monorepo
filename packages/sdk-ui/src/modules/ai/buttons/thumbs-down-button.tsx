import { useTranslation } from 'react-i18next';

import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context';
import IconButton from '@/modules/ai/common/icon-button';
import Tooltip from '@/modules/ai/common/tooltip';
import ThumbsDownIcon from '@/modules/ai/icons/thumbs-down-icon';

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
