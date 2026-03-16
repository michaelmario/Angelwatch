
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Mic, 
  Ban, 
  Handshake, 
  MapPin, 
  Navigation, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Menu, 
  ChevronRight, 
  Settings,
  Mail,
  Phone,
  Clock as ClockIcon
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';

const logoData = PlaceHolderImages.find(img => img.id === 'angelwatch-logo');

export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const db = useFirestore();
  const { user: authUser } = useUser();
  const profileRef = authUser ? doc(db, 'users', authUser.uid) : null;
  const { data: userProfile } = useDoc<UserProfile>(profileRef);

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
    { name: "Réservation", href: "#reservation" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${isScrolled ? 'bg-[#0a111a]/95 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {logoData && (
              <Image 
                src={logoData.imageUrl} 
                alt="AngelWatch Logo" 
                width={48} 
                height={48} 
                className="rounded-xl group-hover:scale-110 transition-transform"
                data-ai-hint={logoData.imageHint}
              />
            )}
            <span className="text-xl font-extrabold text-white tracking-tighter uppercase">AngelWatch</span>
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
            {userProfile?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="text-[10px] font-bold text-accent uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Settings className="w-3 h-3" /> Admin
              </Link>
            )}
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-white font-bold text-[10px] uppercase tracking-widest px-6 h-10 rounded-full" asChild>
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
                  {userProfile?.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="text-lg font-bold uppercase tracking-widest text-accent hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-5 h-5" /> Console Admin
                    </Link>
                  )}
                  <Button className="bg-accent hover:bg-accent/90 text-white font-bold w-full mt-4 h-14 rounded-xl" asChild>
                    <Link href="/auth">Accès Membre</Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative hero-gradient min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="flex flex-col items-center gap-6">
             {logoData && (
               <Image 
                 src={logoData.imageUrl} 
                 alt="AngelWatch Main Logo" 
                 width={120} 
                 height={120} 
                 className="rounded-3xl shadow-2xl"
                 data-ai-hint={logoData.imageHint}
               />
             )}
             <h1 className="text-4xl sm:text-5xl md:text-8xl font-extrabold text-white leading-tight tracking-tighter">
              AngelWatch
            </h1>
          </div>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            La sécurité routière, notre engagement. <br className="hidden md:block" />
            La technologie au service de la bienveillance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 h-16 rounded-xl text-sm font-bold shadow-2xl group w-full sm:w-auto uppercase tracking-widest" asChild>
              <Link href="/auth">
                Demander un Ange <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 h-16 rounded-xl text-sm font-bold w-full sm:w-auto uppercase tracking-widest" asChild>
              <Link href="/auth">Devenir Chauffeur</Link>
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
            <div className="w-1 h-12 bg-white rounded-full" />
        </div>
      </section>

      {/* Actions Section */}
      <section id="actions" className="py-24 bg-white section-animate">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0a111a] tracking-tight">Nos Actions de Prévention</h2>
            <div className="w-24 h-1.5 bg-accent mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <Card className="border-none shadow-xl hover:shadow-2xl transition-all group bg-slate-50 rounded-3xl overflow-hidden">
              <CardContent className="p-10 space-y-6 flex flex-col items-center">
                <div className="p-6 rounded-3xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                  <Mic className="w-12 h-12" />
                </div>
                <h3 className="font-bold text-2xl text-[#0a111a]">Sensibilisation</h3>
                <p className="text-slate-500 text-base leading-relaxed">
                  Interventions terrain pour rappeler que l'amitié sauve des vies en fin de soirée.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl hover:shadow-2xl transition-all group bg-slate-50 rounded-3xl overflow-hidden">
              <CardContent className="p-10 space-y-6 flex flex-col items-center text-center">
                <div className="p-6 rounded-3xl bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                  <Ban className="w-12 h-12" />
                </div>
                <h3 className="font-bold text-2xl text-[#0a111a]">Stop Alcool au Volant</h3>
                <p className="text-slate-500 text-base leading-relaxed">
                  Logistique infaillible pour garantir qu'aucun conducteur inapte ne reprenne la route.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl hover:shadow-2xl transition-all group bg-slate-50 rounded-3xl overflow-hidden">
              <CardContent className="p-10 space-y-6 flex flex-col items-center text-center">
                <div className="p-6 rounded-3xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                  <Handshake className="w-12 h-12" />
                </div>
                <h3 className="font-bold text-2xl text-[#0a111a]">Partenariats Soirées</h3>
                <p className="text-slate-500 text-base leading-relaxed">
                  Présence sur festivals pour un retour sécurisé systématique de vos véhicules.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Tracking */}
      <section id="suivi" className="py-24 bg-[#0a111a] text-white section-animate">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tighter">Interface de <br /> Tracking Live</h2>
            <p className="text-slate-400 text-xl leading-relaxed">
              Suivez en temps réel la position de votre Ange et l'état du rapatriement de votre véhicule via notre application intelligente.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-6 group">
                <div className="p-4 rounded-2xl bg-accent/20 group-hover:bg-accent transition-colors">
                  <MapPin className="w-6 h-6 text-accent group-hover:text-white" />
                </div>
                <span className="text-lg font-semibold">Géolocalisation précise par satellite</span>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="p-4 rounded-2xl bg-accent/20 group-hover:bg-accent transition-colors">
                  <Navigation className="w-6 h-6 text-accent group-hover:text-white" />
                </div>
                <span className="text-lg font-semibold">Estimation d'arrivée temps réel (ETA)</span>
              </div>
            </div>
          </div>
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 group aspect-video">
            <Image 
              src="https://picsum.photos/seed/mapdark/1200/800" 
              alt="Interface Carte" 
              fill
              className="object-cover grayscale opacity-40 group-hover:scale-110 transition-transform duration-1000"
              data-ai-hint="dark map"
            />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="bg-[#0a111a]/90 backdrop-blur-2xl px-8 py-6 rounded-3xl border border-white/20 flex items-center gap-4 shadow-2xl animate-pulse">
                <div className="w-4 h-4 bg-accent rounded-full animate-ping" />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Votre Ange est en route</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rejoindre Form */}
      <section id="rejoindre" className="py-24 bg-slate-50 section-animate">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0a111a]">Devenez un Ange</h2>
            <p className="text-slate-500 text-xl font-medium">Contribuez activement à la sécurité routière.</p>
          </div>
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="p-8 md:p-16 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Prénom & Nom</label>
                  <Input placeholder="Jean Dupont" className="h-16 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-accent/20 transition-all text-lg px-6" />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Code Postal</label>
                  <Input placeholder="75000" className="h-16 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-accent/20 transition-all text-lg px-6" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Votre Motivation</label>
                <Textarea placeholder="Pourquoi souhaitez-vous nous rejoindre ?" className="min-h-[160px] bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-accent/20 transition-all p-6 text-lg resize-none" />
              </div>
              <Button className="w-full h-16 bg-[#0a111a] hover:bg-[#1a2c42] text-white font-bold uppercase tracking-[0.2em] rounded-2xl text-xs shadow-xl transition-all active:scale-[0.98]">
                Déposer ma candidature
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Reservation Form */}
      <section id="reservation" className="py-24 bg-white section-animate">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0a111a]">Besoin d'un Ange ?</h2>
            <p className="text-slate-500 text-xl">Réservation immédiate pour un retour serein.</p>
          </div>
          <div className="bg-[#0a111a] rounded-[3rem] p-8 md:p-20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/10 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
              <div className="space-y-6">
                <Input placeholder="Nom Complet" className="h-16 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:bg-white/10 text-lg px-6" />
                <Input placeholder="Lieu de récupération" className="h-16 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:bg-white/10 text-lg px-6" />
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <Input type="text" placeholder="Heure souhaitée (ex: 23:30)" className="h-16 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:bg-white/10 text-lg px-6" />
                </div>
                <Button size="lg" className="w-full h-16 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl shadow-2xl uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98]">
                  Confirmer la demande
                </Button>
              </div>
            </div>
            <p className="text-center text-slate-500 text-[10px] tracking-[0.3em] uppercase relative z-10">Service disponible 24/7 pour votre sécurité</p>
          </div>
        </div>
      </section>

      {/* Contact & Map Section */}
      <section id="contact" className="py-24 bg-slate-50 section-animate">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Contact Form & Info */}
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-extrabold text-[#0a111a] tracking-tight">Nous Contacter</h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                  Une question ? Un partenariat ? Notre équipe est à votre écoute pour assurer votre sécurité et celle de vos proches.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0a111a] text-sm uppercase tracking-wider">Téléphone</h4>
                    <p className="text-slate-500">+262 692 00 00 00</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0a111a] text-sm uppercase tracking-wider">Email</h4>
                    <p className="text-slate-500">contact@angelwatch.re</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0a111a] text-sm uppercase tracking-wider">Siège Social</h4>
                    <p className="text-slate-500">Av. Du 14 Juillet 1789<br />Le Port 97420, La Réunion</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                    <ClockIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0a111a] text-sm uppercase tracking-wider">Horaires</h4>
                    <p className="text-slate-500">24/7 Service Intervention</p>
                  </div>
                </div>
              </div>

              <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input placeholder="Votre Nom" className="h-14 bg-slate-50 border-none rounded-xl" />
                    <Input placeholder="Votre Email" className="h-14 bg-slate-50 border-none rounded-xl" />
                  </div>
                  <Input placeholder="Sujet" className="h-14 bg-slate-50 border-none rounded-xl" />
                  <Textarea placeholder="Votre message..." className="min-h-[120px] bg-slate-50 border-none rounded-xl p-4 resize-none" />
                  <Button className="w-full h-14 bg-[#0a111a] hover:bg-[#1a2c42] text-white font-bold rounded-xl uppercase tracking-widest text-xs">
                    Envoyer le message
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Map Section */}
            <div className="relative h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14905.377022798384!2d55.297597287324834!3d-20.938685941689126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2182888a843b7097%3A0x5fae8eaaa5fb78e3!2sAv.%20Du%2014%20Juillet%201789%2C%20Le%20Port%2097420%2C%20La%20R%C3%A9union!5e0!3m2!1sfr!2sfr!4v1773650547018!5m2!1sfr!2sfr" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-80 contrast-125 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
              <div className="absolute top-6 left-6 bg-[#0a111a] text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Notre Localisation</p>
                <p className="text-sm font-bold">AngelWatch Hub Réunion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a111a] text-white py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-12">
          <div className="flex flex-col items-center gap-4">
             {logoData && (
               <Image 
                 src={logoData.imageUrl} 
                 alt="AngelWatch Logo Footer" 
                 width={64} 
                 height={64} 
                 className="rounded-2xl"
                 data-ai-hint={logoData.imageHint}
               />
             )}
             <span className="text-2xl font-bold uppercase tracking-tighter">AngelWatch</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">{link.name}</Link>
            ))}
            <Link href="/auth" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Connexion</Link>
            {userProfile?.role === 'admin' && (
              <Link href="/admin" className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent hover:text-white transition-colors">Administration</Link>
            )}
          </nav>
          <div className="flex gap-8">
            <Link href="#" className="p-4 bg-white/5 rounded-2xl hover:bg-accent hover:text-white transition-all duration-300"><Twitter className="w-6 h-6" /></Link>
            <Link href="#" className="p-4 bg-white/5 rounded-2xl hover:bg-accent hover:text-white transition-all duration-300"><Instagram className="w-6 h-6" /></Link>
            <Link href="#" className="p-4 bg-white/5 rounded-2xl hover:bg-accent hover:text-white transition-all duration-300"><Linkedin className="w-6 h-6" /></Link>
          </div>
          <div className="text-center space-y-3">
            <p className="text-slate-500 text-[10px] tracking-[0.2em] uppercase">© 2024 AngelWatch Initiative. Tous droits réservés.</p>
            <p className="text-slate-600 text-[10px]">La sécurité routière est l'affaire de tous. Conduisez avec prudence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
