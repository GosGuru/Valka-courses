import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Target, MoreHorizontal, BookCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { adminGetAllPrograms, adminCreateProgram, adminUpdateProgram, adminDeleteProgram } from '@/lib/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link } from 'react-router-dom';

const AdminPrograms = () => {
  const { toast } = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetAllPrograms();
      setPrograms(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los programas." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const onSubmit = async (formData) => {
    const dataToSubmit = {
      ...formData,
      weeks: parseInt(formData.weeks, 10) || 0,
      sessions_per_week: parseInt(formData.sessions_per_week, 10) || 0,
      active: formData.active || false,
    };

    try {
      if (editingProgram) {
        await adminUpdateProgram(editingProgram.id, dataToSubmit);
        toast({ title: "Éxito", description: "Programa actualizado correctamente." });
      } else {
        await adminCreateProgram(dataToSubmit);
        toast({ title: "Éxito", description: "Programa creado correctamente." });
      }
      reset();
      setIsFormOpen(false);
      setEditingProgram(null);
      loadPrograms();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    reset(program);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteProgram(id);
      toast({ title: "Éxito", description: "Programa eliminado." });
      loadPrograms();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const openNewProgramForm = () => {
    setEditingProgram(null);
    reset({ 
      name: '', 
      description: '', 
      level: 'beginner', 
      active: false, 
      cover_url: '',
      weeks: 0,
      sessions_per_week: 0
    });
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Target className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-wider">Gestionar Programas</h1>
        </div>
        <Button onClick={openNewProgramForm}><Plus className="mr-2 h-4 w-4" /> Crear Programa</Button>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border grid grid-cols-5 font-bold text-muted-foreground">
          <div className="col-span-2">Nombre</div>
          <div>Nivel</div>
          <div>Estado</div>
          <div className="text-right">Acciones</div>
        </div>
        {loading ? (
          <p className="p-4 text-center">Cargando programas...</p>
        ) : (
          programs.map(program => (
            <div key={program.id} className="p-4 border-b border-border grid grid-cols-5 items-center last:border-b-0">
              <div className="col-span-2 font-medium">{program.name}</div>
              <div className="capitalize">{program.level}</div>
              <div>
                <span className={`px-2 py-1 text-xs rounded-full ${program.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {program.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="text-right">
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/programs/${program.id}/sessions`}>
                          <BookCopy className="mr-2 h-4 w-4" /> Gestionar Sesiones
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(program)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el programa.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(program.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Editar' : 'Crear'} Programa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...register('name', { required: 'El nombre es obligatorio' })} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weeks">Semanas de Duración</Label>
                <Input id="weeks" type="number" {...register('weeks')} placeholder="Ej: 12" />
              </div>
              <div>
                <Label htmlFor="sessions_per_week">Sesiones por Semana</Label>
                <Input id="sessions_per_week" type="number" {...register('sessions_per_week')} />
              </div>
            </div>
            <div>
              <Label htmlFor="level">Nivel</Label>
              <select id="level" {...register('level')} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base">
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
            <div>
              <Label htmlFor="cover_url">URL de Portada</Label>
              <Input id="cover_url" {...register('cover_url')} />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="active" {...register('active')} className="h-4 w-4" />
              <Label htmlFor="active">Activo</Label>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPrograms;