
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

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
      } else if (error.code === 'auth/weak-password') {
        message = "Le mot de passe est trop court.";
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
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 bg-slate-50 min-h-screen">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="bg-[#0a111a] p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <span className="text-xl md:text-2xl font-bold text-[#0a111a] tracking-tight uppercase">AngelWatch</span>
      </Link>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-[1.5rem] md:rounded-3xl overflow-hidden bg-white mx-4">
        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-14 bg-slate-100">
            <TabsTrigger value="client" className="data-[state=active]:bg-white data-[state=active]:text-[#0a111a] font-bold text-[10px] md:text-xs uppercase tracking-widest">Client</TabsTrigger>
            <TabsTrigger value="driver" className="data-[state=active]:bg-white data-[state=active]:text-accent font-bold text-[10px] md:text-xs uppercase tracking-widest">Chauffeur</TabsTrigger>
          </TabsList>
          
          <div className="p-6 md:p-8">
            <TabsContent value="client" className="mt-0 space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2 text-center">
                <h1 className="text-xl md:text-2xl font-bold text-[#0a111a]">{isRegistering ? 'Rejoindre AngelWatch' : 'Espace Client'}</h1>
                <p className="text-muted-foreground text-xs md:text-sm">Sécurisez vos trajets nocturnes dès maintenant.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input 
                      type="email" 
                      placeholder="Email" 
                      className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input 
                      type="password" 
                      placeholder="Mot de passe" 
                      className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full h-12 bg-[#0a111a] hover:bg-[#1a2c42] text-white font-bold rounded-xl uppercase tracking-widest text-[10px]"
                  disabled={loading}
                  onClick={() => handleAuth('client')}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isRegistering ? "Créer mon compte client" : "Se connecter en tant que Client"} 
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="driver" className="mt-0 space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2 text-center">
                <h1 className="text-xl md:text-2xl font-bold text-[#0a111a]">{isRegistering ? 'Devenir un Ange' : 'Portail Chauffeur'}</h1>
                <p className="text-muted-foreground text-xs md:text-sm">Connectez-vous pour commencer votre mission.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input 
                      type="email" 
                      placeholder="Identifiant Chauffeur ou Email" 
                      className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input 
                      type="password" 
                      placeholder="Mot de passe" 
                      className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl uppercase tracking-widest text-[10px] shadow-lg"
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

      <button 
        className="mt-8 text-xs md:text-sm text-slate-500 hover:text-[#0a111a] font-medium transition-colors mb-8"
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? "Déjà un compte ? Connectez-vous" : "Pas encore de compte ? S'enregistrer ici"}
      </button>
    </div>
  );
}
