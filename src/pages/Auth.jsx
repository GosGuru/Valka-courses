
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ onAuthSuccess, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  useEffect(() => {
    if (session) {
      if (onAuthSuccess) onAuthSuccess();
      navigate('/dashboard');
    }
  }, [session, onAuthSuccess, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && password.length < 6) {
      toast({
        title: 'Contraseña Débil',
        description: 'La contraseña debe tener al menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (!error) {
        toast({
          title: '¡Bienvenido de vuelta!',
          description: 'Has iniciado sesión correctamente.',
        });
        // Let the useEffect handle redirection
      }
    } else {
      const { data, error } = await signUp(email, password, {
        data: { display_name: displayName }
      });
      if (!error) {
        if (data.session) {
           toast({
            title: `¡Bienvenido, ${displayName}!`,
            description: 'Tu cuenta ha sido creada.',
          });
          // Let the useEffect handle redirection
        } else {
          toast({
            title: 'Revisa tu email',
            description: 'Hemos enviado un enlace de confirmación a tu correo.',
          });
          if (onAuthSuccess) onAuthSuccess();
        }
      }
    }
    setLoading(false);
  };

  return (
    <motion.div
      key={isLogin ? 'login' : 'register'}
      initial={{ opacity: 0, x: isLogin ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isLogin ? 50 : -50 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md space-y-0"
    >
      <div className="space-y-2 text-center">
          <h1 className="text-5xl tracking-wider font-logo text-primary">VALKA</h1>
        <p className="text-muted-foreground">{isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta para empezar'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div className="space-y-0">
            <Label htmlFor="displayName">Nombre</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Tu nombre"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="bg-background border-border"
            />
          </div>
        )}
        <div className="space-y-0">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background border-border"
          />
        </div>
        <div className="space-y-0">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-background border-border"
          />
        </div>

        <Button type="submit" className="w-full transition-colors bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
          {loading ? (
            'Cargando...'
          ) : isLogin ? (
            <>
              <LogIn className="w-4 h-4 mr-2" /> Iniciar Sesión
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" /> Registrarse
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-muted-foreground hover:text-primary">
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </Button>
      </div>
    </motion.div>
  );
};

export default AuthPage;
