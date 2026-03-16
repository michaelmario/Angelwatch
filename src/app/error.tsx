
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const logoData = PlaceHolderImages.find(img => img.id === 'angelwatch-logo');

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log de l'erreur pour les administrateurs
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a111a] text-white p-6 text-center relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 hero-gradient opacity-60 pointer-events-none" />
      
      <div className="relative z-10 space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="flex flex-col items-center gap-8">
          {logoData && (
            <Image 
              src={logoData.imageUrl} 
              alt="AngelWatch Logo" 
              width={100} 
              height={100} 
              className="rounded-3xl border border-white/10"
              data-ai-hint={logoData.imageHint}
            />
          )}
          <div className="bg-yellow-500/10 p-5 rounded-3xl border border-yellow-500/20">
            <AlertCircle className="w-14 h-14 text-yellow-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Erreur du Système</h2>
          <p className="text-slate-400 max-w-md mx-auto text-lg font-medium">
            Une perturbation a été détectée dans nos services. Nos Anges techniques travaillent à rétablir la situation.
          </p>
          {error.digest && (
            <p className="text-[10px] text-slate-600 font-mono mt-4 uppercase tracking-widest">
              Code d'incident : {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button 
            onClick={() => reset()}
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-white px-10 h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Réessayer
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-10 h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" /> Accueil
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[9px] uppercase tracking-[0.4em] text-slate-600 font-bold">
          Centre de Support AngelWatch &bull; Monitoring Actif
        </p>
      </div>
    </div>
  );
}
