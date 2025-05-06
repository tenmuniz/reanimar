import { createClient } from '@supabase/supabase-js';
import { Militar, EscalaData } from './storage';

// As variáveis de ambiente podem ser ajustadas posteriormente 
// quando o cliente configurar seu projeto Supabase
const supabaseUrl = 'https://uakdrtgabsxvuxilqepw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2RydGdhYnN4dnV4aWxxZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0OTA2MjcsImV4cCI6MjA2MjA2NjYyN30.FFxCUjxwtW5JfbQVLTn7pUPRUY22HFLzEHBd8-lfYI8';

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface para definir a estrutura da tabela de militares no Supabase
export interface SupabaseMilitar extends Omit<Militar, 'createdAt' | 'updatedAt'> {
  created_at?: string; // Campo gerado pelo Supabase
  updated_at?: string; // Campo gerado pelo Supabase
}

// Interface para escala no Supabase
export interface SupabaseEscala {
  id?: string;
  tipo: 'pmf' | 'escolaSegura';
  ano: number;
  mes: number;
  dia: number;
  posicao: number;
  militar_id: string | null;
  created_at?: string;
  updated_at?: string;
}

// Classe para gerenciar militares no Supabase
export class SupabaseMilitarStorage {
  // Obter todos os militares
  static async getAllMilitares(): Promise<Militar[]> {
    try {
      const { data, error } = await supabase
        .from('militares')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar militares do Supabase:', error);
        return [];
      }
      
      // Converter do formato Supabase para o formato da aplicação
      return data.map(militar => ({
        id: militar.id,
        nome: militar.nome,
        patente: militar.patente,
        guarnicao: militar.guarnicao,
        ativo: militar.ativo,
        createdAt: militar.created_at || new Date().toISOString(),
        updatedAt: militar.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao buscar militares:', error);
      return [];
    }
  }
  
  // Obter apenas os militares ativos
  static async getActiveMilitares(): Promise<Militar[]> {
    try {
      const { data, error } = await supabase
        .from('militares')
        .select('*')
        .eq('ativo', true);
      
      if (error) {
        console.error('Erro ao buscar militares ativos do Supabase:', error);
        return [];
      }
      
      // Converter do formato Supabase para o formato da aplicação
      return data.map(militar => ({
        id: militar.id,
        nome: militar.nome,
        patente: militar.patente,
        guarnicao: militar.guarnicao,
        ativo: militar.ativo,
        createdAt: militar.created_at || new Date().toISOString(),
        updatedAt: militar.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao buscar militares ativos:', error);
      return [];
    }
  }
  
  // Obter apenas os nomes dos militares ativos
  static async getActiveMilitarNames(): Promise<string[]> {
    const militares = await this.getActiveMilitares();
    return militares.map(militar => militar.nome);
  }
  
  // Buscar militar por ID
  static async getMilitarById(id: string): Promise<Militar | null> {
    try {
      const { data, error } = await supabase
        .from('militares')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar militar por ID do Supabase:', error);
        return null;
      }
      
      if (!data) return null;
      
      // Converter do formato Supabase para o formato da aplicação
      return {
        id: data.id,
        nome: data.nome,
        patente: data.patente,
        guarnicao: data.guarnicao,
        ativo: data.ativo,
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar militar por ID:', error);
      return null;
    }
  }
  
  // Adicionar um novo militar
  static async addMilitar(militar: Omit<Militar, 'id' | 'createdAt' | 'updatedAt'>): Promise<Militar | null> {
    try {
      const { data, error } = await supabase
        .from('militares')
        .insert([{
          nome: militar.nome,
          patente: militar.patente,
          guarnicao: militar.guarnicao,
          ativo: militar.ativo
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar militar no Supabase:', error);
        return null;
      }
      
      // Converter do formato Supabase para o formato da aplicação
      return {
        id: data.id,
        nome: data.nome,
        patente: data.patente,
        guarnicao: data.guarnicao,
        ativo: data.ativo,
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao adicionar militar:', error);
      return null;
    }
  }
  
  // Atualizar um militar existente
  static async updateMilitar(id: string, updates: Partial<Militar>): Promise<Militar | null> {
    try {
      const { data, error } = await supabase
        .from('militares')
        .update({
          nome: updates.nome,
          patente: updates.patente,
          guarnicao: updates.guarnicao,
          ativo: updates.ativo
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar militar no Supabase:', error);
        return null;
      }
      
      // Converter do formato Supabase para o formato da aplicação
      return {
        id: data.id,
        nome: data.nome,
        patente: data.patente,
        guarnicao: data.guarnicao,
        ativo: data.ativo,
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao atualizar militar:', error);
      return null;
    }
  }
  
  // Remover um militar
  static async deleteMilitar(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('militares')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao remover militar do Supabase:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao remover militar:', error);
      return false;
    }
  }
  
  // Importar militares da API e salvar no Supabase
  static async importFromOfficersAPI(officers: string[]): Promise<Militar[]> {
    if (!officers || officers.length === 0) return [];
    
    try {
      const militares: SupabaseMilitar[] = officers.map(officer => {
        // Extrair patente do nome (assumindo formato "PATENTE NOME")
        const parts = officer.split(" ");
        const patente = parts[0];
        const nome = parts.slice(1).join(" ");
        
        // Detectar guarnição com base no nome
        const guarnicao = this.getGuarnicaoMilitar(officer);
        
        return {
          id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
          nome: officer,
          patente: patente,
          guarnicao: guarnicao,
          ativo: true
        };
      });
      
      // Inserir no Supabase
      const { data, error } = await supabase
        .from('militares')
        .insert(militares)
        .select();
      
      if (error) {
        console.error('Erro ao importar militares para o Supabase:', error);
        return [];
      }
      
      // Converter do formato Supabase para o formato da aplicação
      return data.map(militar => ({
        id: militar.id,
        nome: militar.nome,
        patente: militar.patente,
        guarnicao: militar.guarnicao,
        ativo: militar.ativo,
        createdAt: militar.created_at || new Date().toISOString(),
        updatedAt: militar.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao importar militares:', error);
      return [];
    }
  }
  
  // Método privado para identificar a guarnição de um militar
  private static getGuarnicaoMilitar(nome: string): string {
    if (nome.includes("QOPM") || nome.includes("MONTEIRO") || 
        nome.includes("VANILSON") || nome.includes("ANDRÉ") || 
        nome.includes("CUNHA") || nome.includes("CARAVELAS") || 
        nome.includes("TONI") || nome.includes("CORREA") || 
        nome.includes("RODRIGUES") || nome.includes("TAVARES")) {
      return "EXPEDIENTE";
    } else if (nome.includes("PEIXOTO") || nome.includes("RODRIGO") || 
               nome.includes("LEDO") || nome.includes("NUNES") || 
               nome.includes("AMARAL") || nome.includes("CARLA") || 
               nome.includes("FELIPE") || nome.includes("BARROS") || 
               nome.includes("A. SILVA") || nome.includes("LUAN") || 
               nome.includes("NAVARRO")) {
      return "ALFA";
    } else if (nome.includes("OLIMAR") || nome.includes("FÁBIO") || 
               nome.includes("ANA CLEIDE") || nome.includes("GLEIDSON") || 
               nome.includes("CARLOS EDUARDO") || nome.includes("NEGRÃO") || 
               nome.includes("BRASIL") || nome.includes("MARVÃO") || 
               nome.includes("IDELVAN")) {
      return "BRAVO";
    } else if (nome.includes("PINHEIRO") || nome.includes("RAFAEL") || 
               nome.includes("MIQUEIAS") || nome.includes("M. PAIXÃO") || 
               nome.includes("CHAGAS") || nome.includes("CARVALHO") || 
               nome.includes("GOVEIA") || nome.includes("ALMEIDA") || 
               nome.includes("PATRIK") || nome.includes("GUIMARÃES")) {
      return "CHARLIE";
    }
    return "OUTROS";
  }
}

// Classe para gerenciar escalas no Supabase
export class SupabaseEscalaStorage {
  // Salvar escala para um mês específico
  static async saveEscalaMes(
    tipo: 'pmf' | 'escolaSegura', 
    ano: number, 
    mes: number, 
    dadosMes: {[day: string]: (string | null)[]}
  ): Promise<boolean> {
    try {
      // Primeiro, vamos remover os registros existentes para este mês e tipo
      await supabase
        .from('escalas')
        .delete()
        .eq('tipo', tipo)
        .eq('ano', ano)
        .eq('mes', mes);
      
      // Agora vamos criar os novos registros
      const registros: Omit<SupabaseEscala, 'id'>[] = [];
      
      Object.entries(dadosMes).forEach(([dia, militares]) => {
        militares.forEach((militar, posicao) => {
          registros.push({
            tipo,
            ano,
            mes,
            dia: parseInt(dia),
            posicao,
            militar_id: militar
          });
        });
      });
      
      if (registros.length > 0) {
        const { error } = await supabase
          .from('escalas')
          .insert(registros);
        
        if (error) {
          console.error('Erro ao salvar escala no Supabase:', error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar escala:', error);
      return false;
    }
  }
  
  // Obter escala para um mês específico
  static async getEscalaMes(
    tipo: 'pmf' | 'escolaSegura', 
    ano: number, 
    mes: number
  ): Promise<{[day: string]: (string | null)[]}> {
    try {
      const { data, error } = await supabase
        .from('escalas')
        .select('*')
        .eq('tipo', tipo)
        .eq('ano', ano)
        .eq('mes', mes);
      
      if (error) {
        console.error('Erro ao buscar escala do Supabase:', error);
        return {};
      }
      
      // Converter do formato de tabela para o formato de objeto usado na aplicação
      const result: {[day: string]: (string | null)[]} = {};
      
      data.forEach(escala => {
        const diaStr = escala.dia.toString();
        
        if (!result[diaStr]) {
          // PMF tem 3 posições, Escola Segura tem 2
          const tamanhoArray = tipo === 'pmf' ? 3 : 2;
          result[diaStr] = Array(tamanhoArray).fill(null);
        }
        
        result[diaStr][escala.posicao] = escala.militar_id;
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar escala:', error);
      return {};
    }
  }
  
  // Obter toda a escala
  static async getEscala(tipo: 'pmf' | 'escolaSegura'): Promise<EscalaData> {
    try {
      const { data, error } = await supabase
        .from('escalas')
        .select('*')
        .eq('tipo', tipo);
      
      if (error) {
        console.error('Erro ao buscar escala completa do Supabase:', error);
        return {};
      }
      
      // Converter do formato de tabela para o formato de objeto usado na aplicação
      const result: EscalaData = {};
      
      data.forEach(escala => {
        const monthKey = `${escala.ano}-${escala.mes}`;
        const diaStr = escala.dia.toString();
        
        if (!result[monthKey]) {
          result[monthKey] = {};
        }
        
        if (!result[monthKey][diaStr]) {
          // PMF tem 3 posições, Escola Segura tem 2
          const tamanhoArray = tipo === 'pmf' ? 3 : 2;
          result[monthKey][diaStr] = Array(tamanhoArray).fill(null);
        }
        
        result[monthKey][diaStr][escala.posicao] = escala.militar_id;
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar escala completa:', error);
      return {};
    }
  }
  
  // Adicionar ou atualizar um militar em uma escala
  static async atualizarMilitarNaEscala(
    tipo: 'pmf' | 'escolaSegura', 
    ano: number, 
    mes: number, 
    dia: number, 
    posicao: number, 
    militar: string | null
  ): Promise<boolean> {
    try {
      // Primeiro verificamos se o registro já existe
      const { data, error: selectError } = await supabase
        .from('escalas')
        .select('id')
        .eq('tipo', tipo)
        .eq('ano', ano)
        .eq('mes', mes)
        .eq('dia', dia)
        .eq('posicao', posicao)
        .maybeSingle();
      
      if (selectError) {
        console.error('Erro ao verificar escala existente:', selectError);
        return false;
      }
      
      if (data) {
        // Se existe, atualizamos
        const { error: updateError } = await supabase
          .from('escalas')
          .update({ militar_id: militar })
          .eq('id', data.id);
        
        if (updateError) {
          console.error('Erro ao atualizar militar na escala:', updateError);
          return false;
        }
      } else {
        // Se não existe, inserimos
        const { error: insertError } = await supabase
          .from('escalas')
          .insert([{
            tipo,
            ano,
            mes,
            dia,
            posicao,
            militar_id: militar
          }]);
        
        if (insertError) {
          console.error('Erro ao inserir militar na escala:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar militar na escala:', error);
      return false;
    }
  }
} 