"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ContactPage() {
  // États des données du formulaire
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceType: "transfert",
    message: "",
  });

  // États de validation locale et statut d'envoi
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const faqs = [
    {
      q: "Comment fonctionne le calcul du tarif ?",
      a: "Le tarif est calculé précisément au kilomètre lors de votre réservation en ligne. Le prix annoncé est fixe et garanti sans surprise.",
    },
    {
      q: "Que se passe-t-il en cas de retard de vol ou de train ?",
      a: "Nous suivons en direct l'état des liaisons ferroviaires et aériennes. Votre chauffeur adapte son heure de prise en charge sans frais d'attente supplémentaires.",
    },
    {
      q: "Quels sont les moyens de paiement acceptés ?",
      a: "Paiement sécurisé en ligne par carte bancaire (Stripe) lors de la réservation, ou directement à bord (CB, sans contact, espèces).",
    },
    {
      q: "Proposez-vous des sièges bébé / enfants ?",
      a: "Oui, un siège enfant ou rehausseur homologué est mis à disposition gratuitement sur simple précision dans votre message ou réservation.",
    },
  ];

  // Gestion du téléphone : uniquement des chiffres (max 10)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: onlyDigits }));
        
    if (onlyDigits.length === 10) {
      setPhoneError("");
    }
  };

  // Validation format email
  const validateEmail = (val: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(val);
  };

  const handleEmailBlur = () => {
    if (formData.email && !validateEmail(formData.email)) {
      setEmailError("Veuillez renseigner une adresse e-mail valide.");
    } else {
      setEmailError("");
    }
  };

  // Soumission vers la route API backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerMessage(null);

    // Contrôles préliminaires côté client
    if (!validateEmail(formData.email)) {
      setEmailError("Veuillez renseigner une adresse e-mail valide.");
      return;
    }

    // On nettoie : on retire espaces, tirets, points, parenthèses
    const cleanPhone = formData.phone.replace(/[\s.\-_()]/g, "");

    // On vérifie que c'est un numéro valide (français 10 chiffres OU international avec +33 / 0033)
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9][0-9]{8}$/;

    if (!phoneRegex.test(cleanPhone)) {
      setPhoneError("Veuillez renseigner un numéro de téléphone valide.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      // Succès : réinitialisation du formulaire
      setServerMessage({
        type: "success",
        text: "Votre message a été transmis avec succès. Nous vous recontacterons dans les plus brefs délais.",
      });
      setFormData({
        name: "",
        phone: "",
        email: "",
        serviceType: "transfert",
        message: "",
      });
    } catch (err: unknown) {
      setServerMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erreur lors de l'envoi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HEADER CONTACT AVEC IMAGE DE FOND */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 text-center text-blanc overflow-hidden">
        
        {/* Image de fond Next.js */}
        <Image
          src="/images/contact-bg.jpg" // Place ton image dans public/images/contact-bg.jpg
          alt="Contact Emir Transport Orléans"
          fill
          priority
          className="object-cover object-center -z-20 brightness-75"
        />

        {/* Voile dégradé Bordeaux & Sombre pour garantir le contraste */}
        <div className="absolute inset-0  bg-gradient-to-b from-noir/70 via-noir/50 to-noir/80  -z-10" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-sable bg-noir/50 border border-sable/30 px-4 py-1.5 rounded-full backdrop-blur-sm shadow-md">
            Service Clientèle & Devis
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif tracking-wide uppercase text-blanc drop-shadow-md">
            Contactez Emir Transport
          </h1>

          <p className="text-sm sm:text-base text-sable/90 max-w-2xl mx-auto font-light leading-relaxed drop-shadow">
            Une question, une demande de devis sur-mesure ou une urgence de déplacement ? <br /> Nous vous répondons le plus rapidement possible.
          </p>

          {/* Boutons d'action rapide */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <a
              href="tel:+33600000000"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sable hover:bg-blanc text-noir font-serif font-bold uppercase tracking-wider text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>📞</span>
              <span>06 XX XX XX XX</span>
            </a>

            <a
              href="https://wa.me/33600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-noir/70 hover:bg-rouge-clair text-sable hover:text-blanc font-serif font-semibold uppercase tracking-wider text-xs sm:text-sm px-6 py-3.5 rounded-xl border border-sable/40 shadow-lg transition-all duration-200 backdrop-blur-sm active:scale-95 cursor-pointer"
            >
              <span>💬</span>
              <span>Écrire sur WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. SECTION FORMULAIRE & COORDONNÉES (Fond Gris #585858) */}
      <section className="bg-gris py-16 sm:py-20 px-4 sm:px-6 text-blanc">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* CARTE COORDONNÉES */}
          <div className="bg-sable text-noir rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-rouge-fonce border-b border-noir/15 pb-3">
              Coordonnées
            </h2>

            <div className="space-y-4 text-sm text-noir/80 font-medium">
              <div>
                <span className="block text-xs font-bold uppercase text-noir mb-0.5">Secteur principal</span>
                <p>Orléans, agglomération et région Centre-Val de Loire</p>
              </div>

              <div>
                <span className="block text-xs font-bold uppercase text-noir mb-0.5">Liaisons fréquentes</span>
                <p>Gares d&apos;Orléans & Fleury-les-Aubrais, Aéroports parisiens (Orly, Roissy CDG, Beauvais)</p>
              </div>

              <div>
                <span className="block text-xs font-bold uppercase text-noir mb-0.5">Disponibilité</span>
                <p>7 jours sur 7 / 24 heures sur 24 (sur réservation)</p>
              </div>
            </div>

            <div className="pt-4 border-t border-noir/15">
              <Link
                href="/reservation"
                className="block text-center bg-rouge-fonce hover:bg-rouge-clair text-blanc py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
              >
                Module de Réservation en ligne →
              </Link>
            </div>
          </div>

          {/* FORMULAIRE SÉCURISÉ */}
          <div className="lg:col-span-2 bg-sable rounded-2xl p-6 sm:p-10 shadow-2xl text-noir">
            <h2 className="text-2xl font-extrabold uppercase tracking-wider text-rouge-fonce mb-6">
              Envoyer un message ou demander un devis
            </h2>

            {/* Notification retour serveur */}
            {serverMessage && (
              <div
                className={`mb-6 p-4 rounded-lg text-sm font-medium ${
                  serverMessage.type === "success"
                    ? "bg-green-100 text-green-900 border border-green-300"
                    : "bg-red-100 text-red-900 border border-red-300"
                }`}
              >
                {serverMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Nom & Prénom</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Votre nom complet"
                    className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir placeholder:text-noir/40 focus:outline-none focus:ring-1 focus:ring-noir"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Téléphone</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    placeholder="0612345678"
                    className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir placeholder:text-noir/40 focus:outline-none focus:ring-1 focus:ring-noir"
                  />
                  {phoneError ? (
                    <p className="text-red-700 text-xs mt-1 font-semibold">{phoneError}</p>
                  ) : (
                    <p className="text-noir/50 text-[11px] mt-1">10 chiffres sans espaces</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (emailError) setEmailError("");
                    }}
                    onBlur={handleEmailBlur}
                    placeholder="votre.email@exemple.com"
                    className={`w-full bg-[#dfd4c5] border rounded-md p-3 text-sm text-noir placeholder:text-noir/40 focus:outline-none focus:ring-1 ${
                      emailError ? "border-red-600 focus:ring-red-600" : "border-noir/20 focus:ring-noir"
                    }`}
                  />
                  {emailError && (
                    <p className="text-red-700 text-xs mt-1 font-semibold">{emailError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Type de prestation</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir focus:outline-none focus:ring-1 focus:ring-noir"
                  >
                    <option value="transfert">Transfert Gare / Aéroport</option>
                    <option value="pro">Trajet Professionnel / Affaires</option>
                    <option value="evenement">Mariage / Événement privé</option>
                    <option value="longue_distance">Trajet Longue Distance</option>
                    <option value="autre">Autre demande</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Votre Message / Détails de la demande</label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Indiquez vos dates, adresses de prise en charge et nombre de personnes..."
                  className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir placeholder:text-noir/40 focus:outline-none focus:ring-1 focus:ring-noir resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-rouge-fonce hover:bg-rouge-clair text-blanc font-serif uppercase tracking-wider px-8 py-3 rounded-full text-xs md:text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer border border-rouge-clair/40 ${
                    isLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer ma demande"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* 3. SECTION FAQ (Fond Bordeaux #620D14) */}
      <section className="bg-rouge-fonce py-16 px-4 sm:px-6 text-blanc border-t border-blanc/10">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-blanc">
              Questions Fréquentes
            </h2>
            <p className="text-sable text-xs sm:text-sm font-light">
              Les réponses à vos questions courantes avant votre déplacement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="bg-sable text-noir rounded-xl p-6 space-y-2 shadow-lg"
              >
                <h3 className="font-bold text-sm text-rouge-fonce uppercase tracking-wide">
                  {item.q}
                </h3>
                <p className="text-xs sm:text-sm text-noir/80 font-medium leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
