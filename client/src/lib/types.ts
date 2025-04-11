export interface Officer {
  id: string;
  name: string;
}

export interface DaySchedule {
  day: number;
  weekday: string;
  officers: (string | null)[];
}

export interface MonthSchedule {
  [key: string]: (string | null)[];
}

export interface MonthData {
  year: number;
  month: number;
  days: number;
  firstDayOfWeek: number;
}
