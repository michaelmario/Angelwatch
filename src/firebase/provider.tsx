
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface FirebaseContextType {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({
  children,
  app,
  db,
  auth,
}: {
  children: ReactNode;
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
}) {
  // Si Firebase n'est pas configuré, on affiche un message d'aide au lieu de faire planter l'app
  if (!app || !db || !auth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a111a] p-6">
        <Alert variant="destructive" className="max-w-md border-red-500/50 bg-red-500/10 text-white">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          <AlertTitle className="font-bold">Configuration Requise</AlertTitle>
          <AlertDescription>
            Le projet Firebase n'est pas encore configuré. Veuillez connecter votre projet Firebase via la console Studio pour activer l'authentification et la base de données.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={{ app, db, auth }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export const useFirebaseApp = () => useFirebase().app!;
export const useFirestore = () => useFirebase().db!;
export const useAuth = () => useFirebase().auth!;
