export type Coordinates = {
  lat: number;
  lng: number;
};

export type Location = {
  _id: string;
  lookupKey: string;
  placetype: null | string;
  context: null | string;
  err: null | string;
  latLng: Coordinates;
  name: string;
  place_name: string;
  text: string;
  version: string;
};
