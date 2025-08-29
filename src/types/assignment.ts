export interface Assignment {
  id: string;
  courseId: string;
  authorId: string;
  authorName: string;
  message: string;
  fileName: string;
  fileType: string;
  fileDataBase64: string; // data URL or base64 content for demo persistence
  createdAt: string;
  updatedAt?: string;
  dueAt: string; // ISO datetime string
}
