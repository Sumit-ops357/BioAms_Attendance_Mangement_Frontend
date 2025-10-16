import React from "react";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || "{}");
  // You may refine the check based on your user object
  if (!token || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default AdminRoute;
