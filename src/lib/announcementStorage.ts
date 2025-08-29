import { Announcement, CreateAnnouncementInput, UpdateAnnouncementInput } from '../types/announcement';

const ANNOUNCEMENTS_KEY = 'learnflow_announcements';

const readAll = (): Announcement[] => {
  const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const writeAll = (items: Announcement[]) => {
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(items));
};

export const listAnnouncementsByCourse = (courseId: string): Announcement[] => {
  return readAll().filter(a => a.courseId === courseId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createAnnouncement = (input: CreateAnnouncementInput): Announcement => {
  const all = readAll();
  const item: Announcement = {
    id: Date.now().toString(),
    courseId: input.courseId,
    authorId: input.authorId,
    authorName: input.authorName,
    content: input.content,
    createdAt: new Date().toISOString(),
  };
  all.push(item);
  writeAll(all);
  return item;
};

export const updateAnnouncement = (input: UpdateAnnouncementInput): Announcement => {
  const all = readAll();
  const idx = all.findIndex(a => a.id === input.id);
  if (idx === -1) throw new Error('Announcement not found');
  const updated: Announcement = { ...all[idx], content: input.content, updatedAt: new Date().toISOString() };
  all[idx] = updated;
  writeAll(all);
  return updated;
};

export const deleteAnnouncement = (id: string): void => {
  const all = readAll();
  const filtered = all.filter(a => a.id !== id);
  writeAll(filtered);
};
