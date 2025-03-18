import React from 'react';
import { Filter, isDatetime, isNumber, isText } from '@sisense/sdk-data';
import { FilterEditorTextual } from './filter-editor-textual';
import { FilterEditorNumerical } from './filter-editor-numerical';
import { FilterEditorDatetime } from './filter-editor-datetime';

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
      {isDatetime(filter.attribute.type) && (
        <FilterEditorDatetime filter={filter} onChange={onChange} />
      )}
    </>
  );
};
