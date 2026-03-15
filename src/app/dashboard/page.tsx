
"use client";

import React, { useState } from 'react';
import { Shield, Search, Send, MapPin, Navigation, Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { StatusUpdates } from '@/components/StatusUpdates';
import { DriverCard } from '@/components/DriverCard';
import { ServiceRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ClientDashboard() {
  const { toast } = useToast();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [destination, setDestination] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const mockDrivers = [
    { id: 'd1', name: 'Marcus Miller', lat: 48.8584, lng: 2.2945, rating: 4.9, trips: 1240, avatar: 'https://picsum.photos/seed/driver1/150/150' },
    { id: 'd2', name: 'Elena Vance', lat: 48.8606, lng: 2.3376, rating: 4.8, trips: 890, avatar: 'https://picsum.photos/seed/driver2/150/150' },
  ];

  const handleRequest = () => {
    if (!destination) {
      toast({
        title: "Destination required",
        description: "Please enter where you'd like to be picked up or dropped off.",
        variant: "destructive"
      });
      return;
    }

    setIsRequesting(true);
    // Simulate API delay
    setTimeout(() => {
      const newRequest: ServiceRequest = {
        id: 'REQ-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        clientId: 'c1',
        clientName: 'Alex Rivera',
        driverId: 'd1',
        driverName: 'Marcus Miller',
        status: 'en_route',
        destination: destination,
        createdAt: new Date().toISOString()
      };
      setRequest(newRequest);
      setIsRequesting(false);
      toast({
        title: "Driver Assigned!",
        description: "Marcus Miller is on his way to your location.",
      });
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-background relative pb-8 min-h-screen">
      {/* Mobile-First Navigation Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-primary">AngelWatch</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="w-5 h-5 text-slate-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Menu className="w-5 h-5 text-slate-600" />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Map View */}
        <section className="space-y-3">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-primary">Live Map</h2>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              2 Active Drivers Nearby
            </span>
          </div>
          <MapPlaceholder drivers={mockDrivers} />
        </section>

        {/* Request Input or Status */}
        <section className="space-y-4">
          {!request ? (
            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Where to?</h3>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Enter destination address..." 
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full h-14 bg-accent hover:bg-accent/90 text-white rounded-xl text-lg font-bold shadow-lg transition-transform active:scale-95"
                  onClick={handleRequest}
                  disabled={isRequesting}
                >
                  {isRequesting ? (
                    <span className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 animate-spin" /> Matching...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Request Professional Escort <Send className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <StatusUpdates request={request} />
          )}
        </section>

        {/* Available Drivers List */}
        {!request && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary">Vetted Drivers</h2>
            <div className="grid gap-4">
              {mockDrivers.map((driver) => (
                <DriverCard 
                  key={driver.id}
                  name={driver.name}
                  rating={driver.rating}
                  trips={driver.trips}
                  avatar={driver.avatar}
                />
              ))}
            </div>
          </section>
        )}

        {/* Request Details Footer (if active) */}
        {request && (
          <div className="fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto">
            <Button 
              variant="destructive" 
              className="w-full h-12 rounded-xl shadow-xl font-bold"
              onClick={() => {
                setRequest(null);
                toast({ title: "Request Cancelled", description: "Your service request has been ended." });
              }}
            >
              Cancel Service Request
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
