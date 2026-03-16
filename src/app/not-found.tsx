
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ChevronLeft } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const logoData = PlaceHolderImages.find(img => img.id === 'angelwatch-logo');

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a111a] text-white p-6 text-center relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 hero-gradient opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 space-y-10 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center gap-8">
          {logoData && (
            <Image 
              src={logoData.imageUrl} 
              alt="AngelWatch Logo" 
              width={120} 
              height={120} 
              className="rounded-[2.5rem] shadow-2xl animate-pulse-subtle border border-white/10"
              data-ai-hint={logoData.imageHint}
            />
          )}
          <div className="bg-red-500/10 p-5 rounded-3xl border border-red-500/20 backdrop-blur-sm">
            <ShieldAlert className="w-14 h-14 text-red-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase opacity-20 absolute -top-10 left-1/2 -translate-x-1/2 select-none">404</h1>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Oups ! Page introuvable</h2>
          <p className="text-slate-400 max-w-md mx-auto text-lg font-medium leading-relaxed">
            Il semble que l'Ange que vous cherchez ait pris une autre route. Cette page n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white px-10 h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all active:scale-95">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" /> Retour à l'accueil
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-10 h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] backdrop-blur-md transition-all active:scale-95" onClick={() => window.history.back()}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Page précédente
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[9px] uppercase tracking-[0.4em] text-slate-600 font-bold">
          AngelWatch Security Initiative &bull; Système de Protection
        </p>
      </div>
    </div>
  );
}
