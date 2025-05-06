import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MonthData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMonthData(year: number, month: number): MonthData {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  return {
    year,
    month,
    days: lastDay.getDate(),
    firstDayOfWeek: firstDay.getDay()
  };
}

export function formatMonthYear(date: Date): string {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

export function getWeekdayName(day: number, month: number, year: number): string {
  const date = new Date(year, month, day);
  const weekdayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return weekdayNames[date.getDay()];
}

export function getWeekdayClass(weekday: string): { border: string; background: string; badge: string } {
  if (weekday === "Sáb" || weekday === "Dom") {
    return {
      border: "border-l-amber-500 border-l-4",
      background: "bg-gradient-to-r from-amber-500/80 to-orange-600/60",
      badge: "bg-amber-600/20 text-white border-amber-300/20"
    };
  }
  return {
    border: "border-l-blue-500 border-l-4",
    background: "bg-gradient-to-r from-blue-600/80 to-indigo-700/70",
    badge: "bg-blue-600/20 text-white border-blue-300/20"
  };
}

export function getLocalStorageSchedule(key: string): Record<string, Record<string, (string | null)[]>> {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : {};
}

export function saveLocalStorageSchedule(key: string, data: Record<string, Record<string, (string | null)[]>>): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Função para obter a lista de militares do localStorage
export function getLocalStorageMilitares(): string[] {
  // Importar a classe MilitarStorage diretamente para evitar dependência circular
  const { MilitarStorage } = require('./storage');
  return MilitarStorage.getActiveMilitarNames();
}

/**
 * Formata uma data no padrão brasileiro DD/MM/YYYY
 * @param date Data a ser formatada
 * @returns String da data no formato DD/MM/YYYY
 */
export function formatDateBR(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  // JavaScript conta meses de 0-11, então precisamos adicionar 1 para exibição correta no formato DD/MM/YYYY
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
