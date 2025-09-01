import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getUserProfile, updateUserProfile, uploadAvatar } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const EditProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const userProfile = await getUserProfile();
          setProfile(userProfile);
          setValue('display_name', userProfile.display_name);
          setPreviewUrl(userProfile.photo_url);
        } catch (error) {
          toast({ title: 'Error', description: 'No se pudo cargar el perfil.', variant: 'destructive' });
        }
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading, setValue, toast]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (formData) => {
    setIsSaving(true);
    try {
      let photo_url = profile.photo_url;
      if (avatarFile) {
        photo_url = await uploadAvatar(avatarFile);
      }

      await updateUserProfile({
        display_name: formData.display_name,
        photo_url,
      });

      // Refrescar estado local para ver nueva imagen sin necesidad de navegar aún
      setProfile(prev => ({ ...prev, display_name: formData.display_name, photo_url }));
      setPreviewUrl(photo_url);
      toast({ title: '¡Éxito!', description: 'Tu perfil ha sido actualizado.' });
      setTimeout(() => navigate('/profile'), 400);
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'No se pudo actualizar el perfil.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Perfil</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-32 h-32">
              <AvatarImage src={previewUrl} alt="Avatar" />
              <AvatarFallback className="text-4xl">
                {profile?.display_name?.charAt(0)?.toUpperCase() || 'V'}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full bg-card"
              onClick={() => fileInputRef.current.click()}
            >
              <Camera className="w-5 h-5" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_name">Nombre de Usuario</Label>
          <Input
            id="display_name"
            {...register('display_name', { required: 'El nombre es obligatorio' })}
          />
          {errors.display_name && <p className="text-sm text-destructive">{errors.display_name.message}</p>}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditProfile;