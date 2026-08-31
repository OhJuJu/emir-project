"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { LineStringGeometry } from "../lib/mapbox";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type LngLat = { longitude: number; latitude: number };

type MapViewProps = {
  departure: LngLat | null;
  arrival: LngLat | null;
  routeGeometry: LineStringGeometry | null;
  pinMode: "departure" | "arrival" | null;
  onMapClick: (coords: LngLat) => void;
};

export default function MapView({ departure, arrival, routeGeometry, pinMode, onMapClick }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const departureMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const arrivalMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // On garde les callbacks/valeurs "vivantes" dans des refs pour que le listener
  // de clic (attaché une seule fois à l'init de la carte) ait toujours la dernière valeur,
  // sans avoir à recréer la carte à chaque changement de pinMode.
  const onMapClickRef = useRef(onMapClick);
  const pinModeRef = useRef(pinMode);
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);
  useEffect(() => { pinModeRef.current = pinMode; }, [pinMode]);

  // Initialisation de la carte, une seule fois 
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [1.908049, 47.898488], // centre approximatif d'Orléans
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("click", (e) => {
      if (!pinModeRef.current) return; // clic ignoré si aucun mode de pointage actif
      onMapClickRef.current({ longitude: e.lngLat.lng, latitude: e.lngLat.lat });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Le curseur change en "crosshair" pour indiquer visuellement que le clic va poser un point
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = pinMode ? "crosshair" : "";
  }, [pinMode]);

  // Marqueur de départ
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!departure) {
      departureMarkerRef.current?.remove();
      departureMarkerRef.current = null;
      return;
    }

    if (!departureMarkerRef.current) {
      departureMarkerRef.current = new mapboxgl.Marker({ color: "#8B1A1A" })
        .setLngLat([departure.longitude, departure.latitude])
        .addTo(map);
    } else {
      departureMarkerRef.current.setLngLat([departure.longitude, departure.latitude]);
    }
  }, [departure]);

  // Marqueur d'arrivée
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!arrival) {
      arrivalMarkerRef.current?.remove();
      arrivalMarkerRef.current = null;
      return;
    }

    if (!arrivalMarkerRef.current) {
      arrivalMarkerRef.current = new mapboxgl.Marker({ color: "#2E2E2E" })
        .setLngLat([arrival.longitude, arrival.latitude])
        .addTo(map);
    } else {
      arrivalMarkerRef.current.setLngLat([arrival.longitude, arrival.latitude]);
    }
  }, [arrival]);

  // Tracé de l'itinéraire (ligne) + cadrage automatique de la vue
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyRoute = () => {
      const sourceId = "route-source";

      if (map.getLayer("route-layer")) map.removeLayer("route-layer");
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      if (routeGeometry) {
        // Le "as any" ici contourne le typage interne de mapbox-gl, qui référence
        // le namespace global GeoJSON — on évite ainsi toute dépendance à ce package
        // pour un simple objet dont on connaît la forme exacte.
        map.addSource(sourceId, {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: routeGeometry } as any,
        });
        map.addLayer({
          id: "route-layer",
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#8B1A1A", "line-width": 4 },
        });
      }

      if (departure && arrival) {
        const bounds = new mapboxgl.LngLatBounds(
          [departure.longitude, departure.latitude],
          [departure.longitude, departure.latitude]
        );
        bounds.extend([arrival.longitude, arrival.latitude]);
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
      } else if (departure) {
        map.flyTo({ center: [departure.longitude, departure.latitude], zoom: 13 });
      } else if (arrival) {
        map.flyTo({ center: [arrival.longitude, arrival.latitude], zoom: 13 });
      }
    };

    if (map.isStyleLoaded()) {
      applyRoute();
    } else {
      map.once("load", applyRoute);
    }
  }, [routeGeometry, departure, arrival]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-72 rounded-xl overflow-hidden border border-noir/20"
    />
  );
}
