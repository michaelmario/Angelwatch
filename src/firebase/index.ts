
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * Initialise Firebase de manière sécurisée.
 * Si la clé API est manquante, retourne des instances nulles pour éviter le plantage
 * et permettre l'affichage d'un message d'erreur gracieux.
 */
export function initializeFirebase(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
} {
  // Vérification de la présence de la configuration minimale
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
    console.warn("Firebase config is missing. Please check your .env file.");
    return { app: null, auth: null, db: null };
  }

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    return { app, auth, db };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return { app: null, auth: null, db: null };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
