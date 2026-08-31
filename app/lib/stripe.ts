import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY manquante dans les variables d'environnement.");
}

// Ce fichier ne doit JAMAIS être importé depuis un composant "use client" :
// la clé secrète ne doit exister que côté serveur.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);