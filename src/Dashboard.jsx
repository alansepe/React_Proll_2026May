import { useState } from "react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "▪" },
  { id: "analytics", label: "Analytics", icon: "◈" },
  { id: "deployments", label: "Deployments", icon: "◉" },
  { id: "logs", label: "Logs", icon: "≡" },
  { id: "users", label: "Users", icon: "◎" },
  { id: "settings", label: "Settings", icon: "◇" },
];

const STATS = [
  { label: "ACTIVE NODES", value: "2,847", delta: "+12", up: true },
  { label: "AVG LATENCY", value: "38ms", delta: "-4ms", up: true },
  { label: "ERROR RATE", value: "0.04%", delta: "+0.01%", up: false },
  { label: "THROUGHPUT", value: "1.2M/s", delta: "+340k", up: true },
];

const TABLE_DATA = [
  { id: "SVC-001", service: "auth-gateway", region: "us-east-1", status: "HEALTHY", uptime: "99.98%", requests: "4.2M", latency: "12ms" },
  { id: "SVC-002", service: "data-pipeline", region: "eu-west-2", status: "HEALTHY", uptime: "99.91%", requests: "1.8M", latency: "28ms" },
  { id: "SVC-003", service: "ml-inference", region: "ap-south-1", status: "DEGRADED", uptime: "97.40%", requests: "890K", latency: "142ms" },
  { id: "SVC-004", service: "cdn-edge", region: "us-west-2", status: "HEALTHY", uptime: "100.0%", requests: "18.4M", latency: "4ms" },
  { id: "SVC-005", service: "search-index", region: "eu-central-1", status: "HEALTHY", uptime: "99.72%", requests: "3.1M", latency: "19ms" },
  { id: "SVC-006", service: "notif-broker", region: "us-east-2", status: "DOWN", uptime: "91.20%", requests: "220K", latency: "—" },
  { id: "SVC-007", service: "billing-api", region: "us-east-1", status: "HEALTHY", uptime: "99.99%", requests: "540K", latency: "31ms" },
  { id: "SVC-008", service: "media-proc", region: "ap-northeast-1", status: "DEGRADED", uptime: "96.10%", requests: "310K", latency: "88ms" },
];

const STATUS_STYLES = {
  HEALTHY:  { color: "#4ade80", bg: "rgba(74,222,128,0.08)", dot: "#4ade80" },
  DEGRADED: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", dot: "#f59e0b" },
  DOWN:     { color: "#f87171", bg: "rgba(248,113,113,0.10)", dot: "#f87171" },
};

