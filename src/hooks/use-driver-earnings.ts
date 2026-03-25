"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { ServiceRequest, Tip, Payout } from '@/lib/types';

const BASE_FARE = 15;
const PER_KM_RATE = 1.5;

interface DriverEarnings {
  totalEarnings: number;
  pendingPayout: number;
  completedPayout: number;
  tipsTotal: number;
  ridesCount: number;
}

/**
 * Hook to fetch driver earnings from completed rides and tips.
 * Payout calculation is simplified for MVP.
 */
export function useDriverEarnings(driverId: string | undefined) {
  const db = useFirestore();
  const [earnings, setEarnings] = useState<DriverEarnings>({
    totalEarnings: 0,
    pendingPayout: 0,
    completedPayout: 0,
    tipsTotal: 0,
    ridesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!driverId || !db) return;

    // Listen for completed rides
    const ridesQuery = query(
      collection(db, 'serviceRequests'),
      where('driverId', '==', driverId),
      where('status', '==', 'completed')
    );

    // Listen for tips
    const tipsQuery = query(
      collection(db, 'tips'),
      where('driverId', '==', driverId)
    );

    // Listen for payouts
    const payoutsQuery = query(
      collection(db, 'payouts'),
      where('driverId', '==', driverId)
    );

    let ridesCount = 0;
    let tipsTotal = 0;
    let pendingPayout = 0;
    let completedPayout = 0;

    const unsubRides = onSnapshot(ridesQuery, (snap) => {
      ridesCount = snap.size;
      // Estimate earnings per ride (base + distance)
      const rideEarnings = ridesCount * (BASE_FARE + PER_KM_RATE * 10);
      updateEarnings(rideEarnings, tipsTotal, pendingPayout, completedPayout);
      setLoading(false);
    });

    const unsubTips = onSnapshot(tipsQuery, (snap) => {
      tipsTotal = 0;
      snap.forEach(doc => {
        const tip = doc.data() as Tip;
        tipsTotal += tip.amount;
      });
      updateEarnings(ridesCount * (BASE_FARE + PER_KM_RATE * 10), tipsTotal, pendingPayout, completedPayout);
    });

    const unsubPayouts = onSnapshot(payoutsQuery, (snap) => {
      pendingPayout = 0;
      completedPayout = 0;
      snap.forEach(doc => {
        const payout = doc.data() as Payout;
        if (payout.status === 'completed') {
          completedPayout += payout.amount;
        } else if (payout.status === 'pending' || payout.status === 'processing') {
          pendingPayout += payout.amount;
        }
      });
      updateEarnings(ridesCount * (BASE_FARE + PER_KM_RATE * 10), tipsTotal, pendingPayout, completedPayout);
    });

    function updateEarnings(rideEarnings: number, tips: number, pending: number, completed: number) {
      const total = rideEarnings + tips;
      setEarnings({
        totalEarnings: Math.round(total * 100) / 100,
        pendingPayout: Math.round(pending * 100) / 100,
        completedPayout: Math.round(completed * 100) / 100,
        tipsTotal: Math.round(tips * 100) / 100,
        ridesCount,
      });
    }

    return () => {
      unsubRides();
      unsubTips();
      unsubPayouts();
    };
  }, [db, driverId]);

  return { earnings, loading };
}
