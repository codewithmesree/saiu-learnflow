export interface ClassSession {
  id: string;
  courseId: string;
  courseName: string;
  professorId: string;
  subject: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:MM in 24h
  endTime: string; // HH:MM in 24h
  notes?: string;
  canceled?: boolean;
  createdAt: string;
  updatedAt?: string;
}


