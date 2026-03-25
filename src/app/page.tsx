
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield, Mic, Ban, Handshake, MapPin, Navigation,
  Twitter, Linkedin, Instagram, Menu, ChevronRight,
  Settings, Mail, Phone, Clock as ClockIcon,
  User, LogOut, LayoutDashboard, Car, Loader2, CheckCircle
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';



// Form state helpers
const emptyRejoindre = { name: '', email: '', phone: '', postalCode: '', motivation: '', drivingLicenseUrl: '' };
const emptyContact = { name: '', email: '', subject: '', message: '' };
const emptyReservation = { name: '', pickupLocation: '', desiredTime: '' };

export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const db = useFirestore();
  const auth = useAuth();
  const { user: authUser } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const profileRef = useMemo(
    () => (authUser ? doc(db, 'users', authUser.uid) : null),
    [db, authUser]
  );
  const { data: userProfile } = useDoc<UserProfile>(profileRef);

  // Form states
  const [rejoindre, setRejoindre] = useState(emptyRejoindre);
  const [contact, setContact] = useState(emptyContact);
  const [reservation, setReservation] = useState(emptyReservation);

  const [rejoindreLoading, setRejoindreLoading] = useState(false);
  const [rejoindreSuccess, setRejoindreSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    observerRef.current = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.section-animate').forEach(s => observerRef.current?.observe(s));

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.refresh();
  };

  const submitRejoindre = async () => {
    if (!rejoindre.name || !rejoindre.postalCode || !rejoindre.email) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir le nom, email et code postal.', variant: 'destructive' }); return;
    }
    setRejoindreLoading(true);
    try {
      await addDoc(collection(db, 'applications'), {
        ...rejoindre, status: 'pending', createdAt: new Date().toISOString()
      });
      setRejoindreSuccess(true);
      setRejoindre(emptyRejoindre);
      toast({ title: 'Candidature envoyée !', description: 'Nous vous contacterons bientôt.' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setRejoindreLoading(false);
    }
  };

  const submitContact = async () => {
    if (!contact.name || !contact.email || !contact.message) {
      toast({ title: 'Champs requis', variant: 'destructive' }); return;
    }
    setContactLoading(true);
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...contact, read: false, createdAt: new Date().toISOString()
      });
      setContactSuccess(true);
      setContact(emptyContact);
      toast({ title: 'Message envoyé !', description: 'Nous vous répondrons rapidement.' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setContactLoading(false);
    }
  };

  const submitReservation = async () => {
    if (!reservation.name || !reservation.pickupLocation) {
      toast({ title: 'Champs requis', variant: 'destructive' }); return;
    }
    setReservationLoading(true);
    try {
      await addDoc(collection(db, 'quickBookings'), {
        ...reservation, status: 'pending', createdAt: new Date().toISOString()
      });
      setReservationSuccess(true);
      setReservation(emptyReservation);
      toast({ title: 'Demande confirmée !', description: 'Un Ange vous sera assigné.' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setReservationLoading(false);
    }
  };

  const navLinks = [
    { name: "Actions", href: "#actions" },
    { name: "Suivi Live", href: "#suivi" },
    { name: "Rejoindre", href: "#rejoindre" },
    { name: "Réservation", href: "#reservation" },
    { name: "Contact", href: "#contact" },
  ];

  const dashboardHref = userProfile?.role === 'driver' ? '/driver' : userProfile?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${isScrolled ? 'bg-[#0a111a]/95 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/icons/icon-96x96.png" priority alt="AngelWatch Logo" width={48} height={48} className="rounded-xl group-hover:scale-110 transition-transform" />
            <span className="text-xl font-extrabold text-white tracking-tighter uppercase">AngelWatch</span>
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href} className="text-[10px] font-bold text-white uppercase tracking-widest hover:text-accent transition-colors">{link.name}</Link>
            ))}
            {userProfile?.role === 'admin' && (
              <Link href="/admin" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5">
                <Settings className="w-3 h-3" /> Admin
              </Link>
            )}

            {/* Logged-in user avatar dropdown OR login button */}
            {authUser && userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-3 py-2 text-white">
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center font-black text-sm">
                      {userProfile.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest max-w-[90px] truncate">{userProfile.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 shadow-2xl border-white/10">
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link href={dashboardHref} className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-accent" />
                      {userProfile.role === 'driver' ? 'Panel Chauffeur' : 'Tableau de bord'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" /> Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer text-red-500 focus:text-red-500">
                    <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-white font-bold text-[10px] uppercase tracking-widest px-6 h-10 rounded-full" asChild>
                <Link href="/auth">Connexion</Link>
              </Button>
            )}
          </nav>

          {/* Nav Mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white"><Menu className="w-6 h-6" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a111a] border-white/10 text-white">
                <SheetTitle className="text-white">Menu AngelWatch</SheetTitle>
                <SheetDescription className="text-slate-400">Naviguez vers nos services de sécurité.</SheetDescription>
                <nav className="flex flex-col gap-6 mt-12">
                  {navLinks.map(link => (
                    <Link key={link.name} href={link.href} className="text-lg font-bold uppercase tracking-widest hover:text-accent transition-colors">{link.name}</Link>
                  ))}
                  {authUser && userProfile ? (
                    <>
                      <Link href={dashboardHref} className="text-lg font-bold uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5" /> Tableau de bord
                      </Link>
                      <Link href="/profile" className="text-lg font-bold uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-2">
                        <User className="w-5 h-5" /> Mon Profil
                      </Link>
                      <Button className="bg-red-600 hover:bg-red-700 text-white font-bold w-full mt-2 h-14 rounded-xl" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                      </Button>
                    </>
                  ) : (
                    <Button className="bg-accent hover:bg-accent/90 text-white font-bold w-full mt-4 h-14 rounded-xl" asChild>
                      <Link href="/auth">Accès Membre</Link>
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative min-h-[60vh] sm:min-h-screen flex flex-col items-center pb-12 text-center px-6 bg-cover bg-center bg-no-repeat bg-[#0f172a]"
        style={{ backgroundImage: 'url(/hero-bg.png)' }}
      >
        <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay for better CTA contrast */}

        {/* Dynamic spacer to push content below the central logo in the background image */}
        <div className="h-[40vh] sm:h-[60vh] pointer-events-none" />

        {/* Visible Mission Statement */}
        <div className="relative z-20 max-w-2xl px-4 animate-in fade-in duration-1000 pt-24 md:pt-0">
           <p className="text-lg md:text-2xl lg:hidden text-white font-medium drop-shadow-2xl opacity-90 leading-relaxed">
             La sécurité routière, notre engagement. <br className="hidden md:block" />
             La technologie au service de la bienveillance.
           </p>
        </div>

        {/* CTA Buttons pushed to the bottom and hidden on mobile */}
        <div className="mt-auto relative z-20 hidden sm:flex w-full max-w-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="flex flex-row gap-6 justify-center w-full">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 h-16 rounded-xl text-sm font-bold shadow-2xl group uppercase tracking-widest flex-1" asChild>
              <Link href={authUser ? dashboardHref : '/auth'}>
                Demander un Ange <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 px-8 h-16 rounded-xl text-sm font-bold uppercase tracking-widest flex-1" asChild>
              <Link href="/auth">Devenir Chauffeur</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-30 z-10 hidden sm:block">
          <div className="w-1 h-8 bg-white rounded-full" />
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
            {[
              { icon: <Mic className="w-12 h-12" />, title: 'Sensibilisation', desc: "Interventions terrain pour rappeler que l'amitié sauve des vies en fin de soirée.", color: 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white' },
              { icon: <Ban className="w-12 h-12" />, title: 'Stop Alcool au Volant', desc: "Logistique infaillible pour garantir qu'aucun conducteur inapte ne reprenne la route.", color: 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white' },
              { icon: <Handshake className="w-12 h-12" />, title: 'Partenariats Soirées', desc: "Présence sur festivals pour un retour sécurisé systématique de vos véhicules.", color: 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white' },
            ].map(item => (
              <Card key={item.title} className="border-none shadow-xl hover:shadow-2xl transition-all group bg-slate-50 rounded-3xl overflow-hidden">
                <CardContent className="p-10 space-y-6 flex flex-col items-center text-center">
                  <div className={`p-6 rounded-3xl transition-all duration-500 ${item.color}`}>{item.icon}</div>
                  <h3 className="font-bold text-2xl text-[#0a111a]">{item.title}</h3>
                  <p className="text-slate-500 text-base leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live Tracking */}
      <section id="suivi" className="py-24 bg-[#0a111a] text-white section-animate">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tighter">Interface de <br /> Tracking Live</h2>
            <p className="text-slate-400 text-xl leading-relaxed">Suivez en temps réel la position de votre Ange et l'état du rapatriement de votre véhicule via notre application intelligente.</p>
            <div className="space-y-6">
              {[
                { icon: <MapPin className="w-6 h-6 text-accent group-hover:text-white" />, text: 'Géolocalisation précise par satellite' },
                { icon: <Navigation className="w-6 h-6 text-accent group-hover:text-white" />, text: "Estimation d'arrivée temps réel (ETA)" },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-6 group">
                  <div className="p-4 rounded-2xl bg-accent/20 group-hover:bg-accent transition-colors">{item.icon}</div>
                  <span className="text-lg font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 group aspect-video">
            <Image src="https://picsum.photos/seed/mapdark/1200/800" alt="Interface Carte" fill className="object-cover grayscale opacity-40 group-hover:scale-110 transition-transform duration-1000" data-ai-hint="dark map" />
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
              {rejoindreSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-black text-[#0a111a]">Candidature envoyée !</h3>
                  <p className="text-slate-500">Nous vous contacterons prochainement. Merci de rejoindre les Anges !</p>
                  <Button variant="outline" className="rounded-2xl" onClick={() => setRejoindreSuccess(false)}>Envoyer une autre candidature</Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Prénom & Nom</label>
                      <Input value={rejoindre.name} onChange={e => setRejoindre(p => ({ ...p, name: e.target.value }))} placeholder="Jean Dupont" className="h-16 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-accent/20 transition-all text-lg px-6" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Code Postal</label>
                      <Input value={rejoindre.postalCode} onChange={e => setRejoindre(p => ({ ...p, postalCode: e.target.value }))} placeholder="97420" className="h-16 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-accent/20 transition-all text-lg px-6" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                      <Input value={rejoindre.email} onChange={e => setRejoindre(p => ({ ...p, email: e.target.value }))} placeholder="jean@email.re" type="email" className="h-16 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-accent/20 transition-all text-lg px-6" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Téléphone</label>
                      <Input value={rejoindre.phone} onChange={e => setRejoindre(p => ({ ...p, phone: e.target.value }))} placeholder="+262 692 00 00 00" type="tel" className="h-16 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-accent/20 transition-all text-lg px-6" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lien permis de conduire (URL Photo)</label>
                    <Input value={rejoindre.drivingLicenseUrl} onChange={e => setRejoindre(p => ({ ...p, drivingLicenseUrl: e.target.value }))} placeholder="https://..." type="url" className="h-16 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-accent/20 transition-all text-lg px-6" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Votre Motivation</label>
                    <Textarea value={rejoindre.motivation} onChange={e => setRejoindre(p => ({ ...p, motivation: e.target.value }))} placeholder="Pourquoi souhaitez-vous nous rejoindre ?" className="min-h-[160px] bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-accent/20 transition-all p-6 text-lg resize-none" />
                  </div>
                  <Button onClick={submitRejoindre} disabled={rejoindreLoading} className="w-full h-16 bg-[#0a111a] hover:bg-[#1a2c42] text-white font-bold uppercase tracking-[0.2em] rounded-2xl text-xs shadow-xl transition-all active:scale-[0.98]">
                    {rejoindreLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Déposer ma candidature
                  </Button>
                </>
              )}
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
            {reservationSuccess ? (
              <div className="text-center py-10 space-y-4 relative z-10">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-black text-white">Demande confirmée !</h3>
                <p className="text-slate-400">Un Ange vous sera assigné. Restez disponible.</p>
                <Button variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10" onClick={() => setReservationSuccess(false)}>Nouvelle réservation</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
                  <div className="space-y-6">
                    <Input value={reservation.name} onChange={e => setReservation(p => ({ ...p, name: e.target.value }))} placeholder="Nom Complet" className="h-16 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:bg-white/10 text-lg px-6" />
                    <Input value={reservation.pickupLocation} onChange={e => setReservation(p => ({ ...p, pickupLocation: e.target.value }))} placeholder="Lieu de récupération" className="h-16 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:bg-white/10 text-lg px-6" />
                  </div>
                  <div className="space-y-6">
                    <Input value={reservation.desiredTime} onChange={e => setReservation(p => ({ ...p, desiredTime: e.target.value }))} type="text" placeholder="Heure souhaitée (ex: 23:30)" className="h-16 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:bg-white/10 text-lg px-6" />
                    <Button onClick={submitReservation} disabled={reservationLoading} size="lg" className="w-full h-16 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl shadow-2xl uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98]">
                      {reservationLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Confirmer la demande
                    </Button>
                  </div>
                </div>
                <p className="text-center text-slate-500 text-[10px] tracking-[0.3em] uppercase relative z-10">Service disponible 24/7 pour votre sécurité</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Contact & Map Section */}
      <section id="contact" className="py-24 bg-slate-50 section-animate">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-extrabold text-[#0a111a] tracking-tight">Nous Contacter</h2>
                <p className="text-slate-500 text-lg leading-relaxed">Une question ? Un partenariat ? Notre équipe est à votre écoute.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { icon: <Phone className="w-5 h-5" />, label: 'Téléphone', value: '+262 692 00 00 00' },
                  { icon: <Mail className="w-5 h-5" />, label: 'Email', value: 'contact@angelwatch.re' },
                  { icon: <MapPin className="w-5 h-5" />, label: 'Siège Social', value: 'Av. Du 14 Juillet 1789\nLe Port 97420, La Réunion' },
                  { icon: <ClockIcon className="w-5 h-5" />, label: 'Horaires', value: '24/7 Service Intervention' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="p-3 bg-accent/10 rounded-xl text-accent">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-[#0a111a] text-sm uppercase tracking-wider">{item.label}</h4>
                      <p className="text-slate-500 whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {contactSuccess ? (
                <div className="bg-green-50 rounded-3xl p-8 text-center space-y-3 border border-green-100">
                  <CheckCircle className="w-10 h-10 text-green-600 mx-auto" />
                  <h3 className="font-bold text-green-800">Message envoyé !</h3>
                  <p className="text-green-600 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                  <Button variant="outline" size="sm" className="rounded-2xl border-green-200" onClick={() => setContactSuccess(false)}>Nouveau message</Button>
                </div>
              ) : (
                <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input value={contact.name} onChange={e => setContact(p => ({ ...p, name: e.target.value }))} placeholder="Votre Nom" className="h-14 bg-slate-50 border-none rounded-xl" />
                      <Input value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))} placeholder="Votre Email" type="email" className="h-14 bg-slate-50 border-none rounded-xl" />
                    </div>
                    <Input value={contact.subject} onChange={e => setContact(p => ({ ...p, subject: e.target.value }))} placeholder="Sujet" className="h-14 bg-slate-50 border-none rounded-xl" />
                    <Textarea value={contact.message} onChange={e => setContact(p => ({ ...p, message: e.target.value }))} placeholder="Votre message..." className="min-h-[120px] bg-slate-50 border-none rounded-xl p-4 resize-none" />
                    <Button onClick={submitContact} disabled={contactLoading} className="w-full h-14 bg-[#0a111a] hover:bg-[#1a2c42] text-white font-bold rounded-xl uppercase tracking-widest text-xs">
                      {contactLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Envoyer le message
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Map */}
            <div className="relative h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14905.377022798384!2d55.297597287324834!3d-20.938685941689126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2182888a843b7097%3A0x5fae8eaaa5fb78e3!2sAv.%20Du%2014%20Juillet%201789%2C%20Le%20Port%2097420%2C%20La%20R%C3%A9union!5e0!3m2!1sfr!2sfr!4v1773650547018!5m2!1sfr!2sfr"
                width="100%" height="100%"
                style={{ border: 0 }}
                allowFullScreen loading="lazy"
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
            <Image src="/icons/icon-128x128.png" alt="AngelWatch Logo Footer" width={64} height={64} className="rounded-2xl" />
            <span className="text-2xl font-bold uppercase tracking-tighter">AngelWatch</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">{link.name}</Link>
            ))}
            {!authUser && <Link href="/auth" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Connexion</Link>}
            {authUser && <Link href="/profile" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Mon Profil</Link>}
            {userProfile?.role === 'admin' && <Link href="/admin" className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent hover:text-white transition-colors">Administration</Link>}
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
