
"use client";

import React, { useState } from 'react';
import { Shield, Power, Navigation, User, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { useToast } from '@/hooks/use-toast';

export default function DriverDashboard() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);
  const [activeJob, setActiveJob] = useState<{ clientName: string, destination: string } | null>(null);

  const toggleOnline = () => {
    setIsOnline(!isOnline);
    toast({
      title: !isOnline ? "You are now online" : "You are now offline",
      description: !isOnline ? "You'll receive new job requests soon." : "No more requests will be sent to you.",
      variant: !isOnline ? "default" : "secondary"
    });
  };

  const simulateJob = () => {
    if (!isOnline) {
      toast({ title: "Go online first!", variant: "destructive" });
      return;
    }
    setActiveJob({
      clientName: "Alex Rivera",
      destination: "78 Rue de Rivoli, Paris"
    });
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-slate-50 min-h-screen">
      <header className="px-6 py-5 flex items-center justify-between bg-primary text-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <span className="font-bold text-lg">Driver Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-widest">{isOnline ? 'Online' : 'Offline'}</span>
          <Switch 
            checked={isOnline} 
            onCheckedChange={toggleOnline} 
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      </header>

      <main className="p-6 space-y-6 flex-1">
        {/* Earnings Card */}
        <Card className="bg-white border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-primary/5 p-6 flex justify-between items-center border-b border-primary/10">
              <div>
                <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">Today's Earnings</p>
                <h2 className="text-3xl font-extrabold text-primary">$184.50</h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">Trips</p>
                <h2 className="text-2xl font-bold text-primary">8</h2>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Status / Job */}
        {!activeJob ? (
          <div className="space-y-6">
            <Card className="border-dashed border-2 border-slate-200 bg-transparent text-center py-12">
              <CardContent className="space-y-4">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-600">Waiting for requests...</h3>
                  <p className="text-sm text-slate-400">Keep the app open to receive new jobs.</p>
                </div>
                {isOnline && (
                  <Button variant="outline" className="mt-4" onClick={simulateJob}>
                    Simulate Job Arrival
                  </Button>
                )}
              </CardContent>
            </Card>

            <section className="space-y-3">
              <h3 className="font-bold text-primary">Live Traffic</h3>
              <MapPlaceholder drivers={[]} />
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Job Details */}
            <Card className="border-accent/30 shadow-xl bg-white animate-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="bg-accent/5 border-b border-accent/10 pb-4">
                <div className="flex justify-between items-center">
                  <Badge className="bg-accent text-white">Active Assignment</Badge>
                  <span className="text-xs text-accent font-bold">ETA: 4 MIN</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">{activeJob.clientName}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" /> 4.9 Rating
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border-l-2 border-slate-100 ml-4 pl-6 relative">
                  <div className="relative">
                    <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm" />
                    <p className="text-xs font-bold text-muted-foreground uppercase">Pickup</p>
                    <p className="font-semibold text-primary">Current Location</p>
                  </div>
                  <div className="relative pt-4">
                    <div className="absolute -left-8 top-5 w-4 h-4 rounded-full bg-accent border-4 border-white shadow-sm" />
                    <p className="text-xs font-bold text-muted-foreground uppercase">Destination</p>
                    <p className="font-semibold text-primary">{activeJob.destination}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-12 border-primary/20 text-primary font-bold">
                    Message
                  </Button>
                  <Button className="h-12 bg-primary text-white font-bold">
                    Navigation
                  </Button>
                </div>

                <Button 
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg"
                  onClick={() => {
                    setActiveJob(null);
                    toast({ title: "Job Completed", description: "Payment has been processed." });
                  }}
                >
                  Confirm Arrival <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
