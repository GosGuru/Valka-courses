import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6">
        <h1 className="text-4xl tracking-wider font-logo text-primary">VALKA</h1>
        <Button
          onClick={onLoginClick}
          variant="outline"
          className="transition-colors duration-300 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Iniciar Sesión
        </Button>
      </header>

      <main className="flex items-center justify-center flex-1 min-h-dvh">
        <div className="relative z-10 p-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl tracking-widest font-logo md:text-8xl lg:text-9xl text-foreground"
          >
            VALKA
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto mt-4 text-xl text-muted-foreground md:text-2xl"
          >
            Planes de entrenamiento inteligentes para desbloquear tu verdadero
            potencial.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10"
          >
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="px-12 py-6 text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Únete ahora
            </Button>
          </motion.div>
        </div>
      </main>

      <div className="absolute inset-0 z-0 opacity-10">
        <img
          className="object-cover w-full h-full"
          alt="fondo de gimnasio oscuro"
          src="https://horizons-cdn.hostinger.com/fde49ae2-5262-4e73-9e30-4e32b2057cb9/08c910b2aa6c5761c0985b9a5055bab17bbbc0a9-5N1O9.png"
        />
      </div>
      <div className="absolute inset-0 z-0 bg-background/80"></div>

      {/* Sección de Filosofía VALKA */}
      

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 max-w-6xl p-5 mx-auto mt-0 mb-16 sm:px-6 bg-neutral-900 inset-shadow-current drop-shadow-none rounded-3xl"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
          {/* Texto primero (mobile-first) */}
          <div className="md:col-span-7">
            <h2 className="text-2xl font-semibold tracking-wide sm:text-3xl md:text-4xl text-foreground">
              La Filosofía <span className="text-primary">VALKA</span>
            </h2>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground">
              Acá no solo levantamos el cuerpo, levantamos la mente. Creemos en:
            </p>

            <dl className="space-y-3.5 mt-2">
              <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
                <dt className="font-semibold text-primary">80/20:</dt>
                <dd className="text-foreground">
                  Foco en lo esencial que te da el 80% de los resultados.
                </dd>
              </div>
              <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
                <dt className="font-semibold text-primary">Feynman:</dt>
                <dd className="text-foreground">
                  Explicaciones simples. Si no lo podés explicar fácil, no lo entendés bien.
                </dd>
              </div>
              <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
                <dt className="font-semibold text-primary">Comunidad:</dt>
                <dd className="text-foreground">
                  La plaza nos une. El progreso nos define.
                </dd>
              </div>
              <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
                <dt className="font-semibold text-primary">Disciplina:</dt>
                <dd className="text-foreground">
                  Hacer lo que hay que hacer, sin excusas.
                </dd>
              </div>
            </dl>
          </div>

          {/* Imagen: se oculta en mobile para priorizar legibilidad */}
          <div className="hidden md:block md:col-span-5">
            <div className="relative overflow-hidden shadow-lg rounded-xl ring-1 ring-white/10">
              <img
                src="https://horizons-cdn.hostinger.com/fde49ae2-5262-4e73-9e30-4e32b2057cb9/08c910b2aa6c5761c0985b9a5055bab17bbbc0a9-5N1O9.png"
                alt="Entrenamiento en la plaza"
                className="h-[260px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default LandingPage;
