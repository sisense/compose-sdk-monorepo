import { ListOfJaqlDataTypes } from '@sisense/sdk-pivot-query-client';

export type SortingSettingItem = {
  title: string;
  datatype: ListOfJaqlDataTypes;
  selected: boolean;
  direction: 'asc' | 'desc' | null;
};
