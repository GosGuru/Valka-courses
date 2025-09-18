import React from "react";
import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";

const PoliticaPrivacidad = () => {
  return (
    <Layout isPublic>
      <Helmet>
        <title>Política de Privacidad | VALKA</title>
        <meta name="description" content="Política de privacidad de VALKA sobre uso del chat, anonimización y tratamiento de datos." />
      </Helmet>
      <div className="max-w-3xl px-6 py-10 mx-auto">
        <h1 className="mb-4 text-3xl font-bold">Política de Privacidad</h1>
        <p className="mb-4 text-sm text-muted-foreground">Última actualización: Septiembre 2025</p>
        <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
          <p>
            Este sitio utiliza un asistente conversacional para proveer orientación general sobre calistenia. No almacenamos identificadores personales directos.
          </p>
          <ul className="pl-5 list-disc">
            <li>Sanitización automática de mensajes: se remueven nombres, emails, teléfonos y direcciones cuando corresponda.</li>
            <li>Dirección IP: se transforma a un hash no reversible sólo para fines de seguridad y métricas agregadas.</li>
            <li>Opt-out: podés indicar <strong>"No publicar mi pregunta"</strong> en el chat y respetaremos tu preferencia.</li>
            <li>Publicación de Q&A: sólo se publican preguntas y respuestas útiles, anónimas y sin datos sensibles.</li>
            <li>Consejos de salud: el contenido es informativo y no reemplaza asesoramiento profesional individual.</li>
          </ul>
          <p>
            Si tenés consultas sobre privacidad, escribinos y responderemos a la brevedad.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PoliticaPrivacidad;
