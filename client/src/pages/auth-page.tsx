import { useEffect, useState } from "react";
import { Redirect, useLocation } from "wouter";
import { AlertCircle, LockKeyhole, ChevronRight } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import brasaoCipm from "../assets/brasao-20cipm.png";
import brasaoPmpa from "../assets/brasao-pmpa-novo.png";

// Definição da animação de shake para o formulário de login
const shakeAnimation = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
.shake {
  animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
}
`;

// Esquema de validação
const loginSchema = z.object({
  cpf: z.string().min(1, { message: "Usuário é obrigatório" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation } = useAuth();
  const [shakeForm, setShakeForm] = useState(false);

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

  // Função para aplicar efeito de shake no formulário
  const applyShakeEffect = () => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 600); // Duração da animação
  };

  // Função para lidar com o login
  const handleLogin = (data: LoginFormData) => {
    // Verifica localmente se as credenciais correspondem ao usuário permitido
    if (data.cpf === 'capmuniz' && data.password === '0801') {
      loginMutation.mutate(data);
    } else {
      // Exibe mensagem de erro específica e aplica efeito de shake
      loginForm.setError('root', {
        type: 'manual',
        message: 'Usuário ou senha inválidos'
      });
      
      // Aplicar borda vermelha nos campos
      loginForm.setError('cpf', { type: 'manual', message: '' });
      loginForm.setError('password', { type: 'manual', message: '' });
      
      // Aplicar efeito de shake
      applyShakeEffect();
    }
  };

  // Se o usuário já estiver autenticado, redireciona para a página inicial
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <style>{shakeAnimation}</style>
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-[#0a2f6b] via-[#143d8a] to-[#1e3a8a]">
        {/* Container de login (esquerda) */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
          <div 
            className={`bg-white rounded-xl shadow-xl w-full max-w-md p-8 relative ${shakeForm ? 'shake' : ''}`}
          >
            <div className="mb-6 flex flex-col items-center">
              <img src={brasaoCipm} alt="Brasão 20ª CIPM" className="w-24 h-auto mb-4" />
              <h1 className="text-2xl font-bold text-[#0a2f6b] text-center uppercase">
                Sistema de Escalas Extras
              </h1>
              <p className="text-sm text-gray-600 text-center mt-1">
                20ª Companhia Independente da PMPA
              </p>
            </div>

            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold text-gray-800">Acesso Restrito</h2>
              <p className="text-xs text-gray-600 mt-1">
                Sistema exclusivo para policiais militares da ativa 
                <br />lotados na 20ª CIPM - Muaná
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
                          className={`${loginForm.formState.errors.cpf ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
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
                          className={`${loginForm.formState.errors.password ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(loginMutation.error || loginForm.formState.errors.root) && (
                  <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>{loginForm.formState.errors.root?.message || "Usuário ou senha inválidos"}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 mt-6 transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={loginMutation.isPending}
                >
                  <LockKeyhole className="h-4 w-4 mr-2" />
                  {loginMutation.isPending ? "Carregando..." : "ENTRAR"}
                  {!loginMutation.isPending && <ChevronRight className="h-4 w-4 ml-2" />}
                </Button>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-red-500 font-medium">
                    Atenção: Tentativas de acesso não autorizado são registradas por IP.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    © 2025 – 20ª Companhia Independente da Polícia Militar – Muaná/PA
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Hero/Informações (direita) */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 relative">
          {/* Brasão de fundo (marca d'água) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <img src={brasaoPmpa} alt="Brasão PMPA" className="w-96 h-auto" />
          </div>
          
          <div className="relative z-10 text-center max-w-md">
            <h2 className="text-3xl font-bold text-white mb-4 uppercase">
              Sistema de Gestão de Extras
            </h2>
            <p className="text-white text-opacity-90 mb-8">
              Plataforma oficial da 20ª CIPM para gerenciamento e controle de escalas
              extraordinárias, desenvolvida para maximizar a eficiência operacional e
              transparência.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-10 p-5 rounded-lg border border-white border-opacity-20 shadow-lg">
                <h3 className="text-white font-semibold text-lg mb-2">Polícia Mais Forte</h3>
                <p className="text-white text-opacity-80 text-sm">Gestão de extras PMF</p>
              </div>
              <div className="bg-white bg-opacity-10 p-5 rounded-lg border border-white border-opacity-20 shadow-lg">
                <h3 className="text-white font-semibold text-lg mb-2">Escola Segura</h3>
                <p className="text-white text-opacity-80 text-sm">Proteção escolar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}