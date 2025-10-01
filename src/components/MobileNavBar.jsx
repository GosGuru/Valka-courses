import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Menu,
  User,
  LogOut,
  Settings,
  Library,
  Target,
  MessageCircle,
  Wrench,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const MobileNavBar = ({ profile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminToolsOpen, setAdminToolsOpen] = useState(false);

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const mainActions = [
    { icon: Home, label: "Inicio", path: "/dashboard" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
  ];

  const adminTools = [
    { icon: Target, label: "Admin Programas", path: "/admin/programs" },
    { icon: Library, label: "Admin Biblioteca", path: "/admin/library" },
    { icon: User, label: "Registros", path: "/admin/registrations" },
  ];

  const menuItems = [
    { icon: Target, label: "Programas", path: "/programs" },
    { icon: Library, label: "Biblioteca", path: "/library" },
    { icon: User, label: "Perfil", path: "/profile" },
    { icon: LogOut, label: "Cerrar Sesión", action: signOut },
  ];

  const handleMenuItemClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      navigate(item.path);
    }
    setMenuOpen(false);
  };

  return (
    <>
      {/* Backdrop para el menú */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Menú desplegable */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-50 overflow-y-auto shadow-2xl lg:hidden bottom-[119px] left-[90px] -translate-x-1/2 w-[280px] max-h-[60vh] bg-gray-900/60 backdrop-blur-2xl rounded-3xl border border-white/10"
          >
            <div className="px-3 py-4 space-y-1.5">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleMenuItemClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    item.path && isActive(item.path)
                      ? "bg-white/20 text-white"
                      : "hover:bg-white/10 text-gray-300"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              ))}

              {/* Sección de Herramientas para Admin */}
              {profile?.role === "admin" && (
                <div className="pt-2 mt-2 border-t border-white/10">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: menuItems.length * 0.05 }}
                    onClick={() => setAdminToolsOpen(!adminToolsOpen)}
                    className="flex items-center justify-between w-full gap-3 px-4 py-3 text-gray-300 transition-all rounded-2xl hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <Wrench className="w-5 h-5" />
                      <span className="text-sm font-medium">Herramientas</span>
                    </div>
                    {adminToolsOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {adminToolsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-1 ml-4 space-y-1 overflow-hidden"
                      >
                        {adminTools.map((tool, index) => (
                          <motion.button
                            key={tool.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleMenuItemClick(tool)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
                              isActive(tool.path)
                                ? "bg-white/20 text-white"
                                : "hover:bg-white/10 text-gray-400"
                            }`}
                          >
                            <tool.icon className="w-4 h-4" />
                            <span className="text-xs font-medium">{tool.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NavBar flotante */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed z-50 -translate-x-1/2 lg:hidden bottom-3 left-1/2"
      >
        <div className="relative flex items-center justify-center gap-0 px-3 py-2.5 overflow-hidden shadow-2xl w-[100%] bg-gray-900/60 backdrop-blur-2xl rounded-full border border-white/10 -translate-x-[150px]">
          {/* Indicador activo - calculado dinámicamente */}
          <motion.div
            className="absolute inset-y-1.5 w-[86px] m-1 p-1 bg-white/15 rounded-full shadow-lg"
            initial={false}
            animate={{
              left: menuOpen
                ? 188
                : isActive("/dashboard")
                ? 6
                : isActive("/chat")
                ? 97
                : 6,
            }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          />

          {/* Botones principales */}
          {mainActions.map((action) => (
            <motion.button
              key={action.path}
              onClick={() => navigate(action.path)}
              whileTap={{ scale: 0.92 }}
              className={`relative z-10 flex flex-col items-center justify-center gap-0.5 w-[86px] py-2 transition-colors ${
                isActive(action.path)
                  ? "text-white"
                  : "text-gray-400"
              }`}
            >
              <action.icon
                className={`w-5 h-5 ${
                  isActive(action.path) ? "stroke-[2.5]" : "stroke-[2]"
                }`}
              />
              <span className="text-[10px] font-medium">{action.label}</span>
            </motion.button>
          ))}

          {/* Botón de menú */}
          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            whileTap={{ scale: 0.92 }}
            className={`relative z-10 flex flex-col items-center justify-center gap-0.5 w-[86px] py-2 transition-colors ${
              menuOpen
                ? "text-white"
                : "text-gray-400"
            }`}
          >
            <motion.div
              animate={{ rotate: menuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Menu
                className={`w-5 h-5 ${menuOpen ? "stroke-[2.5]" : "stroke-[2]"}`}
              />
            </motion.div>
            <span className="text-[10px] font-medium">Menú</span>
          </motion.button>
        </div>
      </motion.nav>
    </>
  );
};

export default MobileNavBar;
