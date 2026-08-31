import { NextResponse } from "next/server";
import { stripe } from "../../lib/stripe";
import { calculatePrice } from "../../lib/pricing";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      departureAddress,
      arrivalAddress,
      date,
      time,
      passengers,
      luggage,
      babySeat,
      lastName,
      firstName,
      phone,
      email,
      tripType,
      distanceKm,
      durationMinutes,
    } = body;

    // 1. CHAMPS OBLIGATOIRES
    if (!departureAddress || !arrivalAddress || !date || !time || !lastName || !firstName || !phone || !email) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    // 2. DISTANCE VALIDE (nécessaire pour calculer un prix)
    if (typeof distanceKm !== "number" || distanceKm <= 0) {
      return NextResponse.json(
        { error: "Distance de trajet invalide. Merci de sélectionner des adresses valides." },
        { status: 400 }
      );
    }

    // 3. FORMAT EMAIL
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Format d'adresse e-mail invalide." }, { status: 400 });
    }

    // 4. TÉLÉPHONE (10 CHIFFRES)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json(
        { error: "Le numéro de téléphone doit comporter exactement 10 chiffres." },
        { status: 400 }
      );
    }

    // 5. DATE/HEURE DANS LE FUTUR
    const requestedDateTime = new Date(`${date}T${time}`);
    if (requestedDateTime.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "La date et l'heure de prise en charge doivent être dans le futur." },
        { status: 400 }
      );
    }

    const normalizedTripType = tripType === "aller_retour" ? "aller_retour" : "simple";

    // 6. RECALCUL DU PRIX CÔTÉ SERVEUR — on ne fait jamais confiance à un prix envoyé par le client
    const price = calculatePrice(distanceKm, normalizedTripType);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email.trim().toLowerCase(),
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Course VTC — ${departureAddress} → ${arrivalAddress}`,
              description: `${normalizedTripType === "aller_retour" ? "Aller-retour" : "Aller simple"} · ${distanceKm} km · Le ${date} à ${time}`,
            },
            unit_amount: Math.round(price * 100), // Stripe attend un montant en centimes
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/reservation/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/reservation`,
      // Les métadonnées voyagent avec la session Stripe et sont récupérées dans le webhook
      // une fois le paiement confirmé — c'est ce qui permet d'envoyer les emails/SMS ensuite.
      metadata: {
        departureAddress,
        arrivalAddress,
        date,
        time,
        passengers: String(passengers ?? "1"),
        luggage: String(luggage ?? "1"),
        babySeat: String(Boolean(babySeat)),
        lastName,
        firstName,
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        tripType: normalizedTripType,
        distanceKm: String(distanceKm),
        durationMinutes: String(durationMinutes ?? ""),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur création session Stripe :", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du paiement." },
      { status: 500 }
    );
  }
}