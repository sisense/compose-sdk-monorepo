import * as Leaflet from 'leaflet';

import { createMarker, MarkerConfig, removeMarkers } from './markers';

describe('createMarker', () => {
  it('should create a Leaflet.CircleMarker with correct coordinates and style', () => {
    const coordinates: MarkerConfig['coordinates'] = { lat: 1, lng: 1 };
    const style: MarkerConfig['style'] = {
      color: 'red',
      size: 10,
      fill: 'filled',
      blur: false,
    };

    const marker = createMarker({ coordinates, style });

    expect(marker).toBeInstanceOf(Leaflet.CircleMarker);
    expect(marker.getLatLng()).toEqual(coordinates);
    expect(marker.options).toEqual({
      radius: 10,
      fillOpacity: 0.5,
      opacity: 0.5,
      fillColor: 'red',
      color: 'transparent',
      stroke: false,
      weight: 0,
      customStyle: style,
    });
  });
});

describe('removeMarkers', () => {
  it('should call remove method for each marker', () => {
    const marker1 = new Leaflet.CircleMarker({ lat: 1, lng: 1 }, { radius: 10 });
    const marker2 = new Leaflet.CircleMarker({ lat: 1, lng: 1 }, { radius: 10 });
    const marker3 = new Leaflet.CircleMarker({ lat: 1, lng: 1 }, { radius: 10 });

    const markers = [marker1, marker2, marker3];

    // spy on remove method
    markers.forEach((marker) => {
      vi.spyOn(marker, 'remove');
    });

    removeMarkers(markers);

    // Check if remove method is called for each marker
    markers.forEach((marker) => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(marker.remove).toHaveBeenCalledOnce();
    });
  });

  it('should handle empty array of markers', () => {
    const markers: Leaflet.CircleMarker[] = [];
    removeMarkers(markers); // Should not throw an error
  });
});
