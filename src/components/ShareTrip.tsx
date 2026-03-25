"use client";

import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ShareTripProps {
  requestId: string;
}

export function ShareTrip({ requestId }: ShareTripProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track/${requestId}`
    : `/track/${requestId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: 'Lien copié !', description: 'Partagez ce lien avec vos proches.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de copier le lien.', variant: 'destructive' });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AngelWatch - Suivi de mission',
          text: 'Suivez ma mission AngelWatch en temps réel',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed - not an error
      }
    } else {
      setOpen(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 h-12 rounded-xl border-slate-200 font-bold text-slate-600"
          onClick={handleNativeShare}
        >
          <Share2 className="w-4 h-4 mr-2" /> Partager le suivi
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[1.5rem] p-6 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Partager le suivi</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-500">
            Vos proches peuvent suivre votre mission en temps réel via ce lien :
          </p>

          <div className="flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="flex-1 h-12 rounded-xl bg-slate-50 border-slate-100 text-sm font-mono"
            />
            <Button
              size="lg"
              className="h-12 rounded-xl"
              onClick={handleCopy}
              variant={copied ? 'default' : 'outline'}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl"
            asChild
          >
            <a href={shareUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> Ouvrir le lien
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
