import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

// Router configuration with future flags to suppress warnings
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};
import { useAuth } from "@/contexts/SupabaseAuthContext";
import Dashboard from "@/pages/Dashboard";
import Programs from "@/pages/Programs";
import ProgramDetail from "@/pages/ProgramDetail";
import Library from "@/pages/Library";
import LessonDetail from "@/pages/LessonDetail";
import Profile from "@/pages/Profile";
import UserProfile from "@/pages/UserProfile";
import EditProfile from "@/pages/EditProfile";
import AdminPanel from "@/pages/AdminPanel";
import AdminPrograms from "@/pages/admin/AdminPrograms";
import AdminLibrary from "@/pages/admin/AdminLibrary";
import AuthPage from "@/pages/Auth";
import Layout from "@/components/Layout";
import LandingPage from "@/pages/LandingPage";
import CalisteniaDurazno from "@/pages/CalisteniaDurazno";
import CalisteniaUruguay from "@/pages/CalisteniaUruguay";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getUserProfile } from "@/lib/api/user";
import AdminProgramSessions from "@/pages/admin/AdminProgramSessions";
import AdminRegistrations from "@/pages/admin/AdminRegistrations";
import FlowiseChatPremium from "@/pages/FlowiseChatPremium";
import FullscreenChat from "@/pages/FullscreenChat";
import PoliticaPrivacidad from "@/pages/PoliticaPrivacidad";


const App = () => {
  const { session, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (session) {
      getUserProfile().then(setProfile);
    } else {
      setProfile(null);
    }
  }, [session]);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    document.body.style.overflow = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-auto border-4 rounded-full border-t-transparent border-primary"
        />
      </div>
    );
  }

  const UnauthenticatedApp = () => (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onLoginClick={() => openAuthModal("login")}
              onRegisterClick={() => openAuthModal("register")}
            />
          }
        />
        <Route
          path="/politica-privacidad"
          element={
            <Layout isPublic>
              <PoliticaPrivacidad />
            </Layout>
          }
        />
        <Route
          path="/chat"
          element={
            <Layout isPublic>
              <FlowiseChatPremium />
            </Layout>
          }
        />
        <Route path="/chat/fullscreen" element={<FullscreenChat />} />
        <Route
          path="/calistenia-durazno"
          element={
            <Layout isPublic>
              <CalisteniaDurazno />
            </Layout>
          }
        />
        <Route
          path="/calistenia-uruguay"
          element={
            <Layout isPublic>
              <CalisteniaUruguay />
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/programs"
          element={
            <Layout isPublic>
              <Programs />
            </Layout>
          }
        />
        <Route
          path="/programs/:idSlug"
          element={
            <Layout isPublic>
              <ProgramDetail onEnrollClick={() => openAuthModal("register")} />
            </Layout>
          }
        />
        <Route
          path="/library"
          element={
            <Layout isPublic>
              <Library />
            </Layout>
          }
        />
        <Route
          path="/library/:idSlug"
          element={
            <Layout isPublic>
              <LessonDetail />
            </Layout>
          }
        />
      </Routes>

      <Dialog
        open={authModalOpen}
        onOpenChange={(isOpen) => !isOpen && closeAuthModal()}
      >
        <DialogContent className="fixed max-w-xs max-h-full p-0 force-center top-1/2 left-1/2">
          <VisuallyHidden>
            <DialogTitle>{authMode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</DialogTitle>
            <DialogDescription>
              {authMode === 'login' 
                ? 'Ingresa tus credenciales para acceder a tu cuenta' 
                : 'Crea una cuenta nueva para comenzar tu entrenamiento'}
            </DialogDescription>
          </VisuallyHidden>
          <AuthPage initialMode={authMode} onAuthSuccess={closeAuthModal} />
        </DialogContent>
      </Dialog>
    </>
  );

  const AuthenticatedApp = () => (
    <Routes>
      {/* Ruta fullscreen SIN Layout (sin navbar ni sidebar) */}
      <Route path="/chat/fullscreen" element={<FullscreenChat />} />
      
      {/* Todas las demás rutas CON Layout */}
      <Route 
        path="/*" 
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/politica-privacidad"
                element={
                  <Layout isPublic>
                    <PoliticaPrivacidad />
                  </Layout>
                }
              />
              <Route path="/chat" element={<FlowiseChatPremium />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/:idSlug" element={<ProgramDetail />} />
              <Route path="/library" element={<Library />} />
              <Route path="/library/:idSlug" element={<LessonDetail />} />
              <Route path="/calistenia-uruguay" element={<CalisteniaUruguay />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<UserProfile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              {profile?.role === "admin" && (
                <>
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/programs" element={<AdminPrograms />} />
                  <Route
                    path="/admin/programs/:id/sessions"
                    element={<AdminProgramSessions />}
                  />
                  <Route path="/admin/library" element={<AdminLibrary />} />
                  <Route
                    path="/admin/registrations"
                    element={<AdminRegistrations />}
                  />
                </>
              )}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );

  return (
    <HelmetProvider>
      <Helmet>
        <title>VALKA - Entrenamiento Inteligente</title>
        <meta
          name="description"
          content="Plataforma de entrenamiento personalizado con programas adaptativos y seguimiento de progreso en tiempo real."
        />
        <meta property="og:title" content="VALKA - Entrenamiento Inteligente" />
        <meta
          property="og:description"
          content="Plataforma de entrenamiento personalizado con programas adaptativos y seguimiento de progreso en tiempo real."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <Router {...routerConfig}>
        <AnimatePresence mode="wait">
          {session ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </AnimatePresence>
      </Router>
      <Toaster />
    </HelmetProvider>
  );
};

export default App;
