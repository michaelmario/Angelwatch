"use client";

import React, { useMemo, useState } from 'react';
import { Shield, ChevronLeft, Clock, CheckCircle, XCircle, Loader2, Banknote, ArrowDownToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFirestore, useUser, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useDriverEarnings } from '@/hooks/use-driver-earnings';
import { UserProfile, Payout } from '@/lib/types';
import Link from 'next/link';

const payoutStatusColors: Record<Payout['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
};

export default function DriverPayoutsPage() {
  const db = useFirestore();
  const { user: authUser } = useUser();
  const { toast } = useToast();
  const { earnings } = useDriverEarnings(authUser?.uid);

  const profileRef = useMemo(() => authUser ? doc(db, 'users', authUser.uid) : null, [db, authUser]);
  const { data: userProfile } = useDoc<UserProfile>(profileRef);

  const payoutsQuery = useMemo(() => {
    if (!authUser) return null;
    return query(collection(db, 'payouts'), where('driverId', '==', authUser.uid));
  }, [db, authUser]);

  const { data: payouts } = useCollection<Payout>(payoutsQuery ?? collection(db, 'payouts'));

  const [requestOpen, setRequestOpen] = useState(false);
  const [bankAccount, setBankAccount] = useState('');
  const [requesting, setRequesting] = useState(false);

  const availableForPayout = Math.max(0, earnings.totalEarnings - earnings.pendingPayout);

  const handleRequestPayout = async () => {
    if (!authUser || availableForPayout <= 0) return;
    setRequesting(true);
    try {
      await addDoc(collection(db, 'payouts'), {
        driverId: authUser.uid,
        driverName: userProfile?.name || 'Chauffeur',
        amount: availableForPayout,
        status: 'pending',
        bankAccount: bankAccount.trim() || undefined,
        createdAt: new Date().toISOString(),
      });
      toast({ title: 'Demande envoyée !', description: 'Votre demande de versement sera traitée sous 24-48h.' });
      setRequestOpen(false);
      setBankAccount('');
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de soumettre la demande.', variant: 'destructive' });
    } finally {
      setRequesting(false);
    }
  };

  const sortedPayouts = useMemo(() => {
    if (!payouts) return [];
    return [...payouts].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [payouts]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0a111a] text-white px-6 py-5 flex items-center gap-4 sticky top-0 z-50">
        <Link href="/driver" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-accent p-2 rounded-xl">
            <Banknote className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Mes Versements</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-6 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-[#0a111a] to-[#1a2c42] border-none text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Solde disponible</p>
                <p className="text-5xl font-black mt-1">€{availableForPayout.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest">Total</p>
                  <p className="font-bold text-lg">€{earnings.totalEarnings.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest">En attente</p>
                  <p className="font-bold text-lg">€{earnings.pendingPayout.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest">Versé</p>
                  <p className="font-bold text-lg">€{earnings.completedPayout.toFixed(2)}</p>
                </div>
              </div>

              <Button
                className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg"
                disabled={availableForPayout <= 0}
                onClick={() => setRequestOpen(true)}
              >
                <ArrowDownToLine className="w-5 h-5 mr-2" /> Demander un versement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips summary */}
        {earnings.tipsTotal > 0 && (
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-3 rounded-xl">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Pourboires</p>
                  <p className="text-2xl font-black text-pink-600">€{earnings.tipsTotal.toFixed(2)}</p>
                </div>
              </div>
              <Badge className="bg-pink-100 text-pink-600">{earnings.ridesCount} courses</Badge>
            </CardContent>
          </Card>
        )}

        {/* Payout History */}
        <Card className="bg-white border-none shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" /> Historique des versements
            </CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-bold uppercase">Date</TableHead>
                <TableHead className="text-xs font-bold uppercase">Montant</TableHead>
                <TableHead className="text-xs font-bold uppercase">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPayouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-slate-400">
                    Aucun versement pour le moment.
                  </TableCell>
                </TableRow>
              ) : sortedPayouts.map(payout => (
                <TableRow key={payout.id}>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(payout.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">
                    €{payout.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] font-black ${payoutStatusColors[payout.status]}`}>
                      {payout.status === 'pending' ? 'En attente' :
                       payout.status === 'processing' ? 'En cours' :
                       payout.status === 'completed' ? 'Versé' : 'Échoué'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Info */}
        <div className="text-center space-y-1">
          <p className="text-xs text-slate-400">
            Les versements sont traités sous 24-48h ouvrées.
          </p>
          <p className="text-xs text-slate-400">
            Frais de traitement : 0€ (offert par AngelWatch)
          </p>
        </div>
      </main>

      {/* Request Payout Dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="rounded-[1.5rem] p-6 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Demander un versement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-accent/10 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Montant à recevoir</p>
              <p className="text-3xl font-black text-accent">€{availableForPayout.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                IBAN (optionnel)
              </label>
              <Input
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-none"
              />
              <p className="text-[10px] text-slate-400">
                Laissez vide pour un virement sur votre moyen de paiement enregistré.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setRequestOpen(false)}>
              Annuler
            </Button>
            <Button
              className="flex-1 rounded-xl bg-accent"
              disabled={requesting || availableForPayout <= 0}
              onClick={handleRequestPayout}
            >
              {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
