import { ListOfJaqlDataTypes } from '../../data-handling/constants.js';

export type SortingSettingItem = {
  title: string;
  datatype: ListOfJaqlDataTypes;
  selected: boolean;
  direction: 'asc' | 'desc' | null;
};
