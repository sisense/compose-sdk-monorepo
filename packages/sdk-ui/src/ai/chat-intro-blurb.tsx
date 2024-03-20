export default function ChatIntroBlurb(props: { title: string }) {
  return (
    <div className="csdk-text-center">
      <h1 className="csdk-text-ai-lg csdk-text-text-active csdk-font-semibold">
        Explore {props.title}
      </h1>
      <p className="csdk-text-ai-base csdk-text-text-active csdk-mb-[8px] csdk-mt-[32px]">
        You can ask questions about your data, and I'll provide insights based on the data model
        you're working with.
      </p>
    </div>
  );
}
