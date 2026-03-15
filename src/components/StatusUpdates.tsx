
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { clientPersonalizedStatusUpdate, type ClientPersonalizedStatusUpdateOutput } from '@/ai/flows/client-personalized-status-update';
import { ServiceRequest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface StatusUpdatesProps {
  request: ServiceRequest;
}

export function StatusUpdates({ request }: StatusUpdatesProps) {
  const [update, setUpdate] = useState<ClientPersonalizedStatusUpdateOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpdate() {
      setLoading(true);
      try {
        const result = await clientPersonalizedStatusUpdate({
          requestId: request.id,
          clientName: request.clientName,
          driverName: request.driverName || 'Finding Driver...',
          driverLocation: request.driverId ? 'Approaching your sector' : 'Nearby',
          serviceStatus: request.status.replace('_', ' '),
          estimatedArrivalTime: '8 minutes',
          serviceType: 'Security Transport',
          destination: request.destination,
        });
        setUpdate(result);
      } catch (error) {
        console.error("AI Update failed", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUpdate();
    const interval = setInterval(fetchUpdate, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [request]);

  if (loading && !update) {
    return (
      <Card className="border-accent/20">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Sparkles className="w-12 h-12 text-accent" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-accent" />
          Intelligent Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium text-foreground leading-relaxed">
          {update?.personalizedMessage}
        </p>
        
        <div className="flex flex-wrap gap-3 items-center">
          <Badge variant="outline" className="bg-accent/5 border-accent/20 text-accent font-semibold px-3 py-1">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {update?.statusCategory}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            {update?.estimatedTimeRemaining}
          </div>
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {request.destination}
          </span>
          <span>Updated just now</span>
        </div>
      </CardContent>
    </Card>
  );
}
