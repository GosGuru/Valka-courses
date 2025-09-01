
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const adminSections = [
    {
      title: 'Gestionar Programas',
      description: 'Crear, editar y organizar los programas de entrenamiento.',
      link: '/admin/programs',
      icon: Target,
      color: 'primary'
    },
    {
      title: 'Gestionar Biblioteca',
      description: 'Administrar categorías y lecciones de la biblioteca educativa.',
      link: '/admin/library',
      icon: BookOpen,
      color: 'secondary'
    },
    {
      title: 'Registros',
      description: 'Ver inscripciones de usuarios y progreso en las sesiones.',
      link: '/admin/registrations',
      icon: Users,
      color: 'green-500'
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6"
    >
      <motion.div variants={cardVariants} className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-wider">Panel de Administración</h1>
          <p className="text-muted-foreground">Herramientas para gestionar el contenido y los usuarios de VALKA.</p>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.div key={section.title} variants={cardVariants}>
              <Link to={section.link}>
                <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col hover:border-primary transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 bg-${section.color}/20 rounded-lg flex items-center justify-center`}>
                       <Icon className={`w-5 h-5 text-${section.color}`} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-wider">{section.title}</h2>
                  </div>
                  <p className="text-muted-foreground flex-grow">{section.description}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default AdminPanel;
