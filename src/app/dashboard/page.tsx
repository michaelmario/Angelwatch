"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Shield, Send, MapPin, Navigation, Bell, Menu, AlertOctagon, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { StatusUpdates } from '@/components/StatusUpdates';
import { DriverCard } from '@/components/DriverCard';
import { SosButton } from '@/components/SosButton';
import { ShareTrip } from '@/components/ShareTrip';
import { ServiceRequest, UserProfile, Location } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { useAvailableDrivers } from '@/hooks/use-available-drivers';
import { geocodeAddress } from '@/lib/geocoding';
import {
  collection, doc, setDoc, updateDoc, onSnapshot, query, where, orderBy
} from 'firebase/firestore';
import Link from 'next/link';

export default function ClientDashboard() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user: authUser } = useUser();

  const profileRef = useMemo(() => authUser ? doc(db, 'users', authUser.uid) : null, [db, authUser]);
  const { data: userProfile } = useDoc<UserProfile>(profileRef);

  const [destination, setDestination] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);
  const [clientLocation, setClientLocation] = useState<Location | null>(null);
  const [pickupAddress, setPickupAddress] = useState<string>('');

  // Get client location
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setClientLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Client location error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Get available drivers from Firestore
  const { drivers: availableDrivers, loading: driversLoading } = useAvailableDrivers({
    userLocation: clientLocation,
    maxDistanceKm: 50,
  });

  // Listen for active request in Firestore
  useEffect(() => {
    if (!authUser) return;
    const q = query(
      collection(db, 'serviceRequests'),
      where('clientId', '==', authUser.uid),
      where('status', 'in', ['awaiting', 'en_route', 'arrived', 'in_progress'])
    );
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        const docData = snap.docs[0];
        setActiveRequest({ id: docData.id, ...docData.data() } as ServiceRequest);
      } else {
        setActiveRequest(null);
      }
    });
    return () => unsub();
  }, [db, authUser]);

  const handleRequest = async () => {
    if (!destination.trim()) {
      toast({ title: 'Destination requise', description: 'Veuillez entrer votre destination.', variant: 'destructive' });
      return;
    }
    if (!authUser || !userProfile) {
      toast({ title: 'Non connecté', description: 'Veuillez vous connecter pour réserver.', variant: 'destructive' });
      return;
    }
    setIsRequesting(true);
    try {
      // Geocode destination
      const destCoords = await geocodeAddress(destination.trim());

      const reqRef = doc(collection(db, 'serviceRequests'));
      const newRequest: Omit<ServiceRequest, 'id'> = {
        clientId: authUser.uid,
        clientName: userProfile.name || authUser.email || 'Client',
        clientAvatar: userProfile.avatar,
        status: 'awaiting',
        destination: destination.trim(),
        destinationCoords: destCoords || undefined,
        pickupAddress: pickupAddress || undefined,
        pickupCoords: clientLocation || undefined,
        createdAt: new Date().toISOString(),
      };
      await setDoc(reqRef, newRequest);
      setDestination('');
      toast({ title: 'Demande envoyée !', description: 'Un Ange va vous être assigné bientôt.' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer la demande.', variant: 'destructive' });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancel = async () => {
    if (!activeRequest) return;
    await updateDoc(doc(db, 'serviceRequests', activeRequest.id), { status: 'cancelled' });
    setActiveRequest(null);
    toast({ title: 'Demande annulée', description: 'Votre mission a été annulée.' });
  };

  // Map drivers to the format expected by MapPlaceholder
  const mapDrivers = useMemo(() => {
    return availableDrivers.map(d => ({
      id: d.id,
      name: d.name,
      location: d.location,
      rating: 4.8, // Default rating
      trips: 0,
    }));
  }, [availableDrivers]);

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-background relative pb-8 min-h-screen">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-primary">AngelWatch</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications" asChild>
            <Link href="/profile"><Bell className="w-5 h-5 text-slate-600" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menu" asChild>
            <Link href="/profile"><Menu className="w-5 h-5 text-slate-600" /></Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Map */}
        <section className="space-y-3">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-primary">Carte Live</h2>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {driversLoading ? 'Chargement...' : `${mapDrivers.length} Anges à proximité`}
            </span>
          </div>
          <MapPlaceholder
            drivers={mapDrivers}
            activeRequest={activeRequest}
            showDriverRoute={!!activeRequest}
          />
        </section>

        {/* Request / Status */}
        <section className="space-y-4">
          {!activeRequest ? (
            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Où allez-vous ?</h3>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Adresse de destination..."
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRequest()}
                  />
                </div>
                <Button
                  className="w-full h-14 bg-accent hover:bg-accent/90 text-white rounded-xl text-lg font-bold shadow-lg transition-transform active:scale-95"
                  onClick={handleRequest}
                  disabled={isRequesting}
                >
                  {isRequesting ? (
                    <span className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 animate-spin" /> Recherche en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Demander un Ange <Send className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <StatusUpdates request={activeRequest} />
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1 h-12 rounded-xl border-primary/20 font-bold">
                  <Link href={`/chat/${activeRequest.id}`}>
                    <MessageCircle className="w-4 h-4 mr-2" /> Chat
                  </Link>
                </Button>
                <ShareTrip requestId={activeRequest.id} />
              </div>
            </div>
          )}
        </section>

        {/* Available Drivers */}
        {!activeRequest && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary">Anges Disponibles</h2>
            {driversLoading ? (
              <div className="text-center py-8 text-slate-400">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-accent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm">Recherche des Anges...</p>
              </div>
            ) : mapDrivers.length > 0 ? (
              <div className="grid gap-4">
                {mapDrivers.map(driver => (
                  <DriverCard
                    key={driver.id}
                    name={driver.name}
                    rating={driver.rating}
                    trips={driver.trips}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-slate-200 bg-transparent text-center py-8">
                <CardContent>
                  <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600">Aucun Ange disponible pour le moment</p>
                  <p className="text-xs text-slate-400 mt-1">Réessayez dans quelques minutes</p>
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </main>

      {/* Cancel floating button */}
      {activeRequest && (
        <div className="fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto">
          <Button
            variant="destructive"
            className="w-full h-12 rounded-xl shadow-xl font-bold"
            onClick={handleCancel}
          >
            Annuler la demande
          </Button>
        </div>
      )}

      {/* SOS floating button */}
      <SosButton clientId={authUser?.uid} clientName={userProfile?.name} requestId={activeRequest?.id} />
    </div>
  );
}
