import SuggestionDropdownItem from './suggestion-dropdown-item';

export interface SuggestionDropdownListProps {
  onSelect: (selection: string) => void;
  suggestions: string[];
  isLoading: boolean;
}

export default function SuggestionDropdownList(props: SuggestionDropdownListProps) {
  return (
    <div className="csdk-py-[16px] csdk-flex csdk-flex-col">
      {props.isLoading && (
        <div className="csdk-animate-pulse csdk-px-[16px] csdk-flex csdk-flex-col csdk-gap-[16px]">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={`suggestion-placeholder-${i}`}
              className="csdk-h-[20px] csdk-bg-slate-300 csdk-rounded-[10px] csdk-col-span-2"
            ></div>
          ))}
        </div>
      )}
      {!props.isLoading &&
        props.suggestions.map((suggestion) => (
          <SuggestionDropdownItem
            key={suggestion}
            onClick={() => props.onSelect(suggestion)}
            text={suggestion}
          />
        ))}
    </div>
  );
}
