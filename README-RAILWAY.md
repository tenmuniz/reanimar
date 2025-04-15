# Sistema de Escalas PMF - Guia de Deployment no Railway

## Instalação no Railway

1. Faça login na sua conta do [Railway](https://railway.app/)
2. Clique em "New Project" e selecione "Deploy from GitHub repo"
3. Conecte sua conta GitHub e selecione o repositório deste projeto
4. Na seção de variáveis de ambiente, configure:

### Variáveis de Ambiente Necessárias

```
NODE_ENV=production
SESSION_SECRET=sua-chave-secreta-aqui
PORT=5000
```

### Conexão com Banco de Dados

O Railway oferece bancos PostgreSQL integrados. Configure o banco:

1. Na interface do Railway, clique em "New" e selecione "Database" → "PostgreSQL"
2. Após criação, o Railway automaticamente adicionará a variável `DATABASE_URL` ao seu projeto

## Notas Importantes

- A aplicação está configurada para usar a porta definida pela variável `PORT`, ou 5000 como padrão
- O service worker para PWA está configurado para funcionar tanto em desenvolvimento quanto em produção
- A sessão está configurada para funcionar com cookies seguros em produção

## Manutenção

Para atualizar o aplicativo:
1. Envie suas alterações para o GitHub
2. O Railway automaticamente detectará as mudanças e iniciará um novo deploy

## Troubleshooting

- **Erro de conexão com banco**: Verifique se a variável `DATABASE_URL` está corretamente configurada
- **Erro de sessão**: Verifique se `SESSION_SECRET` está configurado com uma string longa e aleatória
- **Erros na inicialização**: Consulte os logs no painel do Railway