import TextMessage from '../messages/text-message';
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
        <TextMessage align="left">Some things to ask about this dataset:</TextMessage>
        <SuggestionList onSelection={onSelection} questions={questions} />
      </>
    );
  }

  return null;
}
