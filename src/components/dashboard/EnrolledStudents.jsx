
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, MoreHorizontal, Eye, UserPlus, MessageSquare, Check, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { addFriend, getFriends } from '@/lib/api';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';
import EnrolledStudentsModal from './EnrolledStudentsModal';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const EnrolledStudents = ({ students = [], programName, isAdmin = false, onRefresh }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [friendIds, setFriendIds] = useState(new Set());
  const [pendingIds, setPendingIds] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar amistades actuales y solicitudes pendientes
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      try {
        const { friends, requests } = await getFriends();
        setFriendIds(new Set(friends.map(f => f.id)));
        setPendingIds(new Set(requests.map(r => r.id)));
      } catch (e) {
        // Silencioso; no crítico
      }
    })();
  }, []);

  const handleActionClick = (description) => {
    toast({
      title: '🚧 Función en desarrollo',
      description,
    });
  };

  const handleViewProfile = (studentId) => {
    navigate(`/profile/${studentId}`);
  };
  
  const handleAddFriend = async (student) => {
    try {
      await addFriend(student.id);
      setPendingIds(prev => new Set([...prev, student.id]));
      toast({ title: 'Solicitud enviada', description: `Has enviado una solicitud a ${student.display_name}.` });
    } catch (e) {
      toast({ title: 'No se pudo enviar', description: e.message, variant: 'destructive' });
    }
  };

  const handleSendMessage = (studentName) => {
    handleActionClick(`Pronto podrás enviar mensajes a ${studentName}.`);
  };

  const handleViewAll = () => {
    navigate('/admin/registrations');
  };

  // Memoizar los estudiantes filtrados
  const filteredStudents = useMemo(() => {
    // Si no hay estudiantes, retornar array vacío
    if (!students || students.length === 0) return [];
    
    // MOSTRAR TODOS LOS ESTUDIANTES incluyendo al usuario actual
    return students;
  }, [students]);
  
  // Preview muestra TODOS los usuarios (incluyendo al usuario actual)
  const previewStudents = filteredStudents.slice(0, 5);
  const remainingCount = Math.max(0, filteredStudents.length - 5);
  
  // Memoizar el estado de "hay contenido para mostrar"
  const hasContent = filteredStudents.length > 0;

  return (
    <>
      <motion.div variants={cardVariants} className="p-4 border bg-card border-border rounded-xl sm:p-6">
        {/* Header con contador total (incluyendo usuario actual) */}
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold leading-snug sm:text-lg">
            <Users className="flex-shrink-0 w-5 h-5 text-primary" />
            <span>Usuarios Inscritos</span>
            <span className="text-xs font-normal text-muted-foreground sm:text-sm">
              ({filteredStudents.length})
            </span>
          </h3>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onRefresh}
              className="w-8 h-8"
              title="Actualizar lista"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {hasContent ? (
          <>
            {/* Preview muestra solo otros usuarios */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-3">
                {previewStudents.map((student, index) => (
                  <Avatar 
                    key={`avatar-${student.id}`} 
                    className="w-10 h-10 transition-transform border-2 cursor-pointer border-background sm:w-12 sm:h-12 hover:scale-110"
                    style={{ zIndex: previewStudents.length - index }}
                    onClick={() => setShowModal(true)}
                  >
                    <AvatarImage src={student.photo_url} alt={student.display_name} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary sm:text-sm">
                      {student.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {/* Mostrar badge +N si hay más usuarios */}
                {remainingCount > 0 && (
                  <div 
                    className="flex items-center justify-center w-10 h-10 transition-transform border-2 rounded-full cursor-pointer sm:w-12 sm:h-12 bg-primary/20 border-background hover:scale-110"
                    onClick={() => setShowModal(true)}
                  >
                    <span className="text-xs font-bold text-primary sm:text-sm">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botón Ver Todos con contador total */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
              className="justify-center w-full text-xs sm:text-sm"
            >
              Ver Todos ({filteredStudents.length})
            </Button>

            {/* Lista expandida (solo para admin, opcional) */}
            {isAdmin && (
              <div className="mt-4 pt-4 border-t border-border space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {previewStudents.map((student) => {
                  const isMe = student.id === currentUserId;
                  const isFriend = friendIds.has(student.id);
                  const isPending = pendingIds.has(student.id);
                  return (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-accent">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.photo_url} alt={student.display_name} />
                          <AvatarFallback>{student.display_name?.charAt(0)?.toUpperCase() || 'A'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.display_name}</p>
                          <p className="text-sm text-muted-foreground">{student.program_name}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProfile(student.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            <span>Visitar Perfil</span>
                          </DropdownMenuItem>
                          {!isMe && !isFriend && !isPending && (
                            <DropdownMenuItem onClick={() => handleAddFriend(student)}>
                              <UserPlus className="w-4 h-4 mr-2" />
                              <span>Agregar como Amigo</span>
                            </DropdownMenuItem>
                          )}
                          {isFriend && (
                            <div className="px-2 py-1.5 text-sm flex items-center gap-2 text-green-500">
                              <Check className="w-4 h-4" /> Amigo
                            </div>
                          )}
                          {isPending && !isFriend && (
                            <div className="px-2 py-1.5 text-sm flex items-center gap-2 text-yellow-500">
                              <Clock className="w-4 h-4" /> Pendiente
                            </div>
                          )}
                          <DropdownMenuItem onClick={() => handleSendMessage(student.display_name)}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            <span>Enviar Mensaje</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground sm:w-12 sm:h-12" />
            <p className="text-sm sm:text-base text-muted-foreground">
              Aún no hay usuarios inscritos en este programa.
            </p>
          </div>
        )}
      </motion.div>

      {/* Modal pasa todos los estudiantes (incluyendo usuario actual) */}
      <EnrolledStudentsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        students={filteredStudents}
        programName={programName}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default EnrolledStudents;
