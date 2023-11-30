import TextMessage from './text-message';

export type ClearHistoryMessageProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ClearHistoryMessage({ onCancel, onConfirm }: ClearHistoryMessageProps) {
  return (
    <div className="csdk-flex csdk-flex-col csdk-gap-y-2">
      <TextMessage align="right" onClick={onConfirm}>
        {'Yes, clear chat'}
      </TextMessage>
      <TextMessage align="right" onClick={onCancel}>
        {'No, continue analysis'}
      </TextMessage>
    </div>
  );
}
