"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";

export default function DriverVerificationPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!user || userProfile?.role !== 'driver') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle /> Accès Refusé
            </CardTitle>
            <CardDescription>
              Cette page est réservée aux chauffeurs AngelWatch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseFile || !insuranceFile) {
      setMessage({ type: 'error', text: "Veuillez sélectionner tous les documents requis." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1. Upload License
      const licenseRef = ref(storage, `drivers/${user.uid}/license_${Date.now()}`);
      await uploadBytes(licenseRef, licenseFile);
      const licenseUrl = await getDownloadURL(licenseRef);

      // 2. Upload Insurance
      const insuranceRef = ref(storage, `drivers/${user.uid}/insurance_${Date.now()}`);
      await uploadBytes(insuranceRef, insuranceFile);
      const insuranceUrl = await getDownloadURL(insuranceRef);

      // 3. Update Firestore Profile
      await updateDoc(doc(db, "users", user.uid), {
        licenseUrl,
        insuranceUrl,
        verificationStatus: "pending",
        updatedAt: new Date().toISOString()
      });

      setMessage({ type: 'success', text: "Documents envoyés avec succès ! Votre profil est en cours de vérification." });
      
      // Optional: Redirect after delay
      setTimeout(() => router.push('/dashboard'), 3000);

    } catch (error: any) {
      console.error("Upload error:", error);
      setMessage({ type: 'error', text: "Une erreur est survenue lors de l'envoi. Veuillez réessayer." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBF1F4] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#2D598F]">Vérification Chauffeur</h1>
          <p className="text-slate-600">Pour garantir la sécurité de nos utilisateurs, nous avons besoin de valider vos documents.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Documents Requis</CardTitle>
            <CardDescription>Format accepté : JPG, PNG, PDF (Max 5MB)</CardDescription>
          </CardHeader>
          <CardContent>
            {userProfile.verificationStatus === 'pending' ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md flex items-center gap-3">
                <Loader2 className="animate-spin h-5 w-5" />
                <p>Vos documents sont en cours d'examen par nos équipes.</p>
              </div>
            ) : userProfile.verificationStatus === 'verified' ? (
               <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md flex items-center gap-3">
                <CheckCircle className="h-5 w-5" />
                <p>Votre profil est vérifié. Vous pouvez accepter des courses.</p>
              </div>
            ) : (
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="license">Permis de conduire (Recto/Verso)</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="license" 
                        type="file" 
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurance">Attestation d'Assurance</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="insurance" 
                        type="file" 
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setInsuranceFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </div>

                {message && (
                  <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                  </div>
                )}

                <Button type="submit" className="w-full bg-[#2D598F]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Envoyer les documents
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}