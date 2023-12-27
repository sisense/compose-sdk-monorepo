import leaflet from 'leaflet';

export function fitMapToBounds(map: leaflet.Map, markers: leaflet.CircleMarker[]) {
  if (!markers.length) return;

  map.fitBounds(
    markers.map((marker) => [marker.getLatLng().lat, marker.getLatLng().lng]),
    {
      animate: true,
      maxZoom: 4,
    },
  );
}
