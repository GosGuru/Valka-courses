import React from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const DashboardHeader = ({ profile, user }) => {
  return (
    <motion.div variants={cardVariants} className="mb-8">
      <h1 className="text-4xl font-bold mb-2">
        ¡Bienvenido de vuelta, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">{profile?.display_name || user?.email}</span>! 🔥
      </h1>
      <p className="text-muted-foreground text-lg">Listo para conquistar el día</p>
    </motion.div>
  );
};

export default DashboardHeader;