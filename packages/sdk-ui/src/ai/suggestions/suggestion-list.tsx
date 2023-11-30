import { useState } from 'react';
import SuggestedItem from './suggestion-item';

type Props = {
  questions: string[];
  onSelection: (question: string) => void;
};

export default function SuggestionList(props: Props) {
  const [shouldShowMore, setShouldShowMore] = useState(false);
  return (
    <div className="csdk-flex csdk-flex-col csdk-gap-y-4 csdk-justify-center csdk-text-center csdk-items-center">
      {(shouldShowMore ? props.questions : props.questions.slice(0, 4)).map((question) => (
        <SuggestedItem
          key={question}
          question={question}
          onClick={() => props.onSelection(question)}
        />
      ))}
      {!shouldShowMore && props.questions.length > 4 && (
        <SuggestedItem question="See more" onClick={() => setShouldShowMore(true)} />
      )}
    </div>
  );
}
