"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Location } from '@/lib/types';

interface UseDriverLocationOptions {
  enabled?: boolean;
  updateIntervalMs?: number;
}

interface UseDriverLocationReturn {
  currentLocation: Location | null;
  isTracking: boolean;
  error: string | null;
}

export function useDriverLocation({
  enabled = false,
  updateIntervalMs = 10000, // Update every 10 seconds
}: UseDriverLocationOptions = {}): UseDriverLocationReturn {
  const db = useFirestore();
  const { user: authUser } = useUser();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const updateLocation = useCallback(
    async (location: Location) => {
      if (!authUser || !db) return;

      const now = Date.now();
      if (now - lastUpdateRef.current < updateIntervalMs) return;
      lastUpdateRef.current = now;

      try {
        await setDoc(
          doc(db, 'driverStatus', authUser.uid),
          {
            id: authUser.uid,
            location,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to update driver location:', err);
      }
    },
    [authUser, db, updateIntervalMs]
  );

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setIsTracking(true);
    setError(null);

    const handleSuccess = (position: GeolocationPosition) => {
      const location: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentLocation(location);
      updateLocation(location);
    };

    const handleError = (err: GeolocationPositionError) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('Permission de localisation refusée');
          break;
        case err.POSITION_UNAVAILABLE:
          setError('Position non disponible');
          break;
        case err.TIMEOUT:
          setError('Timeout de localisation');
          break;
        default:
          setError('Erreur de localisation');
      }
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTracking(false);
    };
  }, [enabled, updateLocation]);

  return { currentLocation, isTracking, error };
}
