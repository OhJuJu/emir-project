import Link from "next/link";
import Image from "next/image";

export default function VehiculePage() {
  const services = [
    {
      title: "Bouteilles d'eau",
      desc: "Eau minérale fraîche mise à disposition pour chaque trajet.",
      icon: "💧",
    },
    {
      title: "Recharge smartphone",
      desc: "Câbles multimarques disponibles (USB-C, Lightning, induction).",
      icon: "⚡",
    },
    {
      title: "Connexion Wi-Fi",
      desc: "Accès Internet haut débit à bord pour travailler ou vous divertir.",
      icon: "📶",
    },
    {
      title: "Climatisation régulée",
      desc: "Température ajustée sur-mesure selon vos préférences.",
      icon: "❄️",
    },
    {
      title: "Vitres teintées",
      desc: "Intimité totale et protection solaire pour un voyage discret.",
      icon: "🕶️",
    },
    {
      title: "Musique & Ambiance",
      desc: "Connexion Bluetooth pour écouter vos playlists favorites.",
      icon: "🎵",
    },
    {
      title: "Réhausseur pour enfants",
      desc: "Installé gratuitement et sur simple demande préalable.",
      icon: "👶",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO BANNER : LE VÉHICULE PROPOSÉ */}
      <section className="relative w-full min-h-[65vh] sm:min-h-[75vh] flex items-center justify-center text-center px-4 overflow-hidden">
        
        {/* Photo extérieure de la berline */}
        <Image
          src="/images/vehicule-hero.jpg" 
          alt="Berline Mercedes VTC Emir Transport Orléans"
          fill
          priority
          className="object-cover object-center -z-20 brightness-[0.70]"
        />

        {/* Voile sombre pour le contraste du titre */}
        <div className="absolute inset-0 bg-gradient-to-b from-noir/60 via-noir/40 to-noir/70 -z-10" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-wide uppercase text-blanc leading-tight drop-shadow-xl">
            Le Véhicule<br />Proposé
          </h1>
        </div>
      </section>

      {/* 2. SECTION VOTRE CONFORT (Fond Bordeaux #620D14) */}
      <section className="bg-rouge-fonce py-16 sm:py-24 px-4 sm:px-6 text-blanc">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-center text-blanc drop-shadow-md">
            Votre Confort
          </h2>

          {/* Rangée 1 : Image à gauche + Texte à droite */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            
            {/* Carte Image 1 */}
            <div className="bg-sable rounded-2xl p-3 min-h-[240px] md:min-h-[280px] relative overflow-hidden shadow-2xl flex items-center justify-center">
              <Image
                src="/images/confort-interieur.jpg" 
                alt="Intérieur cuir grand confort berline Emir Transport"
                fill
                className="object-cover rounded-xl p-2"
              />
              <span className="text-noir/30 font-bold uppercase tracking-wider text-xs">
                [ Photo Sellerie & Intérieur ]
              </span>
            </div>

            {/* Carte Texte 1 */}
            <div className="bg-sable text-noir rounded-2xl p-8 sm:p-10 flex flex-col justify-center shadow-2xl">
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-rouge-fonce mb-3 font-serif">
                Sellerie Cuir & Finitions Nobles
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-noir/80 font-medium">
                Installez-vous dans des sièges ergonomiques assurant un maintien parfait sur toutes les distances. L&apos;habitacle est nettoyé et désinfecté avec un soin rigoureux avant chaque prise en charge pour vous garantir une propreté irréprochable.
              </p>
            </div>

          </div>

          {/* Rangée 2 : Texte à gauche + Image à droite */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            
            {/* Carte Texte 2 */}
            <div className="bg-sable text-noir rounded-2xl p-8 sm:p-10 flex flex-col justify-center shadow-2xl order-2 md:order-1">
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-rouge-fonce mb-3 font-serif">
                Silence & Insonorisation
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-noir/80 font-medium">
                Profitez d&apos;une insonorisation acoustique optimale et de vitres surteintées. Que vous souhaitiez travailler sur votre ordinateur, passer vos appels professionnels en toute discrétion ou simplement vous détendre, voyagez dans une bulle de calme.
              </p>
            </div>

            {/* Carte Image 2 */}
            <div className="bg-sable rounded-2xl p-3 min-h-[240px] md:min-h-[280px] relative overflow-hidden shadow-2xl flex items-center justify-center order-1 md:order-2">
              <Image
                src="/images/confort-ambiance.jpg" 
                alt="Ambiance calme et connectée à bord"
                fill
                className="object-cover rounded-xl p-2"
              />
              <span className="text-noir/30 font-bold uppercase tracking-wider text-xs">
                [ Photo Ambiance & Conduite ]
              </span>
            </div>

          </div>

          {/* BANDEAU CAPACITÉ (Passagers & Bagages) */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-20 text-blanc font-bold uppercase tracking-widest text-sm sm:text-base border-t border-blanc/20">
            <div className="flex items-center gap-3 bg-noir/20 px-6 py-3 rounded-full border border-blanc/10">
              <span className="text-2xl">👥</span>
              <span>1 à 4 Passagers</span>
            </div>
            <div className="flex items-center gap-3 bg-noir/20 px-6 py-3 rounded-full border border-blanc/10">
              <span className="text-2xl">🧳</span>
              <span>1 à 4 Bagages</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SECTION SERVICES À BORD */}
      <section className="bg-gris py-16 sm:py-24 px-4 sm:px-6 text-blanc">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-blanc drop-shadow-md">
              Services à Bord
            </h2>
            <p className="text-sable text-sm font-light">
              Des équipements pensés pour rendre votre déplacement agréable et sans contrainte.
            </p>
          </div>

          {/* Grille flex centrée des 7 cartes */}
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            {services.map((item, idx) => (
              <div
                key={idx}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-sable text-noir rounded-2xl p-6 text-center flex flex-col items-center justify-between shadow-xl hover:-translate-y-1 transition-all duration-200 border border-noir/5"
              >
                <div className="text-4xl mb-4 bg-[#dfd4c5] w-16 h-16 rounded-full flex items-center justify-center shadow-inner">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wide text-rouge-fonce mb-2 font-serif">
                    {item.title}
                  </h3>
                  <p className="text-xs text-noir/80 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA FINAL : RÉSERVER UNE COURSE */}
          <div className="text-center pt-6">
            <Link
              href="/reservation"
              className="inline-block bg-rouge-fonce hover:bg-rouge-clair text-blanc font-serif uppercase tracking-wider px-10 py-4 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-2xl border border-rouge-clair/40 active:scale-95 cursor-pointer"
            >
              Réserver une course
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}