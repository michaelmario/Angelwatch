"use client";

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceRequest } from '@/lib/types';

interface EarningsData {
  date: string;
  earnings: number;
  trips: number;
}

interface EarningsChartProps {
  requests: ServiceRequest[];
  period?: 'daily' | 'weekly' | 'monthly';
}

function buildChartData(requests: ServiceRequest[], period: 'daily' | 'weekly' | 'monthly'): EarningsData[] {
  const BASE_FARE = 15; // €15 base fare per ride
  const PER_KM_RATE = 1.5; // €1.50 per km (assumed avg 10km = €15)

  const completed = requests.filter(r => r.status === 'completed' && r.completedAt);
  const byDate: Record<string, { earnings: number; trips: number }> = {};

  completed.forEach(req => {
    const date = new Date(req.completedAt!);
    let key: string;

    if (period === 'daily') {
      key = date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else if (period === 'weekly') {
      const weekNum = Math.ceil((date.getDate()) / 7);
      key = `S${weekNum}`;
    } else {
      key = date.toLocaleDateString('fr-FR', { month: 'short' });
    }

    if (!byDate[key]) {
      byDate[key] = { earnings: 0, trips: 0 };
    }
    // Estimate earnings per ride (base + distance)
    byDate[key].earnings += BASE_FARE + PER_KM_RATE * 10;
    byDate[key].trips += 1;
  });

  return Object.entries(byDate).map(([date, data]) => ({
    date,
    earnings: Math.round(data.earnings * 100) / 100,
    trips: data.trips,
  }));
}

export function EarningsChart({ requests, period = 'daily' }: EarningsChartProps) {
  const chartData = useMemo(() => buildChartData(requests, period), [requests, period]);

  if (chartData.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <span className="text-accent">📊</span> Revenus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
            Pas encore de données de revenus.
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalEarnings = chartData.reduce((sum, d) => sum + d.earnings, 0);
  const totalTrips = chartData.reduce((sum, d) => sum + d.trips, 0);

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <span className="text-accent">📊</span> Revenus
        </CardTitle>
        <p className="text-xs text-slate-400">
          Total: <span className="font-black text-primary">€{totalEarnings.toFixed(2)}</span> • {totalTrips} courses
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `€${v}`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }}
              formatter={(value: number) => [`€${value.toFixed(2)}`, 'Revenus']}
            />
            <Bar dataKey="earnings" name="Revenus (€)" fill="var(--accent, #2563eb)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
