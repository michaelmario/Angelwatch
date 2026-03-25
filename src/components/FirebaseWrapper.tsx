"use client";

import { FirebaseProvider } from '@/firebase/provider';
import { app, auth, db } from '@/lib/firebase';

export default function FirebaseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider app={app} auth={auth} db={db}>
      {children}
    </FirebaseProvider>
  );
}