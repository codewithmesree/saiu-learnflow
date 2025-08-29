import { Course, CreateCourseInput } from '../types/course';
import { User } from '../types/auth';

const COURSES_KEY = 'learnflow_courses';

const readCourses = (): Course[] => {
  const raw = localStorage.getItem(COURSES_KEY);
  return raw ? JSON.parse(raw) : [];
};

const writeCourses = (courses: Course[]) => {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
};

const generateCourseCode = (): string => {
  // 6-character alphanumeric, excluding ambiguous chars
  const chars = 'ABCDEFGHJKMNPQRSTUVWXZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export const createCourse = (professor: User, input: CreateCourseInput): Course => {
  const courses = readCourses();
  let code = generateCourseCode();
  // ensure unique code
  const existingCodes = new Set(courses.map(c => c.code));
  while (existingCodes.has(code)) code = generateCourseCode();

  const course: Course = {
    id: Date.now().toString(),
    code,
    name: input.name,
    subject: input.subject,
    professorId: professor.id,
    professorName: professor.name,
    createdAt: new Date().toISOString(),
    studentIds: [],
  };
  courses.push(course);
  writeCourses(courses);
  return course;
};

export const getCoursesByProfessor = (professorId: string): Course[] => {
  return readCourses().filter(c => c.professorId === professorId);
};

export const getCourseById = (id: string): Course | null => {
  return readCourses().find(c => c.id === id) || null;
};

export const getCourseByCode = (code: string): Course | null => {
  const normalized = code.trim().toUpperCase();
  return readCourses().find(c => c.code.toUpperCase() === normalized) || null;
};

export const joinCourseByCode = (code: string, student: User): Course => {
  const courses = readCourses();
  const normalized = code.trim().toUpperCase();
  const idx = courses.findIndex(c => c.code.toUpperCase() === normalized);
  if (idx === -1) throw new Error('Invalid course code');
  const course = courses[idx];
  if (!course.studentIds.includes(student.id)) {
    course.studentIds.push(student.id);
    courses[idx] = course;
    writeCourses(courses);
  }
  return course;
};

export const listAllCourses = (): Course[] => readCourses();
