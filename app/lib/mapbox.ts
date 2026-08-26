export type RouteInfo = {
  distanceKm: number;
  durationMinutes: number;
};

/**
 * Calcule la distance (km) et la durée (min) entre deux points
 * via l'API Directions de Mapbox (profil "driving").
 */
export async function getRouteInfo(
  origin: { longitude: number; latitude: number },
  destination: { longitude: number; latitude: number }
): Promise<RouteInfo | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${token}&overview=false`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];

    return {
      distanceKm: Math.round((route.distance / 1000) * 10) / 10, // mètres -> km, arrondi à 1 décimale
      durationMinutes: Math.round(route.duration / 60), // secondes -> minutes
    };
  } catch (err) {
    console.error("Erreur calcul itinéraire Mapbox :", err);
    return null;
  }
}