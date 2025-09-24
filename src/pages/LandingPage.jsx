import React from "react";
import { Helmet } from 'react-helmet';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Brain, Users, Flame, Compass } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

// Helper WhatsApp (faltaba en este archivo)
const WA_BASE = "https://wa.me/59894734367";
const waLink = (text) => `${WA_BASE}?text=${encodeURIComponent(text)}`;

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
  const faq = [
    { q: '¿Cuánto sale entrenar en VALKA?', a: 'Ofrecemos planes escalables según tu nivel y objetivos. Escribinos por WhatsApp para opciones actuales y promos locales.' },
    { q: '¿En cuánto tiempo veo resultados?', a: 'En 4–6 semanas mejoras control y fuerza base. Cambios visuales suelen apreciarse entre la semana 8 y 16 con consistencia.' },
    { q: '¿Qué diferencia a VALKA de una rutina genérica?', a: 'Nuestro enfoque prioriza progresiones medibles, técnica y prevención de sobreuso. Menos ruido, más avance real.' },
    { q: '¿Cuántos días por semana necesito?', a: 'Podés progresar con 3 días. Ideal 4–5 si buscás fuerza + skills. Ajustamos según recuperación y vida personal.' },
    { q: '¿Puedo empezar sin equipo?', a: 'Sí. Iniciamos con palancas básicas y patrones fundamentales. Luego sugerimos barra, anillas y banda de resistencia.' }
  ];
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6">
        <h1 className="text-4xl tracking-wider font-logo text-primary">
          VALKA
        </h1>
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
            <RouterLink to="/chat" className="ml-3 inline-block" aria-label="Abrir chat VALKA">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-full">
                Probar el Chat
              </Button>
            </RouterLink>
            <div className="flex items-center justify-center gap-1 mt-4 text-sm group">
              <Link
                to="/calistenia-durazno"
                className="inline-flex items-center gap-1 transition-colors border-b border-transparent text-primary group-hover:border-primary"
              >
                Conocé cómo entrenamos en Durazno
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Fondo con imagen y overlay */}
      <div className="absolute inset-0 z-0 opacity-10">
        {/* <img
          className="object-cover w-full h-full"
          alt="fondo de gimnasio oscuro"
          src="Hero.jpeg"
        /> */}
      </div>
      <div className="absolute z-0 inset-2 bg-background/50"></div>

      {/* Sección de Filosofía VALKA (mejorada para UX + SEO local) */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        aria-labelledby="filosofia-valka"
        className="relative z-10 max-w-6xl px-6 py-10 mx-auto mt-0 mb-20 rounded-3xl sm:px-10 focus-within:ring-2 focus-within:ring-primary/40"
      >
        {/* Background decoration */}
        <div aria-hidden className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-800" />
        <div aria-hidden className="absolute inset-0 rounded-3xl ring-1 ring-border/60" />
        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
          <div className="space-y-6 md:col-span-7">
            <header className="space-y-4">
              <h2
                id="filosofia-valka"
                className="text-3xl font-bold tracking-tight md:text-4xl text-foreground"
              >
                La filosofía <span className="text-primary">VALKA</span>
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground max-w-prose">
                Calistenia inteligente en Durazno: técnica, movilidad y fuerza
                al servicio de una evolución sostenible. Entrenás con enfoque
                claro, progresiones medibles y comunidad que sostiene el hábito.
              </p>
            </header>

            {/* Valores base re-maquetados con íconos accesibles */}
            <ul
              className="grid gap-4 sm:grid-cols-2"
              role="list"
              aria-label="Principios y valores VALKA"
            >
              {[
                { icon: Target, title: '80/20', desc: 'Foco en lo esencial que produce la mayor parte del progreso.' },
                { icon: Brain, title: 'Feynman', desc: 'Explicaciones simples para entender y aplicar mejor.' },
                { icon: Users, title: 'Comunidad', desc: 'La plaza y el grupo sostienen disciplina y motivación.' },
                { icon: Flame, title: 'Disciplina', desc: 'Hacer lo que toca incluso cuando no hay ganas.' }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.title}
                    className="relative flex gap-4 p-4 transition border group rounded-xl border-border/60 bg-background/20 backdrop-blur-sm hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary/40"
                  >
                    <div className="flex items-center justify-center rounded-lg w-11 h-11 bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold tracking-wide text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Bloques informativos */}
            <div className="grid gap-5 sm:grid-cols-2" aria-label="Información adicional" role="list">
              {[{
                title: '¿Quiénes entrenan?',
                lines: ['Principiantes: primera dominada y control básico.', 'Salud y movilidad: menos dolor, más rango útil.', 'Skills: handstand, front lever, muscle-up limpio.']
              }, {
                title: 'Qué te llevás',
                lines: ['Progresiones guiadas y seguimiento real.', 'Técnica y seguridad en cada repetición.', 'Comunidad para sostener consistencia.']
              }].map(block => (
                <div key={block.title} className="relative p-5 border rounded-xl border-border/60 bg-background/30 backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary/40">
                  <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase text-primary">
                    {block.title}
                  </h3>
                  <ul className="pl-4 space-y-1 text-xs list-disc text-muted-foreground" role="list">
                    {block.lines.map(l => <li key={l}>{l}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA + navegación interna */}
            <div className="flex flex-wrap items-center gap-5 pt-2">
              <Button
                onClick={() => window.open(waLink('Quiero unirme a VALKA'), '_blank', 'noopener,noreferrer')}
                aria-label="Unirme ahora por WhatsApp"
                className="min-w-[11rem]"
              >
                Unite ahora
              </Button>
              <a
                href="#training-how"
                className="inline-flex items-center text-sm font-medium rounded text-primary hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Ver cómo entrenamos <ArrowRight className="w-4 h-4 ml-1" />
              </a>
              <a
                href="/calistenia-durazno"
                className="inline-flex items-center text-sm font-medium rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Landing local <Compass className="w-4 h-4 ml-1" />
              </a>
              <RouterLink
                to="/chat"
                className="inline-flex items-center text-sm font-medium rounded text-primary hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Ir al Chat <ArrowRight className="w-4 h-4 ml-1" />
              </RouterLink>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground max-w-prose">
              Entrenamos en Durazno y alrededores (al aire libre y espacios acordados). Escribinos por WhatsApp para horarios y punto de encuentro exacto.
            </p>
          </div>
          {/* Imagen */}
          <div className="space-y-5 md:col-span-5">
            <figure className="relative overflow-hidden border shadow-lg rounded-2xl border-border/60 bg-background/40 backdrop-blur-sm">
              <img
                src="sobreNosotros.jpeg"
                alt="Grupo de entrenamiento de calistenia VALKA en Durazno realizando progresiones"
                className="h-[260px] w-full object-cover md:h-[360px]"
                loading="lazy"
              />
              <figcaption className="sr-only">Atletas de VALKA entrenando progresiones de calistenia en Durazno.</figcaption>
            </figure>
            <div className="hidden text-xs leading-relaxed md:block text-muted-foreground">
              <p><strong className="text-foreground">Transparencia:</strong> mostramos la realidad del proceso: postura, transiciones y pausas técnicas antes de las habilidades avanzadas.</p>
            </div>
          </div>
        </div>
      </motion.section>
      {/* FAQ inline visible (apoya intención de búsqueda) */}
      <section className="max-w-4xl px-6 pb-20 mx-auto space-y-6">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-primary">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {faq.map(item => (
            <div key={item.q} className="p-4 border rounded-lg bg-card/40 border-border/60">
              <h3 className="mb-1 text-base font-semibold">{item.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">¿Tenés otra duda? Escribinos directamente y te respondemos en menos de 24h.</p>
      </section>
    </div>
  );
};

export default LandingPage;
