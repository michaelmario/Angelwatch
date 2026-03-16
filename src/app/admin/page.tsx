
"use client";

import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Users, 
  UserPlus, 
  Trash2, 
  Edit, 
  Search, 
  ChevronLeft, 
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { UserProfile, UserRole } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminDashboard() {
  const db = useFirestore();
  const { user: authUser, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  // Admin Check
  const profileRef = useMemo(() => authUser ? doc(db, 'users', authUser.uid) : null, [db, authUser]);
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(profileRef);

  // Users Collection
  const usersQuery = useMemo(() => collection(db, 'users'), [db]);
  const { data: users, loading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserProfile> | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleSaveUser = () => {
    if (!editingUser?.name || !editingUser?.role) {
      toast({ title: "Champs requis", description: "Veuillez remplir le nom et le rôle.", variant: "destructive" });
      return;
    }

    const userId = editingUser.id || doc(collection(db, 'users')).id;
    const userRef = doc(db, 'users', userId);
    const data = {
      ...editingUser,
      id: userId,
      updatedAt: new Date().toISOString()
    };

    setDoc(userRef, data, { merge: true })
      .then(() => {
        toast({ title: editingUser.id ? "Utilisateur mis à jour" : "Utilisateur créé", description: `${editingUser.name} a été enregistré avec succès.` });
        setIsDialogOpen(false);
        setEditingUser(null);
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: editingUser.id ? 'update' : 'create',
          requestResourceData: data
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) {
      setIsDeleting(id);
      const userRef = doc(db, 'id', id);
      deleteDoc(userRef)
        .then(() => {
          toast({ title: "Utilisateur supprimé", description: `${name} a été retiré de la base de données.` });
        })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'delete'
          });
          errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => setIsDeleting(null));
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Accès Refusé</h1>
        <p className="text-slate-500 mb-6 max-w-md">Vous devez disposer de privilèges d'administrateur pour accéder à cette page.</p>
        <Button asChild>
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-[#0a111a] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-accent p-2 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Console Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-white border-white/20 px-3 py-1">
              Admin: {userProfile.name}
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Utilisateurs Totaux</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-slate-900">{users?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chauffeurs Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-accent">{users?.filter(u => u.role === 'driver').length || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clients Enregistrés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-slate-900">{users?.filter(u => u.role === 'client').length || 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" /> Gestion des Utilisateurs
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 rounded-xl" onClick={() => setEditingUser({ role: 'client' })}>
                  <UserPlus className="w-4 h-4 mr-2" /> Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2rem] p-8 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{editingUser?.id ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nom complet</label>
                    <Input 
                      placeholder="Ex: Jean Dupont" 
                      className="h-14 rounded-2xl bg-slate-50 border-none"
                      value={editingUser?.name || ''}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</label>
                    <Input 
                      placeholder="Ex: jean@email.com" 
                      className="h-14 rounded-2xl bg-slate-50 border-none"
                      value={editingUser?.email || ''}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rôle</label>
                    <Select 
                      value={editingUser?.role} 
                      onValueChange={(val: UserRole) => setEditingUser(prev => ({ ...prev, role: val }))}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="driver">Chauffeur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Annuler</Button>
                  <Button onClick={handleSaveUser} className="bg-[#0a111a] hover:bg-[#1a2c42] rounded-xl px-8 font-bold">Enregistrer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <div className="p-0">
            <div className="px-6 py-4 bg-slate-50/50 flex items-center border-b border-slate-100">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Rechercher par nom ou email..." 
                  className="pl-10 h-10 bg-white border-slate-200 rounded-lg text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-xs font-bold uppercase tracking-widest">Utilisateur</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest">Rôle</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-slate-400">
                      Aucun utilisateur trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{user.name}</span>
                          <span className="text-xs text-slate-500">{user.email || 'Pas d\'email'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-md px-2 py-0.5 text-[10px] uppercase font-black ${
                          user.role === 'admin' ? 'bg-red-100 text-red-600 border-red-200' :
                          user.role === 'driver' ? 'bg-accent/10 text-accent border-accent/20' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`} variant="outline">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-accent rounded-lg"
                          onClick={() => {
                            setEditingUser(user);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-lg"
                          disabled={isDeleting === user.id}
                          onClick={() => handleDeleteUser(user.id, user.name)}
                        >
                          {isDeleting === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
      
      <footer className="bg-white border-t p-6 text-center">
        <p className="text-xs text-slate-400">Utilisez cette interface avec précaution. Toutes les modifications sont immédiates.</p>
      </footer>
    </div>
  );
}
