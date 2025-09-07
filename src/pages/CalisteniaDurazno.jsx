import React from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Activity,
  Dumbbell,
  Sparkles,
  Target,
  TrendingUp,
  Flag,
} from "lucide-react";

// WhatsApp helper
const WA_BASE = "https://wa.me/59894734367";
const waLink = (text) => `${WA_BASE}?text=${encodeURIComponent(text)}`;

const CalisteniaDurazno = () => {
  const year = new Date().getFullYear();
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Calistenia en Durazno | VALKA</title>
        <meta
          name="description"
          content="Calistenia en Durazno: fuerza, movilidad y comunidad. Progresiones seguras para todos los niveles. Reservá tu primera sesión."
        />
        <link
          rel="canonical"
          href="https://valka-courses.vercel.app/calistenia-durazno"
        />
        {/* Local Business / ExerciseGym */}
        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "ExerciseGym",
          "name": "VALKA Calistenia Durazno",
          "url": "https://valka-courses.vercel.app/",
          "image": "https://valka-courses.vercel.app/Hero.jpeg",
            "telephone": "+59894734367",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Durazno",
              "addressRegion": "Durazno",
              "addressCountry": "UY",
              "streetAddress": "Plaza de Deportes Nº1"
            },
            "areaServed": {"@type":"AdministrativeArea","name":"Durazno y alrededores"},
            "openingHoursSpecification": [{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"08:00","closes":"21:00"}],
            "sameAs": ["https://www.instagram.com/valka_sw/"],
            "priceRange": "$$",
            "description": "Entrenamiento de calistenia, fuerza y movilidad en Durazno con progresiones seguras y comunidad local."
        }
        `}</script>
        {/* Courses ItemList */}
        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {"@type":"Course","name":"Programa Base Calistenia (8 semanas)","description":"Progresiones iniciales de fuerza, movilidad y control corporal en Durazno.","provider":{"@type":"Organization","name":"VALKA"},"hasCourseInstance":{"@type":"CourseInstance","courseMode":"onsite","location":{"@type":"Place","name":"Durazno","address":{"@type":"PostalAddress","addressLocality":"Durazno","addressCountry":"UY"}},"startDate":"[2025-09-15]","endDate":"[2025-11-10]","offers":{"@type":"Offer","priceCurrency":"UYU","price":"[Precio]","availability":"https://schema.org/InStock","url":"https://valka-courses.vercel.app/cursos"}}}
            },
            {"@type":"ListItem","position":2,"item":{"@type":"Course","name":"Dominadas y Tracción Progresiva","description":"Progresiones de dominadas estrictas a movimientos avanzados.","provider":{"@type":"Organization","name":"VALKA"}}},
            {"@type":"ListItem","position":3,"item":{"@type":"Course","name":"Movilidad + Core Control","description":"Trabajo de movilidad activa y estabilidad central aplicado a calistenia.","provider":{"@type":"Organization","name":"VALKA"}}}
          ]
        }
        `}</script>
        {/* FAQPage */}
        <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {"@type":"Question","name":"¿Necesito fuerza previa para empezar?","acceptedAnswer":{"@type":"Answer","text":"No. Arrancamos con progresiones básicas y asistencia controlada."}},
            {"@type":"Question","name":"¿Hay prueba o clase inicial?","acceptedAnswer":{"@type":"Answer","text":"Sí, primera sesión evaluativa coordinada por WhatsApp."}},
            {"@type":"Question","name":"¿Puedo combinar horarios?","acceptedAnswer":{"@type":"Answer","text":"Sí, según cupos disponibles para sostener tu constancia."}},
            {"@type":"Question","name":"¿Se trabaja movilidad también?","acceptedAnswer":{"@type":"Answer","text":"En cada clase: hombros, cadera, columna y control de core."}},
            {"@type":"Question","name":"¿Edad mínima o máxima?","acceptedAnswer":{"@type":"Answer","text":"Adaptamos desde 14 años y adultos de cualquier edad."}},
            {"@type":"Question","name":"¿Qué llevo a la primera clase?","acceptedAnswer":{"@type":"Answer","text":"Ropa cómoda, agua y ganas de aprender."}},
            {"@type":"Question","name":"¿Cuánto tiempo hasta ver resultados?","acceptedAnswer":{"@type":"Answer","text":"Entre 4 y 8 semanas se observan mejoras claras."}}
          ]
        }
        `}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-8 pb-20 text-center bg-gradient-to-b from-background to-background/40">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl text-3xl font-extrabold leading-tight md:text-6xl"
        >
          Calistenia en Durazno: <span className="text-primary">fuerza</span>,
          movilidad y comunidad
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-2xl mt-6 text-lg text-muted-foreground md:text-xl"
        >
          Control de cuerpo y mente con técnica guiada y progresiones
          aseguradas.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-4 mt-10 sm:flex-row"
        >
          <Button
            size="lg"
            className="px-10 py-6 text-lg"
            onClick={() =>
              window.open(
                waLink("Hola quiero info sobre calistenia en Durazno"),
                "_blank"
              )
            }
          >
            Entrenar ahora
          </Button>
          <span className="text-sm text-muted-foreground">
            Acercamiento para saber cómo empezar.
          </span>
        </motion.div>
      </section>

      {/* Beneficios */}
      <section className="px-4 py-16 mx-auto max-w-7xl">
        <h2 className="mb-8 text-3xl font-bold md:text-4xl">
          ¿Por qué entrenar calistenia con VALKA en Durazno?
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            [
              "Progresiones claras",
              "De cero a tu primera dominada, sin saltos de riesgo.",
            ],
            [
              "Movilidad y flexibilidad primero",
              "Rangos de calidad antes de subir la dificultad.",
            ],
            [
              "Ejecución técnica",
              "Refinamos cada repetición: control > volumen.",
            ],
            [
              "Mentalidad y constancia",
              "Hábitos y foco interno; cada sesión suma al largo plazo.",
            ],
            ["Adaptado a tu nivel", "Principiantes, intermedios y avanzados."],
            [
              "Visión a mediano y largo plazo",
              "Fases planificadas para tu evolución como atleta VALKA.",
            ],
            [
              "Entrená en Durazno",
              "Sesiones en [zona/parque] y al aire libre según clima.",
            ],
            [
              "Clase inicial guiada",
              "Evaluación + primeras progresiones; agendá por WhatsApp.",
            ],
            [
              "Muscle-up en 6 semanas",
              "De 0 a muscle-up limpio con técnica y progresiones seguras.",
            ],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="p-5 transition border rounded-xl bg-background/60 backdrop-blur-sm border-border hover:border-primary/50"
            >
              <h3 className="mb-2 font-semibold text-primary">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 space-y-4">
          <blockquote className="p-4 italic border-l-4 rounded bg-muted/30 border-primary">
            “En 6 semanas logré mi primera dominada estricta.” – [Nombre]
          </blockquote>
          <blockquote className="p-4 italic border-l-4 rounded bg-muted/30 border-primary">
            “Me siento más fuerte y con menos dolores de hombro.” – [Nombre]
          </blockquote>
        </div>
      </section>

      {/* Cómo son las clases */}
      <section
        aria-labelledby="training-how"
        className="px-4 py-16 mx-auto border-t max-w-7xl border-border"
      >
        <h2 id="training-how" className="text-3xl font-bold md:text-4xl">
          Así funciona el entrenamiento
        </h2>

        {/* Pasos claros, layout simétrico */}
        <ol className="mt-8 space-y-5">
          {[
            {
              icon: Activity,
              title: "Calentá & Movilizá",
              desc: "Calentamiento articular y movilidad activa para preparar el cuerpo.",
            },
            {
              icon: Dumbbell,
              title: "Progresá fuerza con control",
              desc: "Empuje, tracción y core sin saltos de riesgo; fases adaptadas a tu nivel.",
            },
            {
              icon: Sparkles,
              title: "Pulí la técnica",
              desc: "Pausas, control escapular, respiración y alineaciones para ejecución limpia.",
            },
            {
              icon: Target,
              title: "Hacé usable la fuerza",
              desc: "Movilidad funcional (hombros, cadera, columna) para transferir a habilidades.",
            },
            {
              icon: TrendingUp,
              title: "Medí y ajustá",
              desc: "Hitos: dominada estricta, hollow sólido, handstand estable, muscle-up limpio.",
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary shrink-0">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold leading-none tracking-wide uppercase text-foreground">
                    {step.title}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground max-w-prose">
                    {step.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Niveles */}
        <div className="grid gap-6 mt-10 md:grid-cols-3">
          <div className="p-5 border rounded-lg border-border bg-background/60">
            <h3 className="mb-2 font-semibold">Principiantes</h3>
            <ul className="pl-4 space-y-1 text-sm list-disc text-muted-foreground">
              <li>Plancha inclinada</li>
              <li>Dominada asistida</li>
              <li>Hollow body</li>
              <li>Sentadilla controlada</li>
              <li>Movilidad activa básica</li>
            </ul>
          </div>

          <div className="p-5 border rounded-lg border-border bg-background/60">
            <h3 className="mb-2 font-semibold">Intermedios</h3>
            <ul className="pl-4 space-y-1 text-sm list-disc text-muted-foreground">
              <li>Fondos</li>
              <li>Dominadas estrictas</li>
              <li>Tuck front lever</li>
              <li>Handstand básico</li>
              <li>Extensión torácica progresiva</li>
            </ul>
          </div>

          <div className="p-5 border rounded-lg border-border bg-background/60">
            <h3 className="mb-2 font-semibold">Avanzados</h3>
            <ul className="pl-4 space-y-1 text-sm list-disc text-muted-foreground">
              <li>Muscle-up limpio</li>
              <li>Progresiones de front lever</li>
              <li>Handstand libre</li>
              <li>Planche lean progresivo</li>
              <li>Refinamiento de líneas y timing</li>
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                waLink("Quiero saber mi nivel para empezar"),
                "_blank",
                "noopener,noreferrer"
              )
            }
            aria-label="Consultar tu nivel por WhatsApp"
          >
            Consultar tu nivel
          </Button>
        </div>
      </section>

      {/* Timeline / Ruta Atleta VALKA */}
      <section
        className="px-4 py-16 mx-auto border-t max-w-7xl border-border"
        aria-labelledby="timeline-valka"
      >
        <h2 id="timeline-valka" className="text-3xl font-bold md:text-4xl">
          Ruta de evolución del atleta VALKA
        </h2>
        <p className="max-w-3xl mt-4 text-muted-foreground">
          Cada fase tiene objetivos claros. El tiempo estimado varía según
          constancia, descanso y técnica previa. La mentalidad: construir
          capacidad sostenible, no buscar atajos.
        </p>
        <ol className="relative mt-10 space-y-10 md:space-y-0 md:grid md:grid-cols-6 md:gap-6 md:before:hidden">
          {[
            {
              title: "Fundamentos",
              time: "0–2 meses",
              points: [
                "Dominada asistida",
                "Hollow sólido 20s",
                "Movilidad básica hombros",
              ],
              icon: Activity,
            },
            {
              title: "Base de fuerza",
              time: "2–4 meses",
              points: [
                "Dominada estricta",
                "Flexiones sólidas",
                "Fondos asistidos",
              ],
              icon: Dumbbell,
            },
            {
              title: "Control & Core",
              time: "4–6 meses",
              points: [
                "Tuck front lever",
                "Handstand pared 20–30s",
                "Muscle-up asistido",
              ],
              icon: Target,
            },
            {
              title: "Habilidades intermedias",
              time: "6–9 meses",
              points: [
                "Muscle-up limpio",
                "Handstand libre asistido",
                "Front lever avanzado",
              ],
              icon: Sparkles,
            },
            {
              title: "Refinamiento",
              time: "9–12+ meses",
              points: [
                "Planche lean avanzada",
                "Líneas limpias",
                "Combos controlados",
              ],
              icon: TrendingUp,
            },
            {
              title: "Evolución continua",
              time: "12m+",
              points: [
                "Ciclos periodizados",
                "Nuevos hitos personales",
                "Mentoría puntual",
              ],
              icon: Flag,
            },
          ].map((stage, i) => {
            const Icon = stage.icon;
            return (
              <li key={stage.title} className="relative md:flex md:flex-col">
                <div className="flex items-start gap-4 md:flex-col md:items-start">
                  <div className="flex items-center justify-center w-10 h-10 border rounded-full border-primary/40 bg-background/70 backdrop-blur-sm text-primary shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="mt-0 md:mt-4">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-primary">
                      {stage.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {stage.time}
                    </p>
                    <ul className="mt-3 space-y-1 text-xs list-disc list-inside text-muted-foreground">
                      {stage.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {i < 5 && (
                  <span
                    className="hidden md:block absolute top-5 left-[calc(50%+2rem)] right-0 h-px bg-gradient-to-r from-primary/40 via-border to-transparent"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
        <div className="mt-10">
          <Button
            onClick={() =>
              window.open(waLink("Quiero avanzar en la ruta VALKA"), "_blank")
            }
          >
            Ver tu punto de partida
          </Button>
        </div>
      </section>

      {/* Horarios y modalidades */}
      <section className="px-4 py-16 mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold md:text-4xl">
          Horarios y modalidades
        </h2>
        <p className="mt-4 text-muted-foreground">
          Grupos reducidos para mantener correcciones de calidad.
        </p>
        <ul className="mt-6 space-y-2 text-sm list-disc list-inside text-muted-foreground">
          <li>Lunes a Viernes (bloques mañana): 09:00 | 11:30</li>
          <li>Tardes: 16:00 a 20:00 (ingreso por bloques)</li>
          <li>Sesiones 1:1: coordinar horario específico</li>
          <li>Horario de invierno: [indicar variación si cambia]</li>
        </ul>
        <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Grupal presencial",
              "Progreso con energía de equipo, Y compañerismo.",
            ],
            [
              "Rutinas personalizadas",
              "Rutinas pensadas en mejora debilidades, y alcanzar objetivos.",
            ],
            ["Mejora constante", "Feedback profundo y personalizado."],
            ["Plan guiado + virtual", "Seguimiento cuando rotás horarios."],
          ].map(([t, d]) => (
            <div
              key={t}
              className="p-4 border rounded-lg border-border bg-background/50"
            >
              <p className="font-semibold text-primary">{t}</p>
              <p className="mt-1 text-xs text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Button
            onClick={() =>
              window.open(
                waLink("Quiero reservar un horario de calistenia"),
                "_blank"
              )
            }
          >
            Reservar horario
          </Button>
        </div>
      </section>

      {/* Área de servicio */}
      <section className="px-4 py-16 mx-auto border-t max-w-7xl border-border">
        <h2 className="text-3xl font-bold md:text-4xl">
          Entrenamos en Durazno
        </h2>
        <p className="mt-4 text-muted-foreground">
          Sesiones presenciales de Deportes Plaza de Deportes N°1, Durazno
          Uruguay.
        </p>
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() =>
              window.open("https://maps.app.goo.gl/ajsGQBeT1TkqNxPu9")
            }
          >
           <MapPin /> Ubicación
          </Button>
        </div>
      </section>

      {/* NAP */}
      <section className="px-4 py-16 mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold md:text-4xl">Datos de contacto</h2>
        <div className="grid gap-6 mt-6 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            <p>
              <strong>Nombre:</strong> VALKA Calistenia Durazno
            </p>
            <p>
              <strong>WhatsApp:</strong>{" "}
              <a
                className="text-primary hover:underline"
                href={waLink("Hola quiero empezar calistenia")}
                target="_blank"
                rel="noopener noreferrer"
              >
                +598 94734367
              </a>
            </p>
            <p>
              <strong>Ubicación:</strong> Durazno, Uruguay
            </p>
            <p>
              <strong>Horario:</strong> Lunes a Viernes 08:00–21:00
            </p>
            <p>
              <strong>Área de servicio:</strong> Durazno y alrededores
            </p>
            <p>
              <strong>Instagram:</strong>{" "}
              <a
                className="text-primary hover:underline"
                href="https://www.instagram.com/valka_sw/"
                target="_blank"
                rel="noopener noreferrer"
              >
                @valka_sw
              </a>
            </p>
          </div>
          <div className="p-4 text-sm border rounded-lg bg-muted/20 border-border">
            <p className="mb-2 font-semibold">¿Tenés dudas rápidas?</p>
            <p className="mb-4 text-muted-foreground">
              Escribinos y coordinamos tu primera sesión evaluativa.
            </p>
            <Button
              onClick={() =>
                window.open(
                  waLink("Quiero coordinar mi primera sesión evaluativa"),
                  "_blank"
                )
              }
            >
              Escribir ahora
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 mx-auto border-t max-w-7xl border-border">
        <h2 className="text-3xl font-bold md:text-4xl">Preguntas frecuentes</h2>
        <div className="mt-8 space-y-6">
          {[
            [
              "¿Necesito fuerza previa para empezar?",
              "No. Arrancamos con progresiones básicas y asistencia controlada.",
            ],
            [
              "¿Hay prueba o clase inicial?",
              "Sí, primera sesión evaluativa (coordinamos por WhatsApp).",
            ],
            [
              "¿Puedo combinar horarios?",
              "Sí, según cupos. Te ayudamos a mantener constancia.",
            ],
            [
              "¿Se trabaja movilidad también?",
              "En cada clase: hombros, cadera, columna y control de core.",
            ],
            [
              "¿Edad mínima o máxima?",
              "Desde 14 años y adultos de cualquier edad.",
            ],
            [
              "¿Qué llevo a la primera clase?",
              "Ropa cómoda, agua y ganas de aprender.",
            ],
            [
              "¿Cuánto tiempo hasta ver resultados?",
              "Entre 4 y 8 semanas mejoras claras en control y fuerza básica.",
            ],
          ].map(([q, a]) => (
            <div
              key={q}
              className="p-4 border rounded-lg bg-background/60 border-border"
            >
              <h3 className="font-medium text-primary">{q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-4 py-24 mx-auto text-center max-w-7xl">
        <h2 className="text-4xl font-bold md:text-5xl">Listo para empezar</h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
          Tu cuerpo puede más de lo que pensás. Empezá hoy con un plan claro.
        </p>
        <div className="mt-10">
          <Button
            size="lg"
            onClick={() =>
              window.open(waLink("Quiero empezar hoy en VALKA"), "_blank")
            }
          >
            Empezar ahora
          </Button>
        </div>
      </section>

      <footer className="py-8 mt-auto text-xs text-center border-t border-border text-muted-foreground">
        &copy; {year} VALKA Calistenia Durazno. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default CalisteniaDurazno;
