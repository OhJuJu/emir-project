"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import AddressAutocomplete, { AddressSelection } from "../components/AddressAutocomplete";
import { getRouteInfo, RouteInfo } from "../lib/mapbox";

type ReservationFormData = {
  departureAddress: string;
  arrivalAddress: string;
  date: string;
  time: string;
  passengers: string;
  luggage: string;
  babySeat: boolean;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
};

export default function ReservationPage() {
  const [tripType, setTripType] = useState<"simple" | "aller_retour">("simple");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  // Coordonnées GPS des deux adresses sélectionnées (null tant que non choisies dans la liste)
  const [departureCoords, setDepartureCoords] = useState<AddressSelection | null>(null);
  const [arrivalCoords, setArrivalCoords] = useState<AddressSelection | null>(null);

  // Résultat du calcul d'itinéraire
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    defaultValues: {
      departureAddress: "",
      arrivalAddress: "",
      date: "",
      time: "",
      passengers: "1",
      luggage: "1",
      babySeat: false,
      lastName: "",
      firstName: "",
      phone: "",
      email: "",
    },
    mode: "onBlur",
  });

  const departureAddress = watch("departureAddress");
  const arrivalAddress = watch("arrivalAddress");

  const prixParKm = 2.5; // exemple
  const prixEstime = routeInfo ? routeInfo.distanceKm * prixParKm : null;

  // Dès que les DEUX adresses ont des coordonnées valides, on calcule l'itinéraire
  useEffect(() => {
    if (!departureCoords || !arrivalCoords) {
      setRouteInfo(null);
      return;
    }

    let isCancelled = false;

    const calculateRoute = async () => {
      setIsCalculatingRoute(true);
      const result = await getRouteInfo(departureCoords, arrivalCoords);
      if (!isCancelled) {
        setRouteInfo(result);
        setIsCalculatingRoute(false);
      }
    };

    calculateRoute();

    return () => {
      isCancelled = true;
    };
  }, [departureCoords, arrivalCoords]);

  // Si l'utilisateur modifie le texte après avoir sélectionné une adresse,
  // on invalide les coordonnées pour forcer une nouvelle sélection propre
  const handleDepartureTextChange = (text: string) => {
    setValue("departureAddress", text);
    setDepartureCoords(null);
  };

  const handleArrivalTextChange = (text: string) => {
    setValue("arrivalAddress", text);
    setArrivalCoords(null);
  };

  const onSubmit = async (data: ReservationFormData) => {
    setSubmitStatus("loading");
    setServerMessage(null);

    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tripType,
          distanceKm: routeInfo?.distanceKm ?? null,
          durationMinutes: routeInfo?.durationMinutes ?? null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue.");
      }

      setSubmitStatus("success");
      setServerMessage("Votre demande de réservation a bien été envoyée ! Vous allez recevoir une confirmation par e-mail et SMS.");
      reset();
      setDepartureCoords(null);
      setArrivalCoords(null);
      setRouteInfo(null);
    } catch (error) {
      setSubmitStatus("error");
      setServerMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* 1. HEADER DE LA PAGE RÉSERVATION */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 text-center text-blanc overflow-hidden">
        <Image
          src="/images/hero-bg.jpg"
          alt="Réservation chauffeur privé Emir Transport"
          fill
          priority
          className="object-cover object-center -z-20 brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/85 via-noir/30 to-noir/90 -z-10" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-sable bg-noir/50 border border-sable/30 px-4 py-1.5 rounded-full backdrop-blur-sm shadow-md">
            Réservation Immédiate & Tarif Garanti
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif tracking-wide uppercase text-blanc drop-shadow-md">
            Réserver une Course
          </h1>

          <p className="text-sm sm:text-base text-sable/90 font-light leading-relaxed">
            Calculez votre itinéraire, obtenez un tarif fixe en toute transparence et réservez votre berline avec chauffeur privé.
          </p>
        </div>
      </section>

      {/* 2. SECTION DU MODULE DE RÉSERVATION */}
      <section className="bg-gris py-12 sm:py-20 px-4 sm:px-6 text-blanc">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* COLONNE GAUCHE (2/3) : LE FORMULAIRE DE SAISIE */}
          <div className="lg:col-span-2 bg-sable text-noir rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">

            {/* SÉLECTION TYPE DE TRAJET */}
            <div className="flex items-center gap-3 p-1.5 bg-[#dfd4c5] rounded-xl max-w-sm">
              <button
                type="button"
                onClick={() => setTripType("simple")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  tripType === "simple"
                    ? "bg-rouge-fonce text-blanc shadow-md"
                    : "text-noir/70 hover:text-noir"
                }`}
              >
                Aller simple
              </button>
              <button
                type="button"
                onClick={() => setTripType("aller_retour")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  tripType === "aller_retour"
                    ? "bg-rouge-fonce text-blanc shadow-md"
                    : "text-noir/70 hover:text-noir"
                }`}
              >
                Aller - Retour
              </button>
            </div>

            {/* ÉTAPE 1 : ADRESSES (avec autocomplétion Mapbox) */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-rouge-fonce flex items-center gap-2 border-b border-noir/15 pb-2">
                <span>📍</span> 1. Itinéraire
              </h2>

              <div className="space-y-3">
                <AddressAutocomplete
                  label="Adresse de départ (Prise en charge)"
                  placeholder="Ex : 1 Place du Martroi, 45000 Orléans"
                  value={departureAddress}
                  onChange={handleDepartureTextChange}
                  onSelect={(selection) => {
                    setValue("departureAddress", selection.placeName, { shouldValidate: true });
                    setDepartureCoords(selection);
                  }}
                  error={errors.departureAddress?.message}
                />
                {/* Champ caché pour que react-hook-form valide bien le champ requis */}
                <input type="hidden" {...register("departureAddress", { required: "L'adresse de départ est obligatoire." })} />

                <AddressAutocomplete
                  label="Adresse d'arrivée (Destination)"
                  placeholder="Ex : Aéroport Paris-Orly, Gare des Aubrais..."
                  value={arrivalAddress}
                  onChange={handleArrivalTextChange}
                  onSelect={(selection) => {
                    setValue("arrivalAddress", selection.placeName, { shouldValidate: true });
                    setArrivalCoords(selection);
                  }}
                  error={errors.arrivalAddress?.message}
                />
                <input type="hidden" {...register("arrivalAddress", { required: "L'adresse d'arrivée est obligatoire." })} />
              </div>
            </div>

            {/* ÉTAPE 2 : DATE & HEURE */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-rouge-fonce flex items-center gap-2 border-b border-noir/15 pb-2">
                <span>🕒</span> 2. Date & Horaire
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Date de départ</label>
                  <input
                    type="date"
                    className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir focus:outline-none focus:ring-1 focus:ring-noir"
                    {...register("date", { required: "La date est obligatoire." })}
                  />
                  {errors.date && <p className="text-xs text-rouge-fonce mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Heure de prise en charge</label>
                  <input
                    type="time"
                    className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir focus:outline-none focus:ring-1 focus:ring-noir"
                    {...register("time", { required: "L'heure est obligatoire." })}
                  />
                  {errors.time && <p className="text-xs text-rouge-fonce mt-1">{errors.time.message}</p>}
                </div>
              </div>
            </div>

            {/* ÉTAPE 3 : PASSAGERS & OPTIONS */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-rouge-fonce flex items-center gap-2 border-b border-noir/15 pb-2">
                <span>👥</span> 3. Passagers & Bagages
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Nombre de passagers</label>
                  <select
                    className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir focus:outline-none focus:ring-1 focus:ring-noir"
                    {...register("passengers")}
                  >
                    <option value="1">1 passager</option>
                    <option value="2">2 passagers</option>
                    <option value="3">3 passagers</option>
                    <option value="4">4 passagers (Max)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Nombre de bagages</label>
                  <select
                    className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir focus:outline-none focus:ring-1 focus:ring-noir"
                    {...register("luggage")}
                  >
                    <option value="1">1 bagage en coffre</option>
                    <option value="2">2 bagages en coffre</option>
                    <option value="3">3 bagages en coffre</option>
                    <option value="4">4 bagages en coffre (Max)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-rouge-fonce rounded border-noir/30 focus:ring-rouge-fonce"
                    {...register("babySeat")}
                  />
                  <span className="text-xs sm:text-sm font-medium text-noir/90">
                    Besoin d&apos;un siège enfant / bébé homologué (Inclus gratuitement)
                  </span>
                </label>
              </div>
            </div>

            {/* ÉTAPE 4 : COORDONNÉES */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-rouge-fonce flex items-center gap-2 border-b border-noir/15 pb-2">
                <span>👤</span> 4. Vos Coordonnées
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Nom</label>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir placeholder:text-noir/40 focus:outline-none focus:ring-1 focus:ring-noir"
                    {...register("lastName", { required: "Votre nom est obligatoire." })}
                  />
                  {errors.lastName && <p className="text-xs text-rouge-fonce mt-1">{errors.lastName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Prénom</label>
                  <input
                    type="text"
                    placeholder="Votre prénom"
                    className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir placeholder:text-noir/40 focus:outline-none focus:ring-1 focus:ring-noir"
                    {...register("firstName", { required: "Votre prénom est obligatoire." })}
                  />
                  {errors.firstName && <p className="text-xs text-rouge-fonce mt-1">{errors.firstName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Email</label>
                  <input
                    type="email"
                    placeholder="votre.email@exemple.com"
                    className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir placeholder:text-noir/40 focus:outline-none focus:ring-1 focus:ring-noir"
                    {...register("email", {
                      required: "L'email est obligatoire.",
                      pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Format d'email invalide." },
                    })}
                  />
                  {errors.email && <p className="text-xs text-rouge-fonce mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-noir/80">Téléphone (10 chiffres)</label>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      required: "Le téléphone est obligatoire.",
                      pattern: { value: /^[0-9]{10}$/, message: "Le numéro doit contenir 10 chiffres." },
                    }}
                    render={({ field }) => (
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="0612345678"
                        className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir placeholder:text-noir/40 focus:outline-none focus:ring-1 focus:ring-noir"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.phone && <p className="text-xs text-rouge-fonce mt-1">{errors.phone.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE (1/3) : RÉCAPITULATIF & TARIF */}
          <div className="bg-[#4a4a4a] border border-blanc/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl sticky top-24">
            <h2 className="text-xl font-bold uppercase tracking-wider text-blanc border-b border-blanc/10 pb-3">
              Récapitulatif
            </h2>

            <div className="space-y-3 text-sm text-blanc/90">
              <div className="flex justify-between py-1 border-b border-blanc/10 text-xs">
                <span className="text-sable font-bold uppercase">Prestation :</span>
                <span>Berline Mercedes VTC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blanc/10 text-xs">
                <span className="text-sable font-bold uppercase">Distance estimée :</span>
                <span className="font-semibold">
                  {isCalculatingRoute ? "..." : routeInfo ? `${routeInfo.distanceKm} km` : "-- km"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-blanc/10 text-xs">
                <span className="text-sable font-bold uppercase">Durée estimée :</span>
                <span className="font-semibold">
                  {isCalculatingRoute ? "..." : routeInfo ? `${routeInfo.durationMinutes} min` : "-- min"}
                </span>
              </div>
            </div>

            <div className="bg-rouge-fonce/80 border border-rouge-clair/40 rounded-xl p-5 text-center space-y-1">
              <span className="text-m uppercase tracking-widest text-sable font-semibold">Tarif : </span>
              <span className="text-s uppercase tracking-widest text-sable font-bold">
                  {isCalculatingRoute ? "..." : routeInfo ? ` ${prixEstime?.toFixed(2)} €` : "-- €"}
                </span>
              <p className="text-[11px] text-blanc/70">TTC • Sans frais cachés ni supplément bouchons</p>
            </div>

            {serverMessage && (
              <p
                className={`text-xs text-center rounded-lg p-3 ${
                  submitStatus === "success"
                    ? "bg-green-800/40 text-green-200 border border-green-500/30"
                    : "bg-red-800/40 text-red-200 border border-red-500/30"
                }`}
              >
                {serverMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={submitStatus === "loading"}
              className="w-full bg-rouge-fonce hover:bg-rouge-clair text-blanc font-serif uppercase tracking-wider py-4 rounded-xl text-sm font-semibold transition-all shadow-xl border border-rouge-clair/40 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitStatus === "loading" ? "Envoi en cours..." : "Procéder au paiement sécurisé"}
            </button>
          </div>
        </form>
      </section>

      {/* 3. SECTION LES 3 ÉTAPES */}
      <section className="bg-rouge-fonce py-16 px-4 sm:px-6 text-blanc border-t border-blanc/10">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-blanc">
              Comment se déroule votre réservation ?
            </h2>
            <p className="text-sable text-xs sm:text-sm font-light">
              Un parcours simple, transparent et sans mauvaise surprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-sable text-noir rounded-xl p-6 space-y-3 shadow-lg">
              <div className="w-10 h-10 mx-auto rounded-full bg-rouge-fonce text-sable font-bold flex items-center justify-center font-serif text-lg">1</div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-rouge-fonce">Estimation & Réservation</h3>
              <p className="text-xs text-noir/80 leading-relaxed font-medium">
                Indiquez vos adresses et découvrez instantanément votre tarif fixe sans engagement.
              </p>
            </div>

            <div className="bg-sable text-noir rounded-xl p-6 space-y-3 shadow-lg">
              <div className="w-10 h-10 mx-auto rounded-full bg-rouge-fonce text-sable font-bold flex items-center justify-center font-serif text-lg">2</div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-rouge-fonce">Confirmation Immédiate</h3>
              <p className="text-xs text-noir/80 leading-relaxed font-medium">
                Vous recevez instantanément votre confirmation par e-mail et SMS avec la facture.
              </p>
            </div>

            <div className="bg-sable text-noir rounded-xl p-6 space-y-3 shadow-lg">
              <div className="w-10 h-10 mx-auto rounded-full bg-rouge-fonce text-sable font-bold flex items-center justify-center font-serif text-lg">3</div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-rouge-fonce">Prise en charge à l&apos;heure</h3>
              <p className="text-xs text-noir/80 leading-relaxed font-medium">
                Votre chauffeur vous attend à l&apos;adresse exacte et s&apos;occupe de vos bagages.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
