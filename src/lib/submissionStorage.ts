import { Submission } from '../types/submission';

const SUBMISSIONS_KEY = 'learnflow_submissions';

const readAll = (): Submission[] => {
  const raw = localStorage.getItem(SUBMISSIONS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const writeAll = (items: Submission[]) => {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(items));
};

export const listSubmissionsByAssignment = (assignmentId: string): Submission[] => {
  return readAll().filter(s => s.assignmentId === assignmentId);
};

export const listSubmissionsByStudent = (studentId: string): Submission[] => {
  return readAll().filter(s => s.studentId === studentId);
};

export const createSubmission = (s: Omit<Submission, 'id' | 'submittedAt'>): Submission => {
  const all = readAll();
  const item: Submission = { ...s, id: Date.now().toString(), submittedAt: new Date().toISOString() };
  all.push(item);
  writeAll(all);
  return item;
};

export const updateSubmission = (id: string, updates: Partial<Submission>): Submission => {
  const all = readAll();
  const idx = all.findIndex(x => x.id === id);
  if (idx === -1) throw new Error('Submission not found');
  const updated = { ...all[idx], ...updates } as Submission;
  all[idx] = updated;
  writeAll(all);
  return updated;
};
