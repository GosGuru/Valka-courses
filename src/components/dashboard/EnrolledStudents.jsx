
import React from 'react';
import { motion } from 'framer-motion';
import { Users, MoreHorizontal, Eye, UserPlus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const EnrolledStudents = ({ students, programId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleActionClick = (description) => {
    toast({
      title: '🚧 Función en desarrollo',
      description,
    });
  };

  const handleViewProfile = (studentId) => {
    navigate(`/profile/${studentId}`);
  };
  
  const handleAddFriend = (studentName) => {
    handleActionClick(`La función para agregar a ${studentName} como amigo se implementará pronto.`);
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
    <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Alumnos Inscritos
        </h3>
        <Button variant="outline" size="sm" onClick={handleViewAll}>
          Ver Todos
        </Button>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredStudents.map((student) => (
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
                  <DropdownMenuItem onClick={() => handleAddFriend(student.display_name)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Agregar como Amigo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSendMessage(student.display_name)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Enviar Mensaje</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aún no hay alumnos inscritos.</p>
        </div>
      )}
    </motion.div>
  );
};

export default EnrolledStudents;
