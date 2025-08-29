import { ClassSession } from '../types/schedule';

const SCHEDULE_KEY = 'learnflow_schedule';

const readAll = (): ClassSession[] => {
  const raw = localStorage.getItem(SCHEDULE_KEY);
  return raw ? JSON.parse(raw) : [];
};

const writeAll = (items: ClassSession[]) => {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(items));
};

export const listSessionsByProfessor = (professorId: string): ClassSession[] => {
  return readAll().filter(s => s.professorId === professorId);
};

export const listSessionsByCourse = (courseId: string): ClassSession[] => {
  return readAll().filter(s => s.courseId === courseId);
};

export const listSessionsByCourseIds = (courseIds: string[]): ClassSession[] => {
  const set = new Set(courseIds);
  return readAll().filter(s => set.has(s.courseId));
};

export const createSession = (payload: Omit<ClassSession, 'id' | 'createdAt' | 'updatedAt'>): ClassSession => {
  const all = readAll();
  const item: ClassSession = { ...payload, id: Date.now().toString(), createdAt: new Date().toISOString() };
  all.push(item);
  writeAll(all);
  return item;
};

export const updateSession = (id: string, updates: Partial<ClassSession>): ClassSession => {
  const all = readAll();
  const idx = all.findIndex(x => x.id === id);
  if (idx === -1) throw new Error('Session not found');
  const updated = { ...all[idx], ...updates, updatedAt: new Date().toISOString() } as ClassSession;
  all[idx] = updated;
  writeAll(all);
  return updated;
};

export const cancelSession = (id: string): ClassSession => {
  return updateSession(id, { canceled: true });
};

export const deleteSession = (id: string): void => {
  const all = readAll();
  const next = all.filter(s => s.id !== id);
  writeAll(next);
};


