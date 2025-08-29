export interface Course {
  id: string;
  code: string; // shareable join code
  name: string;
  subject: string;
  professorId: string;
  professorName: string;
  createdAt: string;
  studentIds: string[];
}

export interface CreateCourseInput {
  name: string;
  subject: string;
}

export interface JoinCourseInput {
  code: string;
  studentId: string;
}
