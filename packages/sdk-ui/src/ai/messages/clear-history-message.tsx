import { useTranslation } from 'react-i18next';
import ClickableMessage from './clickable-message';
import TextMessage from './text-message';

export type ClearHistoryMessageProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ClearHistoryMessage({ onCancel, onConfirm }: ClearHistoryMessageProps) {
  const { t } = useTranslation();

  return (
    <>
      <TextMessage align="left">{t('ai.clearHistoryPrompt')}</TextMessage>
      <div className="csdk-flex csdk-gap-x-2">
        <ClickableMessage align="right" onClick={onConfirm} accessibleName="confirm clear chat">
          <div className="csdk-py-[6px] csdk-px-[20px]">{t('ai.buttons.yes')}</div>
        </ClickableMessage>
        <ClickableMessage align="right" onClick={onCancel} accessibleName="cancel clear chat">
          <div className="csdk-py-[6px] csdk-px-[20px]">{t('ai.buttons.no')}</div>
        </ClickableMessage>
      </div>
    </>
  );
}
