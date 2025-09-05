
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MoreHorizontal, Eye, UserPlus, MessageSquare, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { addFriend, getFriends } from '@/lib/api';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const EnrolledStudents = ({ students, programId, isAdmin = false }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [friendIds, setFriendIds] = useState(new Set());
  const [pendingIds, setPendingIds] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);

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

  const filteredStudents = programId
    ? students.filter(s => s.program_id === programId)
    : students;

  return (
    <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-base font-bold flex items-center gap-2 sm:text-lg leading-snug">
          <Users className="w-5 h-5 text-primary flex-shrink-0" />
          <span>Alumnos Inscritos</span>
        </h3>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAll}
            className="w-full sm:w-auto justify-center text-xs sm:text-sm whitespace-nowrap"
          >
            <span className="sm:hidden">Ver</span>
            <span className="hidden sm:inline">Ver Todos</span>
          </Button>
        )}
      </div>

      {filteredStudents.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredStudents.map((student) => {
            const isMe = student.id === currentUserId;
            const isFriend = friendIds.has(student.id);
            const isPending = pendingIds.has(student.id);
            return (
            <div key={student.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
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
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Visitar Perfil</span>
                  </DropdownMenuItem>
                  {!isMe && !isFriend && !isPending && (
                    <DropdownMenuItem onClick={() => handleAddFriend(student)}>
                      <UserPlus className="mr-2 h-4 w-4" />
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
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Enviar Mensaje</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )})}
        </div>
      ) : (
        <div className="text-center py-6">
          <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3 sm:w-12 sm:h-12" />
          <p className="text-sm sm:text-base text-muted-foreground">Aún no hay alumnos inscritos.</p>
        </div>
      )}
    </motion.div>
  );
};

export default EnrolledStudents;
