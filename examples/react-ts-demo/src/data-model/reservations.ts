import {
  Dimension,
  DateDimension,
  Attribute,
  createAttribute,
  createDateDimension,
  createDimension,
} from '@sisense/sdk-data';

export const DataSource = 'reservations';

interface reservationscsvDimension extends Dimension {
  PartySize: Attribute;
  PersonName: Attribute;
  ReservationID: Attribute;
  ReservationTime: Attribute;
  WalkIn: Attribute;
  Shift: Attribute;
  ReservationDate: DateDimension;
  ReservationDatetime: DateDimension;
}
export const reservationscsv = createDimension({
  name: 'reservations.csv',
  PartySize: createAttribute({
    name: 'PartySize',
    type: 'numeric-attribute',
    expression: '[reservations.csv.Party Size]',
  }),
  PersonName: createAttribute({
    name: 'PersonName',
    type: 'text-attribute',
    expression: '[reservations.csv.Name]',
  }),
  ReservationID: createAttribute({
    name: 'ReservationID',
    type: 'numeric-attribute',
    expression: '[reservations.csv.Reservation ID]',
  }),
  ReservationTime: createAttribute({
    name: 'ReservationTime',
    type: 'text-attribute',
    expression: '[reservations.csv.Reservation Time]',
  }),
  WalkIn: createAttribute({
    name: 'WalkIn',
    type: 'text-attribute',
    expression: '[reservations.csv.Walk In]',
  }),
  Shift: createDateDimension({
    name: 'Shift',
    type: 'text-attribute',
    expression: '[reservations.csv.Shift]',
  }),
  ReservationDate: createDateDimension({
    name: 'ReservationDate',
    expression: '[reservations.csv.Reservation Date (Calendar)]',
  }),
  ReservationDatetime: createDateDimension({
    name: 'ReservationDatetime',
    expression: '[reservations.csv.Reservation Datetime (Calendar)]',
  }),
}) as reservationscsvDimension;
