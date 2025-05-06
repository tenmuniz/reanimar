import { useState, useEffect, useRef, useCallback } from 'react';

// Token aleatório gerado para identificação da sessão
const generateToken = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Hook personalizado para gerenciar conexão WebSocket
export function useWebSocket(url: string = 'ws://localhost:5007/ws-api') {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionToken = useRef<string>(generateToken());
  const reconnectCountRef = useRef<number>(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL_BASE = 2000; // 2 segundos

  // Função para calcular intervalo de reconexão exponencial
  const getReconnectInterval = useCallback(() => {
    // Backoff exponencial: 2s, 4s, 8s, 16s, 32s
    const exponentialDelay = RECONNECT_INTERVAL_BASE * Math.pow(2, reconnectCountRef.current);
    // Adiciona um jitter aleatorio (±20%) para evitar reconexões simultâneas
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
    return Math.min(exponentialDelay + jitter, 30000); // Máximo de 30 segundos
  }, []);

  // Função para conectar ao WebSocket
  const connect = useCallback(() => {
    try {
      // Limpar qualquer conexão anterior
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Adicionar token à URL para identificação
      const wsUrl = `${url}?token=${sessionToken.current}`;
      console.log(`Tentando conectar ao WebSocket (tentativa ${reconnectCountRef.current + 1}):`, wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket conectado com sucesso');
        setIsConnected(true);
        setError(null);
        reconnectCountRef.current = 0; // Resetar contador de reconexões
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prev) => [...prev, data]);
        } catch (e) {
          console.warn('Mensagem não é um JSON válido:', event.data);
          setMessages((prev) => [...prev, { raw: event.data }]);
        }
      };
      
      ws.onerror = (event) => {
        console.error('Erro no WebSocket:', event);
        setError('Erro na conexão WebSocket');
        
        // Não tentar reconexão imediata, deixar para o evento onclose
        // Isso evita múltiplas tentativas de reconexão
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket desconectado (código ${event.code}): ${event.reason || 'Sem motivo específico'}`);
        setIsConnected(false);
        
        // Limpar timeout anterior se existir
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        
        // Se não atingiu o limite de tentativas, tentar reconectar
        if (reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = getReconnectInterval();
          console.log(`Tentando reconectar em ${delay/1000} segundos...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current++;
            connect();
          }, delay);
        } else {
          console.error(`Limite de ${MAX_RECONNECT_ATTEMPTS} tentativas de reconexão atingido. Desistindo.`);
          setError(`Falha na conexão após ${MAX_RECONNECT_ATTEMPTS} tentativas.`);
        }
      };
      
      wsRef.current = ws;
    } catch (err) {
      console.error('Falha ao criar conexão WebSocket:', err);
      setError('Falha ao criar conexão WebSocket');
      
      // Tentar novamente, mas apenas se ainda não atingiu o limite
      if (reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = getReconnectInterval();
        console.log(`Erro ao inicializar. Tentando reconectar em ${delay/1000} segundos...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectCountRef.current++;
          connect();
        }, delay);
      }
    }
  }, [url, getReconnectInterval]);
  
  // Função para enviar mensagem
  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data));
        return true;
      } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
        return false;
      }
    }
    return false;
  }, []);
  
  // Função para reconectar manualmente
  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0; // Reset do contador para começar do zero
    connect();
  }, [connect]);
  
  // Função para desconectar
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
  }, []);
  
  // Conectar ao montar e desconectar ao desmontar
  useEffect(() => {
    connect();
    
    // Função para detectar quando o navegador volta a ficar online
    const handleOnline = () => {
      console.log('Navegador voltou a ficar online. Reconectando WebSocket...');
      reconnect();
    };
    
    // Registrar listener para evento online
    window.addEventListener('online', handleOnline);
    
    return () => {
      disconnect();
      window.removeEventListener('online', handleOnline);
    };
  }, [connect, disconnect, reconnect]);
  
  return {
    isConnected,
    error,
    messages,
    sendMessage,
    connect: reconnect, // Expor a função de reconexão
    disconnect
  };
}

export default useWebSocket; 