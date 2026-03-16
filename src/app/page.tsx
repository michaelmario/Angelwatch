
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Mic, Ban, Handshake, MapPin, Navigation, Twitter, Linkedin, Instagram, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-animate').forEach(section => {
      observerRef.current?.observe(section);
    });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: "Actions", href: "#actions" },
    { name: "Suivi Live", href: "#suivi" },
    { name: "Rejoindre", href: "#rejoindre" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - Dynamique et Responsive */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${isScrolled ? 'bg-[#0a111a]/95 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight uppercase">AngelWatch</span>
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-[10px] font-bold text-white uppercase tracking-widest hover:text-accent transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-white font-bold text-[10px] uppercase tracking-widest px-6" asChild>
              <Link href="/auth">Connexion</Link>
            </Button>
          </nav>

          {/* Nav Mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a111a] border-white/10 text-white">
                <SheetTitle className="text-white">Menu AngelWatch</SheetTitle>
                <SheetDescription className="text-slate-400">Naviguez vers nos services de sécurité.</SheetDescription>
                <nav className="flex flex-col gap-6 mt-12">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      href={link.href} 
                      className="text-lg font-bold uppercase tracking-widest hover:text-accent transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <Button className="bg-accent hover:bg-accent/90 text-white font-bold w-full mt-4" asChild>
                    <Link href="/auth">Accès Membre</Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section - Optimisée Mobile */}
      <section className="relative hero-gradient min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="max-w-4xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-[9px] md:text-[10px] font-bold text-accent uppercase tracking-widest mb-2">
            Engagement Officiel & Sécurité Routière
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-extrabold text-white leading-[1.1]">
            AngelWatch : La sécurité <br className="hidden md:block" />
            routière, notre engagement.
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-medium px-4">
            La technologie au service de la bienveillance. Ne laissez plus la route décider pour vous lors de vos soirées.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 px-4">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 h-14 rounded-md text-sm font-bold shadow-xl group w-full sm:w-auto" asChild>
              <Link href="/auth">
                <Navigation className="w-4 h-4 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                Demander un Ange
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 h-14 rounded-md text-sm font-bold w-full sm:w-auto" asChild>
              <Link href="/auth">Devenir Chauffeur</Link>
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Actions Section - Responsive Grid */}
      <section id="actions" className="py-20 md:py-32 bg-background section-animate">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Nos Actions de Prévention</h2>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <Card className="border-none shadow-sm hover:shadow-xl transition-all group bg-white/50 backdrop-blur-sm">
              <CardContent className="p-8 md:p-10 space-y-6 flex flex-col items-center text-center">
                <div className="p-5 rounded-2xl bg-accent/5 text-accent group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-500">
                  <Mic className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl">Campagnes de Sensibilisation</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Des interventions sur le terrain pour rappeler que l'amitié sauve des vies en fin de soirée.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-xl transition-all group bg-white/50 backdrop-blur-sm">
              <CardContent className="p-8 md:p-10 space-y-6 flex flex-col items-center text-center">
                <div className="p-5 rounded-2xl bg-red-50 text-red-500 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                  <Ban className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl">Stop Alcool au Volant</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Une logistique infaillible pour garantir qu'aucun conducteur inapte ne reprenne la route.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-xl transition-all group bg-white/50 backdrop-blur-sm">
              <CardContent className="p-8 md:p-10 space-y-6 flex flex-col items-center text-center">
                <div className="p-5 rounded-2xl bg-accent/5 text-accent group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-500">
                  <Handshake className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl">Partenariats Événementiels</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Présence sur les festivals et soirées pour un retour sécurisé systématique de vos véhicules.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Tracking - Responsive Layout */}
      <section id="suivi" className="py-20 md:py-32 bg-[#0a111a] text-white section-animate overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">Interface de <br className="hidden md:block" /> Tracking Live</h2>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed">
              Suivez en temps réel la position de votre Ange et l'état du rapatriement de votre véhicule via notre application intelligente.
            </p>
            <ul className="space-y-4 md:space-y-6">
              <li className="flex items-center gap-4 text-slate-300">
                <div className="p-2 rounded-lg bg-accent/20">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                Géolocalisation précise par satellite
              </li>
              <li className="flex items-center gap-4 text-slate-300">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Navigation className="w-5 h-5 text-accent" />
                </div>
                Estimation d'arrivée temps réel (ETA)
              </li>
            </ul>
          </div>
          <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group bg-slate-900 aspect-video lg:aspect-auto">
            <Image 
              src="https://picsum.photos/seed/mapdark/1200/800" 
              alt="Interface Carte" 
              fill
              className="object-cover grayscale opacity-40 group-hover:scale-110 group-hover:rotate-1 transition-transform duration-1000"
              data-ai-hint="dark map"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/90 backdrop-blur-xl px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border border-white/20 flex items-center gap-3 md:gap-4 shadow-2xl animate-pulse mx-4">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-center">VOTRE ANGE EST EN ROUTE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forms Sections - Refined for all screens */}
      <section id="rejoindre" className="py-20 md:py-32 bg-slate-50 section-animate">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Devenez un Ange</h2>
            <p className="text-muted-foreground text-base md:text-lg px-4">Contribuez activement à la sécurité de votre région.</p>
          </div>
          <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6 md:p-16 space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Prénom & Nom</label>
                  <Input placeholder="Jean Dupont" className="h-14 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-accent/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Code Postal</label>
                  <Input placeholder="75000" className="h-14 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-accent/20 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Pourquoi nous rejoindre ?</label>
                <Textarea placeholder="Parlez-nous de votre motivation..." className="min-h-[120px] bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-accent/20 transition-all p-4" />
              </div>
              <Button className="w-full h-16 bg-[#0a111a] hover:bg-[#1a2c42] text-white font-bold uppercase tracking-widest rounded-xl text-xs shadow-xl transition-all active:scale-95">
                Déposer ma candidature
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="contact" className="py-20 md:py-32 bg-white border-t border-slate-100 section-animate">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Besoin d'un Ange ?</h2>
            <p className="text-muted-foreground text-base md:text-lg">Réservation immédiate pour un retour serein.</p>
          </div>
          <div className="bg-[#0a111a] rounded-[2rem] md:rounded-[3rem] p-6 md:p-20 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 relative z-10">
              <div className="space-y-4">
                <Input placeholder="Nom Complet" className="h-16 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:bg-white/10" />
                <Input placeholder="Lieu de récupération" className="h-16 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:bg-white/10" />
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Input type="text" placeholder="23:30" className="h-16 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl pr-16 focus:bg-white/10" />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Heure</div>
                </div>
                <Button size="lg" className="w-full h-16 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95">
                  Confirmer la demande
                </Button>
              </div>
            </div>
            <p className="text-center text-slate-500 text-[10px] md:text-xs tracking-widest uppercase">Service disponible 24/7 pour votre sécurité</p>
          </div>
        </div>
      </section>

      {/* Footer - Complet et Responsive */}
      <footer className="bg-[#0a111a] text-white py-16 md:py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-10 md:space-y-12">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold uppercase tracking-tighter">AngelWatch</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 gap-y-4">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">{link.name}</Link>
            ))}
            <Link href="/auth" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Connexion</Link>
          </nav>
          <div className="flex gap-6 md:gap-8">
            <Link href="#" className="p-3 md:p-4 bg-white/5 rounded-2xl hover:bg-accent hover:text-white transition-all duration-300"><Twitter className="w-5 h-5" /></Link>
            <Link href="#" className="p-3 md:p-4 bg-white/5 rounded-2xl hover:bg-accent hover:text-white transition-all duration-300"><Instagram className="w-5 h-5" /></Link>
            <Link href="#" className="p-3 md:p-4 bg-white/5 rounded-2xl hover:bg-accent hover:text-white transition-all duration-300"><Linkedin className="w-5 h-5" /></Link>
          </div>
          <div className="text-center space-y-2 px-4">
            <p className="text-slate-500 text-[9px] md:text-xs tracking-widest uppercase">© 2024 AngelWatch Initiative. Tous droits réservés.</p>
            <p className="text-slate-600 text-[9px] md:text-[10px]">La sécurité routière est l'affaire de tous. Conduisez avec prudence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
