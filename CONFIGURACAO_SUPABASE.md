# Configuração do Supabase para o Sistema de Escalas 20ª CIPM

Este documento fornece instruções passo a passo sobre como configurar o Supabase para funcionar com a aplicação de gerenciamento de escalas da 20ª CIPM.

## Pré-requisitos

- Uma conta no Supabase (gratuita ou paga)
- Acesso a um navegador web moderno
- Os arquivos de código do projeto já configurados

## Passo 1: Criar um novo projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e faça login na sua conta
2. Clique em "New Project" (Novo Projeto)
3. Forneça as seguintes informações:
   - **Nome do Projeto**: Escalas 20 CIPM (ou qualquer nome de sua preferência)
   - **Database Password**: Crie uma senha forte para o banco de dados
   - **Region**: Escolha a região mais próxima geograficamente (recomendado: South America (São Paulo))
4. Clique em "Create New Project" e aguarde a criação do projeto (isso pode levar alguns minutos)

## Passo 2: Configurar as tabelas do banco de dados

1. No painel do Supabase, vá para a seção "SQL Editor" (Editor SQL)
2. Clique em "New Query" (Nova Consulta)
3. Copie todo o conteúdo do arquivo `supabase_setup.sql` fornecido com o projeto
4. Cole o código no editor SQL do Supabase
5. Clique em "Run" (Executar) para criar as tabelas necessárias

## Passo 3: Obter as credenciais de API

1. No painel do Supabase, vá para a seção "Settings" (Configurações)
2. Clique em "API" no menu lateral
3. Na seção "Project API Keys", você encontrará:
   - **URL**: A URL do seu projeto Supabase
   - **anon public**: A chave pública anônima para uso no cliente

## Passo 4: Configurar a aplicação

1. Abra o arquivo `client/src/lib/supabase.ts` no editor de código
2. Substitua as variáveis de configuração com suas credenciais:

```typescript
const supabaseUrl = 'sua-url-do-projeto';
const supabaseAnonKey = 'sua-chave-publica-anonima';
```

Por exemplo:

```typescript
const supabaseUrl = 'https://abcdefghijklmnopqrst.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Passo 5: Testar a conexão

1. Execute a aplicação localmente
2. Verifique se os dados estão sendo salvos e carregados corretamente do Supabase

## Estrutura do Banco de Dados

O sistema utiliza duas tabelas principais:

### Tabela `militares`

Armazena os dados dos policiais militares.

- **id**: Identificador único (UUID)
- **nome**: Nome completo do militar
- **patente**: Patente/posto do militar
- **guarnicao**: Guarnição a que pertence (ALFA, BRAVO, CHARLIE, etc.)
- **ativo**: Status ativo ou inativo
- **created_at**: Data de criação do registro
- **updated_at**: Data da última atualização

### Tabela `escalas`

Armazena as escalas dos militares.

- **id**: Identificador único (UUID)
- **tipo**: Tipo da operação ('pmf' ou 'escolaSegura')
- **ano**: Ano da escala
- **mes**: Mês da escala (0-11, onde 0 = Janeiro)
- **dia**: Dia do mês
- **posicao**: Posição na escala (0, 1, 2)
- **militar_id**: ID do militar escalado
- **created_at**: Data de criação do registro
- **updated_at**: Data da última atualização

## Modo Offline

A aplicação foi projetada para funcionar em modo offline:

1. Primeiro, tenta carregar dados do Supabase
2. Se não conseguir, usa dados armazenados localmente no navegador
3. Quando a conexão é restabelecida, sincroniza os dados locais com o Supabase

## Suporte e Resolução de Problemas

Se encontrar problemas durante a configuração:

1. Verifique se as credenciais estão corretas
2. Certifique-se de que o SQL foi executado sem erros
3. Verifique se o acesso à internet está funcionando
4. Confirme se as políticas de segurança estão configuradas corretamente

Para problemas persistentes, consulte a documentação oficial do Supabase em [https://supabase.com/docs](https://supabase.com/docs). 