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
      {/* Brasão como marca d'água */}
      <div className="absolute bottom-4 left-4 opacity-10">
        <img src={brasaoCipm} alt="Brasão 20ª CIPM" className="h-32 w-auto" />
      </div>
      
      {/* Formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12 relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl px-8 py-6 max-w-md mx-auto w-full">
          <div className="mb-6 flex flex-col items-center">
            <img src={brasaoCipm} alt="Brasão 20ª CIPM" className="w-16 h-16 mb-4" />
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
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Acesso Restrito</h2>
            <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
              Sistema restrito a policiais militares da ativa lotados na 20ª CIPM – Muaná / Ponta de Pedras.
              Atenção: Tentativas de acesso não autorizado são registradas.
            </p>
          </div>

          {/* Formulário de Login */}
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
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
                className="w-full bg-gradient-to-r from-[#0a2f6b] to-[#3f78e0] hover:from-[#0a2f6b] hover:to-[#2060d0] text-white font-medium py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center mt-6"
                disabled={loginMutation.isPending}
              >
                <LockKeyhole className="h-4 w-4 mr-2" />
                {loginMutation.isPending ? "Autenticando..." : "Entrar"}
                {!loginMutation.isPending && <ChevronsRight className="h-4 w-4 ml-2" />}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Lado direito - Hero */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-[#0a2f6b]/90 to-[#3f78e0]/90 p-12 items-center justify-center relative">
        {/* Brasão como marca d'água no lado direito */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <img src={brasaoCipm} alt="Brasão 20ª CIPM" className="w-80 h-80" />
        </div>
        
        <div className="text-center relative z-10">
          <div className="flex justify-center mb-6">
            <img src={brasaoCipm} alt="Brasão 20ª CIPM" className="h-32 w-auto drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 uppercase">Sistema de Gestão de Extras</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Plataforma oficial da 20ª CIPM para gerenciamento e controle de escalas extraordinárias,
            desenvolvida para maximizar a eficiência operacional e transparência.
          </p>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
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