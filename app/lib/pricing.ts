export type TripType = "simple" | "aller_retour";

function calculateBasePrice(distanceKm: number): number {
  if (distanceKm <= 7) return 10;
  if (distanceKm <= 10) return 15;
  if (distanceKm <= 20) return distanceKm * 1.4;
  if (distanceKm <= 50) return distanceKm * 1.3;
  if (distanceKm <= 100) return distanceKm * 1.1;
  return distanceKm * 1;
}

/**
 * Calcule le prix final d'une course. Utilisée à la fois pour l'affichage
 * côté client (récapitulatif) et pour le recalcul côté serveur avant paiement —
 * les deux DOIVENT rester strictement identiques.
 */
export function calculatePrice(distanceKm: number, tripType: TripType): number {
  const base = calculateBasePrice(distanceKm);
  const total = tripType === "aller_retour" ? base * 1.5 : base;
  return Math.round(total * 100) / 100; // arrondi à 2 décimales (centimes)
}