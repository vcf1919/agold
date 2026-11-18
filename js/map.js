/*
 * AGOLD · Mapa 3D (MapLibre GL + OpenFreeMap), en tonos marfil y champán.
 * Se carga solo cuando la sección «Visítanos» se acerca a la pantalla.
 */
const MAPLIBRE = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
const MAPLIBRE_CSS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
const STYLE = 'https://tiles.openfreemap.org/styles/positron';

const C = {
  bg: '#F3EDE4',
  land: '#EFE7DA',
  park: '#E6E2CF',
  water: '#DCD3C2',
  roadMinor: '#FBF8F3',
  roadMajor: '#FFFFFF',
  casing: '#E2D6C2',
  building: '#EDE3D3',
  text: '#5E5249',
  halo: '#F8F4EE',
};

function loadScript(src) {
  return new Promise((res, rej) => {
    if (window.maplibregl) return res();
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}
function loadCSS(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
}

function tintStyle(style) {
  style.layers = style.layers.filter((l) => !/^(label_country|label_state|boundary|highway-shield|road_shield|airport)/.test(l.id));
  for (const l of style.layers) {
    const p = (l.paint = l.paint || {});
    const id = l.id;
    if (l.type === 'background') p['background-color'] = C.bg;
    else if (id === 'park' || id.startsWith('landcover')) { p['fill-color'] = C.park; p['fill-opacity'] = 0.7; }
    else if (id === 'landuse_residential') { p['fill-color'] = C.land; p['fill-opacity'] = 0.6; }
    else if (id === 'water') p['fill-color'] = C.water;
    else if (id === 'waterway') p['line-color'] = C.water;
    else if (id === 'building') { l.maxzoom = 14; p['fill-color'] = C.building; }
    else if (l.type === 'line' && /casing/.test(id)) p['line-color'] = C.casing;
    else if (l.type === 'line' && /major|motorway/.test(id)) p['line-color'] = C.roadMajor;
    else if (l.type === 'line' && /minor|path|pier/.test(id)) p['line-color'] = C.roadMinor;
    else if (l.type === 'line' && /rail/.test(id)) p['line-color'] = C.casing;
    if (l.type === 'symbol') {
      p['text-color'] = C.text;
      p['text-halo-color'] = C.halo;
      p['text-halo-width'] = 1.4;
    }
  }
  // Edificios en volumen (marfil/champán)
  const firstSymbol = style.layers.findIndex((l) => l.type === 'symbol');
  style.layers.splice(firstSymbol, 0, {
    id: 'agold-3d',
    type: 'fill-extrusion',
    source: 'openmaptiles',
    'source-layer': 'building',
    minzoom: 14,
    filter: ['!', ['has', 'hide_3d']],
    paint: {
      'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 6], 0, '#F8F4EE', 12, '#F2EBE0', 30, '#EBE0CE'],
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      'fill-extrusion-opacity': 0.92,
      'fill-extrusion-vertical-gradient': false,
    },
  });
  // Luz suave y cálida para que los volúmenes queden en marfil y champán
  style.light = { anchor: 'viewport', color: '#FFFFFF', intensity: 0.26, position: [1.4, 210, 35] };
  return style;
}

function markerEl() {
  const el = document.createElement('div');
  el.className = 'map-marker';
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', 'AGOLD · C/ Joan Parras, 2');
  const mark = document.querySelector('.nav__mark');
  el.innerHTML = mark ? mark.outerHTML.replace('nav__mark', '').replace(/is-flash/g, '') : '';
  return el;
}

export async function initMap(host, site) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    loadCSS(MAPLIBRE_CSS);
    const [style] = await Promise.all([fetch(STYLE).then((r) => r.json()), loadScript(MAPLIBRE)]);
    const maplibregl = window.maplibregl;
    const center = site.coords || [-0.40056, 39.39948];
    const map = new maplibregl.Map({
      container: host,
      style: tintStyle(style),
      center,
      zoom: 15.4,
      pitch: 30,
      bearing: -12,
      maxPitch: 70,
      attributionControl: { compact: true },
      cooperativeGestures: true,
      fadeDuration: 0,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
    map.once('load', () => {
      host.querySelector('.visit__map-fallback')?.remove();
      new maplibregl.Marker({ element: markerEl(), anchor: 'center' }).setLngLat(center).addTo(map);
      const target = { center, zoom: 17.1, pitch: 58, bearing: -28 };
      if (reduced) map.jumpTo(target);
      else map.flyTo({ ...target, duration: 3200, essential: true, curve: 1.2 });
    });
    host.setAttribute('aria-label', 'Mapa: ' + (site.address || 'AGOLD, Catarroja'));
    host.setAttribute('role', 'region');
  } catch (e) {
    // Si falla el mapa, se queda la tarjeta con la dirección
    console.info('[AGOLD] Mapa no disponible:', e && e.message);
  }
}
