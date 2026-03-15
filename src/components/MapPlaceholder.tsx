
"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MapPlaceholderProps {
  drivers: { id: string; name: string; lat: number; lng: number }[];
  clientLocation?: { lat: number; lng: number };
}

export function MapPlaceholder({ drivers, clientLocation = { lat: 48.8566, lng: 2.3522 } }: MapPlaceholderProps) {
  // Simple simulation of coordinate movement for visual effect
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => ({
        x: prev.x + (Math.random() - 0.5) * 0.001,
        y: prev.y + (Math.random() - 0.5) * 0.001
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="relative w-full h-[400px] bg-slate-100 overflow-hidden border-2 border-primary/10 rounded-xl">
      {/* Background "Map" Grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#2D598F 1px, transparent 0)', 
          backgroundSize: '40px 40px' 
        }} 
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Client Pin */}
        <div className="relative z-10">
          <div className="absolute -top-10 -left-5 bg-white px-2 py-1 rounded shadow-md text-xs font-bold whitespace-nowrap">
            You
          </div>
          <div className="w-4 h-4 bg-accent rounded-full border-2 border-white shadow-lg animate-pulse" />
        </div>

        {/* Driver Pins */}
        {drivers.map((driver, i) => {
          const xOffset = (i * 80) - 100 + (offset.x * 1000);
          const yOffset = (i * 60) - 80 + (offset.y * 1000);
          
          return (
            <div 
              key={driver.id} 
              className="absolute transition-all duration-1000 ease-in-out"
              style={{ transform: `translate(${xOffset}px, ${yOffset}px)` }}
            >
              <div className="flex flex-col items-center">
                <div className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full mb-1 shadow-sm font-medium">
                  {driver.name}
                </div>
                <Navigation className="w-6 h-6 text-primary fill-primary rotate-45" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 right-4 space-y-2">
        <button className="bg-white p-2 rounded-full shadow-lg border hover:bg-slate-50">
          <User className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="absolute top-4 left-4">
        <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-primary shadow-sm border border-primary/20">
          Live Tracking Enabled
        </div>
      </div>
    </Card>
  );
}
