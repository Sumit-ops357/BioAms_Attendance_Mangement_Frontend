import React, { createContext, useContext, useState } from "react";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  // Simulated auth: In real apps, read login from backend+cookie/storage
  const [admin, setAdmin] = useState({ isAuthenticated: true, role: "admin", name: "Admin User" });

  return (
    <AdminAuthContext.Provider value={{ admin, setAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
