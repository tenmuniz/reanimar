import React from 'react';
import { motion } from 'framer-motion';
import { Search, Users } from 'lucide-react';
import MilitarSearch from '@/components/search/MilitarSearch';

export default function BuscaMilitar() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center">
              <Search className="mr-3 h-10 w-10 text-blue-500" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Busca de Militar
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg max-w-2xl">
              Verifique quando e onde um militar está escalado em operações especiais
            </p>
          </div>
          
          <div className="flex gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center"
            >
              <Users className="h-5 w-5 mr-2" />
              <span className="font-medium">PMF + Escola Segura</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <MilitarSearch />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-3">
          Como usar a busca de militar
        </h2>
        <ul className="space-y-2 text-slate-700 dark:text-slate-300">
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 h-6 w-6 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 font-bold text-sm">1</span>
            Digite o nome ou parte do nome do militar que deseja buscar
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 h-6 w-6 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 font-bold text-sm">2</span>
            Clique no botão "Buscar" ou pressione Enter
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 h-6 w-6 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 font-bold text-sm">3</span>
            Visualize os resultados, que mostrarão todos os dias em que o militar está escalado em cada operação no mês atual
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 h-6 w-6 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 font-bold text-sm">4</span>
            Use as abas para filtrar por tipo de operação (PMF ou Escola Segura)
          </li>
        </ul>
      </motion.div>
    </div>
  );
}