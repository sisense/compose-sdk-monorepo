import React from 'react';
import { DateRangeFilter } from '@sisense/sdk-data';

type DateRangeFilterDisplayProps = {
  filter: DateRangeFilter;
};

type DisplayVariant = 'from-to' | 'only-from' | 'only-to';

export const DateRangeFilterDisplay = (props: DateRangeFilterDisplayProps) => {
  const displayVariant: DisplayVariant =
    props.filter.from && props.filter.to ? 'from-to' : props.filter.from ? 'only-from' : 'only-to';
  const textContent = getTextContent(displayVariant, props.filter);
  return (
    <div className="csdk-leading-[26px] csdk-mx-auto csdk-my-2 csdk-px-1 csdk-text-[13px] csdk-whitespace-nowrap csdk-flex csdk-flex-wrap csdk-gap-x-1 csdk-justify-center">
      {textContent}
    </div>
  );
};

const getTextContent = (displayVariant: DisplayVariant, filter: DateRangeFilter) => {
  switch (displayVariant) {
    case 'from-to':
      return `${filter.from} to ${filter.to}`;
    case 'only-from':
      return `From ${filter.from}`;
    case 'only-to':
      return `To ${filter.to}`;
  }
};
