
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, MapPin, UserCheck, Smartphone } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">AngelWatch</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</Link>
          <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Safety</Link>
          <Button variant="ghost" asChild>
            <Link href="/auth">Login</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-4xl mx-auto">
        <div className="space-y-6">
          <Badge />
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary leading-tight">
            Your Personal Security <br />
            <span className="text-accent">Just a Tap Away</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Professional security drivers available 24/7. Real-time GPS tracking, 
            intelligent AI updates, and vetted professionals to get you home safely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-2xl shadow-xl" asChild>
              <Link href="/dashboard">Get Started as Client</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/20 text-primary px-8 py-6 text-lg rounded-2xl hover:bg-primary/5" asChild>
              <Link href="/driver">Drive with AngelWatch</Link>
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
          {[
            {
              icon: MapPin,
              title: "Live Tracking",
              desc: "Know exactly where your driver is with millisecond precision GPS updates."
            },
            {
              icon: UserCheck,
              title: "Vetted Drivers",
              desc: "Every driver undergoes rigorous background checks and safety training."
            },
            {
              icon: Smartphone,
              title: "PWA Native Feel",
              desc: "Install on your home screen for instant access, even on poor connections."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-left space-y-4 hover:shadow-md transition-shadow">
              <div className="bg-accent/10 w-12 h-12 flex items-center justify-center rounded-2xl">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-lg text-primary">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">AngelWatch</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 AngelWatch. Professional Safety Services.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge() {
  return (
    <div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mb-6">
      <span className="mr-2">✨</span> Now available in your city
    </div>
  )
}
