# Sistema de Gerenciamento de Escalas - 20ª CIPM

Sistema para gestão de escalas de serviço da 20ª Companhia Independente de Polícia Militar (Muaná/Ponta de Pedras), com suporte para operações PMF e Escola Segura.

## Características

- Cadastro e gerenciamento de militares
- Organização de escalas PMF e Escola Segura
- Persistência híbrida: Supabase + armazenamento local
- Funcionalidade offline
- Sincronização automática quando o sistema volta a ficar online
- Layout responsivo para uso em desktop e dispositivos móveis

## Tecnologias

- React
- TypeScript
- Tailwind CSS
- Supabase (banco de dados e armazenamento)
- Firebase (APIs e sistemas legados)
- LocalStorage (para persistência offline)

## Arquitetura

O sistema utiliza uma arquitetura híbrida com várias camadas de persistência:

1. **Supabase**: Principal banco de dados para acesso online
2. **LocalStorage**: Armazenamento local para operação offline
3. **APIs legadas**: Para compatibilidade com sistemas existentes

A aplicação detecta automaticamente o status da conexão e escolhe a melhor estratégia de armazenamento/recuperação de dados.

## Configuração do Projeto

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Conta no Supabase (gratuita ou paga)

### Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/escalas-20cipm.git
   cd escalas-20cipm
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure o Supabase:
   - Crie um projeto no Supabase
   - Execute o script SQL em `supabase_setup.sql` no SQL Editor do Supabase
   - Copie as credenciais do Supabase (URL e chave anônima)

4. Configure as variáveis de ambiente:
   - Edite o arquivo `client/src/lib/supabase.ts`
   - Substitua as variáveis `supabaseUrl` e `supabaseAnonKey` com suas credenciais

5. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

Para instruções detalhadas sobre a configuração do Supabase, consulte o arquivo [CONFIGURACAO_SUPABASE.md](./CONFIGURACAO_SUPABASE.md).

## Estrutura do Projeto

- `client/src/lib/supabase.ts`: Configuração e classes de acesso ao Supabase
- `client/src/lib/storage.ts`: Classes de armazenamento local
- `client/src/pages/`: Páginas da aplicação
- `client/src/components/`: Componentes reutilizáveis
- `supabase_setup.sql`: Script SQL para configurar o Supabase

## Uso

### Gerenciamento de Militares

- Cadastro de novos militares
- Edição de informações como patente e guarnição
- Ativação/desativação de militares

### Escala PMF

- Atribuição de militares para posições na escala PMF
- Visualização por mês e dia
- Relatórios de serviços por militar

### Escola Segura

- Gerenciamento da escala para a operação Escola Segura
- Restrição para dias letivos
- Limite de 2 policiais por dia

## Deployment

Para instruções de deployment na plataforma Railway, consulte o arquivo [README-RAILWAY.md](./README-RAILWAY.md).

## Desenvolvimento Futuro

- Autenticação com Supabase Auth
- Sincronização em tempo real com Supabase Realtime
- Sistema de controle de versão para conflitos
- Aplicativo móvel com React Native

## Licença

Este projeto é licenciado sob [incluir licença]

## Contato

Para questões ou suporte, entre em contato com:
[Incluir informações de contato]

## Configuração para Deploy no Vercel

Para configurar corretamente o projeto no Vercel, siga estas etapas:

1. Crie um novo projeto no Vercel e conecte ao repositório GitHub
2. Configure as seguintes variáveis de ambiente no projeto Vercel:

```
SUPABASE_URL=https://seuprojetosupabase.supabase.co
SUPABASE_KEY=sua_chave_anon_aqui
PORT=5006
```

3. Certifique-se de que seu arquivo `vercel.json` contenha a configuração adequada para o servidor:

```json
{
  "version": 2,
  "builds": [
    { "src": "server/index.ts", "use": "@vercel/node" },
    { "src": "client/package.json", "use": "@vercel/static-build", "config": { "distDir": "build" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/index.ts" },
    { "src": "/ws-api", "dest": "server/index.ts" },
    { "src": "/(.*)", "dest": "client/build/$1" }
  ]
}
```

4. Adicione uma configuração específica para WebSockets no Vercel, se necessário (consulte a documentação do Vercel para mais detalhes)

## Desenvolvimento Local

Para executar o projeto localmente:

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Crie um arquivo `.env` na raiz do projeto com as variáveis necessárias
4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

## Solução de Problemas do WebSocket

Se encontrar erros na conexão WebSocket:

1. Verifique se o servidor está rodando na porta 5006
2. Certifique-se de que não há outros processos usando a mesma porta
3. Se estiver usando HTTPS no cliente, a conexão WebSocket deve usar WSS
4. Verifique as configurações de CORS no servidor
5. Em produção no Vercel, certifique-se de que as rotas estão configuradas corretamente 