"use client";

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceRequest } from '@/lib/types';

interface EarningsCardProps {
  requests: ServiceRequest[];
}

const BASE_FARE = 15;
const PER_KM_RATE = 1.5;

function estimateEarnings(requests: ServiceRequest[]): number {
  return requests
    .filter(r => r.status === 'completed' && r.completedAt)
    .reduce((sum) => sum + BASE_FARE + PER_KM_RATE * 10, 0);
}

export function EarningsCard({ requests }: EarningsCardProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completed = requests.filter(r => r.status === 'completed' && r.completedAt);

    const todayTrips = completed.filter(r => new Date(r.completedAt!) >= todayStart);
    const weekTrips = completed.filter(r => new Date(r.completedAt!) >= weekStart);
    const monthTrips = completed.filter(r => new Date(r.completedAt!) >= monthStart);

    const todayEarnings = estimateEarnings(todayTrips);
    const weekEarnings = estimateEarnings(weekTrips);
    const monthEarnings = estimateEarnings(monthTrips);

    // Calculate trends (compare to previous periods)
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);

    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

    const yesterdayTrips = completed.filter(r => {
      const d = new Date(r.completedAt!);
      return d >= yesterdayStart && d < yesterdayEnd;
    });
    const prevWeekTrips = completed.filter(r => {
      const d = new Date(r.completedAt!);
      return d >= prevWeekStart && d < weekStart;
    });
    const prevMonthTrips = completed.filter(r => {
      const d = new Date(r.completedAt!);
      return d >= prevMonthStart && d < monthStart;
    });

    const yesterdayEarnings = estimateEarnings(yesterdayTrips);
    const prevWeekEarnings = estimateEarnings(prevWeekTrips);
    const prevMonthEarnings = estimateEarnings(prevMonthTrips);

    const formatTrend = (current: number, previous: number) => {
      if (previous === 0) return null;
      const pct = ((current - previous) / previous) * 100;
      return {
        value: Math.abs(pct).toFixed(1),
        positive: pct >= 0,
      };
    };

    return {
      today: { earnings: todayEarnings, trips: todayTrips.length, trend: formatTrend(todayEarnings, yesterdayEarnings) },
      week: { earnings: weekEarnings, trips: weekTrips.length, trend: formatTrend(weekEarnings, prevWeekEarnings) },
      month: { earnings: monthEarnings, trips: monthTrips.length, trend: formatTrend(monthEarnings, prevMonthEarnings) },
    };
  }, [requests]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Today */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aujourd&apos;hui</span>
          </div>
          <p className="text-2xl font-black text-primary">€{stats.today.earnings.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{stats.today.trips} courses</p>
          {stats.today.trend && (
            <div className={`flex items-center justify-center gap-0.5 mt-1 ${stats.today.trend.positive ? 'text-green-600' : 'text-red-500'}`}>
              {stats.today.trend.positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              <span className="text-[9px] font-bold">{stats.today.trend.value}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* This Week */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cette semaine</span>
          </div>
          <p className="text-2xl font-black text-primary">€{stats.week.earnings.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{stats.week.trips} courses</p>
          {stats.week.trend && (
            <div className={`flex items-center justify-center gap-0.5 mt-1 ${stats.week.trend.positive ? 'text-green-600' : 'text-red-500'}`}>
              {stats.week.trend.positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              <span className="text-[9px] font-bold">{stats.week.trend.value}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* This Month */}
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ce mois</span>
          </div>
          <p className="text-2xl font-black text-primary">€{stats.month.earnings.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{stats.month.trips} courses</p>
          {stats.month.trend && (
            <div className={`flex items-center justify-center gap-0.5 mt-1 ${stats.month.trend.positive ? 'text-green-600' : 'text-red-500'}`}>
              {stats.month.trend.positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              <span className="text-[9px] font-bold">{stats.month.trend.value}%</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
