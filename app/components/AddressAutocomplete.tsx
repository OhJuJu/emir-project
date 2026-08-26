"use client";

import { useState, useRef, useEffect } from "react";

export type AddressSelection = {
  placeName: string;
  longitude: number;
  latitude: number;
};

type AddressAutocompleteProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
  onSelect: (selection: AddressSelection) => void;
  onBlur?: () => void;
  error?: string;
};

type MapboxFeature = {
  place_name: string;
  center: [number, number]; // [longitude, latitude]
};

export default function AddressAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  onBlur,
  error,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ferme la liste si on clique en dehors du composant
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    // On attend 300ms après la dernière frappe avant d'appeler l'API,
    // pour éviter un appel réseau à chaque lettre tapée
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${token}&country=fr&language=fr&types=address,poi&limit=5`;

        const response = await fetch(url);
        const data = await response.json();
        setSuggestions(data.features || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Erreur autocomplétion Mapbox :", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChange(text);
    fetchSuggestions(text);
  };

  const handleSelect = (feature: MapboxFeature) => {
    onChange(feature.place_name);
    onSelect({
      placeName: feature.place_name,
      longitude: feature.center[0],
      latitude: feature.center[1],
    });
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-bold uppercase mb-1 text-noir/80">{label}</label>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-[#dfd4c5] border border-noir/20 rounded-md p-3 text-sm text-noir placeholder:text-noir/40 focus:outline-none focus:ring-1 focus:ring-noir"
      />
      {error && <p className="text-xs text-rouge-fonce mt-1">{error}</p>}

      {isLoading && (
        <p className="absolute z-20 mt-1 text-xs text-noir/60 bg-blanc px-2 py-1 rounded shadow">
          Recherche...
        </p>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-blanc border border-noir/20 rounded-md shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((feature, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => handleSelect(feature)}
                className="w-full text-left px-3 py-2 text-sm text-noir hover:bg-sable transition-colors"
              >
                {feature.place_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
