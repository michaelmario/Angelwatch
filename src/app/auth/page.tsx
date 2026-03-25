"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { UserProfile } from "@/lib/AuthContext";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Auth Profile
        await updateProfile(user, { displayName: name });

        // Create Firestore Profile
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          displayName: name,
          role: "client", // Default to client
          createdAt: new Date().toISOString(),
        };
        
        await setDoc(doc(db, "users", user.uid), newProfile);
      }
      
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      // AuthContext handles Firestore creation if user is new
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la connexion Google.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EBF1F4] p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#2D598F]">
            {isLogin ? "Connexion" : "Créer un compte"}
          </CardTitle>
          <CardDescription>
            Bienvenue sur AngelWatch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Nom complet"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-[#2D598F] hover:bg-[#1f426d]" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLogin ? "Se connecter" : "S'inscrire"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-slate-500">OU</span>
            <Separator className="flex-1" />
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            Continuer avec Google
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">{isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"} </span>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-[#2D598F] hover:underline"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}