import Link from "next/link";

export default function Footer() {
  const mainNavLinks = [
    { name: "Accueil", path: "/" },
    { name: "Réservation", path: "/reservation" },
    { name: "Véhicule", path: "/vehicule" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <footer className="w-full bg-noir text-blanc mt-auto">
      <div className="w-full border-t-20 border-noir/80" />
      <div className="w-full border-t-4 border-rouge-clair/80" />

      {/* 2. Contenu du Footer */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-6">

        {/* 4. BASEMENT : Mentions Légales & Copyright */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 text-xs text-gris text-center md:text-left">
          
          {/* Copyright */}
          <p>
            © {new Date().getFullYear()} Emir Transport. Tous droits réservés.
          </p>

          {/* Liens légaux & conformité */}
          <div className="flex items-center gap-4">
            <Link
              href="/mentions-legales"
              className="hover:text-sable transition-colors underline-offset-4 hover:underline"
            >
              Mentions Légales
            </Link>
            <span>•</span>
            <Link
              href="/cgv"
              className="hover:text-sable transition-colors underline-offset-4 hover:underline"
            >
              CGV
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}