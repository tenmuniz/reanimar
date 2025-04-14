import { useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { LockKeyhole, ChevronsRight, AlertCircle, BookOpen, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import brasaoCipm from "../assets/brasao-20cipm.png";
import brasaoPmpa from "../assets/brasao-pmpa-novo.png";

// Esquema de validação simplificado sem validações complexas
const loginSchema = z.object({
  cpf: z.string().min(1, { message: "Campo obrigatório" }),
  password: z.string().min(1, { message: "Campo obrigatório" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation } = useAuth();

  // Formulário de login
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cpf: "",
      password: "",
    },
  });

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Função para lidar com o login com validação local para reforçar segurança
  const handleLogin = (data: LoginFormData) => {
    // Verifica localmente se as credenciais correspondem ao usuário permitido
    if (data.cpf === 'capmuniz' && data.password === '0801') {
      loginMutation.mutate(data);
    } else {
      // Exibe mensagem de erro específica sem necessidade de consultar o backend
      loginForm.setError('root', {
        type: 'manual',
        message: 'Credenciais inválidas. Tente novamente.'
      });
    }
  };

  // Se o usuário já estiver autenticado, redireciona para a página inicial
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#0a2f6b] via-[#143d8a] to-[#1e3a8a]">      
      {/* Container flex para alinhar ambos os lados */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border-t-4 border-yellow-500 shadow-blue-500/30 px-8 py-6 max-w-md mx-auto w-full h-[600px] flex flex-col relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="mb-8 flex flex-col items-center">
            <img src={brasaoCipm} alt="Brasão 20ª CIPM" className="w-20 h-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 uppercase text-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0a2f6b] to-[#3f78e0]">
                SISTEMA DE ESCALAS EXTRAS
              </span>
            </h1>
            <p className="text-sm text-gray-700 text-center mt-1 font-medium">
              20ª Companhia Independente da <span className="font-bold text-[#0a2f6b]">PMPA</span>
            </p>
          </div>

          {/* Título da Seção de Login */}
          <div className="mb-8 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Acesso Restrito</h2>
            <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
              Sistema exclusivo para policiais militares da ativa 
              <br />lotados na 20ª CIPM - Muaná
            </p>
          </div>

          {/* Formulário de Login */}
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5 flex-1 flex flex-col justify-between">
              <FormField
                control={loginForm.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite seu usuário"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {loginMutation.error && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Credenciais inválidas. Tente novamente.</span>
                </div>
              )}

              {loginForm.formState.errors.root && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>{loginForm.formState.errors.root.message}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-bold py-3 rounded-lg mt-24 flex items-center justify-center transform hover:scale-[1.02]"
                disabled={loginMutation.isPending}
              >
                <LockKeyhole className="h-5 w-5 mr-2 drop-shadow-sm" />
                {loginMutation.isPending ? "Autenticando..." : "ENTRAR NO SISTEMA"}
                {!loginMutation.isPending && <ChevronsRight className="h-5 w-5 ml-2 animate-pulse" />}
              </Button>
              
            </form>
          </Form>
        </div>
      </div>

      {/* Lado direito - Hero */}
      <div className="hidden md:flex md:w-1/2 bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl items-center justify-center p-6 md:p-12 relative overflow-hidden">
        
        {/* Elementos decorativos */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>
        
        {/* Estrutura flexível para alinhar com a caixa de login */}
        <div className="flex flex-col justify-between h-[600px] relative z-10 w-full max-w-md mx-auto backdrop-blur-sm rounded-3xl border border-white/5 p-8">
          
          {/* TOPO: Brasão */}
          <div className="flex justify-center">
            <img
              src={brasaoCipm}
              alt="Brasão 20ª CIPM"
              className="w-[200px] opacity-10 pointer-events-none select-none"
            />
          </div>
          
          {/* MEIO: Texto */}
          <div className="text-center mt-4 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400 text-2xl font-bold uppercase">
              Sistema de Gestão de Extras
            </h2>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-400 to-blue-600 rounded-full my-2"></div>
            <p className="text-white/90 text-sm mt-4 max-w-md mx-auto leading-relaxed">
              Plataforma oficial da 20ª CIPM para gerenciamento e controle de escalas extraordinárias, 
              desenvolvida para maximizar a eficiência operacional e transparência.
            </p>
          </div>
          
          {/* BASE: Botões alinhados com base da caixa de login */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="bg-gradient-to-br from-blue-600/80 to-blue-800/80 backdrop-blur-md border border-blue-500/30 shadow-lg hover:shadow-blue-500/20 p-4 rounded-2xl text-white flex flex-col items-center hover:scale-[1.03] transition-all duration-300">
              <div className="bg-white/20 p-2 rounded-full mb-3">
                <ShieldAlert className="h-6 w-6 text-white drop-shadow-md" />
              </div>
              <h3 className="font-medium">Polícia Mais Forte</h3>
              <p className="text-xs text-blue-200 mt-1">Gestão de extras PMF</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600/80 to-purple-800/80 backdrop-blur-md border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 p-4 rounded-2xl text-white flex flex-col items-center hover:scale-[1.03] transition-all duration-300">
              <div className="bg-white/20 p-2 rounded-full mb-3">
                <BookOpen className="h-6 w-6 text-white drop-shadow-md" />
              </div>
              <h3 className="font-medium">Escola Segura</h3>
              <p className="text-xs text-purple-200 mt-1">Proteção escolar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}