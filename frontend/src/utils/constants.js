export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Mechanical Engineering',
  'Electronics & Communication',
  'Civil Engineering',
];

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const ATTENDANCE_STATUS = ['Present', 'Absent', 'Late', 'Excused'];

export const EXAM_TYPES = [
  'Midterm Exam',
  'Final Exam',
  'Practical Lab',
  'Assignment',
  'Internal Test',
  'Quiz',
];
