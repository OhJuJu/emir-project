"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import AddressAutocomplete, { AddressSelection } from "../components/AddressAutocomplete";
import MapView from "../components/MapView";
import { getRouteInfo, reverseGeocode, RouteInfo } from "../lib/mapbox";
import { calculatePrice } from "../lib/pricing";

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

  const [departureCoords, setDepartureCoords] = useState<AddressSelection | null>(null);
  const [arrivalCoords, setArrivalCoords] = useState<AddressSelection | null>(null);

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const [pinMode, setPinMode] = useState<"departure" | "arrival" | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

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

  // Prix affiché à l'utilisateur — calculé avec la MÊME formule que celle utilisée
  // côté serveur juste avant le paiement (fichier lib/pricing.ts), pour garantir
  // que le prix annoncé et le prix facturé sont toujours identiques.
  const prixEstime = routeInfo ? calculatePrice(routeInfo.distanceKm, tripType) : null;

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

  const handleDepartureTextChange = (text: string) => {
    setValue("departureAddress", text);
    setDepartureCoords(null);
  };

  const handleArrivalTextChange = (text: string) => {
    setValue("arrivalAddress", text);
    setArrivalCoords(null);
  };

  const handleMapClick = async (coords: { longitude: number; latitude: number }) => {
    if (!pinMode) return;

    setIsReverseGeocoding(true);
    const address = await reverseGeocode(coords.longitude, coords.latitude);
    setIsReverseGeocoding(false);

    const placeName = address ?? `Position (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`;

    if (pinMode === "departure") {
      setValue("departureAddress", placeName, { shouldValidate: true });
      setDepartureCoords({ placeName, ...coords });
    } else {
      setValue("arrivalAddress", placeName, { shouldValidate: true });
      setArrivalCoords({ placeName, ...coords });
    }

    setPinMode(null);
  };

  const onSubmit = async (data: ReservationFormData) => {
    if (!routeInfo) {
      setSubmitStatus("error");
      setServerMessage("Merci de sélectionner une adresse de départ et d'arrivée valides avant de continuer.");
      return;
    }

    setSubmitStatus("loading");
    setServerMessage(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tripType,
          distanceKm: routeInfo.distanceKm,
          durationMinutes: routeInfo.durationMinutes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue.");
      }

      // Redirection vers la page de paiement Stripe
      window.location.href = result.url;
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

            {/* ÉTAPE 1 : ADRESSES */}
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

              <div className="space-y-2 pt-1">
                <p className="text-[11px] uppercase tracking-wide font-bold text-noir/60">
                  Ou pointez directement sur la carte :
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPinMode(pinMode === "departure" ? null : "departure")}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      pinMode === "departure"
                        ? "bg-rouge-fonce text-blanc border-rouge-fonce shadow-md"
                        : "bg-[#dfd4c5] text-noir/70 border-noir/15 hover:text-noir"
                    }`}
                  >
                    {pinMode === "departure" ? "Cliquez sur la carte..." : "Je pointe le départ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPinMode(pinMode === "arrival" ? null : "arrival")}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      pinMode === "arrival"
                        ? "bg-rouge-fonce text-blanc border-rouge-fonce shadow-md"
                        : "bg-[#dfd4c5] text-noir/70 border-noir/15 hover:text-noir"
                    }`}
                  >
                    {pinMode === "arrival" ? "Cliquez sur la carte..." : "Je pointe l'arrivée"}
                  </button>
                </div>
                {isReverseGeocoding && (
                  <p className="text-[11px] text-noir/60 italic">Récupération de l&apos;adresse...</p>
                )}
              </div>

              <MapView
                departure={departureCoords}
                arrival={arrivalCoords}
                routeGeometry={routeInfo?.geometry ?? null}
                pinMode={pinMode}
                onMapClick={handleMapClick}
              />
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
              <span className="text-xs uppercase tracking-widest text-sable font-semibold">Tarif Garanti</span>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-blanc">
                {isCalculatingRoute ? "..." : prixEstime !== null ? `${prixEstime.toFixed(2)} €` : "-- €"}
              </div>
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
              {submitStatus === "loading" ? "Redirection vers le paiement..." : "Procéder au paiement sécurisé"}
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
