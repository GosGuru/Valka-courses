
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, BookOpen, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { adminGetAllLessonCategories, adminCreateLessonCategory, adminUpdateLessonCategory, adminDeleteLessonCategory, adminCreateLesson, adminUpdateLesson, adminDeleteLesson } from '@/lib/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from 'framer-motion';
import * as Collapsible from '@radix-ui/react-collapsible';

const AdminLibrary = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [currentCategoryForLesson, setCurrentCategoryForLesson] = useState(null);

  const categoryForm = useForm();
  const lessonForm = useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetAllLessonCategories();
      setCategories(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la biblioteca." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  // Category CRUD
  const onCategorySubmit = async (formData) => {
    try {
      if (editingCategory) {
        await adminUpdateLessonCategory(editingCategory.id, formData);
        toast({ title: "Éxito", description: "Categoría actualizada." });
      } else {
        await adminCreateLessonCategory(formData);
        toast({ title: "Éxito", description: "Categoría creada." });
      }
      categoryForm.reset();
      setIsCategoryFormOpen(false);
      setEditingCategory(null);
      loadData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    categoryForm.reset(category);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await adminDeleteLessonCategory(id);
      toast({ title: "Éxito", description: "Categoría eliminada." });
      loadData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const openNewCategoryForm = () => {
    setEditingCategory(null);
    categoryForm.reset({ name: '', description: '', order: categories.length + 1 });
    setIsCategoryFormOpen(true);
  };

  // Lesson CRUD
  const onLessonSubmit = async (formData) => {
    const dataToSubmit = {
      title: formData.title,
      video_url: formData.video_url || null,
      category_id: currentCategoryForLesson,
      bullets: (formData.bullets || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      errors: (formData.errors || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      task: formData.task || null,
      applicable_task: formData.applicable_task || null,
    };
    try {
      if (editingLesson) {
        await adminUpdateLesson(editingLesson.id, dataToSubmit);
        toast({ title: "Éxito", description: "Lección actualizada." });
      } else {
        await adminCreateLesson(dataToSubmit);
        toast({ title: "Éxito", description: "Lección creada." });
      }
      lessonForm.reset();
      setIsLessonFormOpen(false);
      setEditingLesson(null);
      loadData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setCurrentCategoryForLesson(lesson.category_id);
    lessonForm.reset({
      title: lesson.title || '',
      video_url: lesson.video_url || '',
      bullets: lesson.bullets ? lesson.bullets.join(', ') : '',
      errors: lesson.errors ? lesson.errors.join(', ') : '',
      task: lesson.task || '',
      applicable_task: lesson.applicable_task || ''
    });
    setIsLessonFormOpen(true);
  };

  const handleDeleteLesson = async (id) => {
    try {
      await adminDeleteLesson(id);
      toast({ title: "Éxito", description: "Lección eliminada." });
      loadData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const openNewLessonForm = (categoryId) => {
    setEditingLesson(null);
    setCurrentCategoryForLesson(categoryId);
  // bullets debe ser string para que .split(',') funcione al enviar
  lessonForm.reset({ title: '', video_url: '', bullets: '', errors: '', task: '', applicable_task: '' });
    setIsLessonFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-wider">Gestionar Biblioteca</h1>
        </div>
        <Button onClick={openNewCategoryForm}><Plus className="w-4 h-4 mr-2" /> Crear Categoría</Button>
      </div>

      <div className="space-y-4">
        {loading ? <p>Cargando...</p> : categories.map(category => (
          <Collapsible.Root key={category.id} defaultOpen className="border bg-card border-border rounded-xl">
            <Collapsible.Trigger className="flex items-center justify-between w-full p-4 transition-colors hover:bg-accent">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">{category.name}</h2>
                <span className="text-sm text-muted-foreground">({category.lessons.length} lecciones)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openNewLessonForm(category.id); }}><Plus className="w-4 h-4 mr-1" /> Lección</Button>
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditCategory(category); }}>Editar Categoría</DropdownMenuItem>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-red-500" onClick={(e) => e.stopPropagation()}>Eliminar Categoría</DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Esto eliminará la categoría y todas sus lecciones.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <div className="p-4 space-y-2 border-t border-border">
                {category.lessons.length > 0 ? category.lessons.map(lesson => (
                  <div key={lesson.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                    <p>{lesson.title}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditLesson(lesson)}><Edit className="w-4 h-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Esto eliminará la lección permanentemente.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteLesson(lesson.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )) : <p className="py-4 text-sm text-center text-muted-foreground">No hay lecciones en esta categoría.</p>}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        ))}
      </div>

      {/* Category Form Dialog */}
      <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? 'Editar' : 'Crear'} Categoría</DialogTitle></DialogHeader>
          <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
            <div><Label>Nombre</Label><Input {...categoryForm.register('name', { required: true })} /></div>
            <div><Label>Descripción</Label><Input {...categoryForm.register('description')} /></div>
            <div><Label>Orden</Label><Input type="number" {...categoryForm.register('order', { valueAsNumber: true })} /></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit">Guardar</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Form Dialog */}
      <Dialog open={isLessonFormOpen} onOpenChange={setIsLessonFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingLesson ? 'Editar' : 'Crear'} Lección</DialogTitle></DialogHeader>
          <form onSubmit={lessonForm.handleSubmit(onLessonSubmit)} className="space-y-4">
            <div><Label>Título</Label><Input {...lessonForm.register('title', { required: true })} /></div>
            <div><Label>URL del Video</Label><Input {...lessonForm.register('video_url')} /></div>
            <div><Label>Ideas Clave (separadas por comas)</Label><Textarea {...lessonForm.register('bullets')} placeholder="Idea 1, Idea 2, Idea 3" /></div>
            <div><Label>Errores Comunes (separados por comas)</Label><Textarea {...lessonForm.register('errors')} placeholder="Error 1, Error 2" /></div>
            <div><Label>Tarea (Descripción)</Label><Textarea {...lessonForm.register('task')} placeholder="Describe la tarea o práctica" /></div>
            <div><Label>Tarea Aplicable Hoy</Label><Textarea {...lessonForm.register('applicable_task')} placeholder="Acción concreta para hoy" /></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit">Guardar</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLibrary;
