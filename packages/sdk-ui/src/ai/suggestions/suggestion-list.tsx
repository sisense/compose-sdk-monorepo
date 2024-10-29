import { useMemo, useState } from 'react';
import SuggestedItem from './suggestion-item';
import styled from '@emotion/styled';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider';
import { useTranslation } from 'react-i18next';

const ListContainer = styled.div<Themable>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: ${({ theme }) => theme.aiChat.suggestions.gap};
`;

type Props = {
  questions: string[];
  onSelection: (question: string) => void;
};

export default function SuggestionList({ questions, onSelection }: Props) {
  const { t } = useTranslation();
  const [showLess, setShowLess] = useState(true);

  const questionsToShow = useMemo(() => {
    if (showLess && questions.length > 5) {
      return questions.slice(0, 4);
    }
    return questions;
  }, [questions, showLess]);

  const { themeSettings } = useThemeContext();

  return (
    <ListContainer aria-label="list of suggested questions" theme={themeSettings}>
      {questionsToShow.map((question) => (
        <SuggestedItem key={question} question={question} onClick={() => onSelection(question)} />
      ))}
      {questionsToShow.length < questions.length && (
        <SuggestedItem question={t('ai.buttons.seeMore')} onClick={() => setShowLess(false)} />
      )}
    </ListContainer>
  );
}
