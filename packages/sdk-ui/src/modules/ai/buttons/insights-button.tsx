import { useTranslation } from 'react-i18next';

import LightBulbIcon from '../icons/light-bulb-icon.js';
import ClickableMessage from '../messages/clickable-message.js';

export default function InsightsButton({ onClick }: { onClick?: () => void }) {
  const { t } = useTranslation();

  return (
    <ClickableMessage align="left" onClick={onClick}>
      <div
        className={`csdk-py-[5px] csdk-px-2 csdk-flex csdk-items-center csdk-gap-x-1 csdk-select-none`}
      >
        <LightBulbIcon />
        {t('ai.buttons.insights')}
      </div>
    </ClickableMessage>
  );
}
