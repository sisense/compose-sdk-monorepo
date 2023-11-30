type SuggestionDropdownItemProps = {
  onClick: () => void;
  text: string;
};

export default function SuggestionDropdownItem(props: SuggestionDropdownItemProps) {
  return (
    <button
      className="csdk-bg-transparent csdk-cursor-pointer csdk-px-[16px] csdk-py-[8px] csdk-flex csdk-items-center hover:csdk-bg-background-priority"
      onClick={props.onClick}
    >
      <span className="csdk-mx-[4px]">{props.text}</span>
    </button>
  );
}
