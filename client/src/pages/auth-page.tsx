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
    <div className="relative min-h-screen flex flex-col md:flex-row bg-gradient-to-r from-[#0a2f6b] to-[#3f78e0]">      
      {/* Container flex para alinhar ambos os lados */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-t-4 border-yellow-500 shadow-blue-500/20 px-8 py-6 max-w-md mx-auto w-full h-[600px] flex flex-col">
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
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg shadow-xl hover:shadow-2xl border-b-4 border-green-800 hover:border-green-900 transform hover:-translate-y-1 active:translate-y-0 active:border-b-2 transition-all duration-200 flex items-center justify-center mt-24"
                disabled={loginMutation.isPending}
              >
                <LockKeyhole className="h-5 w-5 mr-2" />
                {loginMutation.isPending ? "Autenticando..." : "ENTRAR"}
                {!loginMutation.isPending && <ChevronsRight className="h-5 w-5 ml-2" />}
              </Button>
              
              {/* Aviso de segurança */}
              <div className="mt-4 text-center bg-gray-50 p-2 rounded-md border border-gray-200">
                <div className="flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <p className="text-xs text-gray-600">
                    Atenção: Tentativas de acesso não autorizado são registradas via IP.
                  </p>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Lado direito - Hero */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-[#0a2f6b]/90 to-[#3f78e0]/90 items-center justify-center p-6 md:p-12 relative">
        
        {/* Estrutura flexível para alinhar com a caixa de login */}
        <div className="flex flex-col justify-between h-[600px] relative z-10 w-full max-w-md mx-auto">
          
          {/* TOPO: Brasão */}
          <div className="flex justify-center">
            <img
              src={brasaoCipm}
              alt="Brasão 20ª CIPM"
              className="w-[200px] opacity-10 pointer-events-none select-none"
            />
          </div>
          
          {/* MEIO: Texto */}
          <div className="text-center mt-4">
            <h2 className="text-white text-2xl font-bold uppercase">Sistema de Gestão de Extras</h2>
            <p className="text-white/90 text-sm mt-2 max-w-md mx-auto">
              Plataforma oficial da 20ª CIPM para gerenciamento e controle de escalas extraordinárias, 
              desenvolvida para maximizar a eficiência operacional e transparência.
            </p>
          </div>
          
          {/* BASE: Botões alinhados com base da caixa de login */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg text-white flex flex-col items-center hover:bg-blue-600 transition-all">
              <ShieldAlert className="h-6 w-6 mb-2 text-blue-200" />
              <h3 className="font-medium">Polícia Mais Forte</h3>
              <p className="text-xs text-blue-200 mt-1">Gestão de extras PMF</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg text-white flex flex-col items-center hover:bg-blue-600 transition-all">
              <BookOpen className="h-6 w-6 mb-2 text-blue-200" />
              <h3 className="font-medium">Escola Segura</h3>
              <p className="text-xs text-blue-200 mt-1">Proteção escolar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}