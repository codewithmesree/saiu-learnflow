export interface Submission {
  id: string;
  assignmentId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  fileName: string;
  fileType: string;
  fileDataBase64: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}
