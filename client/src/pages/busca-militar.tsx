import React from 'react';
import MilitarSearch from "@/components/search/MilitarSearch";

export default function BuscaMilitar() {
  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-500">
          Busca por Militar
        </h1>
        <p className="text-slate-500 mt-2 max-w-3xl">
          Utilize esta ferramenta para encontrar rapidamente em quais dias e operações um militar está escalado. 
          A busca é realizada em ambas as operações (PMF e Escola Segura) simultaneamente.
        </p>
      </header>
      
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-12">
          <MilitarSearch />
        </div>
        
        <div className="md:col-span-12">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">Instruções de Uso</h2>
            <div className="space-y-2 text-slate-600 dark:text-slate-400">
              <p className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-medium px-2 py-0.5 rounded text-sm">1</span>
                Digite o nome (ou parte dele) do militar que deseja buscar
              </p>
              <p className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-medium px-2 py-0.5 rounded text-sm">2</span>
                O sistema irá mostrar todas as ocorrências em que o militar está escalado
              </p>
              <p className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-medium px-2 py-0.5 rounded text-sm">3</span>
                Use as abas para filtrar por tipo de operação (PMF ou Escola Segura)
              </p>
              <p className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-medium px-2 py-0.5 rounded text-sm">4</span>
                Os resultados são coloridos por tipo de operação: azul para PMF e roxo para Escola Segura
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}