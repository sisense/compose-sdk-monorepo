import leaflet from 'leaflet';

export function addCopyright(map: leaflet.Map, mapUrl: string) {
  const mapBoxCopyright = `
      © <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>
      © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>
      <strong>
        <a href='https://www.mapbox.com/map-feedback/' target='_blank'>
          Improve this map
        </a>
      </strong>`;
  const openStreetMapCopyright = `© <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>`;

  const credits = leaflet.control.attribution();

  if (mapUrl.indexOf('mapbox') > -1) {
    credits.addAttribution(mapBoxCopyright).addTo(map);
  } else if (mapUrl.indexOf('openstreetmap') > -1) {
    credits.addAttribution(openStreetMapCopyright).addTo(map);
  }

  return credits;
}
