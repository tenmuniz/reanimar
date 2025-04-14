import { useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { AlertCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import brasaoPmpa from "../assets/brasao-pmpa.svg";

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
    <div className="min-h-screen flex bg-[#0a3170]">
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md w-96 p-8">
          <div className="mb-6 flex flex-col items-center">
            <img src={brasaoPmpa} alt="Brasão PMPA" className="w-16 h-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-800 text-center">
              SISTEMA DE ESCALAS EXTRAS
            </h1>
            <p className="text-sm text-gray-600 text-center mt-1">
              20ª Companhia Independente da PMPA
            </p>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-base font-medium text-gray-700">Acesso Restrito</h2>
            <p className="text-xs text-gray-500 mt-1">
              Sistema exclusivo para policiais militares da ativa lotados na 20ª CIPM - Muaná
            </p>
          </div>

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
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loginMutation.isPending}
              >
                ENTRAR
              </Button>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Atenção: Tentativas de acesso não autorizado são registradas no IP
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 bg-[#0a3170] p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            SISTEMA DE GESTÃO DE EXTRAS
          </h2>
          <p className="text-white text-sm mb-8">
            Plataforma oficial da 20ª CIPM para gerenciamento e controle de escalas
            extraordinárias, desenvolvida para maximizar a eficiência operacional e
            transparência.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">Polícia Mais Forte</h3>
              <p className="text-white text-opacity-80 text-xs">Gestão de extras PMF</p>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">Escola Segura</h3>
              <p className="text-white text-opacity-80 text-xs">Proteção escolar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}