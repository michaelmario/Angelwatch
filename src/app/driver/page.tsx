
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Shield, Power, Navigation, User, CheckCircle, Clock, MessageCircle, MapPin, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { RatingModal } from '@/components/RatingModal';
import { EarningsCard } from '@/components/EarningsCard';
import { ReceiptModal } from '@/components/ReceiptModal';
import { useDriverEarnings } from '@/hooks/use-driver-earnings';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { useDriverLocation } from '@/hooks/use-driver-location';
import {
  doc, setDoc, updateDoc, onSnapshot, query, collection, where, orderBy, limit
} from 'firebase/firestore';
import { ServiceRequest, UserProfile } from '@/lib/types';
import Link from 'next/link';

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function DriverDashboard() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user: authUser } = useUser();

  const profileRef = useMemo(() => authUser ? doc(db, 'users', authUser.uid) : null, [db, authUser]);
  const { data: userProfile } = useDoc<UserProfile>(profileRef);

  const [isOnline, setIsOnline] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<ServiceRequest | null>(null);
  const [activeJob, setActiveJob] = useState<ServiceRequest | null>(null);
  const [showRating, setShowRating] = useState<ServiceRequest | null>(null);
  const [showReceipt, setShowReceipt] = useState<ServiceRequest | null>(null);

  // Driver location broadcasting
  const { currentLocation, isTracking, error: locationError } = useDriverLocation({
    enabled: isOnline,
    updateIntervalMs: 10000,
  });

  // Listen for awaiting requests when online
  useEffect(() => {
    if (!isOnline || !authUser) { setPendingRequest(null); return; }
    const q = query(
      collection(db, 'serviceRequests'),
      where('status', '==', 'awaiting'),
      limit(1)
    );
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        const d = snap.docs[0];
        setPendingRequest({ id: d.id, ...d.data() } as ServiceRequest);
      } else {
        setPendingRequest(null);
      }
    });
    return () => unsub();
  }, [db, isOnline, authUser]);

  // Listen for active job (assigned to this driver)
  useEffect(() => {
    if (!authUser) return;
    const q = query(
      collection(db, 'serviceRequests'),
      where('driverId', '==', authUser.uid),
      where('status', 'in', ['en_route', 'arrived', 'in_progress']),
      limit(1)
    );
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        const d = snap.docs[0];
        setActiveJob({ id: d.id, ...d.data() } as ServiceRequest);
      } else {
        setActiveJob(null);
      }
    });
    return () => unsub();
  }, [db, authUser]);

  // Show location error toast
  useEffect(() => {
    if (locationError) {
      toast({ title: 'Erreur de localisation', description: locationError, variant: 'destructive' });
    }
  }, [locationError, toast]);

  const toggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    if (authUser) {
      await setDoc(doc(db, 'driverStatus', authUser.uid), {
        id: authUser.uid,
        name: userProfile?.name || 'Chauffeur',
        isAvailable: next,
        location: currentLocation || { lat: -21.1151, lng: 55.5364 }, // Default to La Réunion center
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
    toast({
      title: next ? 'Vous êtes en ligne' : 'Vous êtes hors ligne',
      description: next ? 'Vous recevrez bientôt des demandes.' : 'Aucune demande ne vous sera envoyée.',
    });
  };

  const handleAccept = async () => {
    if (!pendingRequest || !authUser || !userProfile) return;
    await updateDoc(doc(db, 'serviceRequests', pendingRequest.id), {
      driverId: authUser.uid,
      driverName: userProfile.name,
      status: 'en_route',
      driverLocation: currentLocation,
    });
    setActiveJob({ ...pendingRequest, driverId: authUser.uid, driverName: userProfile.name, status: 'en_route' });
    setPendingRequest(null);
    toast({ title: 'Mission acceptée !', description: `En route vers ${pendingRequest.destination}` });
  };

  const handleDecline = () => {
    setPendingRequest(null);
    toast({ title: 'Mission refusée', description: 'La prochaine demande vous sera assignée.' });
  };

  const handleArrived = async () => {
    if (!activeJob) return;
    await updateDoc(doc(db, 'serviceRequests', activeJob.id), {
      status: 'arrived',
    });
    setActiveJob({ ...activeJob, status: 'arrived' });
    toast({ title: 'Arrivé au point de départ !', description: 'Prévenez le client que vous êtes là.' });
  };

  const handleStartTrip = async () => {
    if (!activeJob) return;
    await updateDoc(doc(db, 'serviceRequests', activeJob.id), {
      status: 'in_progress',
    });
    setActiveJob({ ...activeJob, status: 'in_progress' });
    toast({ title: 'Course démarrée !', description: 'Conduisez prudemment.' });
  };

  const handleComplete = async () => {
    if (!activeJob) return;
    await updateDoc(doc(db, 'serviceRequests', activeJob.id), {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    setShowReceipt(activeJob); // Show receipt first
    setShowRating(activeJob); // Then show rating modal
    setActiveJob(null);
    toast({ title: 'Mission terminée !', description: 'Excellent travail !' });
  };

  // Navigation intent for external maps
  const openNavigation = (destination: string, coords?: { lat: number; lng: number }) => {
    if (coords) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`, '_blank');
    } else {
      const encoded = encodeURIComponent(destination);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank');
    }
  };

  // Determine action button based on job status
  const getActionButton = () => {
    if (!activeJob) return null;

    switch (activeJob.status) {
      case 'en_route':
        return (
          <Button
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg"
            onClick={handleArrived}
          >
            <MapPin className="mr-2 w-5 h-5" /> Je suis arrivé
          </Button>
        );
      case 'arrived':
        return (
          <Button
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg"
            onClick={handleStartTrip}
          >
            <Navigation className="mr-2 w-5 h-5" /> Démarrer la course
          </Button>
        );
      case 'in_progress':
        return (
          <Button
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg"
            onClick={handleComplete}
          >
            <CheckCircle className="mr-2 w-5 h-5" /> Confirmer l'arrivée
          </Button>
        );
      default:
        return null;
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    if (!activeJob) return null;

    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      en_route: { bg: 'bg-blue-100 text-blue-700', text: 'En route', label: 'en_route' },
      arrived: { bg: 'bg-yellow-100 text-yellow-700', text: 'Arrivé', label: 'arrived' },
      in_progress: { bg: 'bg-green-100 text-green-700', text: 'En course', label: 'in_progress' },
    };

    const config = statusConfig[activeJob.status];
    if (!config) return null;

    return <Badge className={config.bg}>{config.text}</Badge>;
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between bg-primary text-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <span className="font-bold text-lg">Panel Chauffeur</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold uppercase tracking-widest ${isOnline ? 'text-green-300' : 'text-slate-400'}`}>
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </span>
          <Switch checked={isOnline} onCheckedChange={toggleOnline} className="data-[state=checked]:bg-green-500" />
        </div>
      </header>

      <main className="p-6 space-y-6 flex-1">
        {/* Real-time earnings from completed trips */}
        <EarningsCard requests={[]} />

        {/* Quick links */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 font-bold" asChild>
            <Link href="/driver/payouts">
              <Banknote className="w-4 h-4 mr-2" /> Versements
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 font-bold" asChild>
            <Link href="/profile">
              <User className="w-4 h-4 mr-2" /> Profil
            </Link>
          </Button>
        </div>

        {/* Incoming request notification */}
        {pendingRequest && !activeJob && (
          <Card className="border-accent/40 shadow-xl bg-white animate-in slide-in-from-top-4 duration-500">
            <CardHeader className="bg-accent/5 border-b border-accent/10 pb-4 pt-4 px-6">
              <div className="flex justify-between items-center">
                <Badge className="bg-accent text-white animate-pulse">Nouvelle demande !</Badge>
                <span className="text-xs text-slate-600">{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-primary">{pendingRequest.clientName}</p>
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {pendingRequest.destination}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12 border-red-200 text-red-500 font-bold rounded-xl" onClick={handleDecline}>
                  Refuser
                </Button>
                <Button className="h-12 bg-accent text-white font-bold rounded-xl" onClick={handleAccept}>
                  Accepter
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No job waiting */}
        {!pendingRequest && !activeJob && (
          <div className="space-y-6">
            <Card className="border-dashed border-2 border-slate-200 bg-transparent text-center py-12">
              <CardContent className="space-y-4">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-600">
                    {isOnline ? 'En attente de missions...' : 'Vous êtes hors ligne'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {isOnline ? 'Gardez l\'application ouverte.' : 'Passez en ligne pour recevoir des demandes.'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <section className="space-y-3">
              <h3 className="font-bold text-primary">Trafic en Direct</h3>
              <MapPlaceholder
                drivers={currentLocation ? [{ id: authUser?.uid || 'me', name: 'Ma position', location: currentLocation }] : []}
              />
            </section>
          </div>
        )}

        {/* Active job */}
        {activeJob && (
          <div className="space-y-4">
            <Card className="border-accent/30 shadow-xl bg-white animate-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="bg-accent/5 border-b border-accent/10 pb-4">
                <div className="flex justify-between items-center">
                  {getStatusBadge()}
                  <span className="text-xs text-accent font-bold">ETA: {activeJob.eta || '4 MIN'}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">{activeJob.clientName}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <StarIcon className="w-3 h-3 text-yellow-500 fill-current" /> Client vérifié
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border-l-2 border-slate-100 ml-4 pl-6">
                  <div className="relative">
                    <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm" />
                    <p className="text-xs font-bold text-muted-foreground uppercase">Départ</p>
                    <p className="font-semibold text-primary">{activeJob.pickupAddress || 'Position actuelle'}</p>
                  </div>
                  <div className="relative pt-4">
                    <div className="absolute -left-8 top-5 w-4 h-4 rounded-full bg-accent border-4 border-white shadow-sm" />
                    <p className="text-xs font-bold text-muted-foreground uppercase">Destination</p>
                    <p className="font-semibold text-primary">{activeJob.destination}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-12 border-primary/20 text-primary font-bold rounded-xl">
                    <Link href={`/chat/${activeJob.id}`}>
                      <MessageCircle className="w-4 h-4 mr-2" /> Message
                    </Link>
                  </Button>
                  <Button
                    className="h-12 bg-primary text-white font-bold rounded-xl"
                    onClick={() => openNavigation(activeJob.destination, activeJob.destinationCoords)}
                  >
                    <Navigation className="w-4 h-4 mr-2" /> Navigation
                  </Button>
                </div>

                {getActionButton()}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Receipt modal after completion */}
      {showReceipt && (
        <ReceiptModal
          request={showReceipt}
          driverName={userProfile?.name}
          clientName={showReceipt.clientName}
          onClose={() => setShowReceipt(null)}
        />
      )}

      {/* Rating modal after completion */}
      {showRating && (
        <RatingModal
          requestId={showRating.id}
          revieweeId={showRating.clientId}
          revieweeName={showRating.clientName}
          reviewerId={authUser?.uid || ''}
          reviewerName={userProfile?.name || 'Chauffeur'}
          onClose={() => setShowRating(null)}
        />
      )}
    </div>
  );
}
