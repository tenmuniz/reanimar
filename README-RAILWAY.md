# Deploy na Plataforma Railway

Este guia descreve como implantar a aplicação Escala PMF na plataforma de hospedagem Railway.

## Requisitos

1. Uma conta no [Railway](https://railway.app/)
2. Token de acesso do Railway (para implantação via CI/CD)
3. Acesso ao repositório Git do projeto

## Passos para Deploy Manual

### 1. Criar um novo projeto no Railway

1. Faça login na sua conta do Railway
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Selecione o repositório do projeto Escala PMF

### 2. Configurar Variáveis de Ambiente

Na seção "Variables" do projeto, adicione:

- `NODE_ENV`: `production`
- `SESSION_SECRET`: *uma string aleatória longa*
- `COOKIE_SECURE`: `true`
- `COOKIE_SAME_SITE`: `none`
- `JWT_EXPIRES_IN`: `7d`

O banco de dados PostgreSQL será provisionado automaticamente pelo Railway, e a variável `DATABASE_URL` será configurada automaticamente.

### 3. Adicionar Um Banco de Dados PostgreSQL

1. Clique em "New"
2. Selecione "Database" → "PostgreSQL"
3. Railway conectará automaticamente o banco ao seu serviço

## Deploy Automático com GitHub Actions

O projeto já está configurado para deploy automático via GitHub Actions. O arquivo de workflow `.github/workflows/railway-deploy.yml` realiza o deploy automaticamente quando ocorre um push para a branch `main`.

Para configurar:

1. Vá para as configurações do repositório GitHub, seção "Secrets and variables" → "Actions"
2. Adicione um novo secret:
   - Nome: `RAILWAY_TOKEN`
   - Valor: *seu token da API do Railway*

## Verificação de Saúde

O aplicativo tem um endpoint `/health` que pode ser usado para verificar se o serviço está em execução. Este endpoint retorna informações básicas sobre o status do aplicativo.

## Solução de Problemas

Se você enfrentar problemas durante o deploy:

1. Verifique os logs do Railway para erros específicos
2. Certifique-se de que as variáveis de ambiente estão configuradas corretamente
3. Verifique se o banco de dados PostgreSQL está conectado corretamente
4. Teste localmente com variáveis de ambiente semelhantes para identificar problemas

## Recursos Adicionais

- [Documentação do Railway](https://docs.railway.app/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Railway CLI](https://docs.railway.app/develop/cli)