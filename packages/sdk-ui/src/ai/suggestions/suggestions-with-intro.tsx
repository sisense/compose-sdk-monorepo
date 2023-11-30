import React from 'react';
import SuggestionList from './suggestion-list';
import SuggestionListSkeleton from './suggestion-list-skeleton';

type Props = {
  questions: string[];
  title: string;
  onSelection: (question: string) => void;
};

export default function SuggestionsWithIntro(props: Props) {
  const hasQuestions = props.questions.length > 0;
  return (
    <>
      <div className="csdk-text-center">
        <h1 className="csdk-text-ai-lg csdk-text-text-active csdk-font-semibold">
          Explore {props.title}
        </h1>
        <p className="csdk-text-ai-base csdk-text-text-active csdk-mb-[8px] csdk-mt-[32px]">
          You can ask questions about your data, and I'll provide insights based on the data model
          you're working with.
          <br />
          <br />
          Some suggestions to ask about this dataset:
        </p>
      </div>
      {!hasQuestions && <SuggestionListSkeleton />}
      {hasQuestions && (
        <SuggestionList onSelection={props.onSelection} questions={props.questions} />
      )}
    </>
  );
}
