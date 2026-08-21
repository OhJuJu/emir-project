"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  // États du formulaire synchronisés avec la page Contact
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceType: "transfert",
    message: "",
  });

  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  // Soumission vers la route API backend (/api/contact)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerMessage(null);

    if (!validateEmail(formData.email)) {
      setEmailError("Veuillez renseigner une adresse e-mail valide.");
      return;
    }

    const cleanPhone = formData.phone.replace(/[\s.\-_()]/g, "");
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

      setServerMessage({
        type: "success",
        text: "Votre message a été transmis avec succès. Nous vous recontacterons très rapidement.",
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
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        
        <Image
          src="/images/accueil-bg.jpg" // Place ton image dans public/images/accueil-bg.jpg
          alt="Chauffeur privé VTC Emir Transport Orléans"
          fill
          priority
          className="object-cover object-center -z-20 brightness-[0.70]"
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-noir/50 to-noir/80 -z-10" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <span className="inline-block text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-sable bg-noir/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-sable/30">
            Service VTC d&apos;Excellence
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-wide text-blanc uppercase drop-shadow-lg">
            Emir Transport
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-sable font-light max-w-2xl mx-auto leading-relaxed drop-shadow">
            Votre chauffeur privé à Orléans et en région Centre. Transferts gares, aéroports parisiens et trajets sur-mesure en toute sérénité.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/reservation"
              className="w-full sm:w-auto bg-rouge-fonce hover:bg-rouge-clair text-blanc font-serif tracking-wider uppercase px-8 py-3.5 rounded-lg text-sm md:text-base transition-all duration-200 shadow-xl border border-rouge-clair/40 active:scale-95"
            >
              Réserver une course
            </Link>
            <Link
              href="/vehicule"
              className="w-full sm:w-auto bg-noir/50 hover:bg-noir/80 text-sable hover:text-blanc font-serif tracking-wider uppercase px-7 py-3.5 rounded-lg text-sm md:text-base transition-all duration-200 border border-sable/30 backdrop-blur-sm"
            >
              Découvrir le véhicule
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SECTION VTC ORLÉANAIS (Fond Gris #585858) */}
      <section className="bg-gris py-20 px-4 sm:px-6 text-blanc">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wider">
              VTC Orléanais
            </h2>
            <p className="text-sable text-sm font-light">
              Des prestations haut de gamme adaptées aux particuliers et professionnels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Box 1 : Capacité & Bagages */}
            <div className="bg-[#4a4a4a] rounded-xl p-8 border border-blanc/10 shadow-lg hover:border-sable/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-rouge-fonce/80 flex items-center justify-center text-sable font-serif font-bold mb-5 shadow-inner">
                  01
                </div>
                <h3 className="font-bold text-lg text-blanc uppercase tracking-wide mb-3">
                  Capacité & Bagages
                </h3>
                <p className="text-blanc/80 font-light text-sm mb-4 leading-relaxed">
                  Idéal pour vos départs en voyage, déplacements professionnels et trajets quotidiens :
                </p>
                <ul className="space-y-2 text-sm text-blanc/90">
                  <li className="flex items-center gap-2">
                    <span className="text-sable font-bold">✓</span> Jusqu&apos;à 3 passagers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sable font-bold">✓</span> 1 à 3 grands bagages en coffre
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sable font-bold">✓</span> Prise en charge personnalisée
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-blanc/10 text-xs text-sable font-medium">
                Berline spacieuse & entretenue
              </div>
            </div>

            {/* Box 2 : Confort & Équipements */}
            <div className="bg-[#4a4a4a] rounded-xl p-8 border border-blanc/10 shadow-lg hover:border-sable/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-rouge-fonce/80 flex items-center justify-center text-sable font-serif font-bold mb-5 shadow-inner">
                  02
                </div>
                <h3 className="font-bold text-lg text-blanc uppercase tracking-wide mb-3">
                  Confort à Bord
                </h3>
                <p className="text-blanc/80 font-light text-sm mb-4 leading-relaxed">
                  Des petites attentions incluses pour voyager dans les meilleures conditions :
                </p>
                <ul className="space-y-2 text-sm text-blanc/90">
                  <li className="flex items-center gap-2">
                    <span className="text-sable font-bold">✓</span> Climatisation & sièges confort
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sable font-bold">✓</span> Bouteilles d&apos;eau minérale offertes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sable font-bold">✓</span> Chargeurs de smartphone multimarques
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-blanc/10 text-xs text-sable font-medium">
                Ambiance soignée & discrète
              </div>
            </div>

            {/* Box 3 : Services & Tarification */}
            <div className="bg-[#4a4a4a] rounded-xl p-8 border border-blanc/10 shadow-lg hover:border-sable/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-rouge-fonce/80 flex items-center justify-center text-sable font-serif font-bold mb-5 shadow-inner">
                  03
                </div>
                <h3 className="font-bold text-lg text-blanc uppercase tracking-wide mb-3">
                  Services & Tarifs
                </h3>
                <p className="text-blanc/80 font-light text-sm mb-4 leading-relaxed">
                  Une totale transparence pour l&apos;ensemble de vos courses :
                </p>
                <ul className="space-y-2 text-sm text-blanc/90">
                  <li className="flex items-center gap-2">
                    <span className="text-sable font-bold">✓</span> Tarif fixe calculé au kilomètre
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sable font-bold">✓</span> Transferts Gares & Aéroports (Orly, CDG)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sable font-bold">✓</span> Paiement sécurisé en ligne ou à bord
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-blanc/10 text-xs text-sable font-medium">
                Disponible 7j/7 sur réservation
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SECTION CONTACT  */}
      <section id="contact" className="bg-rouge-fonce py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wider text-blanc">
              Contact
            </h2>
            <p className="text-sable text-sm font-light">
              Une demande particulière ou un devis événementiel ? Écrivez-nous.
            </p>
          </div>

          {/* Formulaire */}
          <div className="bg-sable rounded-2xl p-6 sm:p-10 shadow-2xl text-noir">
            
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
                <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Message</label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Détaillez votre demande..."
                  className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir placeholder:text-noir/40 focus:outline-none focus:ring-1 focus:ring-noir resize-none"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-rouge-fonce hover:bg-rouge-clair text-blanc font-serif uppercase tracking-wider px-8 py-3 rounded-full text-xs md:text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer border border-rouge-clair/40 ${
                    isLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer le message"}
                </button>
              </div>

            </form>
          </div>

        </div>
      </section>

    </div>
  );
}