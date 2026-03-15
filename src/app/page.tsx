
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Mic, Ban, Handshake, MapPin, Navigation, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight uppercase">AngelWatch</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-xs font-bold text-white uppercase tracking-widest hover:text-accent transition-colors">Actions</Link>
          <Link href="#" className="text-xs font-bold text-white uppercase tracking-widest hover:text-accent transition-colors">Suivi Live</Link>
          <Link href="#" className="text-xs font-bold text-white uppercase tracking-widest hover:text-accent transition-colors">Rejoindre</Link>
          <Link href="#" className="text-xs font-bold text-white uppercase tracking-widest hover:text-accent transition-colors">Contact</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative hero-gradient min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-[10px] font-bold text-accent uppercase tracking-widest mb-4">
            Engagement Officiel
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            AngelWatch : La sécurité <br />
            routière, notre engagement.
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            La technologie au service de la bienveillance. Ne laissez plus la route décider pour vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 h-14 rounded-md text-sm font-bold shadow-xl" asChild>
              <Link href="/auth"><Navigation className="w-4 h-4 mr-2" /> Demander un Ange</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 h-14 rounded-md text-sm font-bold" asChild>
              <Link href="/auth">Devenir Chauffeur</Link>
            </Button>
          </div>
        </div>
        
        {/* Abstract shape overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Prevention Actions */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary mb-16">Nos Actions de Prévention</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-10 space-y-6 flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-accent/5 text-accent group-hover:scale-110 transition-transform">
                  <Mic className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl">Campagnes de Sensibilisation</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Des interventions sur le terrain pour rappeler que l'amitié sauve des vies.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-10 space-y-6 flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-red-50 text-red-500 group-hover:scale-110 transition-transform">
                  <Ban className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl">Stop Alcool au Volant</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Une logistique infaillible pour garantir qu'aucun conducteur ivre ne prenne la route.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-10 space-y-6 flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-accent/5 text-accent group-hover:scale-110 transition-transform">
                  <Handshake className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl">Partenariats Événementiels</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Présence sur les festivals et soirées pour un retour sécurisé systématique.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Tracking Section */}
      <section className="py-24 bg-[#0a111a] text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold leading-tight">Interface de Tracking Live</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Suivez en temps réel la position de votre Ange et l'état du rapatriement de votre véhicule. Transparence et sécurité totale.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-accent" />
                Géolocalisation précise
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Navigation className="w-5 h-5 text-accent" />
                Estimation d'arrivée temps réel
              </li>
            </ul>
            <p className="text-sm font-bold text-accent uppercase tracking-widest">Zones sécurisées par nos chauffeurs</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            <Image 
              src="https://picsum.photos/seed/mapdark/800/600" 
              alt="Map Interface" 
              width={800} 
              height={600}
              className="w-full h-auto grayscale opacity-40 group-hover:scale-105 transition-transform duration-700"
              data-ai-hint="dark map"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-accent animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">VOTRE ANGE EST EN ROUTE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Form Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold text-primary">Devenez un Ange</h2>
            <p className="text-muted-foreground">Rejoignez notre équipe locale et participez activement à la sécurité de votre région.</p>
          </div>
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-widest">Prénom & Nom</label>
                  <Input placeholder="Jean Dupont" className="h-12 bg-slate-50 border-none rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-widest">Code Postal de Résidence</label>
                  <Input placeholder="75000" className="h-12 bg-slate-50 border-none rounded-md" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-widest">Pourquoi nous rejoindre ?</label>
                <Textarea placeholder="Parlez-nous de votre motivation..." className="min-h-[120px] bg-slate-50 border-none rounded-md" />
              </div>
              <Button className="w-full h-14 bg-[#0a111a] hover:bg-[#1a2c42] text-white font-bold uppercase tracking-widest rounded-md">
                Déposer ma candidature
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold text-primary">Besoin d'un Ange ?</h2>
            <p className="text-muted-foreground">Réservation immédiate pour un retour serein.</p>
          </div>
          <div className="bg-[#0a111a] rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input placeholder="Nom Complet" className="h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-md" />
              <Input placeholder="Lieu de récupération" className="h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-md" />
              <div className="relative">
                <Input type="text" placeholder="23:30" className="h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-md pr-10" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">Heure</div>
              </div>
              <Button size="lg" className="h-14 bg-accent hover:bg-accent/90 text-white font-bold rounded-md">
                Confirmer la demande
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a111a] text-white py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-8">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold uppercase tracking-tight">AngelWatch</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 AngelWatch Initiative. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="#" className="p-3 bg-white/5 rounded-full hover:bg-accent transition-colors"><Twitter className="w-5 h-5" /></Link>
            <Link href="#" className="p-3 bg-white/5 rounded-full hover:bg-accent transition-colors"><Instagram className="w-5 h-5" /></Link>
            <Link href="#" className="p-3 bg-white/5 rounded-full hover:bg-accent transition-colors"><Linkedin className="w-5 h-5" /></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
