
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, User, Phone, Car, Star, Shield,
  Loader2, Edit2, Save, X, LogOut, History, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser, useDoc, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, where, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { UserProfile, ServiceRequest } from '@/lib/types';

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-600',
  driver: 'bg-accent/10 text-accent',
  client: 'bg-slate-100 text-slate-600',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  driver: 'Chauffeur Ange',
  client: 'Client',
};

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  en_route: 'bg-blue-100 text-blue-600',
  awaiting: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-purple-100 text-purple-700',
  arrived: 'bg-green-100 text-green-600',
};

export default function ProfilePage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user: authUser, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const profileRef = useMemo(
    () => (authUser ? doc(db, 'users', authUser.uid) : null),
    [db, authUser]
  );
  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(profileRef);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setVehicle(profile.vehicle || '');
    }
  }, [profile]);

  // Booking history
  const historyQuery = useMemo(() => {
    if (!authUser) return null;
    const field = profile?.role === 'driver' ? 'driverId' : 'clientId';
    return query(
      collection(db, 'serviceRequests'),
      where(field, '==', authUser.uid)
    );
  }, [db, authUser, profile?.role]);

  const { data: history } = useCollection<ServiceRequest>(historyQuery ?? collection(db, 'serviceRequests'));

  const handleSave = async () => {
    if (!authUser || !profileRef) return;
    setSaving(true);
    try {
      await setDoc(profileRef, { name, phone, vehicle }, { merge: true });
      setEditing(false);
      toast({ title: 'Profil mis à jour', description: 'Vos informations ont été enregistrées.' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!authUser || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <Shield className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Non connecté</h2>
        <Button asChild className="mt-4">
          <Link href="/auth">Se connecter</Link>
        </Button>
      </div>
    );
  }

  const filteredHistory = historyQuery ? (history ?? []) : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0a111a] text-white px-6 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg tracking-tight">Mon Profil</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" /> Déconnexion
        </Button>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Avatar + role */}
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#0a111a] to-[#1a2c42] h-28" />
          <CardContent className="pt-0 pb-8 px-8 -mt-12 flex flex-col items-center text-center gap-4">
            <div className="w-24 h-24 rounded-full bg-accent/10 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-black text-accent">
              {profile.name?.[0]?.toUpperCase() || <User className="w-10 h-10" />}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#0a111a]">{profile.name}</h1>
              <p className="text-slate-500 text-sm">{profile.email}</p>
              <Badge className={`text-[10px] uppercase font-black px-3 py-1 ${roleColors[profile.role]}`}>
                {roleLabels[profile.role]}
              </Badge>
            </div>
            {profile.rating && profile.reviewCount ? (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{profile.rating.toFixed(1)}</span>
                <span className="text-slate-400">({profile.reviewCount} avis)</span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Editable info */}
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Informations personnelles</CardTitle>
            {!editing ? (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-accent hover:text-accent/80">
                <Edit2 className="w-4 h-4 mr-1" /> Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setName(profile.name); setPhone(profile.phone || ''); setVehicle(profile.vehicle || ''); }}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" className="bg-accent text-white rounded-xl" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                  Sauvegarder
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <User className="w-3 h-3" /> Nom complet
              </label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={!editing}
                className="h-12 rounded-xl bg-slate-50 border-none disabled:opacity-60"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Phone className="w-3 h-3" /> Téléphone
              </label>
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={!editing}
                placeholder="+262 692 00 00 00"
                className="h-12 rounded-xl bg-slate-50 border-none disabled:opacity-60"
              />
            </div>
            {profile.role === 'driver' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Car className="w-3 h-3" /> Véhicule
                </label>
                <Input
                  value={vehicle}
                  onChange={e => setVehicle(e.target.value)}
                  disabled={!editing}
                  placeholder="Ex: Peugeot 308 – AB-123-CD"
                  className="h-12 rounded-xl bg-slate-50 border-none disabled:opacity-60"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking history */}
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center gap-2">
            <History className="w-5 h-5 text-accent" />
            <CardTitle className="text-base font-bold">Historique des missions</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-4">
            {filteredHistory.length === 0 ? (
              <div className="px-8 py-8 text-center text-slate-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-sm">Aucune mission pour le moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredHistory.map(req => (
                  <div key={req.id} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="font-semibold text-sm text-[#0a111a] truncate max-w-[200px]">{req.destination}</p>
                      <p className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <Badge className={`text-[10px] uppercase font-black px-2 py-0.5 ${statusColors[req.status] || 'bg-slate-100 text-slate-600'}`}>
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="flex gap-3">
          {profile.role === 'client' && (
            <Button asChild className="flex-1 h-14 bg-[#0a111a] text-white rounded-2xl font-bold">
              <Link href="/dashboard">Tableau de bord</Link>
            </Button>
          )}
          {profile.role === 'driver' && (
            <Button asChild className="flex-1 h-14 bg-accent text-white rounded-2xl font-bold">
              <Link href="/driver">Panel Chauffeur</Link>
            </Button>
          )}
          {profile.role === 'admin' && (
            <Button asChild className="flex-1 h-14 bg-red-600 text-white rounded-2xl font-bold">
              <Link href="/admin">Console Admin</Link>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
