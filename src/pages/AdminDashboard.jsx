import React, { useEffect, useState } from "react";

// Util: Get token from localStorage
const getToken = () => localStorage.getItem("token");

export default function AdminDashboard() {
  // State
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [logsDate, setLogsDate] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState({ employees: false, logs: false });
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  // Fetch all employees
  useEffect(() => {
    async function fetchEmployees() {
      setLoading(l => ({ ...l, employees: true }));
      setError("");
      try {
        const res = await fetch("http://localhost:5000/api/employees/", {
          headers: { "Authorization": `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error("Failed to fetch employees.");
        const data = await res.json();
        setEmployees(data);
        setFiltered(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(l => ({ ...l, employees: false }));
    }
    fetchEmployees();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search) setFiltered(employees);
    else setFiltered(employees.filter(e =>
      (e.emp_id||"").toLowerCase().includes(search.toLowerCase()) ||
      (e.name||"").toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, employees]);

  // Delete employee
  async function handleDelete(emp_id) {
    if (!window.confirm("Delete this employee?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${emp_id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error("Delete failed.");
      setEmployees(employees => employees.filter(e => e.emp_id !== emp_id));
      setFiltered(filtered => filtered.filter(e => e.emp_id !== emp_id));
    } catch (err) {
      setError(err.message || "Failed to delete.");
    }
  }

  // Export CSV or PDF for all/selected
  async function handleExport(type) {
    try {
      const url = `http://localhost:5000/api/attendance/my-logs/${type}?emp_id=ALL`; // or handle selected emp
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `exported_file.${type}`;
      a.click();
    } catch (err) {
      setError("Export failed");
    }
  }

  // Get logs by date
  async function fetchLogs() {
    if (!logsDate) return;
    setLoading(l => ({ ...l, logs: true }));
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/logs?date=${logsDate}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const apiData = await res.json();
      setLogs(Array.isArray(apiData.logs) ? apiData.logs : []);
    } catch (err) {
      setError("Failed to fetch logs");
      setLogs([]);
    }
    setLoading(l => ({ ...l, logs: false }));
  }

  // Upload attendance file (CSV/PDF)
  async function handleUploadAttendance(e) {
    e.preventDefault();
    setUploading(true);
    setUploadMsg("");
    const formData = new FormData();
    formData.append("attendance_file", e.target.file.files[0]);
    try {
      const res = await fetch("http://localhost:5000/api/attendance/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` }, // DO NOT set Content-Type manually!
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setUploadMsg("Upload successful!");
    } catch (err) {
      setUploadMsg("Upload failed: " + err.message);
    }
    setUploading(false);
  }

  return (
    <div className="min-vh-100 bg-light d-flex">
      {/* Sidebar */}
      <aside className="bg-white shadow-sm px-3 d-flex flex-column" style={{width:240}}>
        <div className="my-4 text-center">
          <img className="rounded-circle mb-2" src="/avatar.png" alt="Admin" height={60} width={60}/>
          <div className="fw-bold">Admin</div>
          <small className="text-secondary">admin@example.com</small>
        </div>
        <nav className="flex-fill">
          <ul className="nav nav-pills flex-column gap-2">
            <li className="nav-item"><a className="nav-link active" href="/admin">Dashboard</a></li>
            <li className="nav-item"><a className="nav-link" href="/admin">Reports</a></li>
          </ul>
        </nav>
        <button className="btn btn-outline-secondary mb-4">Logout</button>
      </aside>
      {/* Main content */}
      <main className="flex-fill p-4" style={{minHeight:'100vh'}}>
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="fw-bold mb-0">Administrator Dashboard</h2>
          <input type="date" className="form-control" value={logsDate} onChange={e => setLogsDate(e.target.value)} style={{width:170}}/>
        </div>

        {/* Stat cards */}
        <div className="row mt-4 mb-3 g-3">
          <StatCard icon="bi-people" title="Total Employees" value={employees.length}/>
          <StatCard icon="bi-person-check text-success" title="Present Today" value={1100}/>
          <StatCard icon="bi-calendar2-check text-warning" title="On Leave" value={54}/>
          <StatCard icon="bi-alarm text-danger" title="Late Today" value={50}/>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Employees Table Area */}
        <div className="bg-white rounded shadow-sm p-4 mb-4">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
            <div className="input-group" style={{maxWidth:350}}>
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input
                className="form-control"
                type="text"
                placeholder="Search by emp_id or name"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary ms-auto" onClick={() => handleExport("csv")}>
              <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export CSV
            </button>
            <button className="btn btn-outline-secondary ms-2" onClick={() => setShowUpload(true)}>
              <i className="bi bi-upload me-1"></i> Upload Logs
            </button>
            <button className="btn btn-danger ms-2" onClick={() => handleExport("pdf")}>
              <i className="bi bi-file-earmark-pdf me-1"></i> Export PDF
            </button>
          </div>
          {/* Employees Table */}
          <EmployeeTable
            employees={filtered}
            loading={loading.employees}
            onDelete={handleDelete}
          />
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleUploadAttendance}>
                  <div className="modal-header">
                    <h5 className="modal-title">Upload Attendance File</h5>
                    <button type="button" className="btn-close" onClick={() => {setShowUpload(false); setUploadMsg("");}} />
                  </div>
                  <div className="modal-body">
                    <input type="file" className="form-control" name="file" accept=".csv,.xlsx,.xls,.pdf" required />
                    {uploadMsg && <div className={`mt-2 alert ${uploadMsg.includes('successful') ? 'alert-success' : 'alert-danger'}`}>{uploadMsg}</div>}
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => {setShowUpload(false); setUploadMsg("");}}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Log Fetch by Date */}
        <div className="bg-white rounded shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="fw-bold">Daily Attendance Logs</div>
            <button className="btn btn-outline-dark" onClick={fetchLogs} disabled={!logsDate || loading.logs}>
              <i className="bi bi-calendar-event me-1"></i>
              {loading.logs ? "Loading..." : "Get Logs for Selected Date"}
            </button>
          </div>
          <AttendanceLogTable logs={logs} />
        </div>
      </main>
    </div>
  );
}

// Stat Card
function StatCard({ icon, title, value }) {
  return (
    <div className="col-lg-3 col-md-6 col-sm-6 col-12">
      <div className="bg-white rounded shadow-sm py-3 px-2 h-100 text-center">
        <i className={`bi ${icon} fs-2`} />
        <div className="text-secondary small">{title}</div>
        <div className="fw-bold fs-3">{value}</div>
      </div>
    </div>
  );
}

// Employee Table
function EmployeeTable({ employees, loading, onDelete }) {
  const data = Array.isArray(employees) ? employees : [];
  return (
    <div className="table-responsive">
      <table className="table align-middle table-hover mb-0">
        <thead>
          <tr>
            <th>EMPLOYEE NAME</th>
            <th>EMPLOYEE ID</th>
            <th>EMAIL</th>
            <th>ROLE</th>
            <th>CREATED AT</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? (<tr><td colSpan={6} className="text-center py-5">Loading...</td></tr>)
            : data.map(emp => (
              <tr key={emp.emp_id}>
                <td>{emp.name}</td>
                <td>{emp.emp_id}</td>
                <td>{emp.email}</td>
                <td>{emp.role}</td>
                <td>{emp.created_at ? (new Date(emp.created_at)).toLocaleString() : "-"}</td>
                <td>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(emp.emp_id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  let color = "secondary";
  let label = status;
  if (status === "Active") color = "success";
  if (status === "On Leave") color = "warning";
  if (status === "Inactive") color = "secondary";
  if (status === "Late") color = "danger";
  if (status === "Present") color = "success";
  if (status === "Absent") color = "danger";
  return <span className={`badge bg-${color} bg-opacity-25 text-${color}`}>{label}</span>;
}

function AttendanceLogTable({ logs }) {
  const data = Array.isArray(logs) ? logs : [];
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th>EMPLOYEE ID</th>
            <th>DATE</th>
            <th>PUNCH IN</th>
            <th>PUNCH OUT</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0
            ? <tr><td colSpan={5} className="text-center text-muted">No logs to display</td></tr>
            : data.map((log, i) => (
                <tr key={i}>
                  <td>{log.emp_id}</td>
                  <td>{log.date}</td>
                  <td>{log.punch_in_IST || log.punch_in}</td>
                  <td>{log.punch_out_IST || log.punch_out}</td>
                  <td>{<StatusBadge status={(log.status || (log.total_hours > 0 ? "Present" : "Absent"))}/>}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
