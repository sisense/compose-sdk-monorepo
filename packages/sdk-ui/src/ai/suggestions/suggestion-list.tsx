import { useMemo, useState } from 'react';
import SuggestedItem from './suggestion-item';

type Props = {
  questions: string[];
  onSelection: (question: string) => void;
};

export default function SuggestionList({ questions, onSelection }: Props) {
  const [showLess, setShowLess] = useState(true);

  const questionsToShow = useMemo(() => {
    if (showLess && questions.length > 5) {
      return questions.slice(0, 4);
    }
    return questions;
  }, [questions, showLess]);

  return (
    <div
      aria-label="list of suggested questions"
      className="csdk-flex csdk-flex-col csdk-gap-y-4 csdk-justify-center csdk-text-center csdk-items-center"
    >
      {questionsToShow.map((question) => (
        <SuggestedItem key={question} question={question} onClick={() => onSelection(question)} />
      ))}
      {questionsToShow.length < questions.length && (
        <SuggestedItem question="See more" onClick={() => setShowLess(false)} />
      )}
    </div>
  );
}
