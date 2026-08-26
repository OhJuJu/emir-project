import { NextResponse } from "next/server";

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
    } = body;

    // 1. VÉRIFICATION DES CHAMPS OBLIGATOIRES
    if (!departureAddress || !arrivalAddress || !date || !time || !lastName || !firstName || !phone || !email) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    // 2. VÉRIFICATION DU FORMAT EMAIL (SERVEUR)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Format d'adresse e-mail invalide." },
        { status: 400 }
      );
    }

    // 3. VÉRIFICATION DU TÉLÉPHONE (10 CHIFFRES UNIQUEMENT)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json(
        { error: "Le numéro de téléphone doit comporter exactement 10 chiffres." },
        { status: 400 }
      );
    }

    // 4. VÉRIFICATION QUE LA DATE N'EST PAS DANS LE PASSÉ
    const requestedDateTime = new Date(`${date}T${time}`);
    if (requestedDateTime.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "La date et l'heure de prise en charge doivent être dans le futur." },
        { status: 400 }
      );
    }

    // 5. PRÉPARATION DE L'ENVOI (à connecter à Resend / Twilio ensuite)
    const reservation = {
      tripType: tripType || "simple",
      departureAddress: departureAddress.trim(),
      arrivalAddress: arrivalAddress.trim(),
      date,
      time,
      passengers: passengers || "1",
      luggage: luggage || "1",
      babySeat: Boolean(babySeat),
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    console.log("--- NOUVELLE DEMANDE DE RÉSERVATION VALIDÉE ---");
    console.log(reservation);

    // TODO: Enregistrer la réservation en base de données
    // TODO: Envoyer l'email de confirmation au client (Resend)
    // TODO: Envoyer le SMS/email de notification au chauffeur (Twilio / OVH SMS)

    return NextResponse.json(
      { message: "Réservation transmise avec succès." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur API Réservation :", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de la réservation." },
      { status: 500 }
    );
  }
}