"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Copy, Share2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Assuming this hook exists based on admin page usage

export default function ReferralPage() {
  const { user, userProfile } = useAuth();
  // Simple referral code logic: use UID or a slice of it
  const referralCode = user ? user.uid.slice(0, 8).toUpperCase() : "LOADING...";
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copié !",
      description: "Code de parrainage copié dans le presse-papier.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins AngelWatch',
          text: `Utilise mon code ${referralCode} pour rejoindre AngelWatch et assurer ta sécurité !`,
          url: window.location.origin,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-[#EBF1F4] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-[#2D598F]">Parrainage</h1>
          <p className="text-slate-600">Invitez vos amis et gagnez des points de fidélité.</p>
        </div>

        {/* Points Card */}
        <Card className="bg-gradient-to-br from-[#2D598F] to-[#1a3a63] text-white border-none">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-blue-100 font-medium mb-1">Vos points fidélité</p>
              <h2 className="text-4xl font-bold">150 pts</h2>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </div>
          </CardContent>
        </Card>

        {/* Referral Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2D598F]" />
              Votre code de parrainage
            </CardTitle>
            <CardDescription>
              Partagez ce code avec vos amis. Ils gagnent 5€ sur leur première course, et vous gagnez 50 points !
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  readOnly 
                  value={referralCode} 
                  className="bg-slate-50 font-mono text-lg text-center tracking-widest font-bold border-dashed border-2" 
                />
              </div>
              <Button onClick={handleCopy} variant="outline" size="icon">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={handleShare} className="w-full bg-[#2D598F]">
              <Share2 className="w-4 h-4 mr-2" /> Partager avec mes amis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}