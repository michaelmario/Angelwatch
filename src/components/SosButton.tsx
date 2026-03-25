"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AlertOctagon, X, Loader2, MapPin, Phone } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { SosAlert } from '@/lib/types';

interface SosButtonProps {
  clientId?: string;
  clientName?: string;
  requestId?: string;
}

const COOLDOWN_SECONDS = 30;

export function SosButton({ clientId, clientName, requestId }: SosButtonProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Get location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Géolocalisation non disponible');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Permission refusée');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSos = useCallback(async () => {
    if (!clientId || sending || sent || cooldown > 0) return;
    setSending(true);
    setLocationError(null);

    // Try to get fresh location
    let coords: { lat: number; lng: number } | null = location;
    try {
      if (navigator.geolocation) {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        });
      }
    } catch {
      // Use stale location if fresh one fails
      coords = location;
    }

    try {
      const alertData: Omit<SosAlert, 'id'> = {
        clientId,
        clientName: clientName || 'Client',
        requestId: requestId || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
        createdAt: new Date().toISOString(),
        resolved: false,
      };

      await addDoc(collection(db, 'sos_alerts'), alertData);
      setSent(true);
      setCooldown(COOLDOWN_SECONDS);
      toast({
        title: 'Alerte SOS envoyée',
        description: coords
          ? 'Notre équipe a été notifiée avec votre position. Restez en sécurité.'
          : 'Notre équipe a été notifiée. Restez en sécurité.',
        variant: 'default',
      });
      setTimeout(() => setSent(false), COOLDOWN_SECONDS * 1000);
    } catch {
      toast({
        title: 'Erreur SOS',
        description: 'Impossible d\'envoyer l\'alerte. Réessayez.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  }, [clientId, clientName, requestId, sending, sent, cooldown, location, db, toast]);

  const isActive = sent || cooldown > 0;
  const buttonClass = isActive
    ? 'bg-orange-500 shadow-orange-500/50'
    : 'bg-red-600 hover:bg-red-700 shadow-red-600/50 animate-pulse';

  return (
    <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-2">
      {/* Cooldown indicator */}
      {cooldown > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg border border-slate-100 flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-600">Réinitialisation dans</span>
          <span className="text-xs font-black text-orange-600">{cooldown}s</span>
        </div>
      )}

      {/* Location error hint */}
      {locationError && !isActive && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg border border-slate-100 flex items-center gap-1.5 max-w-[180px]">
          <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
          <span className="text-[10px] text-slate-500">{locationError} - Position non transmise</span>
        </div>
      )}

      {/* Location success hint */}
      {location && !locationError && !isActive && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg border border-slate-100 flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-green-500" />
          <span className="text-[10px] text-slate-500">Position GPS prête</span>
        </div>
      )}

      {/* SOS Button */}
      <button
        onClick={handleSos}
        disabled={sending || !clientId}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Bouton SOS — Appuyez en cas d'urgence"
        aria-label="Envoyer une alerte SOS"
      >
        {sending ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : sent ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <AlertOctagon className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
