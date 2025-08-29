export interface Announcement {
  id: string;
  courseId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAnnouncementInput {
  courseId: string;
  authorId: string;
  authorName: string;
  content: string;
}

export interface UpdateAnnouncementInput {
  id: string;
  content: string;
}
