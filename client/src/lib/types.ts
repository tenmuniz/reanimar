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

export interface MonthData {
  year: number;
  month: number;
  days: number;
  firstDayOfWeek: number;
}
