import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "../../../lib/stripe";

export async function POST(request: Request) {
  // On lit le corps brut (pas de JSON.parse) : Stripe a besoin de l'octet exact
  // envoyé pour vérifier la signature cryptographique.
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    // Si la signature ne correspond pas, la requête ne vient probablement pas de Stripe
    console.error("Signature Stripe invalide :", err);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reservation = session.metadata;

    console.log("--- PAIEMENT CONFIRMÉ — RÉSERVATION À TRAITER ---");
    console.log(reservation);

    // TODO: Enregistrer la réservation en base de données
    // TODO: Envoyer l'email de confirmation au client (Resend) -> reservation?.email
    // TODO: Envoyer le SMS/email de notification au chauffeur (Twilio / OVH SMS)
  }

  // Stripe attend un 200 rapide, sinon il considère l'envoi en échec et réessaie
  return NextResponse.json({ received: true });
}