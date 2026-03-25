"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, TrendingUp, Wallet, CreditCard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CompletedRide {
  id: string;
  createdAt: string;
  price: number;
  status: string;
}

export default function EarningsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState<CompletedRide[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || userProfile?.role !== 'driver')) {
      router.push('/dashboard');
      return;
    }

    const fetchEarnings = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "serviceRequests"),
          where("driverId", "==", user.uid),
          where("status", "==", "completed"),
          orderBy("createdAt", "asc")
        );
        
        const snapshot = await getDocs(q);
        const data: CompletedRide[] = [];
        
        snapshot.forEach(doc => {
          const d = doc.data();
          // Simulate a price if not present (Mock logic for MVP Phase 3)
          const price = d.price || Math.floor(Math.random() * (50 - 20 + 1) + 20);
          data.push({ id: doc.id, ...d, price } as CompletedRide);
        });
        
        setRides(data);
      } catch (err) {
        console.error("Error fetching earnings", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchEarnings();
  }, [user, userProfile, authLoading, router]);

  const stats = useMemo(() => {
    const total = rides.reduce((acc, curr) => acc + curr.price, 0);
    const count = rides.length;
    const avg = count > 0 ? total / count : 0;
    return { total, count, avg };
  }, [rides]);

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    rides.forEach(ride => {
      const date = new Date(ride.createdAt).toLocaleDateString('fr-FR', { weekday: 'short' });
      data[date] = (data[date] || 0) + ride.price;
    });
    return Object.entries(data).map(([name, total]) => ({ name, total }));
  }, [rides]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#EBF1F4]"><Loader2 className="w-8 h-8 animate-spin text-[#2D598F]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#EBF1F4] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-2xl font-bold text-[#2D598F]">Mes Revenus</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#2D598F] text-white border-none shadow-lg">
            <CardContent className="p-6 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-white/80 font-medium">Total Gagné</span>
                <Wallet className="w-5 h-5 opacity-80" />
              </div>
              <span className="text-3xl font-bold">{stats.total} €</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 font-medium">Courses Terminées</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-slate-800">{stats.count}</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-slate-500 font-medium">Moyenne / Course</span>
                <CreditCard className="w-5 h-5 text-[#2D598F]" />
              </div>
              <span className="text-3xl font-bold text-slate-800">{stats.avg.toFixed(2)} €</span>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle>Revenus Hebdomadaires</CardTitle>
            <CardDescription>Vos gains sur les 7 derniers jours d'activité.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}€`} />
                    <Tooltip formatter={(value) => [`${value} €`, 'Revenu']} cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="total" fill="#2D598F" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400">Aucune donnée disponible.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}