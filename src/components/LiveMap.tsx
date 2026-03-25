"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { Location, ServiceRequest } from '@/lib/types';

declare const google: typeof globalThis.google;

const LA_REUNION_CENTER = { lat: -21.1151, lng: 55.5364 };

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultMapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

interface LiveMapProps {
  drivers?: Array<{ id: string; name: string; location: Location; rating?: number; avatar?: string }>;
  activeRequest?: ServiceRequest | null;
  clientLocation?: Location | null;
  height?: number;
  showDriverRoute?: boolean;
}

export function LiveMap({
  drivers = [],
  activeRequest = null,
  clientLocation = null,
  height = 240,
  showDriverRoute = false,
}: LiveMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fit bounds when drivers change
  useEffect(() => {
    if (!map || drivers.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    drivers.forEach(driver => {
      bounds.extend({ lat: driver.location.lat, lng: driver.location.lng });
    });
    if (clientLocation) {
      bounds.extend({ lat: clientLocation.lat, lng: clientLocation.lng });
    }
    map.fitBounds(bounds, 50);
  }, [map, drivers, clientLocation]);

  if (loadError) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md bg-slate-100 flex items-center justify-center" style={{ height }}>
        <div className="text-center text-slate-500">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Carte non disponible</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md bg-slate-100 flex items-center justify-center" style={{ height }}>
        <div className="text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-accent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  const pickupCoords = activeRequest?.pickupCoords;
  const destCoords = activeRequest?.destinationCoords;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md" style={{ height }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={pickupCoords || destCoords || LA_REUNION_CENTER}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={defaultMapOptions}
      >
        {/* Driver markers */}
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            position={{ lat: driver.location.lat, lng: driver.location.lng }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#0a111a',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            title={driver.name}
            onClick={() => setSelectedDriver(driver.id)}
          />
        ))}

        {/* Client location marker */}
        {clientLocation && (
          <Marker
            position={{ lat: clientLocation.lat, lng: clientLocation.lng }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#22c55e',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            title="Votre position"
          />
        )}

        {/* Pickup marker */}
        {pickupCoords && (
          <Marker
            position={{ lat: pickupCoords.lat, lng: pickupCoords.lng }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            title="Point de départ"
          />
        )}

        {/* Destination marker */}
        {destCoords && (
          <Marker
            position={{ lat: destCoords.lat, lng: destCoords.lng }}
            icon={{
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#f97316',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            title="Destination"
          />
        )}

        {/* Route polyline from driver to pickup */}
        {showDriverRoute && pickupCoords && drivers.length > 0 && (
          <Polyline
            path={[
              { lat: drivers[0].location.lat, lng: drivers[0].location.lng },
              { lat: pickupCoords.lat, lng: pickupCoords.lng },
            ]}
            options={{
              strokeColor: '#0a111a',
              strokeOpacity: 0.8,
              strokeWeight: 3,
              geodesic: true,
            }}
          />
        )}

        {/* Driver info window */}
        {selectedDriver && drivers.find(d => d.id === selectedDriver) && (
          <InfoWindow
            position={{
              lat: drivers.find(d => d.id === selectedDriver)!.location.lat,
              lng: drivers.find(d => d.id === selectedDriver)!.location.lng,
            }}
            onCloseClick={() => setSelectedDriver(null)}
          >
            <div className="p-2 min-w-[120px]">
              <p className="font-bold text-sm">{drivers.find(d => d.id === selectedDriver)!.name}</p>
              {drivers.find(d => d.id === selectedDriver)!.rating && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="text-yellow-500">★</span> {drivers.find(d => d.id === selectedDriver)!.rating}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Active request badge */}
      {activeRequest && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-[#0a111a]/90 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2 shadow-xl">
            <span className="w-2 h-2 bg-accent rounded-full animate-ping" />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Votre Ange est en route</span>
          </div>
        </div>
      )}

      {/* Drivers count badge */}
      {drivers.length > 0 && !activeRequest && (
        <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow text-[10px] font-bold text-slate-600 flex items-center gap-1 border border-slate-100">
          <MapPin className="w-3 h-3 text-accent" />
          {drivers.length} Ange{drivers.length > 1 ? 's' : ''} disponible{drivers.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
