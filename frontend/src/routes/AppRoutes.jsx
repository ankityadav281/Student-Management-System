import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

// Public & Auth Pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentManagement from '../pages/admin/StudentManagement';
import DepartmentManagement from '../pages/admin/DepartmentManagement';
import CourseManagement from '../pages/admin/CourseManagement';
import FeeManagement from '../pages/admin/FeeManagement';

// Faculty / Teacher Pages
import AttendanceManagement from '../pages/teacher/AttendanceManagement';
import GradeManagement from '../pages/teacher/GradeManagement';

// Student Portal Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentReportCard from '../pages/student/StudentReportCard';
import StudentFees from '../pages/student/StudentFees';

// Helper component for dynamic role-based dashboard redirection
const RoleBasedDashboard = () => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  if (isStudent) return <StudentDashboard />;
  if (isTeacher) return <AttendanceManagement />;
  return <AdminDashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dynamic Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          }
        />

        {/* Management Routes */}
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <StudentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DepartmentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CourseManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <AttendanceManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <GradeManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fees"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <FeeManagement />
            </ProtectedRoute>
          }
        />

        {/* Student-specific Portal Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin', 'teacher']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/report-card"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin', 'teacher']}>
              <StudentReportCard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fees"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentFees />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 / Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
