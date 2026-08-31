// Type maison à la place de GeoJSON.LineString, pour éviter de dépendre
// du package global @types/geojson (source de conflits de résolution de types).
export type LineStringGeometry = {
  type: "LineString";
  coordinates: [number, number][];
};

export type RouteInfo = {
  distanceKm: number;
  durationMinutes: number;
  geometry: LineStringGeometry | null;
};

/**
 * Calcule la distance (km), la durée (min) ET la géométrie du trajet
 * (nécessaire pour tracer la ligne sur la carte) via l'API Directions de Mapbox.
 */
export async function getRouteInfo(
  origin: { longitude: number; latitude: number },
  destination: { longitude: number; latitude: number }
): Promise<RouteInfo | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  // overview=full + geometries=geojson : on demande le tracé complet du trajet, pas juste les chiffres
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${token}&overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];

    return {
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMinutes: Math.round(route.duration / 60),
      geometry: route.geometry ?? null,
    };
  } catch (err) {
    console.error("Erreur calcul itinéraire Mapbox :", err);
    return null;
  }
}

/**
 * Reverse geocoding : convertit des coordonnées GPS (clic sur la carte)
 * en une adresse lisible. C'est l'inverse de l'autocomplétion.
 */
export async function reverseGeocode(longitude: number, latitude: number): Promise<string | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&language=fr&types=address,poi&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    return null;
  } catch (err) {
    console.error("Erreur reverse geocoding Mapbox :", err);
    return null;
  }
}