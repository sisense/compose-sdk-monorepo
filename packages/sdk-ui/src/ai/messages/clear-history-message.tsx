import ClickableMessage from './clickable-message';
import TextMessage from './text-message';

export type ClearHistoryMessageProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ClearHistoryMessage({ onCancel, onConfirm }: ClearHistoryMessageProps) {
  return (
    <>
      <TextMessage align="left">Do you want to clear this chat?</TextMessage>
      <div className="csdk-flex csdk-gap-x-2">
        <ClickableMessage align="right" onClick={onConfirm} accessibleName="confirm clear chat">
          <div className="csdk-py-[6px] csdk-px-[20px]">Yes</div>
        </ClickableMessage>
        <ClickableMessage align="right" onClick={onCancel} accessibleName="cancel clear chat">
          <div className="csdk-py-[6px] csdk-px-[20px]">No</div>
        </ClickableMessage>
      </div>
    </>
  );
}
