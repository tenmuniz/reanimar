import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Edit, UserPlus, AlertTriangle, RefreshCw } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { SupabaseMilitarStorage } from '@/lib/supabase';

// Esquema de validação do formulário
const militarFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  patente: z.string().min(1, "Patente é obrigatória").max(20),
  guarnicao: z.string().min(1, "Guarnição é obrigatória").max(50),
  ativo: z.boolean().default(true),
});

// Tipo do militar baseado no esquema
type MilitarFormValues = z.infer<typeof militarFormSchema>;

export default function AdminPage() {
  const [location, navigate] = useLocation();
  const [militares, setMilitares] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilitar, setEditingMilitar] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingMilitar, setDeletingMilitar] = useState<any | null>(null);
  const { toast } = useToast();

  // Configuração do formulário
  const form = useForm<MilitarFormValues>({
    resolver: zodResolver(militarFormSchema),
    defaultValues: {
      nome: "",
      patente: "",
      guarnicao: "EXPEDIENTE",
      ativo: true,
    },
  });

  // Carregar militares do Supabase
  const loadMilitares = async () => {
    setIsLoading(true);
    try {
      const militares = await SupabaseMilitarStorage.getAllMilitares();
      setMilitares(militares || []);
    } catch (error) {
      console.error("Erro ao buscar militares:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de militares.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar militares ao montar o componente
  useEffect(() => {
    loadMilitares();
  }, []);

  // Função para adicionar ou atualizar militar
  const onSubmit = async (data: MilitarFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingMilitar) {
        // Atualizar militar existente
        const resultado = await SupabaseMilitarStorage.updateMilitar(editingMilitar.id, data);
        if (resultado) {
          toast({
            title: "Militar atualizado",
            description: "O militar foi atualizado com sucesso.",
            variant: "default",
          });
          await loadMilitares();
          
          // Disparar evento personalizado para notificar outras partes do sistema
          const militarUpdatedEvent = new CustomEvent('militar_updated', { 
            detail: { 
              militar: resultado,
              action: 'update'
            } 
          });
          window.dispatchEvent(militarUpdatedEvent);
          
          setDialogOpen(false);
          setEditingMilitar(null);
          form.reset();
        } else {
          toast({
            title: "Erro na atualização",
            description: "Não foi possível atualizar o militar.",
            variant: "destructive",
          });
        }
      } else {
        // Adicionar novo militar
        const resultado = await SupabaseMilitarStorage.addMilitar(data);
        if (resultado) {
          toast({
            title: "Militar adicionado",
            description: "O militar foi adicionado com sucesso.",
            variant: "default",
          });
          await loadMilitares();
          
          // Disparar evento personalizado para notificar outras partes do sistema
          const militarAddedEvent = new CustomEvent('militar_updated', { 
            detail: { 
              militar: resultado,
              action: 'add'
            } 
          });
          window.dispatchEvent(militarAddedEvent);
          
          setDialogOpen(false);
          form.reset();
        } else {
          toast({
            title: "Erro na adição",
            description: "Não foi possível adicionar o militar.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao salvar militar:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para excluir militar
  const handleDelete = async (id: string) => {
    try {
      const resultado = await SupabaseMilitarStorage.deleteMilitar(id);
      if (resultado) {
        toast({
          title: "Militar removido",
          description: "O militar foi removido com sucesso.",
          variant: "default",
        });
        await loadMilitares();
        setConfirmDeleteOpen(false);
        setDeletingMilitar(null);
      } else {
        toast({
          title: "Erro na remoção",
          description: "Não foi possível remover o militar.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir militar:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o militar.",
        variant: "destructive",
      });
    }
  };

  // Abrir dialog para edição
  const handleEdit = (militar: any) => {
    setEditingMilitar(militar);
    form.reset({
      nome: militar.nome,
      patente: militar.patente,
      guarnicao: militar.guarnicao,
      ativo: militar.ativo,
    });
    setDialogOpen(true);
  };

  // Abrir dialog para novo militar
  const handleAddNew = () => {
    setEditingMilitar(null);
    form.reset({
      nome: "",
      patente: "",
      guarnicao: "EXPEDIENTE",
      ativo: true,
    });
    setDialogOpen(true);
  };

  // Preparar exclusão
  const prepareDelete = (militar: any) => {
    setDeletingMilitar(militar);
    setConfirmDeleteOpen(true);
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <Card className="shadow-lg border border-white/20 bg-white/10 backdrop-blur-md">
        <CardHeader className="bg-gradient-to-r from-blue-700/80 to-indigo-700/80 border-b border-white/20 text-white px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Administração do Sistema</CardTitle>
              <CardDescription className="text-blue-100 mt-1">
                Gerencie militares, configurações e dados do sistema
              </CardDescription>
            </div>
            <Button 
              onClick={handleAddNew} 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white border border-white/20"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Militar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="militares" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 border border-white/20">
              <TabsTrigger value="militares" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Militares
              </TabsTrigger>
              <TabsTrigger value="config" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Configurações
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="militares" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Lista de Militares</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadMilitares}
                  disabled={isLoading}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-300" />
                </div>
              ) : militares.length === 0 ? (
                <div className="py-8 text-center border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm">
                  <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-white">Nenhum militar cadastrado</h3>
                  <p className="text-blue-200 mt-1">Clique em "Novo Militar" para adicionar.</p>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden border border-white/20 bg-white/5 backdrop-blur-md">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-white/5 border-white/20">
                        <TableHead className="text-blue-200">Nome</TableHead>
                        <TableHead className="text-blue-200">Patente</TableHead>
                        <TableHead className="text-blue-200">Guarnição</TableHead>
                        <TableHead className="text-blue-200">Status</TableHead>
                        <TableHead className="text-right text-blue-200">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {militares.map((militar) => (
                        <TableRow key={militar.id} className="hover:bg-white/10 border-white/10">
                          <TableCell className="font-medium text-white">{militar.nome}</TableCell>
                          <TableCell className="text-blue-100">{militar.patente}</TableCell>
                          <TableCell className="text-blue-100">{militar.guarnicao}</TableCell>
                          <TableCell>
                            <Badge variant={militar.ativo ? "default" : "secondary"} 
                              className={militar.ativo 
                                ? "bg-green-600/70 text-white border-green-500/50"
                                : "bg-slate-600/50 text-slate-200 border-slate-500/50"}>
                              {militar.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(militar)}
                              className="text-blue-200 hover:text-white hover:bg-white/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-400 hover:text-red-300 hover:bg-white/10"
                              onClick={() => prepareDelete(militar)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="config">
              <div className="py-8 text-center border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-white">Configurações do Sistema</h3>
                <p className="text-blue-200 mt-1">
                  Esta seção ainda está em desenvolvimento.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Formulário de Adição/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMilitar ? "Editar Militar" : "Novo Militar"}
            </DialogTitle>
            <DialogDescription>
              {editingMilitar 
                ? "Atualize as informações do militar cadastrado." 
                : "Preencha os dados para adicionar um novo militar."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SD PM SILVA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="patente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patente</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a patente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CEL">CEL</SelectItem>
                        <SelectItem value="TEN CEL">TEN CEL</SelectItem>
                        <SelectItem value="MAJ">MAJ</SelectItem>
                        <SelectItem value="CAP">CAP</SelectItem>
                        <SelectItem value="1º TEN">1º TEN</SelectItem>
                        <SelectItem value="2º TEN">2º TEN</SelectItem>
                        <SelectItem value="ASP">ASP</SelectItem>
                        <SelectItem value="SUB TEN">SUB TEN</SelectItem>
                        <SelectItem value="1º SGT">1º SGT</SelectItem>
                        <SelectItem value="2º SGT">2º SGT</SelectItem>
                        <SelectItem value="3º SGT">3º SGT</SelectItem>
                        <SelectItem value="CB">CB</SelectItem>
                        <SelectItem value="SD">SD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guarnicao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guarnição</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a guarnição" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EXPEDIENTE">EXPEDIENTE</SelectItem>
                        <SelectItem value="ALFA">ALFA</SelectItem>
                        <SelectItem value="BRAVO">BRAVO</SelectItem>
                        <SelectItem value="CHARLIE">CHARLIE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ativo</FormLabel>
                      <FormDescription>
                        Marque esta opção se o militar estiver ativo e disponível para escalas.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Salvando...' : (editingMilitar ? 'Atualizar' : 'Adicionar')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o militar <strong>{deletingMilitar?.nome}</strong>. 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700 text-sm mt-2">
            <AlertTriangle className="h-5 w-5 text-red-600 inline-block mr-2" />
            A exclusão removerá o militar de todas as escalas. Certifique-se de que ele não está em 
            escalas ativas antes de prosseguir.
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deletingMilitar && handleDelete(deletingMilitar.id)}
            >
              Excluir Militar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 