import { useState, useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { Shield, UserCheck, LockKeyhole, ChevronsRight, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import brasaoCipm from "../assets/brasao-cipm.svg";
import brasaoPMPA from "../assets/brasao-pmpa.svg";

// Esquema de validação de login
const loginSchema = z.object({
  cpf: z
    .string()
    .min(11, { message: "CPF deve ter 11 dígitos" })
    .max(14, { message: "CPF inválido" })
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, { message: "Formato de CPF inválido" }),
  password: z
    .string()
    .min(4, { message: "Senha deve ter no mínimo 4 caracteres" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Esquema de validação para registro
const registerSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  username: z
    .string()
    .min(3, { message: "Nome de usuário deve ter no mínimo 3 caracteres" }),
  cpf: z
    .string()
    .min(11, { message: "CPF deve ter 11 dígitos" })
    .max(14, { message: "CPF inválido" })
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, { message: "Formato de CPF inválido" }),
  password: z
    .string()
    .min(4, { message: "Senha deve ter no mínimo 4 caracteres" }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Formulário de login
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cpf: "",
      password: "",
    },
  });

  // Formulário de registro
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
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

  // Função para lidar com o login
  const handleLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  // Função para lidar com o registro
  const handleRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
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
            <img src={brasaoCipm} alt="Brasão CIPM" className="h-20 w-auto" />
            <h1 className="mt-4 text-2xl font-bold text-gray-800">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                SISTEMA EXTRAORDINÁRIO
              </span>
            </h1>
            <p className="text-sm text-gray-500 text-center mt-1">
              Gestão de Escalas - 20ª CIPM
            </p>
          </div>

          {/* Abas de Login/Registro */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex items-center justify-center w-1/2 py-3 text-sm font-medium transition-colors ${
                isLogin
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex items-center justify-center w-1/2 py-3 text-sm font-medium transition-colors ${
                !isLogin
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <Shield className="h-4 w-4 mr-2" />
              Registro
            </button>
          </div>

          {isLogin ? (
            /* Formulário de Login */
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF / Matrícula</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="000.000.000-00"
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
          ) : (
            /* Formulário de Registro */
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nome completo"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Usuário</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nome de usuário"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF / Matrícula</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="000.000.000-00"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
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

                {registerMutation.error && (
                  <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Erro ao registrar. Tente novamente.</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                  disabled={registerMutation.isPending}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {registerMutation.isPending ? "Registrando..." : "Registrar"}
                  {!registerMutation.isPending && <ChevronsRight className="h-4 w-4 ml-2" />}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>

      {/* Lado direito - Hero */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-blue-800 to-blue-600 p-12 items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src={brasaoPMPA} alt="Brasão PMPA" className="h-32 w-auto drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Sistema de Gestão de Escalas</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Plataforma oficial da 20ª CIPM para gerenciamento e controle de escalas extraordinárias,
            desenvolvida para maximizar a eficiência operacional e transparência.
          </p>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg text-white flex flex-col items-center">
              <Shield className="h-6 w-6 mb-2 text-blue-200" />
              <h3 className="font-medium">Polícia Mais Forte</h3>
              <p className="text-xs text-blue-200 mt-1">Gestão de escalas PMF</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg text-white flex flex-col items-center">
              <UserCheck className="h-6 w-6 mb-2 text-blue-200" />
              <h3 className="font-medium">Escola Segura</h3>
              <p className="text-xs text-blue-200 mt-1">Proteção escolar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}