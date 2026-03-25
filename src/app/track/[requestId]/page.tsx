
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shield, MapPin, Navigation, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';
import { LiveMap } from '@/components/LiveMap';
import { doc, onSnapshot } from 'firebase/firestore';
import { ServiceRequest, RequestStatus, DriverStatus, Location } from '@/lib/types';
import Link from 'next/link';

const statusConfig: Record<RequestStatus, { label: string; color: string; icon: React.ReactNode }> = {
  awaiting: { label: 'En attente d\'un Ange...', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
  en_route: { label: 'Votre Ange est en route', color: 'bg-blue-100 text-blue-700', icon: <Navigation className="w-4 h-4 animate-bounce" /> },
  arrived: { label: 'Votre Ange est arrivé', color: 'bg-green-100 text-green-700', icon: <MapPin className="w-4 h-4" /> },
  in_progress: { label: 'Mission en cours', color: 'bg-purple-100 text-purple-700', icon: <Navigation className="w-4 h-4 animate-spin" /> },
  completed: { label: 'Mission terminée', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: 'Mission annulée', color: 'bg-red-100 text-red-600', icon: <Shield className="w-4 h-4" /> },
};

export default function TrackPage() {
  const params = useParams();
  const requestId = params?.requestId as string;
  const db = useFirestore();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [driverStatus, setDriverStatus] = useState<DriverStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for request updates
  useEffect(() => {
    if (!requestId) return;
    const unsub = onSnapshot(doc(db, 'serviceRequests', requestId), snap => {
      if (snap.exists()) {
        setRequest({ id: snap.id, ...snap.data() } as ServiceRequest);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [db, requestId]);

  // Listen for driver location when driver is assigned
  useEffect(() => {
    if (!request?.driverId) {
      setDriverStatus(null);
      return;
    }

    const unsub = onSnapshot(doc(db, 'driverStatus', request.driverId), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setDriverStatus({
          id: data.id || snap.id,
          name: data.name || 'Ange',
          location: data.location || { lat: -21.1151, lng: 55.5364 },
          isAvailable: data.isAvailable ?? true,
          updatedAt: data.updatedAt,
        });
      }
    });
    return () => unsub();
  }, [db, request?.driverId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a111a]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a111a] text-white p-6 text-center">
        <Shield className="w-16 h-16 text-slate-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Mission introuvable</h1>
        <p className="text-slate-400">Ce lien de suivi n'est plus valide.</p>
        <Link href="/" className="mt-6 text-accent font-bold hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const statusInfo = statusConfig[request.status];

  // Prepare map drivers
  const mapDrivers: Array<{ id: string; name: string; location: Location }> = [];
  if (driverStatus && driverStatus.location) {
    mapDrivers.push({
      id: driverStatus.id,
      name: driverStatus.name,
      location: driverStatus.location,
    });
  }

  return (
    <div className="min-h-screen bg-[#0a111a] flex flex-col items-center justify-center p-6">
      {/* Map */}
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/10 mb-6">
        <LiveMap
          drivers={mapDrivers}
          activeRequest={request}
          clientLocation={request.pickupCoords || null}
          height={250}
          showDriverRoute={request.status === 'en_route' || request.status === 'arrived'}
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-white space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-accent p-2 rounded-xl">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg uppercase tracking-tighter">AngelWatch</span>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm ${statusInfo.color}`}>
          {statusInfo.icon}
          {statusInfo.label}
        </div>

        {/* Details */}
        <div className="space-y-4">
          {request.driverName && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent font-black text-xl">
                {request.driverName[0]}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Votre Ange</p>
                <p className="font-bold text-white">{request.driverName}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Destination</p>
              <p className="font-semibold">{request.destination}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Heure de départ</p>
              <p className="font-semibold">
                {new Date(request.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-500 uppercase tracking-[0.2em]">
          Suivi partagé via AngelWatch — La Réunion
        </p>
      </div>
    </div>
  );
}
