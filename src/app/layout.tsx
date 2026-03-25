import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from "@/components/ui/toaster";
import { AuthProvider } from '@/lib/AuthContext';
import FirebaseWrapper from '@/components/FirebaseWrapper';

export const metadata: Metadata = {
  title: 'AngelWatch | La sécurité routière, notre engagement',
  description: 'Professionnels du rapatriement de véhicules et accompagnement sécurisé.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AngelWatch',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-background text-foreground">
        <FirebaseWrapper>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </FirebaseWrapper>
      </body>
    </html>
  );
}
