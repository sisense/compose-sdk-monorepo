import TextMessage from './text-message';

export default function ChatWelcomeMessage() {
  return (
    <TextMessage align="left">
      <>
        <div className="csdk-font-semibold">Welcome to the Query Assistant!</div>
        <br />
        <div>
          You can ask questions about your data, and I'll provide insights based on the data model
          you're working with.
        </div>
      </>
    </TextMessage>
  );
}
