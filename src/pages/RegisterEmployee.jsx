import React, { useState } from "react";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { Navigate } from "react-router-dom";

export default function RegisterEmployee() {
  const { admin } = useAdminAuth();

  const [form, setForm] = useState({
    emp_id: "",
    name: "",
    email: "",
    password: "",
    role: ""
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!admin?.isAuthenticated || admin.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess(false);
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Registration failed.");
        setSuccess(false);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setForm({ emp_id: "", name: "", email: "", password: "", role: "" });
      setLoading(false);
    } catch (err) {
      setError("Network error. Please try again.");
      setSuccess(false);
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 550 }}>
      <div className="bg-white rounded shadow p-4">
        <h2 className="fw-bold text-center mb-4">Register New Employee</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="emp_id">Employee ID</label>
            <input
              type="text"
              className="form-control"
              id="emp_id"
              name="emp_id"
              value={form.emp_id}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="name">Full Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold" htmlFor="role">Role</label>
            <select
              className="form-select"
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="">Select a Role</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="ML Engineer">ML Engineer</option>
              <option value="Cloud Engineer">Cloud Engineer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {success && (<div className="alert alert-success">Employee registered successfully!</div>)}
          {error && (<div className="alert alert-danger">{error}</div>)}
          <div className="d-grid">
            <button type="submit" className="btn btn-primary btn-lg fw-bold mt-1" disabled={loading}>
              {loading ? "Registering..." : "Register Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
