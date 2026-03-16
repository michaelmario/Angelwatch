
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const logoData = PlaceHolderImages.find(img => img.id === 'angelwatch-logo');

export default function AuthPage() {
  const { auth } = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const redirectBasedOnRole = async (uid: string, defaultRole: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.role === 'admin') {
        router.push('/admin');
        return;
      }
      if (userData.role === 'driver') {
        router.push('/driver');
        return;
      }
      router.push('/dashboard');
    } else {
      router.push(defaultRole === 'driver' ? '/driver' : '/dashboard');
    }
  };

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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          id: userCredential.user.uid,
          name: email.split('@')[0],
          email: email,
          role: role,
          createdAt: new Date().toISOString()
        });
        toast({
          title: "Compte créé !",
          description: `Bienvenue chez AngelWatch en tant que ${role === 'client' ? 'Client' : 'Chauffeur'}.`,
        });
        router.push(role === 'client' ? '/dashboard' : '/driver');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Connexion réussie",
          description: "Ravi de vous revoir parmi nous.",
        });
        await redirectBasedOnRole(userCredential.user.uid, role);
      }
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

  const handleGoogleAuth = async (role: 'client' | 'driver') => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: user.uid,
          name: user.displayName || 'Utilisateur Google',
          email: user.email,
          role: role,
          avatar: user.photoURL,
          createdAt: new Date().toISOString()
        });
        router.push(role === 'client' ? '/dashboard' : '/driver');
      } else {
        await redirectBasedOnRole(user.uid, role);
      }

      toast({
        title: "Connexion Google réussie",
        description: `Content de vous voir, ${user.displayName}.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erreur Google",
        description: "Impossible de se connecter avec Google.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 min-h-screen">
      <Link href="/" className="flex items-center gap-3 mb-10 group">
        {logoData && (
          <Image 
            src={logoData.imageUrl} 
            alt="AngelWatch Logo" 
            width={64} 
            height={64} 
            className="rounded-2xl group-hover:rotate-12 transition-transform shadow-lg"
            data-ai-hint={logoData.imageHint}
          />
        )}
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
                  disabled={loading || googleLoading}
                  onClick={() => handleAuth('client')}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isRegistering ? "Créer mon compte client" : "Se connecter"} 
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>

                <div className="relative py-4 flex items-center">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">OU</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <Button 
                  variant="outline"
                  className="w-full h-16 border-slate-100 hover:bg-slate-50 text-[#0a111a] font-bold rounded-2xl uppercase tracking-[0.1em] text-[10px] shadow-sm transition-all"
                  disabled={loading || googleLoading}
                  onClick={() => handleGoogleAuth('client')}
                >
                  {googleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <GoogleIcon />}
                  Continuer avec Google
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
                  disabled={loading || googleLoading}
                  onClick={() => handleAuth('driver')}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isRegistering ? "Postuler comme Chauffeur" : "Démarrer mon service"} 
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>

                <div className="relative py-4 flex items-center">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">OU</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <Button 
                  variant="outline"
                  className="w-full h-16 border-slate-100 hover:bg-slate-50 text-[#0a111a] font-bold rounded-2xl uppercase tracking-[0.1em] text-[10px] shadow-sm transition-all"
                  disabled={loading || googleLoading}
                  onClick={() => handleGoogleAuth('driver')}
                >
                  {googleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <GoogleIcon />}
                  Continuer avec Google
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
