import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Edit, Trash2, Save, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { OfficersResponse } from "@/lib/types";
import { Militar, MilitarStorage } from "@/lib/storage";

// Componente principal da página
export default function Escala() {
  const { toast } = useToast();
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMilitar, setCurrentMilitar] = useState<Militar | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Formulário
  const [nome, setNome] = useState("");
  const [patente, setPatente] = useState("");
  const [guarnicao, setGuarnicao] = useState("");
  
  // Buscar oficiais da API
  const { data: officersData, isLoading, refetch } = useQuery<OfficersResponse>({
    queryKey: ["/api/officers"],
    enabled: true,
  });
  
  // Carregar militares do localStorage ao iniciar
  useEffect(() => {
    const loadMilitares = () => {
      // Carregar militares do storage
      const savedMilitares = MilitarStorage.getAllMilitares();
      
      if (savedMilitares.length > 0) {
        setMilitares(savedMilitares);
        console.log('Militares carregados do localStorage:', savedMilitares.length);
      } else if (officersData?.officers && officersData.officers.length > 0) {
        // Se não tiver dados no localStorage mas tiver no API, importa esses dados
        importarMilitaresDaAPI();
      }
    };
    
    loadMilitares();
  }, [officersData]);
  
  // Função para importar militares da API e salvar no localStorage
  const importarMilitaresDaAPI = () => {
    if (officersData?.officers) {
      // Usar o método da classe de storage para importar
      const militaresImportados = MilitarStorage.importFromOfficersAPI(officersData.officers);
      
      setMilitares(militaresImportados);
      
      toast({
        title: "Militares importados",
        description: `${militaresImportados.length} militares foram importados da API e salvos localmente.`,
        duration: 3000,
      });
    }
  };
  
  // Filtrar militares com base no termo de busca
  const filteredMilitares = militares.filter(militar => 
    militar.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    militar.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    militar.guarnicao.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Abrir diálogo para adicionar novo militar
  const handleAddMilitar = () => {
    setCurrentMilitar(null);
    setNome("");
    setPatente("");
    setGuarnicao("OUTROS");
    setIsEditing(false);
    setDialogOpen(true);
  };
  
  // Abrir diálogo para editar militar existente
  const handleEditMilitar = (militar: Militar) => {
    setCurrentMilitar(militar);
    setNome(militar.nome);
    setPatente(militar.patente);
    setGuarnicao(militar.guarnicao);
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  // Salvar militar (novo ou editado)
  const handleSaveMilitar = async () => {
    try {
      // Verificar se os campos requeridos estão preenchidos
      if (!nome.trim() || !patente.trim()) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha o nome e a patente do militar.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      if (isEditing && currentMilitar) {
        // Atualizar militar existente
        const updatedMilitar = MilitarStorage.updateMilitar(currentMilitar.id, {
          nome,
          patente,
          guarnicao
        });
        
        if (updatedMilitar) {
          // Atualizar estado local
          setMilitares(MilitarStorage.getAllMilitares());
          
          toast({
            title: "Militar atualizado",
            description: `${nome} foi atualizado com sucesso.`,
            duration: 3000,
          });
        }
      } else {
        // Adicionar novo militar
        const newMilitar = MilitarStorage.addMilitar({
          nome,
          patente,
          guarnicao,
          ativo: true
        });
        
        // Atualizar estado local
        setMilitares(MilitarStorage.getAllMilitares());
        
        toast({
          title: "Militar adicionado",
          description: `${nome} foi adicionado com sucesso.`,
          duration: 3000,
        });
      }
      
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar militar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as informações. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  // Excluir militar
  const handleDeleteMilitar = (id: string) => {
    try {
      // Excluir militar usando o método da classe de storage
      const success = MilitarStorage.deleteMilitar(id);
      
      if (success) {
        // Atualizar estado local
        setMilitares(MilitarStorage.getAllMilitares());
        
        toast({
          title: "Militar excluído",
          description: "O militar foi removido com sucesso.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Erro ao excluir",
          description: "Militar não encontrado.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao excluir militar:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o militar. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#0a2f6b] via-[#143d8a] to-[#1e3a8a] py-8 mb-4 shadow-xl relative overflow-hidden rounded-3xl">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-start max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shadow-sm"></div>
              <span className="text-xs tracking-wide text-white/80 font-medium">
                20ª Companhia Independente de Polícia Militar – Muaná / Ponta de Pedras
              </span>
            </div>
            
            <div className="relative">
              <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-white to-blue-100
                  drop-shadow-[0_2px_2px_rgba(0,100,255,0.3)]">
                  GERENCIAMENTO DE ESCALAS
                </span>
              </h1>
              
              <div className="absolute -bottom-1 left-0 w-full h-3 bg-gradient-to-b from-blue-300/20 to-transparent blur-sm"></div>
            </div>
            
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-100">
                Cadastro de Militares
              </span>
              <div className="h-px flex-grow bg-gradient-to-r from-blue-400/50 via-white/30 to-transparent"></div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Conteúdo principal */}
      <main className="container mx-auto px-4">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Militares</CardTitle>
                <CardDescription>Gerenciamento de militares e suas guarnições</CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2" onClick={importarMilitaresDaAPI}>
                  <RefreshCcw className="h-4 w-4" />
                  Importar da API
                </Button>
                <Button onClick={handleAddMilitar} className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Militar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar militar..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Patente</TableHead>
                    <TableHead>Guarnição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && militares.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Carregando militares...
                      </TableCell>
                    </TableRow>
                  ) : filteredMilitares.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        {militares.length === 0 
                          ? "Nenhum militar cadastrado. Clique em 'Adicionar Militar' ou 'Importar da API'." 
                          : "Nenhum militar encontrado com os critérios de busca."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMilitares.map((militar) => (
                      <TableRow key={militar.id}>
                        <TableCell className="font-medium">{militar.nome}</TableCell>
                        <TableCell>{militar.patente}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs 
                            ${militar.guarnicao === 'ALFA' ? 'bg-green-100 text-green-800' : 
                             militar.guarnicao === 'BRAVO' ? 'bg-yellow-100 text-yellow-800' :
                             militar.guarnicao === 'CHARLIE' ? 'bg-red-100 text-red-800' :
                             militar.guarnicao === 'EXPEDIENTE' ? 'bg-blue-100 text-blue-800' :
                             'bg-gray-100 text-gray-800'}`}>
                            {militar.guarnicao}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditMilitar(militar)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteMilitar(militar.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500">
              Total de militares: {militares.length}
            </div>
            <div className="text-xs text-gray-400">
              Dados salvos automaticamente no armazenamento local
            </div>
          </CardFooter>
        </Card>
      </main>
      
      {/* Diálogo para adicionar/editar militar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Militar" : "Adicionar Novo Militar"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Edite as informações do militar selecionado."
                : "Preencha os dados para adicionar um novo militar."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patente" className="text-right">
                Patente
              </Label>
              <Input
                id="patente"
                className="col-span-3"
                value={patente}
                onChange={(e) => setPatente(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                className="col-span-3"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guarnicao" className="text-right">
                Guarnição
              </Label>
              <select
                id="guarnicao"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={guarnicao}
                onChange={(e) => setGuarnicao(e.target.value)}
              >
                <option value="ALFA">ALFA</option>
                <option value="BRAVO">BRAVO</option>
                <option value="CHARLIE">CHARLIE</option>
                <option value="EXPEDIENTE">EXPEDIENTE</option>
                <option value="OUTROS">OUTROS</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMilitar}>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 