const COLUMNS = ["ID", "Service", "Region", "Status", "Uptime", "Requests", "Latency"];

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [filter, setFilter] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const filtered = TABLE_DATA.filter(row =>
    Object.values(row).some(v => v.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-root {
          display: flex;
          height: 100vh;
          background: #0a0a0b;
          color: #c8c8d0;
          font-family: 'IBM Plex Mono', monospace;
          overflow: hidden;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: ${sidebarOpen ? "220px" : "56px"};
          min-width: ${sidebarOpen ? "220px" : "56px"};
          background: #0e0e10;
          border-right: 1px solid #1e1e24;
          display: flex;
          flex-direction: column;
          transition: width 0.25s ease, min-width 0.25s ease;
          overflow: hidden;
          z-index: 10;
        }

        .sidebar-header {
          padding: 20px 16px 16px;
          border-bottom: 1px solid #1e1e24;
          display: flex;
          align-items: center;
          gap: 10px;
          white-space: nowrap;
        }

        .logo-mark {
          width: 24px;
          height: 24px;
          min-width: 24px;
          background: #f59e0b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: #0a0a0b;
          font-family: 'Syne', sans-serif;
        }

        .logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: #f0f0f4;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .nav-section {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .nav-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: #44444c;
          padding: 10px 8px 6px;
          white-space: nowrap;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 3px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          border: 1px solid transparent;
        }

        .nav-item:hover {
          background: #1a1a1f;
          color: #e8e8f0;
        }

        .nav-item.active {
          background: rgba(245,158,11,0.08);
          border-color: rgba(245,158,11,0.2);
          color: #f59e0b;
        }

        .nav-icon {
          font-size: 14px;
          min-width: 18px;
          text-align: center;
        }

        .nav-text {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        .sidebar-footer {
          padding: 12px 8px;
          border-top: 1px solid #1e1e24;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          white-space: nowrap;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          min-width: 6px;
          border-radius: 50%;
          background: #4ade80;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .status-text {
          font-size: 10px;
          color: #4ade80;
          letter-spacing: 0.06em;
        }

        /* ── MAIN ── */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 56px;
          border-bottom: 1px solid #1e1e24;
          background: #0e0e10;
          gap: 16px;
          flex-shrink: 0;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .toggle-btn {
          background: none;
          border: 1px solid #2a2a32;
          color: #666;
          width: 32px;
          height: 32px;
          border-radius: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: border-color 0.15s, color 0.15s;
        }

        .toggle-btn:hover { border-color: #f59e0b; color: #f59e0b; }

        .breadcrumb {
          font-size: 11px;
          color: #44444c;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        .breadcrumb span { color: #f59e0b; }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .time-display {
          font-size: 11px;
          color: #44444c;
          letter-spacing: 0.04em;
        }

        .avatar {
          width: 30px;
          height: 30px;
          background: #1e1e28;
          border: 1px solid #2a2a38;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #888;
        }

        /* ── CONTENT ── */
        .content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-heading {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #44444c;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        /* ── STATS ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }

        .stat-card {
          background: #0e0e10;
          border: 1px solid #1e1e24;
          padding: 16px 18px;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 2px;
          height: 100%;
          background: #f59e0b;
        }

        .stat-label {
          font-size: 9px;
          letter-spacing: 0.14em;
          color: #44444c;
          margin-bottom: 8px;
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #f0f0f4;
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-delta {
          font-size: 10px;
          letter-spacing: 0.04em;
        }

        .up { color: #4ade80; }
        .down { color: #f87171; }

        /* ── TABLE ── */
        .table-card {
          background: #0e0e10;
          border: 1px solid #1e1e24;
          overflow: hidden;
        }

        .table-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid #1e1e24;
          gap: 12px;
          flex-wrap: wrap;
        }

        .table-title {
          font-size: 11px;
          font-weight: 600;
          color: #e0e0e8;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .table-count {
          font-size: 10px;
          color: #44444c;
          margin-left: 8px;
        }

        .filter-input {
          background: #0a0a0b;
          border: 1px solid #2a2a32;
          color: #c8c8d0;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          padding: 6px 10px;
          border-radius: 2px;
          outline: none;
          width: 220px;
          transition: border-color 0.15s;
        }

        .filter-input::placeholder { color: #36363e; }
        .filter-input:focus { border-color: #f59e0b; }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead th {
          padding: 10px 16px;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: #44444c;
          text-align: left;
          border-bottom: 1px solid #1e1e24;
          white-space: nowrap;
          cursor: pointer;
          user-select: none;
          transition: color 0.15s;
        }

        thead th:hover { color: #f59e0b; }

        thead th.sorted { color: #f59e0b; }

        .sort-indicator { margin-left: 4px; opacity: 0.6; }

        tbody tr {
          border-bottom: 1px solid #16161a;
          cursor: pointer;
          transition: background 0.1s;
        }

        tbody tr:hover { background: #13131a; }
        tbody tr.selected-row { background: rgba(245,158,11,0.05); }

        tbody td {
          padding: 11px 16px;
          font-size: 11px;
          white-space: nowrap;
        }

        .td-id { color: #44444c; }
        .td-service { color: #e0e0e8; font-weight: 500; }
        .td-region { color: #888; }
        .td-number { color: #a0a0ac; }
        .td-latency { color: #c0c0cc; }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 2px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.08em;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .table-footer {
          padding: 12px 18px;
          border-top: 1px solid #1e1e24;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .footer-info {
          font-size: 10px;
          color: #36363e;
          letter-spacing: 0.04em;
        }

        .refresh-btn {
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.25);
          color: #f59e0b;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          padding: 5px 12px;
          letter-spacing: 0.08em;
          cursor: pointer;
          border-radius: 2px;
          transition: background 0.15s;
        }

        .refresh-btn:hover { background: rgba(245,158,11,0.15); }

        /* ── SCROLLBAR ── */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a32; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #f59e0b; }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .topbar { padding: 0 14px; }
          .content { padding: 14px; }
          .breadcrumb { display: none; }
          .time-display { display: none; }
          .filter-input { width: 140px; }
        }
      `}</style>

      <div className="dash-root">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-mark">OP</div>
            {sidebarOpen && <span className="logo-text">Opsync</span>}
          </div>

          <nav className="nav-section">
            {sidebarOpen && <div className="nav-label">MONITOR</div>}
            {NAV_ITEMS.map(item => (
              <div
                key={item.id}
                className={`nav-item ${activeNav === item.id ? "active" : ""}`}
                onClick={() => setActiveNav(item.id)}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="nav-text">{item.label}</span>}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="status-badge">
              <div className="pulse-dot" />
              {sidebarOpen && <span className="status-text">ALL SYSTEMS GO</span>}
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <button className="toggle-btn" onClick={() => setSidebarOpen(o => !o)}>
                {sidebarOpen ? "◂" : "▸"}
              </button>
              <div className="breadcrumb">
                OPSYNC / <span>{activeNav.toUpperCase()}</span>
              </div>
            </div>
            <div className="topbar-right">
              <span className="time-display">{new Date().toUTCString().slice(0, 25)} UTC</span>
              <div className="avatar">OP</div>
            </div>
          </div>

          {/* Content */}
          <div className="content">
            {/* Stats */}
            <div>
              <div className="section-heading">System Metrics</div>
              <div className="stats-grid">
                {STATS.map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className={`stat-delta ${s.up ? "up" : "down"}`}>
                      {s.up ? "▲" : "▼"} {s.delta}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table */}
            <div>
              <div className="section-heading">Service Registry</div>
              <div className="table-card">
                <div className="table-toolbar">
                  <div>
                    <span className="table-title">Active Services</span>
                    <span className="table-count">{filtered.length} records</span>
                  </div>
                  <input
                    className="filter-input"
                    placeholder="Filter services..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  />
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {COLUMNS.map(col => (
                          <th
                            key={col}
                            className={sortCol === col ? "sorted" : ""}
                            onClick={() => handleSort(col)}
                          >
                            {col.toUpperCase()}
                            {sortCol === col && (
                              <span className="sort-indicator">{sortDir === "asc" ? "↑" : "↓"}</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(row => {
                        const s = STATUS_STYLES[row.status];
                        return (
                          <tr
                            key={row.id}
                            className={selectedRow === row.id ? "selected-row" : ""}
                            onClick={() => setSelectedRow(id => id === row.id ? null : row.id)}
                          >
                            <td className="td-id">{row.id}</td>
                            <td className="td-service">{row.service}</td>
                            <td className="td-region">{row.region}</td>
                            <td>
                              <span
                                className="status-pill"
                                style={{ color: s.color, background: s.bg }}
                              >
                                <span className="status-dot" style={{ background: s.dot }} />
                                {row.status}
                              </span>
                            </td>
                            <td className="td-number">{row.uptime}</td>
                            <td className="td-number">{row.requests}</td>
                            <td className="td-latency">{row.latency}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="table-footer">
                  <span className="footer-info">
                    Last sync: {new Date().toISOString().slice(0, 19)}Z
                  </span>
                  <button className="refresh-btn" onClick={() => setFilter("")}>
                    ↺ REFRESH
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
