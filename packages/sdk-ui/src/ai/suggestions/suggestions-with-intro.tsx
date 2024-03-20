import SuggestionList from './suggestion-list';
import SuggestionListSkeleton from './suggestion-list-skeleton';

type Props = {
  questions: string[];
  isLoading: boolean;
  onSelection: (question: string) => void;
};

export default function SuggestionsWithIntro({ questions, isLoading, onSelection }: Props) {
  const hasQuestions = questions.length > 0;

  if (isLoading) {
    return <SuggestionListSkeleton />;
  }

  if (hasQuestions) {
    return (
      <>
        <div className="csdk-text-center csdk-text-ai-base csdk-text-text-active">
          Some suggestions to ask about this dataset:
        </div>
        <SuggestionList onSelection={onSelection} questions={questions} />
      </>
    );
  }

  return null;
}
