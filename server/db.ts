import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://uakdrtgabsxvuxilqepw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2RydGdhYnN4dnV4aWxxZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0OTA2MjcsImV4cCI6MjA2MjA2NjYyN30.FFxCUjxwtW5JfbQVLTn7pUPRUY22HFLzEHBd8-lfYI8';

// Log de conexão
console.log('Inicializando conexão com o Supabase URL:', supabaseUrl);

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para criar tabelas diretamente via API REST
const createTablesViaRest = async () => {
  console.log('Tentando criar tabelas via REST API...');
  
  try {
    // Militares
    const militaresResponse = await fetch(`${supabaseUrl}/rest/v1/militares?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (militaresResponse.status === 404) {
      console.log('Tabela militares não existe, criando via POST...');
      
      // Criar primeiro militar para inicializar a tabela
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/militares`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          nome: 'CAP QOPM MUNIZ',
          patente: 'CAP',
          guarnicao: 'EXPEDIENTE',
          ativo: true
        })
      });
      
      if (createResponse.ok) {
        console.log('Primeiro militar criado com sucesso, tabela inicializada!');
      } else {
        console.error('Erro ao criar tabela militares:', await createResponse.text());
      }
    } else {
      console.log('Tabela militares já existe!');
    }
    
    // Escalas
    const escalasResponse = await fetch(`${supabaseUrl}/rest/v1/escalas?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (escalasResponse.status === 404) {
      console.log('Tabela escalas não existe, criando via POST...');
      
      // Criar primeira escala para inicializar a tabela
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/escalas`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          tipo: 'pmf',
          ano: 2024,
          mes: 6,
          dia: 1,
          posicao: 0,
          militar_id: null
        })
      });
      
      if (createResponse.ok) {
        console.log('Primeira escala criada com sucesso, tabela inicializada!');
      } else {
        console.error('Erro ao criar tabela escalas:', await createResponse.text());
      }
    } else {
      console.log('Tabela escalas já existe!');
    }
    
  } catch (error) {
    console.error('Erro ao criar tabelas via REST:', error);
  }
};

// Inicializar militares com dados predefinidos
const initializeMilitares = async () => {
  console.log('Inicializando militares...');
  
  try {
    // Verificar quantos militares existem
    const { data: militares, error } = await supabase
      .from('militares')
      .select('count');
    
    // Se não houver militares ou ocorrer erro, inserir os dados padrão
    if (error || !militares || militares[0].count === 0) {
      console.log('Nenhum militar encontrado, inserindo dados padrão...');
      
      const defaultMilitares = [
        { nome: "CAP QOPM MUNIZ", patente: "CAP", guarnicao: "EXPEDIENTE", ativo: true },
        { nome: "1º TEN QOPM MONTEIRO", patente: "1º TEN", guarnicao: "EXPEDIENTE", ativo: true },
        { nome: "TEN VANILSON", patente: "TEN", guarnicao: "EXPEDIENTE", ativo: true },
        { nome: "SUB TEN ANDRÉ", patente: "SUB TEN", guarnicao: "EXPEDIENTE", ativo: true },
        { nome: "3º SGT PM CUNHA", patente: "3º SGT", guarnicao: "EXPEDIENTE", ativo: true },
        { nome: "3º SGT PM CARAVELAS", patente: "3º SGT", guarnicao: "EXPEDIENTE", ativo: true },
        { nome: "CB PM TONI", patente: "CB", guarnicao: "EXPEDIENTE", ativo: true },
        { nome: "SD PM S. CORREA", patente: "SD", guarnicao: "EXPEDIENTE", ativo: true },
        { nome: "SD PM RODRIGUES", patente: "SD", guarnicao: "EXPEDIENTE", ativo: true },
        { nome: "2º SGT PM A. TAVARES", patente: "2º SGT", guarnicao: "EXPEDIENTE", ativo: true },
      ];
      
      // Inserir em lotes de 10 para evitar sobrecarga
      const { error: insertError } = await supabase
        .from('militares')
        .insert(defaultMilitares);
      
      if (insertError) {
        console.error('Erro ao inserir militares:', insertError);
      } else {
        console.log('Militares inseridos com sucesso!');
      }
    } else {
      console.log(`Já existem ${militares[0].count} militares na base.`);
    }
  } catch (error) {
    console.error('Erro ao inicializar militares:', error);
  }
};

// Criar as tabelas via REST
setTimeout(createTablesViaRest, 1000);

// Verificar conexão com Supabase
const testConnection = async (): Promise<void> => {
  try {
    console.log('Testando conexão com o Supabase...');
    
    // Verifica se podemos conectar ao Supabase
    const { data, error } = await supabase.from('militares').select('count');
    
    if (error) {
      console.error('Erro ao conectar ao Supabase:', error);
      console.log('Tentando criar tabelas via REST...');
      await createTablesViaRest();
    } else {
      console.log('Supabase conectado com sucesso. Dados:', data);
      // Inicializar militares se necessário
      await initializeMilitares();
    }
  } catch (error) {
    console.error('Erro ao testar conexão com o Supabase:', error);
  }
};

// Testar conexão ao iniciar
testConnection();

// Teste periódico de conexão
setInterval(() => {
  // Usando async/await em uma função anônima para lidar corretamente com Promises
  (async () => {
    try {
      const { data } = await supabase.from('militares').select('count', { count: 'exact', head: true });
      // Conexão bem-sucedida
      console.log('Verificação periódica de conexão: OK. Militares:', data);
    } catch (err) {
      console.log('Erro na verificação de conexão com Supabase:', err);
    }
  })();
}, 60000); // Verificar a cada minuto

// Função auxiliar para debug
export const checkDatabase = async () => {
  console.log('Verificando banco de dados...');
  try {
    // Tentando acessar militares
    const { data: militares, error: militaresError } = await supabase.from('militares').select('*').limit(5);
    console.log('Militares:', militares || 'Nenhum dado');
    if (militaresError) console.error('Erro ao buscar militares:', militaresError);
    
    // Tentando acessar escalas
    const { data: escalas, error: escalasError } = await supabase.from('escalas').select('*').limit(5);
    console.log('Escalas:', escalas || 'Nenhum dado');
    if (escalasError) console.error('Erro ao buscar escalas:', escalasError);
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
  }
};

// Executar verificação após 5 segundos
setTimeout(checkDatabase, 5000);

export { supabase };