import { useState, useEffect } from 'react';
import useWebSocket from '@/hooks/use-websocket';

const WebSocketStatus = () => {
  const { isConnected, error, connect } = useWebSocket();
  const [showWarning, setShowWarning] = useState(false);
  const [showReconnectSuccess, setShowReconnectSuccess] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  // Mostrar aviso apenas se o erro persistir por mais de 3 segundos
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (error && !isConnected) {
      timer = setTimeout(() => {
        setShowWarning(true);
        setShowReconnectSuccess(false);
      }, 3000);
    } else if (isConnected) {
      // Se reconectou com sucesso após uma tentativa manual
      if (reconnectAttempt > 0) {
        setShowReconnectSuccess(true);
        setShowWarning(false);
        
        // Ocultar mensagem de sucesso após 5 segundos
        timer = setTimeout(() => {
          setShowReconnectSuccess(false);
          setReconnectAttempt(0);
        }, 5000);
      } else {
        setShowWarning(false);
        setShowReconnectSuccess(false);
      }
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [error, isConnected, reconnectAttempt]);

  // Função para reconectar manualmente
  const handleReconnect = () => {
    setReconnectAttempt(prev => prev + 1);
    connect(); // Chamar a função de reconexão do hook
  };

  // Mensagem de sucesso na reconexão
  if (showReconnectSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg shadow-lg border border-green-300 z-50 animate-fadeIn">
        <div className="flex items-start">
          <svg className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Conexão Restabelecida</h3>
            <p className="mt-1 text-sm text-green-700">
              A conexão WebSocket foi restabelecida com sucesso.
            </p>
            <div className="mt-3 flex justify-end">
              <button 
                onClick={() => setShowReconnectSuccess(false)}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg shadow-lg border border-amber-300 z-50 animate-fadeIn">
      <div className="flex items-start">
        <svg className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 className="text-lg font-semibold text-amber-800">Problema de Conexão WebSocket</h3>
          <p className="mt-1 text-sm text-amber-700">
            O sistema está com dificuldades para estabelecer uma conexão WebSocket com o servidor.
            {reconnectAttempt > 0 && <span className="block mt-1 font-medium">Tentativa manual #{reconnectAttempt} falhou.</span>}
          </p>
          <div className="mt-3 text-xs text-amber-600 bg-amber-100 p-2 rounded border border-amber-200">
            <p className="font-medium">Soluções possíveis:</p>
            <ol className="list-decimal ml-4 mt-1 space-y-1">
              <li>Verifique se o servidor está rodando na porta 5006</li>
              <li>Tente reiniciar o servidor com <code className="bg-amber-200 px-1 rounded">npm run dev</code></li>
              <li>Verifique se há processos usando a porta 5006 com <code className="bg-amber-200 px-1 rounded">netstat -ano | findstr :5006</code></li>
              <li>Recarregue a página após reiniciar o servidor</li>
              <li>Se estiver usando HTTPS no cliente, o servidor também deve usar WSS</li>
            </ol>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button 
              onClick={handleReconnect}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tentar Reconectar
            </button>
            <button 
              onClick={() => setShowWarning(false)}
              className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketStatus; 