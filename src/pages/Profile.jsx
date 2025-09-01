
    import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, 
  Trophy, 
  Settings,
  Award,
  TrendingUp,
  LogOut,
  Users2,
  UserPlus,
  Search,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getUserProfile, getUserBadges, getUserPRs, getFriends, searchUsers, addFriend, respondToFriendRequest } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { isValid } from 'date-fns';

const Profile = () => {
  const { toast } = useToast();
  const { user, signOut, session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [prs, setPRs] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!session) {
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const [userProfile, userBadges, userPRs, friendsData] = await Promise.all([
        getUserProfile(),
        getUserBadges(),
        getUserPRs(),
        getFriends(),
      ]);
      setProfile(userProfile);
      setBadges(userBadges);
      setPRs(userPRs);
      setFriends(friendsData.friends);
      setFriendRequests(friendsData.requests);
    } catch (error) {
      toast({
        title: "Error al cargar perfil",
        description: "No se pudo cargar tu información. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, session]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  useEffect(() => {
    const search = async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        return;
      }
      const results = await searchUsers(searchTerm);
      const friendsAndRequestsIds = [...friends.map(f => f.id), ...friendRequests.map(r => r.id)];
      const filteredResults = results.filter(r => r.id !== user.id && !friendsAndRequestsIds.includes(r.id));
      setSearchResults(filteredResults);
    };
    
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, friends, friendRequests, user]);

  const handleAddFriend = async (friendId) => {
    try {
      await addFriend(friendId);
      toast({ title: 'Solicitud enviada', description: 'Tu solicitud de amistad ha sido enviada.' });
      setSearchTerm(''); // Clear search
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };
  
  const handleFriendRequest = async (friendId, accept) => {
    try {
      await respondToFriendRequest(friendId, accept);
      toast({ title: 'Solicitud respondida', description: `Has ${accept ? 'aceptado' : 'rechazado'} la solicitud.` });
      loadData(); // Reload data
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  if (loading || authLoading) {
    return <div className="h-full flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-t-transparent border-primary rounded-full" /></div>;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={cardVariants} className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4"><AvatarImage src={profile?.photo_url} alt={profile?.display_name} /><AvatarFallback className="text-3xl font-bold">{profile?.display_name?.charAt(0)?.toUpperCase() || 'V'}</AvatarFallback></Avatar>
            <h2 className="text-2xl font-bold mb-1">{profile?.display_name || user?.email}</h2>
            <p className="text-muted-foreground mb-4 capitalize">Rol: {profile?.role || 'Usuario'}</p>
            <Link to="/profile/edit" className="block w-full"><Button className="w-full bg-primary text-primary-foreground"><Settings className="w-4 h-4 mr-2" />Editar Perfil</Button></Link>
            <Button onClick={signOut} variant="outline" className="w-full mt-2"><LogOut className="w-4 h-4 mr-2" />Cerrar Sesión</Button>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="prs">PRs</TabsTrigger>
              <TabsTrigger value="friends">Amigos</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="bg-card border border-border rounded-xl p-6 mt-4">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-yellow-400" />Logros Recientes</h3>
                <div className="space-y-3">
                  {badges.slice(0, 3).map((badge, index) => <div key={index} className="flex items-center gap-3 p-3 bg-accent rounded-lg"><div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center"><Trophy className="w-5 h-5 text-yellow-400" /></div><div className="flex-1"><p className="font-medium text-sm">{badge.name}</p></div><span className="text-xs font-bold text-yellow-400">+{badge.points}</span></div>)}
                  {badges.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aún no has ganado logros.</p>}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="prs">
              <div className="bg-card border border-border rounded-xl p-6 mt-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-green-400" />Récords Personales</h3>
                <div className="space-y-4 mt-6">
                  {prs.map((pr, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">{pr.type}</p>
                          {pr.date && isValid(new Date(pr.date)) &&
                            <p className="text-sm text-muted-foreground">{new Date(pr.date).toLocaleDateString()}</p>
                          }
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-400">{pr.value} {pr.unit}</p>
                      </div>
                    </div>
                  ))}
                  {prs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aún no has registrado Récords Personales.</p>}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="friends">
              <div className="bg-card border border-border rounded-xl p-6 mt-4 space-y-6">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><UserPlus className="w-5 h-5 text-primary" />Buscar Amigos</h3>
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input placeholder="Buscar por nombre..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                  <div className="mt-4 space-y-2">
                    {searchResults.map(res => <div key={res.id} className="flex items-center justify-between p-2 bg-accent rounded-lg"><div className="flex items-center gap-2"><Avatar className="w-8 h-8"><AvatarImage src={res.photo_url} /><AvatarFallback>{res.display_name.charAt(0)}</AvatarFallback></Avatar><span>{res.display_name}</span></div><Button size="sm" onClick={() => handleAddFriend(res.id)}>Agregar</Button></div>)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4">Solicitudes Pendientes ({friendRequests.length})</h3>
                  <div className="space-y-2">
                    {friendRequests.length > 0 ? friendRequests.map(req => <div key={req.id} className="flex items-center justify-between p-2 bg-accent rounded-lg"><div className="flex items-center gap-2"><Avatar className="w-8 h-8"><AvatarImage src={req.photo_url} /><AvatarFallback>{req.display_name.charAt(0)}</AvatarFallback></Avatar><span>{req.display_name}</span></div><div className="flex gap-2"><Button size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600" onClick={() => handleFriendRequest(req.id, true)}><Check className="h-4 w-4" /></Button><Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleFriendRequest(req.id, false)}><X className="h-4 w-4" /></Button></div></div>) : <p className="text-sm text-muted-foreground text-center">No tienes solicitudes pendientes.</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Users2 className="w-5 h-5 text-primary" />Mis Amigos ({friends.length})</h3>
                  <div className="space-y-2">
                    {friends.length > 0 ? friends.map(friend => <div key={friend.id} className="flex items-center p-2 bg-accent rounded-lg"><Avatar className="w-8 h-8 mr-2"><AvatarImage src={friend.photo_url} /><AvatarFallback>{friend.display_name.charAt(0)}</AvatarFallback></Avatar><span>{friend.display_name}</span></div>) : <p className="text-sm text-muted-foreground text-center">Aún no tienes amigos.</p>}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;
  