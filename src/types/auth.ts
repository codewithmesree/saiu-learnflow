export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'professor' | 'student';
  name: string;
  department: string;
  createdAt: string;
}

export interface AdminUser extends User {
  role: 'admin';
}

export interface ProfessorUser extends User {
  role: 'professor';
  specialization?: string;
}

export interface StudentUser extends User {
  role: 'student';
  studentId: string;
  major?: string;
  year?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'admin' | 'professor' | 'student';
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  department: string;
}

export interface StudentRegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
}

export interface ProfessorRegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  registerStudent: (data: StudentRegistrationData) => Promise<void>;
  registerProfessor: (data: ProfessorRegistrationData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const DEPARTMENTS = [
  'School of Computing and Data Science',
  'School of Arts and Sciences',
  'School of Law',
  'School of Business',
  'School of AI',
  'School of Media',
  'School of Technology'
] as const;

export type Department = typeof DEPARTMENTS[number];
