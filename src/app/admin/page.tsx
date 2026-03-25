
"use client";

import React, { useState, useMemo } from 'react';
import {
  Shield, Users, UserPlus, Trash2, Edit, Search,
  ChevronLeft, Loader2, CheckCircle2, AlertTriangle,
  ListOrdered, BarChart2, AlertOctagon, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { UserProfile, UserRole, ServiceRequest, VerificationStatus, SosAlert, ContactMessage, Application } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  en_route: 'bg-blue-100 text-blue-700',
  awaiting: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-purple-100 text-purple-700',
  arrived: 'bg-green-100 text-green-600',
};

const verificationColors: Record<VerificationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-600',
};

function buildChartData(requests: ServiceRequest[]) {
  const counts: Record<string, number> = {};
  requests.forEach(r => {
    const day = new Date(r.createdAt).toLocaleDateString('fr-FR', { weekday: 'short' });
    counts[day] = (counts[day] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export default function AdminDashboard() {
  const db = useFirestore();
  const { user: authUser, loading: authLoading } = useUser();
  const { toast } = useToast();

  const profileRef = useMemo(() => authUser ? doc(db, 'users', authUser.uid) : null, [db, authUser]);
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(profileRef);

  const usersQuery = useMemo(() => collection(db, 'users'), [db]);
  const { data: users, loading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const requestsQuery = useMemo(() => collection(db, 'serviceRequests'), [db]);
  const { data: requests } = useCollection<ServiceRequest>(requestsQuery);

  const sosQuery = useMemo(() => collection(db, 'sos_alerts'), [db]);
  const { data: sosAlerts } = useCollection<SosAlert>(sosQuery);

  const messagesQuery = useMemo(() => collection(db, 'contactMessages'), [db]);
  const { data: contactMessages } = useCollection<ContactMessage>(messagesQuery);

  const applicationsQuery = useMemo(() => collection(db, 'applications'), [db]);
  const { data: applications } = useCollection<Application>(applicationsQuery);

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

  const chartData = useMemo(() => buildChartData(requests || []), [requests]);

  const handleSaveUser = () => {
    if (!editingUser?.name || !editingUser?.role) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir le nom et le rôle.', variant: 'destructive' });
      return;
    }
    const userId = editingUser.id || doc(collection(db, 'users')).id;
    const userRef = doc(db, 'users', userId);
    const data = { ...editingUser, id: userId, updatedAt: new Date().toISOString() };
    setDoc(userRef, data, { merge: true })
      .then(() => {
        toast({ title: editingUser.id ? 'Utilisateur mis à jour' : 'Utilisateur créé' });
        setIsDialogOpen(false); setEditingUser(null);
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({ path: userRef.path, operation: editingUser.id ? 'update' : 'create', requestResourceData: data });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Supprimer ${name} ?`)) {
      setIsDeleting(id);
      deleteDoc(doc(db, 'users', id)).finally(() => setIsDeleting(null));
    }
  };

  const handleVerification = (userId: string, status: VerificationStatus) => {
    updateDoc(doc(db, 'users', userId), { verificationStatus: status })
      .then(() => toast({ title: `Statut mis à jour: ${status}` }));
  };

  const handleResolve = (alertId: string) => {
    updateDoc(doc(db, 'sos_alerts', alertId), { resolved: true })
      .then(() => toast({ title: 'Alerte résolue' }));
  };

  const handleApplication = (appId: string, status: 'accepted' | 'rejected', userEmail?: string) => {
    updateDoc(doc(db, 'applications', appId), { status })
      .then(() => {
        toast({ title: `Candidature ${status === 'accepted' ? 'approuvée' : 'refusée'}` });
        if (status === 'accepted' && userEmail) {
          // TODO: Send email notification to applicant
        }
      });
  };

  if (authLoading || profileLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Accès Refusé</h1>
        <p className="text-slate-600 mb-6 max-w-md">Privilèges administrateur requis.</p>
        <Button asChild><Link href="/">Retour à l'accueil</Link></Button>
      </div>
    );
  }

  const activeAlerts = (sosAlerts || []).filter(a => !a.resolved);
  const unreadMessages = (contactMessages || []).filter(m => !m.read);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-[#0a111a] text-white p-6 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Retour à l'accueil" className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft className="w-6 h-6" /></Link>
            <div className="flex items-center gap-3">
              <div className="bg-accent p-2 rounded-xl"><Shield className="w-6 h-6 text-white" /></div>
              <h1 className="text-xl font-bold tracking-tight">Console Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeAlerts.length > 0 && (
              <Badge className="bg-red-600 text-white animate-pulse px-3">{activeAlerts.length} SOS</Badge>
            )}
            <Badge variant="outline" className="text-white border-white/20 px-3 py-1">Admin: {userProfile.name}</Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Utilisateurs', value: users?.length || 0, color: 'text-slate-900' },
            { label: 'Chauffeurs', value: users?.filter(u => u.role === 'driver').length || 0, color: 'text-accent' },
            { label: 'Missions', value: requests?.length || 0, color: 'text-blue-600' },
            { label: 'SOS actifs', value: activeAlerts.length, color: 'text-red-600' },
          ].map(stat => (
            <Card key={stat.label} className="bg-white border-none shadow-sm">
              <CardHeader className="pb-1"><CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</CardTitle></CardHeader>
              <CardContent><p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p></CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-white border border-slate-100 rounded-2xl p-1 h-auto">
            <TabsTrigger value="users" className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-[#0a111a] data-[state=active]:text-white">
              <Users className="w-3 h-3 mr-1" /> Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="missions" className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-[#0a111a] data-[state=active]:text-white">
              <ListOrdered className="w-3 h-3 mr-1" /> Missions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-[#0a111a] data-[state=active]:text-white">
              <BarChart2 className="w-3 h-3 mr-1" /> Analytiques
            </TabsTrigger>
            <TabsTrigger value="sos" className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <AlertOctagon className="w-3 h-3 mr-1" /> SOS {activeAlerts.length > 0 && `(${activeAlerts.length})`}
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-[#0a111a] data-[state=active]:text-white">
              <MessageSquare className="w-3 h-3 mr-1" /> Messages {unreadMessages.length > 0 && `(${unreadMessages.length})`}
            </TabsTrigger>
            <TabsTrigger value="applications" className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-[#0a111a] data-[state=active]:text-white">
              <UserPlus className="w-3 h-3 mr-1" /> Candidatures
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
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
                    <DialogHeader><DialogTitle className="text-2xl font-bold">{editingUser?.id ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nom complet</label>
                        <Input placeholder="Jean Dupont" className="h-14 rounded-2xl bg-slate-50 border-none" value={editingUser?.name || ''} onChange={e => setEditingUser(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</label>
                        <Input placeholder="jean@email.com" className="h-14 rounded-2xl bg-slate-50 border-none" value={editingUser?.email || ''} onChange={e => setEditingUser(p => ({ ...p, email: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rôle</label>
                        <Select value={editingUser?.role} onValueChange={(val: UserRole) => setEditingUser(p => ({ ...p, role: val }))}>
                          <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none"><SelectValue /></SelectTrigger>
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
              <div className="px-6 py-4 bg-slate-50/50 flex items-center border-b border-slate-100">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Rechercher..." className="pl-10 h-10 bg-white border-slate-200 rounded-lg text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Utilisateur</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Rôle</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Vérification</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" /></TableCell></TableRow>
                  ) : filteredUsers.map(user => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{user.name}</span>
                          <span className="text-xs text-slate-500">{user.email || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] uppercase font-black ${user.role === 'admin' ? 'bg-red-100 text-red-600' : user.role === 'driver' ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-slate-600'}`} variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.role === 'driver' ? (
                          <Select value={user.verificationStatus || 'pending'} onValueChange={(v: VerificationStatus) => handleVerification(user.id, v)}>
                            <SelectTrigger className={`h-7 text-[10px] font-bold w-[120px] rounded-lg border-none ${verificationColors[user.verificationStatus || 'pending']}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="approved">Approuvé</SelectItem>
                              <SelectItem value="suspended">Suspendu</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" aria-label="Modifier" className="h-8 w-8 text-slate-400 hover:text-accent rounded-lg" onClick={() => { setEditingUser(user); setIsDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label="Supprimer" className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-lg" disabled={isDeleting === user.id} onClick={() => handleDeleteUser(user.id, user.name)}>
                          {isDeleting === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Missions Tab */}
          <TabsContent value="missions">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-accent" /> Toutes les Missions
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Client</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Chauffeur</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Destination</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Statut</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(requests || []).length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">Aucune mission.</TableCell></TableRow>
                  ) : (requests || []).map(req => (
                    <TableRow key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-800">{req.clientName}</TableCell>
                      <TableCell className="text-slate-600">{req.driverName || '—'}</TableCell>
                      <TableCell className="text-slate-600 max-w-[180px] truncate">{req.destination}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] uppercase font-black ${statusColors[req.status] || 'bg-slate-100 text-slate-600'}`}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm bg-white p-6">
                <CardTitle className="text-base font-bold mb-6 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-accent" /> Missions par Jour
                </CardTitle>
                {chartData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">Pas encore de données.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }} />
                      <Bar dataKey="value" name="Missions" fill="var(--accent, #2563eb)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
              <Card className="border-none shadow-sm bg-white p-6 space-y-4">
                <CardTitle className="text-base font-bold">Résumé</CardTitle>
                {[
                  { label: 'Missions terminées', value: (requests || []).filter(r => r.status === 'completed').length, color: 'text-green-600' },
                  { label: 'Missions annulées', value: (requests || []).filter(r => r.status === 'cancelled').length, color: 'text-red-500' },
                  { label: 'En cours', value: (requests || []).filter(r => ['awaiting','en_route','in_progress','arrived'].includes(r.status)).length, color: 'text-blue-600' },
                  { label: 'Chauffeurs approuvés', value: (users || []).filter(u => u.role === 'driver' && u.verificationStatus === 'approved').length, color: 'text-accent' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-b-0">
                    <span className="text-sm text-slate-600">{stat.label}</span>
                    <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </Card>
            </div>
          </TabsContent>

          {/* SOS Tab */}
          <TabsContent value="sos">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-red-600">
                  <AlertOctagon className="w-5 h-5" /> Alertes SOS
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Client</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Heure</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Statut</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(sosAlerts || []).length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">Aucune alerte SOS.</TableCell></TableRow>
                  ) : (sosAlerts || []).map(alert => (
                    <TableRow key={alert.id} className={`transition-colors ${!alert.resolved ? 'bg-red-50/50' : ''}`}>
                      <TableCell className="font-bold text-slate-900">{alert.clientName}</TableCell>
                      <TableCell className="text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString('fr-FR')}</TableCell>
                      <TableCell>
                        <Badge className={alert.resolved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600 animate-pulse'}>
                          {alert.resolved ? 'Résolu' : 'Actif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!alert.resolved && (
                          <Button size="sm" variant="outline" className="rounded-lg text-xs border-green-200 text-green-700 hover:bg-green-50" onClick={() => handleResolve(alert.id)}>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Résoudre
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent" /> Messages de Contact
                </CardTitle>
              </CardHeader>
              <div className="divide-y divide-slate-50">
                {(contactMessages || []).length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">Aucun message.</div>
                ) : (contactMessages || []).map(msg => (
                  <div key={msg.id} className={`p-6 space-y-2 ${!msg.read ? 'bg-accent/5' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{msg.name}</span>
                        <span className="text-slate-400 text-xs ml-2">{msg.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!msg.read && <Badge className="bg-accent text-white text-[10px]">Nouveau</Badge>}
                        <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{msg.subject}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-accent" /> Candidatures Anges
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Candidat</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Contact</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Permis</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Motivation</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest">Statut</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(applications || []).length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">Aucune candidature.</TableCell></TableRow>
                  ) : (applications || []).map(app => (
                    <TableRow key={app.id} className={`hover:bg-slate-50/50 transition-colors ${app.status === 'pending' ? 'bg-yellow-50/30' : ''}`}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{app.name}</span>
                          <span className="text-xs text-slate-500">{app.postalCode}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-600">{app.email}</span>
                          <span className="text-xs text-slate-400">{app.phone || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.drivingLicenseUrl ? (
                          <a href={app.drivingLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline font-medium">
                            Voir le permis →
                          </a>
                        ) : <span className="text-slate-400 text-xs">Non fourni</span>}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-xs text-slate-600 truncate" title={app.motivation}>
                          {app.motivation || '—'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] uppercase font-black ${
                          app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status === 'pending' ? 'En attente' : app.status === 'accepted' ? 'Approuvé' : 'Refusé'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {app.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg text-xs border-green-200 text-green-700 hover:bg-green-50"
                              onClick={() => handleApplication(app.id, 'accepted', app.email)}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg text-xs border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => handleApplication(app.id, 'rejected')}
                            >
                              Refuser
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t p-6 text-center">
        <p className="text-xs text-slate-600">Console Admin AngelWatch — Modifications immédiates et irréversibles.</p>
      </footer>
    </div>
  );
}
