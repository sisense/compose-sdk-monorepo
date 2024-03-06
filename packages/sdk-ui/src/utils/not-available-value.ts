export type NAType = 'N\\A';
export const NAValue = 'N\\A';

export const isNotAvailable = (value: number | string | null | undefined) => value === NAValue;
