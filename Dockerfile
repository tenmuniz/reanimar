# Estágio de compilação
FROM node:20-alpine AS build

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de projeto
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY vite.config.ts ./
COPY drizzle.config.ts ./
COPY theme.json ./
COPY .env.production ./.env

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Compilar aplicação
RUN npm run build

# Estágio de produção
FROM node:20-alpine AS production

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de build e dependências
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.env ./

# Expor porta
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 8080) + '/health').then(r => process.exit(r.ok ? 0 : 1))" || exit 1

# Iniciar aplicação
CMD ["npm", "start"]