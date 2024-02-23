import { DataModel, Perspective } from '@/ai/api/types';

export const dataModels: DataModel[] = [
  {
    oid: 'm1',
    title: 'Model 1',
  },
  {
    oid: 'm2',
    title: 'Model 2',
  },
  {
    oid: 'm3',
    title: 'Model 3',
  },
];

export const perspectives: Perspective[] = [
  {
    oid: 'p1',
    name: 'Perspective 1',
    description: 'This is my first perspective',
    isDefault: false,
  },
  {
    oid: 'p2',
    name: 'Perspective 2',
    description: 'This is my second perspective',
    isDefault: true,
  },
  {
    oid: 'p3',
    name: 'Perspective 3',
    description: 'This is my third perspective',
    isDefault: false,
  },
];
