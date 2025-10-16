import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import RegisterEmployee from "./pages/RegisterEmployee";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute"; // as above

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmployeeLogin />} />
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/register" element={<RegisterEmployee />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }/>
      </Routes>
    </BrowserRouter>
  );
}
