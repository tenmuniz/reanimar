# Guia de Solução de Problemas com WebSocket

Este guia foi criado para ajudar a resolver o problema de conexão WebSocket que estava impedindo o funcionamento correto do sistema de gerenciamento de escalas da 20ª CIPM.

## Problema Identificado

O sistema estava apresentando os seguintes erros no console do navegador e servidor:
```
WebSocket connection to 'ws://localhost:5002/' token=vO8ZXVz7wr7' failed
TypeError: Cannot read properties of null (reading 'includes')

RangeError: Invalid WebSocket frame: invalid status code 27319

Error: listen EADDRINUSE: address already in use :::5002
```

## Soluções Implementadas

1. **Separação dos WebSockets para evitar conflito**:
   - Alteramos o caminho do WebSocket de `/` para `/ws-api` no arquivo `server/routes.ts`
   - Isso evita conflito com o WebSocket interno do Vite
   - Desabilitamos a compressão (perMessageDeflate) que estava causando erros de frame inválido

2. **Alteração da porta do servidor**:
   - Mudamos a porta do servidor de 5002 para 5006
   - Isso evita conflitos com outros processos que podem estar usando a porta 5002
   - Atualizamos todas as referências à porta em todo o código

3. **Tratamento de erros no componente OfficerSelect**:
   - Adicionamos verificações de segurança para evitar erros com `includes` em valores nulos

4. **Melhorias no hook de WebSocket**:
   - Atualizamos o hook `useWebSocket` para usar o novo caminho `/ws-api` e porta 5006
   - Implementamos lógica de reconexão automática com backoff exponencial
   - Adicionamos tratamento robusto de erros

5. **Componente de status do WebSocket**:
   - Adicionamos um componente que exibe o status da conexão
   - Fornece dicas para solução de problemas
   - Implementamos botão de reconexão manual

6. **Script de diagnóstico**:
   - Atualizamos o script `ws-checker.js` para verificar a conexão no caminho correto
   - Melhoramos os logs e as mensagens de diagnóstico

## Como verificar se a solução funcionou

1. Certifique-se de que o servidor está rodando:
   ```
   npm run dev
   ```

2. Abra a aplicação no navegador em `http://localhost:5006`.

3. Abra o console do navegador (F12) e verifique se há mensagens de sucesso nos logs:
   - "WebSocket conectado com sucesso" (no hook useWebSocket)
   - "✅ Conexão WebSocket estabelecida com sucesso!" (no ws-checker.js)

4. A interface do usuário deve carregar corretamente sem erros.

## Problemas Persistentes

Se ainda houver problemas com a conexão WebSocket:

1. **Verifique o caminho do WebSocket**:
   - Certifique-se de que todos os clientes WebSocket estão usando o caminho `/ws-api`
   - Verifique se não há código antigo que ainda tenta se conectar ao caminho raiz ('/')

2. **Verifique se a porta 5006 está disponível**:
   - Execute `netstat -ano | findstr :5006` para verificar se a porta está em uso
   - Se estiver em uso por outro processo, finalize-o ou mude a porta no arquivo `server/index.ts`

3. **Verifique os logs do servidor para erros específicos**:
   - Erros de WebSocket serão mostrados no console do servidor
   - Preste atenção em erros relacionados a "WebSocketServer" ou "Invalid frame"

4. **Problemas com HTTPS**:
   - Se o cliente estiver em HTTPS, o WebSocket precisa usar WSS (WebSocket Seguro)
   - Modifique o URL para `wss://` no hook `useWebSocket`

## Conflito com Vite

Um problema específico que identificamos foi um conflito entre nosso WebSocket personalizado e o WebSocket interno usado pelo Vite para atualização ao vivo (hot reload).

Isso foi resolvido:
1. Movendo nosso WebSocket para um caminho específico (`/ws-api`)
2. Desabilitando a compressão que causava problemas com frames
3. Ajustando os clientes para usar o novo caminho
4. Mudando a porta para evitar conflitos com outros processos

## Logs e Diagnósticos

Para ajudar no diagnóstico, adicionamos logs extensivos:

1. **No console do servidor**:
   - Mensagens de conexão e desconexão de WebSocket
   - Erros de estabelecimento de conexão
   - Mensagens recebidas dos clientes

2. **No console do navegador**:
   - Script `ws-checker.js` que mostra o status da conexão
   - Mensagens detalhadas de erro com códigos de status WebSocket
   - Verificação de conexão com o servidor antes de tentar WebSocket

## Contato para Suporte

Se os problemas persistirem, entre em contato com o suporte técnico fornecendo:
- Screenshots dos erros do console
- Versão do navegador
- Versão do sistema operacional
- Logs do servidor 