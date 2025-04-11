export interface Officer {
  id: string;
  name: string;
  rank?: string;
}

export interface OfficersResponse {
  officers: string[];
}

export interface DaySchedule {
  day: number;
  weekday: string;
  officers: (string | null)[];
}

export interface MonthSchedule {
  [key: string]: {
    [day: string]: (string | null)[];
  };
}

export interface OperationType {
  id: string;
  name: string;
  color: string;
  positions: number;
  icon: string;
}

export interface CombinedSchedules {
  pmf: MonthSchedule;
  // Mantemos a propriedade escolaSegura apenas para compatibilidade com o código existente
  escolaSegura: MonthSchedule;
}

export interface MonthData {
  year: number;
  month: number;
  days: number;
  firstDayOfWeek: number;
}
