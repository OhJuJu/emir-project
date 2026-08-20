"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Véhicule", path: "/vehicule" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-blanc/95 backdrop-blur-md border-b border-gris/30 px-4 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO (À gauche) */}
        <Link href="/" className="flex items-center gap-2">
        <Image
                src="/images/image-modified.png"
                alt="Emir Transport Logo"
                width={160}
                height={50}
                className="h-14 w-auto object-contain"
                style={{ width: "auto" }} 
                priority
            />
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`text-medium font-medium transition-colors hover:text-rouge-fonce ${
                  isActive ? "text-rouge-clair font-semibold" : "text-noir"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          {/* Bouton CTA Réserver */}
          <Link
            href="/reservation"
            className="bg-rouge-fonce hover:bg-rouge-clair  text-blanc px-4 py-2 rounded text-sm font-semibold transition-all shadow-md"
          >
            Réserver
          </Link>
        </nav>

        {/* BOUTON MENU MOBILE (Burger) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-noir focus:outline-none p-2"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MENU MOBILE DÉROULANT */}
      {isOpen && (
        <nav className="md:hidden mt-4 pb-4 border-t border-gris/30 flex flex-col gap-4 pt-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-rouge-fonce ${
                  isActive ? "text-rouge-clair font-semibold" : "text-noir"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/reservation"
            onClick={() => setIsOpen(false)}
            className="bg-rouge-fonce hover:bg-rouge-clair text-blanc text-center py-2.5 rounded font-semibold text-sm mt-2"
          >
            Réserver une course
          </Link>
        </nav>
      )}
    </header>
  );
}