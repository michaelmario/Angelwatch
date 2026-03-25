"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { DriverStatus } from '@/lib/types';
import { calculateDistance, sortDriversByDistance } from '@/lib/geocoding';
import { Location } from '@/lib/types';

interface UseAvailableDriversOptions {
  userLocation?: Location | null;
  maxDistanceKm?: number;
}

export function useAvailableDrivers({ userLocation, maxDistanceKm = 50 }: UseAvailableDriversOptions = {}) {
  const db = useFirestore();
  const [drivers, setDrivers] = useState<DriverStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'driverStatus'),
      where('isAvailable', '==', true)
    );

    const unsub = onSnapshot(q, (snap) => {
      const driverList: DriverStatus[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        // Only include drivers with valid location
        if (data.location?.lat && data.location?.lng) {
          driverList.push({
            id: data.id || doc.id,
            name: data.name || 'Ange',
            location: data.location,
            isAvailable: data.isAvailable ?? false,
            updatedAt: data.updatedAt,
          });
        }
      });

      // Filter and sort by distance if user location provided
      let filtered = driverList;
      if (userLocation) {
        filtered = sortDriversByDistance(
          driverList.filter(d => calculateDistance(d.location, userLocation) <= maxDistanceKm),
          userLocation
        );
      }

      setDrivers(filtered);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching drivers:', error);
      setLoading(false);
    });

    return () => unsub();
  }, [db, userLocation, maxDistanceKm]);

  return { drivers, loading };
}
