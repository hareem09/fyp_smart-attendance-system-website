import React from 'react'
import { Navigate } from 'react-router-dom';

function ProtectedRoutes({ children, role }) {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;

  return children;
}
export default ProtectedRoutes