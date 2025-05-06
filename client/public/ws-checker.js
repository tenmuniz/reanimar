/**
 * WebSocket Connection Checker
 * Este script tenta estabelecer uma conexão WebSocket com o servidor
 * e exibe informações detalhadas sobre o resultado no console do navegador.
 * Versão: 1.2.0
 */

(function() {
  // Executar quando a página estiver totalmente carregada
  window.addEventListener('load', function() {
    console.group('🔌 WebSocket Connection Checker v1.2.0');
    console.log('Iniciando verificação de conexão WebSocket...');
    
    // Status code para diagnóstico
    const WS_STATUS = {
      0: { name: 'CONNECTING', desc: 'Conexão sendo estabelecida' },
      1: { name: 'OPEN', desc: 'Conexão aberta e operacional' },
      2: { name: 'CLOSING', desc: 'Conexão em processo de encerramento' },
      3: { name: 'CLOSED', desc: 'Conexão fechada ou não pôde ser aberta' }
    };
    
    // Códigos de fechamento de WebSocket
    const WS_CLOSE_CODES = {
      1000: 'Fechamento normal',
      1001: 'Indo embora (página fechada)',
      1002: 'Erro de protocolo',
      1003: 'Tipo de dados não aceito',
      1005: 'Sem código de status',
      1006: 'Fechamento anormal',
      1007: 'Dados inconsistentes',
      1008: 'Política violada',
      1009: 'Mensagem muito grande',
      1010: 'Extensão não negociada',
      1011: 'Erro inesperado',
      1012: 'Reiniciando',
      1013: 'Tente novamente mais tarde',
      1014: 'Endpoint inválido',
      1015: 'TLS falhou'
    };
    
    // Verificar conexão do servidor antes de tentar WebSocket
    const checkServerStatus = () => {
      return fetch('http://localhost:5006/health', { method: 'GET' })
        .then(response => {
          if (!response.ok) throw new Error(`Servidor retornou ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log('%c✅ Servidor está respondendo:', 'color: green; font-weight: bold', data);
          return true;
        })
        .catch(error => {
          console.error('%c❌ Servidor não está respondendo:', 'color: red; font-weight: bold', error.message);
          logServerTroubleshooting();
          return false;
        });
    };
    
    // Função para verificar conexão WebSocket
    const checkWebSocketConnection = () => {
      try {
        // Novo caminho API para WebSocket
        const wsUrl = 'ws://localhost:5006/ws-api?token=' + Math.random().toString(36).substring(2, 15);
        console.log('Tentando conectar ao WebSocket em:', wsUrl);
        
        // Tentar conectar ao WebSocket
        const ws = new WebSocket(wsUrl);
        
        // Status atual - útil para diagnóstico
        console.log(`Status inicial: ${WS_STATUS[ws.readyState].name} (${WS_STATUS[ws.readyState].desc})`);
        
        // Configurar handlers de eventos
        ws.onopen = function() {
          console.log('%c✅ Conexão WebSocket estabelecida com sucesso!', 'color: green; font-weight: bold');
          console.log(`Status atual: ${WS_STATUS[ws.readyState].name} (${WS_STATUS[ws.readyState].desc})`);
          console.log('URL: ' + wsUrl);
          
          // Enviar mensagem de teste
          try {
            ws.send(JSON.stringify({ 
              type: 'ping', 
              message: 'Teste de conexão do ws-checker.js',
              timestamp: new Date().toISOString()
            }));
            console.log('Mensagem de teste enviada com sucesso');
          } catch (e) {
            console.error('Erro ao enviar mensagem de teste:', e);
          }
        };
        
        ws.onmessage = function(event) {
          try {
            const data = JSON.parse(event.data);
            console.log('📩 Mensagem recebida (JSON):', data);
          } catch (e) {
            console.log('📩 Mensagem recebida (texto):', event.data);
          }
        };
        
        ws.onerror = function(error) {
          console.error('%c❌ Erro na conexão WebSocket', 'color: red; font-weight: bold', error);
          console.log(`Status atual: ${WS_STATUS[ws.readyState].name} (${WS_STATUS[ws.readyState].desc})`);
          logConnectionTroubleshooting();
        };
        
        ws.onclose = function(event) {
          const reason = WS_CLOSE_CODES[event.code] || 'Motivo desconhecido';
          console.warn(
            `%c🔴 Conexão WebSocket fechada (código ${event.code}: ${reason})`, 
            'color: orange; font-weight: bold'
          );
          
          if (event.reason) {
            console.warn('Razão adicional:', event.reason);
          }
          
          if (event.wasClean) {
            console.log('A conexão foi fechada normalmente');
          } else {
            console.warn('A conexão foi encerrada de maneira inesperada');
          }
          
          logConnectionTroubleshooting();
        };
        
        // Adicionar ao window para depuração no console
        window._wsChecker = ws;
        
        console.log('Objeto WebSocket disponível como window._wsChecker');
        console.log('Você pode enviar uma mensagem com: window._wsChecker.send("sua mensagem")');
      } catch (error) {
        console.error('%c❌ Erro ao criar conexão WebSocket', 'color: red; font-weight: bold');
        console.error('Detalhes:', error);
        logConnectionTroubleshooting();
      }
    };
    
    // Sugestões para resolver problemas com o servidor
    function logServerTroubleshooting() {
      console.log('%cSoluções para problemas com o servidor:', 'font-weight: bold');
      console.log('1. Certifique-se de que o servidor está rodando com "npm run dev"');
      console.log('2. Verifique erros nos logs do servidor, como conflitos de porta');
      console.log('3. Execute "netstat -ano | findstr :5006" para verificar se a porta está em uso');
      console.log('4. Se a porta estiver em uso, finalize o processo com "taskkill /F /PID <PID>"');
      console.log('5. Verifique se o firewall não está bloqueando a porta 5006');
    }
    
    // Sugestões para resolver problemas com WebSocket
    function logConnectionTroubleshooting() {
      console.log('%cSoluções para problemas de conexão WebSocket:', 'font-weight: bold');
      console.log('1. Verifique se o servidor configurou corretamente o WebSocketServer');
      console.log('2. Certifique-se que o path configurado no servidor coincide com o cliente ("/")');
      console.log('3. Se estiver usando HTTPS, a conexão WebSocket deve usar wss:// ao invés de ws://');
      console.log('4. Verifique as configurações do CORS no servidor');
      console.log('5. Tente reiniciar o servidor e o navegador');
      console.log('6. Veja erros no console do servidor que podem estar relacionados');
    }
    
    // Primeiro verificar se o servidor está ativo, depois tentar WebSocket
    checkServerStatus().then(isUp => {
      if (isUp) {
        checkWebSocketConnection();
      } else {
        console.warn('Pulando verificação do WebSocket pois o servidor não respondeu');
      }
    });
    
    console.groupEnd();
  });
})(); 