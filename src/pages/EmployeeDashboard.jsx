import React, { useEffect, useState } from "react";

// Helpers
const getToken = () => localStorage.getItem("token");
const getEmpId = () => localStorage.getItem("emp_id") 
  || (JSON.parse(localStorage.getItem("user")||"{}").emp_id) 
  || "";

// Main component
export default function EmployeeDashboard() {
  const emp_id = getEmpId();

  // states
  const [summary, setSummary] = useState({ totalDays: 0, totalHours: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", emp_id, role: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [punching, setPunching] = useState(false);

  // Fetch summary and logs on mount
useEffect(() => {
  if (!emp_id) return;
  fetchSummary();
  fetchLogs();
  fetchProfile();
  // eslint-disable-next-line
}, [emp_id]);



  async function fetchSummary() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/my-summary?emp_id=${emp_id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error("Failed to get summary");
      const data = await res.json();
      setSummary({ totalDays: data.totalDays || 0, totalHours: data.totalHours || 0 });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function fetchLogs() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/my-logs?emp_id=${emp_id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (err) {
      setError("Could not load logs");
      setLogs([]);
    }
    setLoading(false);
  }

  // Profile
  async function fetchProfile() {
    setProfileLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${emp_id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error("Load failed");
      const data = await res.json();
      setProfile({
        name: data.name || "",
        email: data.email || "",
        emp_id: data.emp_id || emp_id,
        role: data.role || ""
      });
    } catch {
      setProfile({ ...profile, emp_id });
    }
    setProfileLoading(false);
  }

  async function handleProfileUpdate(e) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${emp_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(profile)
      });
      if (!res.ok) throw new Error("Update error");
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      setProfileMsg("Update failed: " + err.message);
    }
    setProfileLoading(false);
  }

  // Punch in/out
  async function handlePunch(direction) {
    setPunching(true);
    setError("");
    try {
      const endpoint = direction === "in"
        ? "punch-in"
        : "punch-out";
      const res = await fetch(`http://localhost:5000/api/attendance/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ emp_id })
      });
      if (!res.ok) throw new Error("Punch failed");
      await fetchLogs();  // Refresh logs after punch
      await fetchSummary();
    } catch (err) {
      setError(err.message);
    }
    setPunching(false);
  }

  // Export logs
  async function handleExport(type) {
    setExporting(true);
    setError("");
    try {
      const url = `http://localhost:5000/api/attendance/my-logs/${type}?emp_id=${emp_id}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `my_logs.${type}`;
      a.click();
    } catch (err) {
      setError("Export failed");
    }
    setExporting(false);
  }

  // UI
  return (
    <div className="bg-light min-vh-100 py-4 px-2">
      {/* Topbar */}
      <div className="d-flex align-items-center justify-content-between py-2 mb-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <img src="/company_logo.jpg" alt="Company Logo" style={{height:38}}/>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary">Welcome, Employee</span>
          <img src="/avatar.png" alt="avatar" className="rounded-circle border" style={{height:38, width:38}}/>
        </div>
      </div>
      {/* Title/Header row + Punches */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 my-3">
        <h2 className="fw-bold mb-0" style={{ fontFamily: 'inherit' }}>Employee Dashboard</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success fw-bold" onClick={() => handlePunch("in")} disabled={punching}>
            <i className="bi bi-play-fill"></i> Punch In
          </button>
          <button className="btn btn-danger fw-bold" onClick={() => handlePunch("out")} disabled={punching}>
            <i className="bi bi-stop-fill"></i> Punch Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <StatCard title="Total Hours Worked This Month" value={summary.totalHours.toFixed(2)} />
        <StatCard title="Total Days Present" value={summary.totalDays} />
        <StatCard title="Total Leave Taken" value={2} /> {/* Placeholder, update as needed */}
      </div>

      {/* Personal Logs/Card */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="fw-semibold mb-0">Personal Logs</h5>
          <div className="d-flex gap-2">
            <button className="btn btn-light border" onClick={() => handleExport("pdf")} disabled={exporting}>
              <i className="bi bi-file-earmark-pdf"></i> Export PDF
            </button>
            <button className="btn btn-light border" onClick={() => handleExport("csv")} disabled={exporting}>
              <i className="bi bi-file-earmark-spreadsheet"></i> Export CSV
            </button>
            <button className="btn btn-primary" onClick={() => setProfileModal(true)}>
              <i className="bi bi-pencil-square"></i> Update Employee
            </button>
          </div>
        </div>
        <PersonalLogTable logs={logs} loading={loading} />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Update Employee Modal */}
      {profileModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleProfileUpdate}>
                <div className="modal-header">
                  <h5 className="modal-title">Update Employee</h5>
                  <button type="button" className="btn-close" onClick={() => {setProfileModal(false); setProfileMsg("");}} />
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Employee ID</label>
                    <input className="form-control" value={profile.emp_id} disabled />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Name</label>
                    <input className="form-control"
                      value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))}
                      required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Email</label>
                    <input className="form-control"
                      value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))}
                      required type="email" />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Role</label>
                    <input className="form-control"
                      value={profile.role} onChange={e => setProfile(p => ({...p, role: e.target.value}))}
                      required />
                  </div>
                  {profileMsg && <div className={`alert ${profileMsg.includes("success") ? "alert-success":"alert-danger"} mt-2`}>{profileMsg}</div>}
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                    {profileLoading ? "Updating..." : "Update"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => {setProfileModal(false); setProfileMsg("");}}>Close</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Request Leave Drop-down (Placeholder) */}
      <div className="bg-white rounded p-3 border">
        <label className="fw-bold">Request Leave</label>
        <select className="form-select mt-2">
          <option value="">Select Leave Type</option>
          <option value="sick">Sick Leave</option>
          <option value="casual">Casual Leave</option>
        </select>
      </div>
    </div>
  );
}

// Stat Card
function StatCard({ title, value }) {
  return (
    <div className="col-lg-4 col-md-4 col-12 mb-3">
      <div className="bg-white rounded shadow text-center p-3 border">
        <span className="text-secondary fw-medium">{title}</span>
        <div className="fw-bold fs-2 mt-1" style={{color:'#1c4071'}}>{value}</div>
      </div>
    </div>
  );
}

// Personal Logs Table
function PersonalLogTable({ logs, loading }) {
  const data = Array.isArray(logs) ? logs : [];
  return (
    <div className="table-responsive">
      <table className="table table-hover bg-white mb-0">
        <thead>
          <tr>
            <th>DATE</th>
            <th>PUNCH IN TIME</th>
            <th>PUNCH OUT TIME</th>
            <th>TOTAL HOURS</th>
          </tr>
        </thead>
        <tbody>
          {loading ? 
            <tr><td colSpan={4} className="text-center text-muted py-4">Loading...</td></tr> :
          data.length === 0
            ? <tr><td colSpan={4} className="text-center text-muted">No records found.</td></tr>
            : data.map((log, i) => (
                <tr key={i}>
                  <td>{log.date}</td>
                  <td>{log.punch_in || "-"}</td>
                  <td>{log.punch_out || "-"}</td>
                  <td>{log.total_hours ? log.total_hours + "h" : "-"}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
