import { useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { Shield, LockKeyhole, ChevronsRight, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

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

  // Função para lidar com o login personalizado para capmuniz
  const handleLogin = (data: LoginFormData) => {
    // Verifica se as credenciais são do usuário autorizado
    loginMutation.mutate(data);
  };

  // Se o usuário já estiver autenticado, redireciona para a página inicial
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-900 to-blue-700">
      {/* Formulário */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 max-w-md mx-auto w-full">
          <div className="mb-6 flex flex-col items-center">
            <Shield className="h-16 w-16 text-blue-600" />
            <h1 className="mt-4 text-2xl font-bold text-gray-800">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                SISTEMA EXTRAORDINÁRIO
              </span>
            </h1>
            <p className="text-sm text-gray-500 text-center mt-1">
              Gestão de Extras - 20ª CIPM
            </p>
          </div>

          {/* Título da Seção de Login */}
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Acesso Restrito</h2>
            <p className="text-sm text-gray-500">Entre com suas credenciais</p>
          </div>

          {/* Formulário de Login */}
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
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
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-blue-800 to-blue-600 p-12 items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Shield className="h-24 w-24 text-white/90" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Sistema de Gestão de Extras</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Plataforma oficial da 20ª CIPM para gerenciamento e controle de escalas extraordinárias,
            desenvolvida para maximizar a eficiência operacional e transparência.
          </p>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg text-white flex flex-col items-center">
              <Shield className="h-6 w-6 mb-2 text-blue-200" />
              <h3 className="font-medium">Polícia Mais Forte</h3>
              <p className="text-xs text-blue-200 mt-1">Gestão de extras PMF</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg text-white flex flex-col items-center">
              <Shield className="h-6 w-6 mb-2 text-blue-200" />
              <h3 className="font-medium">Escola Segura</h3>
              <p className="text-xs text-blue-200 mt-1">Proteção escolar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}