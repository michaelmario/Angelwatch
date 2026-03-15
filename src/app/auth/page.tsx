
"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 min-h-screen">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="bg-primary p-2 rounded-xl group-hover:scale-110 transition-transform">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-primary tracking-tight">AngelWatch</span>
      </Link>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-14 bg-slate-100">
            <TabsTrigger value="client" className="data-[state=active]:bg-white data-[state=active]:text-primary font-bold">Client</TabsTrigger>
            <TabsTrigger value="driver" className="data-[state=active]:bg-white data-[state=active]:text-primary font-bold">Driver</TabsTrigger>
          </TabsList>
          
          <div className="p-8">
            <TabsContent value="client" className="mt-0 space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold text-primary">Welcome Back</h1>
                <p className="text-muted-foreground text-sm">Secure your journey tonight.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input placeholder="Email Address" className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input type="password" placeholder="Password" className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>
                <Button className="w-full h-12 bg-primary text-white font-bold rounded-xl" asChild>
                  <Link href="/dashboard">Login as Client <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="driver" className="mt-0 space-y-6 animate-in fade-in duration-500">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold text-primary">Driver Portal</h1>
                <p className="text-muted-foreground text-sm">Log in to start your shift.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input placeholder="Driver ID or Email" className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input type="password" placeholder="Password" className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>
                <Button className="w-full h-12 bg-accent text-white font-bold rounded-xl" asChild>
                  <Link href="/driver">Login to Drive <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      <p className="mt-8 text-sm text-muted-foreground">
        Don't have an account? <Link href="#" className="text-primary font-bold hover:underline">Register now</Link>
      </p>
    </div>
  );
}
