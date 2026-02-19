import {
  JaqlDataType,
  ListOfJaqlDataTypes,
  ListOfSortingDirections,
  SortingDirection,
} from '@sisense/sdk-pivot-query-client';

type MessageKeys = 'ascAZ' | 'descZA' | 'asc19' | 'desc91';

export function makeGetCaption(messages: Record<MessageKeys, string>) {
  const captions = {
    [SortingDirection.ASC]: {
      [JaqlDataType.TEXT]: messages.ascAZ,
      [JaqlDataType.NUMERIC]: messages.asc19,
      [JaqlDataType.DATETIME]: messages.asc19,
    },
    [SortingDirection.DESC]: {
      [JaqlDataType.TEXT]: messages.descZA,
      [JaqlDataType.NUMERIC]: messages.desc91,
      [JaqlDataType.DATETIME]: messages.desc91,
    },
  };

  return function getCaption(
    datatype: ListOfJaqlDataTypes,
    direction: ListOfSortingDirections,
  ): string {
    return captions[direction][datatype];
  };
}
