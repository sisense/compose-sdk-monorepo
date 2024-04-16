import ClickableMessage from './clickable-message';

export type ClearHistoryMessageProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ClearHistoryMessage({ onCancel, onConfirm }: ClearHistoryMessageProps) {
  return (
    <div className="csdk-flex csdk-flex-col csdk-gap-y-2">
      <ClickableMessage align="right" onClick={onConfirm}>
        <div className="csdk-py-[7px] csdk-px-2">{'Yes, clear chat'}</div>
      </ClickableMessage>
      <ClickableMessage align="right" onClick={onCancel}>
        <div className="csdk-py-[7px] csdk-px-2">{'No, continue analysis'}</div>
      </ClickableMessage>
    </div>
  );
}
