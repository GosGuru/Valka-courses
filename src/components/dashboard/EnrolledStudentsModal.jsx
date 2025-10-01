import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, UserPlus, Eye, Check, Clock, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { addFriend, getFriends, cancelFriendRequest } from '@/lib/api';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const FILTER_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'friends', label: 'Amigos' },
  { id: 'pending', label: 'Pendientes' },
];

const USERS_PER_PAGE = 30;

const EnrolledStudentsModal = ({ isOpen, onClose, students, programName }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentUserId, setCurrentUserId] = useState(null);
  const [friendIds, setFriendIds] = useState(new Set());
  const [pendingIds, setPendingIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [displayedCount, setDisplayedCount] = useState(USERS_PER_PAGE);
  const [isLoadingAction, setIsLoadingAction] = useState(null);
  const [cancelDialogUser, setCancelDialogUser] = useState(null);

  // Cargar datos de usuario y amistades
  useEffect(() => {
    if (!isOpen) return;
    
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      
      try {
        const { friends, requests } = await getFriends();
        setFriendIds(new Set(friends.map(f => f.id)));
        setPendingIds(new Set(requests.map(r => r.id)));
      } catch (e) {
        console.error('Error loading friends:', e);
      }
    })();
  }, [isOpen]);

  // Reset scroll y estados al abrir
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveFilter('all');
      setDisplayedCount(USERS_PER_PAGE);
    }
  }, [isOpen]);

  // Filtrar y buscar usuarios
  const filteredStudents = useMemo(() => {
    let filtered = [...students]; // Incluir TODOS los usuarios (incluyendo usuario actual)

    // Filtro por texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.display_name?.toLowerCase().includes(query) ||
        s.username?.toLowerCase().includes(query)
      );
    }

    // Filtro por tab
    if (activeFilter === 'friends') {
      filtered = filtered.filter(s => friendIds.has(s.id));
    } else if (activeFilter === 'pending') {
      filtered = filtered.filter(s => pendingIds.has(s.id));
    }

    return filtered;
  }, [students, currentUserId, searchQuery, activeFilter, friendIds, pendingIds]);

  const visibleStudents = filteredStudents.slice(0, displayedCount);
  const hasMore = displayedCount < filteredStudents.length;

  // Acciones
  const handleAddFriend = async (student) => {
    setIsLoadingAction(student.id);
    try {
      await addFriend(student.id);
      setPendingIds(prev => new Set([...prev, student.id]));
      toast({ 
        title: 'Solicitud enviada', 
        description: `Solicitud enviada a ${student.display_name}` 
      });
    } catch (e) {
      toast({ 
        title: 'Error', 
        description: e.message || 'No se pudo enviar la solicitud', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoadingAction(null);
    }
  };

  const handleCancelRequest = async () => {
    if (!cancelDialogUser) return;
    
    setIsLoadingAction(cancelDialogUser.id);
    try {
      await cancelFriendRequest(cancelDialogUser.id);
      setPendingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(cancelDialogUser.id);
        return newSet;
      });
      toast({ 
        title: 'Solicitud cancelada', 
        description: `Solicitud a ${cancelDialogUser.display_name} cancelada` 
      });
    } catch (e) {
      toast({ 
        title: 'Error', 
        description: e.message || 'No se pudo cancelar la solicitud', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoadingAction(null);
      setCancelDialogUser(null);
    }
  };

  const handleViewProfile = (studentId) => {
    navigate(`/profile/${studentId}`);
    onClose();
  };

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 20);
  };

  const handleScrollToTop = () => {
    document.getElementById('students-list')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4"
            >
              <div className="bg-background w-full h-full sm:h-[85vh] sm:max-w-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                
                {/* Header fijo */}
                <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                  <div className="flex items-center justify-between p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-bold sm:text-xl">Inscriptos</h2>
                        {programName && (
                          <p className="text-xs text-muted-foreground sm:text-sm">{programName}</p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={onClose}
                      className="flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Búsqueda */}
                  <div className="px-4 pb-3 sm:px-5 sm:pb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre..."
                        className="pl-10 text-[16px] rounded-xl" // 16px evita zoom en iOS
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Filtros (tabs) */}
                  <div className="flex gap-1 px-4 pb-3 sm:px-5">
                    {FILTER_TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className={`
                          flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all
                          ${activeFilter === tab.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:bg-accent'
                          }
                        `}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista scrolleable */}
                <div 
                  id="students-list"
                  className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4"
                >
                  {visibleStudents.length > 0 ? (
                    <div className="space-y-2">
                      {visibleStudents.map((student) => {
                        const isFriend = friendIds.has(student.id);
                        const isPending = pendingIds.has(student.id);
                        const isPrivate = student.is_private;
                        const isLoading = isLoadingAction === student.id;

                        return (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 bg-accent/50 hover:bg-accent rounded-xl transition-colors"
                          >
                            <div 
                              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                              onClick={() => !isPrivate && handleViewProfile(student.id)}
                            >
                              <Avatar className="flex-shrink-0">
                                <AvatarImage src={student.photo_url} alt={student.display_name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {student.display_name?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm truncate">
                                    {student.display_name || 'Usuario'}
                                  </p>
                                  {student.id === currentUserId && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0">
                                      Tú
                                    </span>
                                  )}
                                  {student.role === 'admin' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold flex-shrink-0">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                {student.username && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    @{student.username}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Botón de acción */}
                            <div className="flex-shrink-0 ml-2">
                              {student.id === currentUserId ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewProfile(student.id)}
                                  className="text-xs"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Mi perfil
                                </Button>
                              ) : isPrivate ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  className="text-xs"
                                >
                                  <Lock className="w-4 h-4 mr-1" />
                                  Privado
                                </Button>
                              ) : isFriend ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewProfile(student.id)}
                                  className="text-xs"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver perfil
                                </Button>
                              ) : isPending ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCancelDialogUser(student)}
                                  disabled={isLoading}
                                  className="text-xs text-yellow-600 dark:text-yellow-500"
                                >
                                  <Clock className="w-4 h-4 mr-1" />
                                  Pendiente
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleAddFriend(student)}
                                  disabled={isLoading}
                                  className="text-xs"
                                >
                                  {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <>
                                      <UserPlus className="w-4 h-4 mr-1" />
                                      Añadir
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Botón cargar más */}
                      {hasMore && (
                        <div className="pt-4 pb-2 text-center">
                          <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            className="w-full sm:w-auto"
                          >
                            Cargar más
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      {searchQuery ? (
                        <>
                          <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
                          <p className="text-muted-foreground mb-4">
                            No encontramos a "{searchQuery}"
                          </p>
                          <Button variant="outline" onClick={() => setSearchQuery('')}>
                            Limpiar búsqueda
                          </Button>
                        </>
                      ) : activeFilter === 'friends' ? (
                        <>
                          <Users className="w-12 h-12 text-muted-foreground mb-3" />
                          <p className="text-muted-foreground mb-4">
                            Aún no tienes amigos inscritos
                          </p>
                          <Button variant="outline" onClick={() => setActiveFilter('all')}>
                            Ver todos
                          </Button>
                        </>
                      ) : (
                        <>
                          <Users className="w-12 h-12 text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">
                            No hay usuarios inscritos aún
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer con contador */}
                {visibleStudents.length > 0 && (
                  <div className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur-sm p-3 text-center">
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Mostrando {visibleStudents.length} de {filteredStudents.length} usuarios
                    </p>
                  </div>
                )}

                {/* Botón volver arriba (aparece al scrollear) */}
                {visibleStudents.length > 10 && (
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleScrollToTop}
                    className="fixed bottom-20 right-4 rounded-full shadow-lg sm:bottom-6 sm:right-6 z-20"
                  >
                    ↑
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dialog de confirmación para cancelar solicitud */}
      <AlertDialog open={!!cancelDialogUser} onOpenChange={() => setCancelDialogUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar solicitud</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de cancelar la solicitud a {cancelDialogUser?.display_name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelRequest}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EnrolledStudentsModal;
