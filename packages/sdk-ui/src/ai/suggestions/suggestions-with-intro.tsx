import { useChatConfig } from '../chat-config';
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

  const { suggestionsWelcomeText } = useChatConfig();

  if (isLoading) {
    return <SuggestionListSkeleton />;
  }

  if (hasQuestions) {
    return (
      <>
        {suggestionsWelcomeText && <TextMessage align="left">{suggestionsWelcomeText}</TextMessage>}
        <SuggestionList onSelection={onSelection} questions={questions} />
      </>
    );
  }

  return null;
}
