import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeLogin() {
  const [form, setForm] = useState({ empId: '', password: '', role: 'employee' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emp_id: form.empId,
          password: form.password,
          role: form.role
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Save token and user info for future authenticated requests
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Optionally set role for later checks
      localStorage.setItem("role", form.role);

      setLoading(false);

      // Redirect based on role
      if (form.role === "admin") {
        navigate("/admin"); // admin dashboard or common dashboard
      } else {
        navigate("/dashboard"); // employee dashboard
      }
    } catch (err) {
      setError("Network error. Try again!");
      setLoading(false);
    }
  }

  function goToRegister() {
    // Only show if admin login is selected
    navigate("/register");
  }

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row bg-white rounded shadow w-75" style={{ minHeight: '560px' }}>
        <div className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center">
          <img src="/login_emp.jpg" alt="" style={{ maxWidth:'98%', height:'550px', objectFit:'cover', borderRadius:'18px' }} />
        </div>
        <div className="col-md-6 px-5 py-5 d-flex flex-column justify-content-center">
          <div className="mb-4 text-center">
            {/* <img src="/company_logo.jpg" alt="Logo" style={{ height: 34, marginBottom: 10 }} /> */}
            <h2 className="fw-bold mb-2">Login</h2>
            <small className="text-muted">Please enter your credentials.</small>
          </div>
          {/* Role Switch */}
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="role">Login as</label>
            <select className="form-select" id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <form onSubmit={handleSubmit} className="w-100 mb-4">
            <div className="mb-3">
              <label className="form-label fw-semibold" htmlFor="empId">Employee ID</label>
              <input
                type="text"
                className="form-control"
                id="empId"
                name="empId"
                value={form.empId}
                onChange={handleChange}
                required
                autoFocus
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
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-2 d-flex justify-content-end">
              <a href="#forgot" className="small text-decoration-none" style={{ color:'#2563eb' }}>Forgot Password?</a>
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 mt-2 fw-bold" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          {/* Register New Employee button (shows only for admin login) */}
          {form.role === "admin" && (
            <div className="d-grid">
              <button
                className="btn btn-outline-success fw-bold"
                onClick={goToRegister}
                type="button"
              >
                Register New Employee
              </button>
            </div>
          )}
          <footer className="text-center text-muted small mt-auto pt-4">
            © 2024 BioAttend. All rights reserved.<br />
            <a href="/" className="text-decoration-underline mx-1">Privacy Policy</a> |
            <a href="/" className="text-decoration-underline mx-1">Terms of Service</a>
          </footer>
        </div>
      </div>
    </div>
  );
}
