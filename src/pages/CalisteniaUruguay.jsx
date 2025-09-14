import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Dumbbell, Target, Activity } from 'lucide-react';

const faqs = [
  {
    q: '¿La calistenia sirve para ganar masa muscular?',
    a: 'Sí. Con progresiones de sobrecarga, volumen adecuado y nutrición consistente puedes generar hipertrofia comparable con pesas en fases iniciales e intermedias.'
  },
  {
    q: '¿Necesito equipo para empezar?',
    a: 'Puedes iniciar solo con el peso corporal. Luego añadir barra de dominadas, anillas y bandas acelera progresiones.'
  },
  {
    q: '¿Cuánto tiempo toma ver resultados?',
    a: 'En 4–6 semanas mejoras coordinación y control. Cambios visuales notorios ocurren entre 8–16 semanas de consistencia.'
  },
  {
    q: '¿Sirve para pérdida de grasa?',
    a: 'Sí. Combina gasto calórico, preserva masa muscular y mejora sensibilidad a la insulina. La alimentación sigue siendo clave.'
  },
];

const CalisteniaUruguay = () => {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Calistenia en Uruguay: Guía Completa para Progresar Inteligentemente',
    description: 'Guía estratégica de calistenia en Uruguay: progresiones, fuerza, planificación, nutrición básica y cómo acelerar avances con VALKA.',
    author: { '@type': 'Organization', name: 'VALKA' },
    publisher: { '@type': 'Organization', name: 'VALKA' },
    mainEntityOfPage: 'https://entrenaconvalka.com/calistenia-uruguay',
    image: 'https://entrenaconvalka.com/Hero.jpeg'
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Calistenia en Uruguay | Guía Completa VALKA</title>
        <meta name="description" content="Guía completa de calistenia en Uruguay: progresiones, fuerza, movilidad, planificación inteligente y cómo avanzar más rápido con VALKA." />
        <link rel="canonical" href="https://entrenaconvalka.com/calistenia-uruguay" />
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl px-4 py-10 mx-auto prose prose-invert">
        <h1 className="mb-4 text-4xl font-extrabold leading-tight">Calistenia en Uruguay: Guía Definitiva</h1>
        <p className="text-lg text-muted-foreground">Entrena con estrategia. Esta guía sintetiza cómo estructurar tu progreso en calistenia usando principios de sobrecarga, periodización ligera y control técnico. Perfecto si quieres fuerza funcional, estética sólida y articulaciones sanas.</p>

        <h2>Por qué la Calistenia Inteligente Importa</h2>
        <p>Hay mucha información suelta. La mayoría avanza unas semanas y se estanca por falta de estructura. La plataforma de VALKA soluciona esto con progresiones adaptativas y registros automáticos de rendimiento.</p>

        <h2>Progresiones Clave</h2>
        <ul className="space-y-2 list-none">
          {['Dominadas → L-sit Pull Ups → Muscle Up Estricto','Flexiones → Pseudo Planche → Planche Lean → Progresiones de Plancha','Fondos → Korean Dips → Transiciones en Anillas','Core: Hollow / Arch → Toes to Bar → Front Lever Tuck → Front Lever'].map(item => (
            <li key={item} className="flex items-start gap-2 text-sm"><CheckCircle className="w-4 h-4 mt-1 text-primary" /> {item}</li>
          ))}
        </ul>

        <h2>Estructura Semanal Recomendada</h2>
        <p>3–5 sesiones según objetivo. Ejemplo 4 días:</p>
        <ol>
          <li>Día 1: Tirón + Core anti-extensión</li>
          <li>Día 2: Empuje + Estabilidad escapular</li>
          <li>Día 3: Full Body + Tensión isométrica</li>
          <li>Día 4: Skill + Tirón ligero + Acondicionamiento</li>
        </ol>

        <h2>Principios de Progresión</h2>
        <ul>
          <li><strong>Dominio técnico</strong>: sube dificultad cuando logras 8–10 reps limpias o 20–30s isométrico.</li>
            <li><strong>Registro</strong>: anota repeticiones, RIR (repeticiones en reserva) y sensación articular.</li>
          <li><strong>Variación inteligente</strong>: cambia un vector a la vez (palanca, ROM, tempo, estabilidad).</li>
          <li><strong>Fatiga controlada</strong>: deja 1–2 RIR la mayor parte del tiempo.</li>
        </ul>

        <h2>Errores Comunes en Uruguay</h2>
        <p>Copiar rutinas de atleta avanzado, sobrecarga excesiva de isométricos y descuidar tirones horizontales. La solución: progresión graduada + balance empuje/tirón.</p>

        <h2>Nutrición Base</h2>
        <p>Superávit ligero para fuerza/masa (5–12%), déficit lento para recomposición. Proteína: 1.6–2.2 g/kg. Prioriza hierro, omega 3 y magnesio si hay déficit dietario.</p>

        <h2>Cómo Acelera VALKA tu Progreso</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[{title: 'Progresiones Adaptativas', icon: Target, text: 'El sistema ajusta estímulo según tu feedback y adherencia.'},{title: 'Registro Eficiente', icon: Activity, text: 'Historial claro de repeticiones, isométricos y volumen.'},{title: 'Biblioteca Curada', icon: Dumbbell, text: 'Guías filtradas sin ruido y enfocadas a ejecución eficiente.'}].map(({title, icon:Icon, text}) => (
            <div key={title} className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Icon className="w-6 h-6 mb-2 text-primary" />
              <h3 className="mb-1 font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <h2>FAQs sobre Calistenia</h2>
        <div className="space-y-4">
          {faqs.map(f => (
            <div key={f.q} className="p-4 border rounded-md bg-card border-border">
              <h3 className="mb-1 text-base font-semibold">{f.q}</h3>
              <p className="text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>

        <h2>Llamado a la Acción</h2>
        <p>Si querés avanzar sin estancarte, probá un programa dentro de la plataforma y registra tu próxima progresión hoy.</p>
      </motion.div>
    </>
  );
};

export default CalisteniaUruguay;