import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, serviceType, message } = body;

    // 1. VÉRIFICATION DES CHAMPS OBLIGATOIRES
    if (!name || !phone || !email || !message) {
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

    // 4. PROTECTION CONTRE LES MESSAGES TROP LONGS (ANTI-ABUS)
    if (message.length > 3000) {
      return NextResponse.json(
        { error: "Le message ne peut pas dépasser 3 000 caractères." },
        { status: 400 }
      );
    }

    // 5. PRÉPARATION DE L'ENVOI (Exemple console avant branchement Resend / Nodemailer)
    console.log("--- NOUVELLE DEMANDE DE CONTACT VALIDÉE ---");
    console.log({
      nom: name.trim(),
      telephone: phone.trim(),
      email: email.trim().toLowerCase(),
      prestation: serviceType || "Non spécifié",
      message: message.trim(),
      date: new Date().toISOString(),
    });

    // TODO: Connecter ici le service d'envoi d'e-mail (Resend / Nodemailer)

    return NextResponse.json(
      { message: "Demande transmise avec succès." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur API Contact :", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de l'envoi." },
      { status: 500 }
    );
  }
}