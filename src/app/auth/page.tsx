
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const AngelLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M35 20C20 10 5 15 2 25C10 24 25 25 35 20Z" fill="currentColor" />
    <path d="M65 20C80 10 95 15 98 25C90 24 75 25 65 20Z" fill="currentColor" />
    <path d="M50 12L56 18V28L50 34L44 28V18L50 12Z" fill="currentColor" />
  </svg>
);

export default function AuthPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (role: 'client' | 'driver') => {
    if (!email || !password) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs pour continuer.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Compte créé !",
          description: `Bienvenue chez AngelWatch en tant que ${role === 'client' ? 'Client' : 'Chauffeur'}.`,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Connexion réussie",
          description: "Ravi de vous revoir parmi nous.",
        });
      }
      
      router.push(role === 'client' ? '/dashboard' : '/driver');
    } catch (error: any) {
      let message = "Une erreur est survenue lors de l'authentification.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Email ou mot de passe incorrect.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "Cet email est déjà utilisé.";
      }

      toast({
        title: "Erreur d'authentification",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 min-h-screen">
      <Link href="/" className="flex items-center gap-3 mb-10 group">
        <AngelLogo className="w-16 h-16 text-[#0a111a] group-hover:scale-110 transition-transform" />
        <span className="text-2xl font-black text-[#0a111a] tracking-tighter uppercase">AngelWatch</span>
      </Link>

      <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white">
        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-16 bg-slate-100 p-0">
            <TabsTrigger value="client" className="data-[state=active]:bg-white data-[state=active]:text-[#0a111a] font-bold text-xs uppercase tracking-[0.2em] rounded-none">Client</TabsTrigger>
            <TabsTrigger value="driver" className="data-[state=active]:bg-white data-[state=active]:text-accent font-bold text-xs uppercase tracking-[0.2em] rounded-none">Chauffeur</TabsTrigger>
          </TabsList>
          
          <div className="p-8 md:p-12">
            <TabsContent value="client" className="mt-0 space-y-8 animate-in fade-in duration-500">
              <div className="space-y-3 text-center">
                <h1 className="text-2xl font-bold text-[#0a111a]">{isRegistering ? 'Rejoindre AngelWatch' : 'Espace Client'}</h1>
                <p className="text-slate-400 text-sm">Sécurisez vos trajets nocturnes dès maintenant.</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    className="pl-14 h-16 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-accent/20 text-base" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
                  <Input 
                    type="password" 
                    placeholder="Mot de passe" 
                    className="pl-14 h-16 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-accent/20 text-base" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full h-16 bg-[#0a111a] hover:bg-[#1a2c42] text-white font-bold rounded-2xl uppercase tracking-[0.2em] text-[10px] mt-2 shadow-xl"
                  disabled={loading}
                  onClick={() => handleAuth('client')}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isRegistering ? "Créer mon compte client" : "Se connecter"} 
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="driver" className="mt-0 space-y-8 animate-in fade-in duration-500">
              <div className="space-y-3 text-center">
                <h1 className="text-2xl font-bold text-[#0a111a]">{isRegistering ? 'Devenir un Ange' : 'Portail Chauffeur'}</h1>
                <p className="text-slate-400 text-sm">Connectez-vous pour commencer votre mission.</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
                  <Input 
                    type="email" 
                    placeholder="Email professionnel" 
                    className="pl-14 h-16 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-accent/20 text-base" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-5 w-5 h-5 text-slate-300" />
                  <Input 
                    type="password" 
                    placeholder="Mot de passe" 
                    className="pl-14 h-16 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-accent/20 text-base" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full h-16 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl uppercase tracking-[0.2em] text-[10px] mt-2 shadow-xl"
                  disabled={loading}
                  onClick={() => handleAuth('driver')}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isRegistering ? "Postuler comme Chauffeur" : "Démarrer mon service"} 
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      <div className="mt-10 flex flex-col items-center gap-4">
        <button 
          className="text-sm text-slate-500 hover:text-[#0a111a] font-bold transition-colors uppercase tracking-widest"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? "Déjà un compte ? Connexion" : "Pas encore de compte ? S'enregistrer"}
        </button>
        <Link href="/" className="text-xs text-slate-400 flex items-center gap-1 hover:text-[#0a111a] transition-colors">
          <ChevronLeft className="w-3 h-3" /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
