
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Library, 
  User, 
  Target,
  LogOut,
  BookOpen,
  Shield,
  ChevronDown,
  Menu,
  Users as UsersIcon
} from 'lucide-react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getUserProfile } from '@/lib/api/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const DesktopSidebar = ({ navItems, adminNavItems, profile, location, handleSignOut, isAdminToolsOpen, setIsAdminToolsOpen }) => (
  <motion.aside 
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="hidden lg:flex w-64 bg-card m-4 rounded-xl p-6 flex-col border border-border"
  >
    <div className="flex items-center justify-center mb-12">
      <Link to={profile ? "/dashboard" : "/"}>
        <span className="font-logo text-4xl text-primary tracking-wider">VALKA</span>
      </Link>
    </div>

    <nav className="flex-1">
      <ul className="space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-lg ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-sans tracking-wider">{item.label}</span>
              </Link>
            </li>
          );
        })}

        {profile?.role === 'admin' && (
          <Collapsible.Root open={isAdminToolsOpen} onOpenChange={setIsAdminToolsOpen}>
            <Collapsible.Trigger className="w-full">
              <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-lg w-full ${
                location.pathname.startsWith('/admin')
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <span className="font-sans tracking-wider">Herramientas</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${isAdminToolsOpen ? 'rotate-180' : ''}`} />
              </div>
            </Collapsible.Trigger>
            <Collapsible.Content asChild>
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pl-6 mt-2 space-y-2 overflow-hidden"
              >
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-base ${
                          isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-sans tracking-wider">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </motion.ul>
            </Collapsible.Content>
          </Collapsible.Root>
        )}
      </ul>
    </nav>

    <div className="mt-auto pt-6 border-t border-border">
      {profile ? (
        <div className="flex items-center justify-between">
          <Link to="/profile" className="flex items-center gap-3 group">
            <Avatar>
              <AvatarImage src={profile.photo_url} alt={profile.display_name} />
              <AvatarFallback>{profile.display_name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold tracking-wider group-hover:text-primary transition-colors">{profile.display_name}</p>
              <p className="text-sm text-muted-foreground capitalize">{profile.role || 'Alumno'}</p>
            </div>
          </Link>
          <button onClick={handleSignOut} className="text-muted-foreground hover:text-primary transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Únete a la comunidad</p>
          </div>
      )}
    </div>
  </motion.aside>
);

const MobileHeader = ({ profile, handleSignOut, adminNavItems }) => (
  <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b bg-card/80 backdrop-blur-sm">
     <Link to={profile ? "/dashboard" : "/"}>
        <span className="font-logo text-3xl text-primary tracking-wider">VALKA</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
           {profile?.role === 'admin' && (
             <>
              <DropdownMenuSeparator />
               {adminNavItems.map(item => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
               ))}
             </>
           )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  </header>
);

const MobileBottomNav = ({ navItems, location }) => (
  <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-card/80 backdrop-blur-sm border-t">
    <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <Link key={item.path} to={item.path} className={`inline-flex flex-col items-center justify-center px-5 group ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        )
      })}
    </div>
  </nav>
);


const Layout = ({ children, isPublic = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isAdminToolsOpen, setIsAdminToolsOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (session) {
      try {
        const userProfile = await getUserProfile();
        setProfile(userProfile);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    } else {
      setProfile(null);
    }
  }, [session]);

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  }, [authLoading, fetchProfile, location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      setIsAdminToolsOpen(true);
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItemsPublic = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/programs', icon: Target, label: 'Programas' },
    { path: '/library', icon: BookOpen, label: 'Biblioteca' },
  ];
  
  const navItemsPrivate = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/programs', icon: Target, label: 'Programas' },
    { path: '/library', icon: Library, label: 'Biblioteca' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  const adminNavItems = [
    { path: '/admin/programs', icon: Target, label: 'Admin Programas' },
    { path: '/admin/library', icon: BookOpen, label: 'Admin Biblioteca' },
    { path: '/admin/registrations', icon: UsersIcon, label: 'Registros' },
  ];

  const currentNavItems = isPublic ? navItemsPublic : navItemsPrivate;

  const showSidebar = !isPublic && session; // menú solo para usuarios logueados

  return (
    <div className={`min-h-screen bg-background text-foreground ${showSidebar ? 'flex flex-col lg:flex-row' : 'flex flex-col'}`}>
      {showSidebar && (
        <DesktopSidebar 
          navItems={[{ path: '/dashboard', icon: Home, label: 'Dashboard' }, { path: '/programs', icon: Target, label: 'Programas' }, { path: '/library', icon: Library, label: 'Biblioteca' }]}
          adminNavItems={adminNavItems}
            profile={profile}
            location={location}
            handleSignOut={handleSignOut}
            isAdminToolsOpen={isAdminToolsOpen}
            setIsAdminToolsOpen={setIsAdminToolsOpen}
        />
      )}

      {showSidebar && profile && <MobileHeader profile={profile} handleSignOut={handleSignOut} adminNavItems={adminNavItems}/>}

      <main className={`flex-1 ${showSidebar ? 'lg:p-4 lg:pr-0 pb-16 lg:pb-0' : ''}`}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full overflow-y-auto"
        >
          {children}
        </motion.div>
      </main>

      {showSidebar && profile && <MobileBottomNav navItems={navItemsPrivate} location={location} />}
    </div>
  );
};

export default Layout;
