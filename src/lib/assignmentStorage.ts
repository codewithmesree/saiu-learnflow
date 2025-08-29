import { Assignment } from '../types/assignment';

const ASSIGNMENTS_KEY = 'learnflow_assignments';

const readAll = (): Assignment[] => {
  const raw = localStorage.getItem(ASSIGNMENTS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const writeAll = (items: Assignment[]) => {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(items));
};

export const listAssignmentsByCourse = (courseId: string): Assignment[] => {
  return readAll().filter(a => a.courseId === courseId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createAssignment = (a: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Assignment => {
  const all = readAll();
  const item: Assignment = { ...a, id: Date.now().toString(), createdAt: new Date().toISOString() };
  all.push(item);
  writeAll(all);
  return item;
};

export const updateAssignment = (id: string, updates: Partial<Assignment>): Assignment => {
  const all = readAll();
  const idx = all.findIndex(x => x.id === id);
  if (idx === -1) throw new Error('Assignment not found');
  const updated: Assignment = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  all[idx] = updated;
  writeAll(all);
  return updated;
};

export const deleteAssignment = (id: string): void => {
  const all = readAll();
  writeAll(all.filter(x => x.id !== id));
};
