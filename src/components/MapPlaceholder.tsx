"use client";

import React from 'react';
import { Navigation, MapPin } from 'lucide-react';
import { LiveMap } from './LiveMap';
import { Location, ServiceRequest } from '@/lib/types';

interface Driver {
  id: string;
  name: string;
  location: Location;
  rating?: number;
  trips?: number;
  avatar?: string;
}

interface MapPlaceholderProps {
  drivers?: Driver[];
  activeRequest?: ServiceRequest | null;
  height?: number;
  showDriverRoute?: boolean;
}

export function MapPlaceholder({ drivers = [], activeRequest = null, height = 240, showDriverRoute = false }: MapPlaceholderProps) {
  const hasApiKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Use real map if API key is available, otherwise use placeholder
  if (hasApiKey) {
    return (
      <LiveMap
        drivers={drivers}
        activeRequest={activeRequest}
        height={height}
        showDriverRoute={showDriverRoute}
      />
    );
  }

  // Fallback: Static Google Maps embed with driver pin overlays
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md" style={{ height }}>
      {/* Embedded Google Maps – La Réunion, France (no API key needed for basic embed) */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d119278.73768703014!2d55.56!3d-21.11!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sfr!4v1710000000000!5m2!1sfr!2sfr"
        width="100%"
        height="100%"
        style={{ border: 0, filter: 'grayscale(20%)' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="AngelWatch carte"
      />

      {/* Driver pin overlays */}
      {drivers.map((driver, i) => (
        <div
          key={driver.id}
          className="absolute z-10 flex flex-col items-center"
          style={{
            top: `${28 + i * 22}%`,
            left: `${38 + i * 18}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="bg-accent text-white rounded-full p-1.5 shadow-lg border-2 border-white animate-bounce">
            <Navigation className="w-3 h-3" />
          </div>
          <div className="bg-white text-[#0a111a] text-[9px] font-bold px-2 py-0.5 rounded-full shadow mt-0.5 whitespace-nowrap border border-slate-100">
            {driver.name.split(' ')[0]}
          </div>
        </div>
      ))}

      {/* Active request pulse */}
      {activeRequest && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#0a111a]/90 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2 shadow-xl">
            <span className="w-2 h-2 bg-accent rounded-full animate-ping" />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Votre Ange est en route</span>
          </div>
        </div>
      )}

      {/* Drivers count badge */}
      {drivers.length > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow text-[10px] font-bold text-slate-600 flex items-center gap-1 border border-slate-100">
          <MapPin className="w-3 h-3 text-accent" />
          {drivers.length} Ange{drivers.length > 1 ? 's' : ''} disponible{drivers.length > 1 ? 's' : ''}
        </div>
      )}

      {/* API key missing notice */}
      <div className="absolute top-3 left-3 z-10 bg-amber-100/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-medium text-amber-700">
        Mode démo – Ajoutez NEXT_PUBLIC_GOOGLE_MAPS_API_KEY pour la carte réelle
      </div>
    </div>
  );
}
