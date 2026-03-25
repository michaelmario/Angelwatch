"use client";

import React, { useState } from 'react';
import { Star, X, Loader2, Heart, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface RatingModalProps {
  requestId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  onClose: () => void;
}

const TIP_AMOUNTS = [2, 5, 10, 15];

export function RatingModal({ requestId, reviewerId, reviewerName, revieweeId, revieweeName, onClose }: RatingModalProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [step, setStep] = useState<'rate' | 'tip'>('rate');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState('');
  const [skipTip, setSkipTip] = useState(false);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({ title: 'Veuillez noter la mission', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        requestId,
        reviewerId,
        reviewerName,
        revieweeId,
        revieweeName,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      });
      setSaving(false);
      // Move to tip step
      setStep('tip');
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'enregistrer l\'avis.', variant: 'destructive' });
      setSaving(false);
    }
  };

  const handleSubmitTip = async () => {
    setSaving(true);
    try {
      // Determine final tip amount
      let finalTip = 0;
      if (!skipTip) {
        if (tipAmount !== null) {
          finalTip = tipAmount;
        } else if (customTip) {
          finalTip = parseFloat(customTip);
          if (isNaN(finalTip) || finalTip < 0) {
            toast({ title: 'Montant invalide', variant: 'destructive' });
            setSaving(false);
            return;
          }
        }
      }

      if (finalTip > 0) {
        // Create tip record
        await addDoc(collection(db, 'tips'), {
          requestId,
          driverId: revieweeId,
          driverName: revieweeName,
          clientId: reviewerId,
          clientName: reviewerName,
          amount: finalTip,
          createdAt: new Date().toISOString(),
        });
        toast({ title: 'Pourboire envoyé !', description: `Merci pour votre générosité !` });
      }

      onClose();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer le pourboire.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (step === 'tip') {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 animate-in slide-in-from-bottom-10 duration-500 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-black text-[#0a111a]">Laisser un pourboire ?</h2>
            <p className="text-slate-500 text-sm">
              {revieweeName} a terminé la mission. Un petit geste pour remercier ?
            </p>
          </div>

          {/* Tip amounts */}
          <div className="grid grid-cols-4 gap-2">
            {TIP_AMOUNTS.map(amount => (
              <button
                key={amount}
                onClick={() => { setTipAmount(amount); setCustomTip(''); }}
                className={`h-14 rounded-2xl font-bold text-lg transition-all ${
                  tipAmount === amount && !customTip
                    ? 'bg-accent text-white shadow-lg scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                €{amount}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
            <input
              type="number"
              placeholder="Autre montant..."
              value={customTip}
              onChange={e => { setCustomTip(e.target.value); setTipAmount(null); }}
              className="w-full h-14 pl-8 pr-4 rounded-2xl bg-slate-50 border-none text-lg font-medium focus:ring-2 focus:ring-accent/20"
              min="0"
              step="0.50"
            />
          </div>

          {/* Skip option */}
          <button
            onClick={() => { setSkipTip(true); }}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 underline"
          >
            Non merci, pas de pourboire
          </button>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-2xl h-12 text-slate-500"
            >
              Plus tard
            </Button>
            <Button
              onClick={handleSubmitTip}
              disabled={saving}
              className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-2xl h-12 font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4 mr-2" />}
              {skipTip || tipAmount !== null || customTip ? 'Envoyer' : 'Ignorer'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Rating step
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 animate-in slide-in-from-bottom-10 duration-500 space-y-6">
        {/* Close */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#0a111a]">Mission terminée !</h2>
            <p className="text-slate-500 text-sm">Notez votre expérience avec {revieweeName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-125 active:scale-110"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  (hover || rating) >= star
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-200'
                }`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-sm font-bold text-slate-500">
            {['', 'Très décevant', 'Décevant', 'Correct', 'Bien', 'Excellent !'][rating]}
          </p>
        )}

        {/* Comment */}
        <Textarea
          placeholder="Commentaire optionnel..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="rounded-2xl bg-slate-50 border-none resize-none focus:ring-2 focus:ring-accent/20"
          rows={3}
        />

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-2xl h-12 text-slate-500">
            Plus tard
          </Button>
          <Button
            onClick={handleSubmitRating}
            disabled={saving || rating === 0}
            className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-2xl h-12 font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Envoyer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
