import React from 'react';
import { Filter, isNumber, isText } from '@sisense/sdk-data';
import { FilterEditorTextual } from './filter-editor-textual';
import { FilterEditorNumerical } from './filter-editor-numerical';

type FilterEditorProps = {
  filter: Filter;
  onChange?: (filter: Filter | null) => void;
};

/** @internal */
export const FilterEditor = ({ filter, onChange }: FilterEditorProps) => {
  return (
    <>
      {isText(filter.attribute.type) && <FilterEditorTextual filter={filter} onChange={onChange} />}
      {isNumber(filter.attribute.type) && (
        <FilterEditorNumerical filter={filter} onChange={onChange} />
      )}
    </>
  );
};
