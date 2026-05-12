import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = '/api';

const ROLES = [
  'Full Stack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'DevOps Engineer',
  'Product Manager',
  'Data Scientist',
];

export default function Home() {
  const [form, setForm] = useState({ name: '', phone: '', role: ROLES[0] });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    fetchCandidates();
    intervalRef.current = setInterval(fetchCandidates, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data } = await axios.get(`${API}/candidates`);
      setCandidates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerCall = async () => {
    if (!form.name || !form.phone) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await axios.post(`${API}/trigger-call`, form);
      setMessage({ type: 'success', text: `Call initiated for ${form.name}` });
      setForm({ name: '', phone: '', role: ROLES[0] });
      fetchCandidates();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message });
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    await supabaseDirectUpdate(id, newStatus);
    fetchCandidates();
  };

  const exportCSV = () => {
    const rows = [['Name', 'Phone', 'Role', 'Status', 'Score', 'Transcript']];
    candidates.forEach(c => rows.push([c.name, c.phone, c.role, c.status, c.score ?? '', c.transcript ?? '']));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'candidates.csv'; a.click();
  };

  const filtered = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: candidates.length,
    completed: candidates.filter(c => c.status === 'completed').length,
    called: candidates.filter(c => c.status === 'called').length,
    avgScore: candidates.filter(c => c.score).length
      ? Math.round(candidates.filter(c => c.score).reduce((a, b) => a + b.score, 0) / candidates.filter(c => c.score).length)
      : null,
  };

  const scoreColor = (s) => s >= 80 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444';
  const scoreLabel = (s) => s >= 80 ? 'Strong Hire' : s >= 50 ? 'Maybe' : 'No Hire';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080b12;
          --surface: #0e1420;
          --surface2: #131927;
          --border: rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.12);
          --text: #e8eaf0;
          --muted: #5a6378;
          --accent: #3b82f6;
          --accent2: #6366f1;
          --green: #22c55e;
          --amber: #f59e0b;
          --red: #ef4444;
          --font: 'Syne', sans-serif;
          --mono: 'DM Mono', monospace;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Animated background grid */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        .wrap { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }

        /* ── HEADER ── */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 0 40px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 40px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .logo-text { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
        .logo-sub { font-size: 11px; color: var(--muted); font-family: var(--mono); margin-top: 1px; }
        .header-right { display: flex; align-items: center; gap: 16px; }
        .live-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-family: var(--mono);
          color: var(--green);
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.2);
          padding: 5px 10px; border-radius: 20px;
        }
        .live-dot {
          width: 6px; height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .export-btn {
          font-family: var(--font);
          font-size: 12px; font-weight: 600;
          color: var(--muted);
          background: var(--surface);
          border: 1px solid var(--border2);
          padding: 7px 14px; border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .export-btn:hover { color: var(--text); border-color: var(--accent); }

        /* ── STATS ── */
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px 22px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .stat-card:hover { border-color: var(--border2); }
        .stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent);
        }
        .stat-label { font-size: 11px; font-family: var(--mono); color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.8px; }
        .stat-value { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
        .stat-value.accent { color: var(--accent); }
        .stat-value.green { color: var(--green); }
        .stat-value.amber { color: var(--amber); }

        /* ── MAIN GRID ── */
        .main-grid { display: grid; grid-template-columns: 360px 1fr; gap: 20px; align-items: start; }

        /* ── FORM CARD ── */
        .form-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          position: sticky;
          top: 24px;
        }
        .card-title {
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.3px;
          margin-bottom: 6px;
        }
        .card-sub { font-size: 12px; color: var(--muted); font-family: var(--mono); margin-bottom: 24px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 11px; font-family: var(--mono); color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.6px; }
        .field input, .field select {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: 10px;
          color: var(--text);
          font-family: var(--font);
          font-size: 13px;
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
        }
        .field input:focus, .field select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .field input::placeholder { color: var(--muted); }

        .call-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border: none;
          border-radius: 10px;
          color: white;
          font-family: var(--font);
          font-size: 13px;
          font-weight: 700;
          padding: 12px;
          cursor: pointer;
          margin-top: 8px;
          letter-spacing: 0.3px;
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative;
          overflow: hidden;
        }
        .call-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.1);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .call-btn:hover::after { opacity: 1; }
        .call-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .calling-ring {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .msg {
          margin-top: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-family: var(--mono);
        }
        .msg.success { background: rgba(34,197,94,0.1); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }
        .msg.error { background: rgba(239,68,68,0.1); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }

        .divider { border: none; border-top: 1px solid var(--border); margin: 24px 0; }

        .quick-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .qs { background: var(--surface2); border-radius: 10px; padding: 12px; text-align: center; }
        .qs-val { font-size: 20px; font-weight: 800; }
        .qs-label { font-size: 10px; font-family: var(--mono); color: var(--muted); margin-top: 2px; }

        /* ── RESULTS ── */
        .results-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }
        .results-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .results-title { font-size: 14px; font-weight: 700; }
        .results-controls { display: flex; gap: 10px; align-items: center; }
        .search-input {
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: 8px;
          color: var(--text);
          font-family: var(--mono);
          font-size: 12px;
          padding: 7px 12px;
          outline: none;
          width: 180px;
          transition: border-color 0.2s;
        }
        .search-input:focus { border-color: var(--accent); }
        .search-input::placeholder { color: var(--muted); }
        .filter-btns { display: flex; gap: 4px; }
        .filter-btn {
          font-family: var(--mono);
          font-size: 11px;
          padding: 5px 10px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.15s;
        }
        .filter-btn.active { background: var(--accent); color: white; border-color: var(--accent); }

        /* ── CANDIDATE ROWS ── */
        .candidate-list { padding: 8px; }
        .candidate-row {
          display: grid;
          grid-template-columns: 200px 1fr 130px 90px 120px 100px;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
          border: 1px solid transparent;
        }
        .candidate-row:hover { background: var(--surface2); border-color: var(--border); }
        .candidate-row.active { background: var(--surface2); border-color: var(--accent); }
        .col-head {
          font-size: 10px; font-family: var(--mono);
          color: var(--muted); text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 0 16px 8px;
          display: grid;
          grid-template-columns: 200px 1fr 130px 90px 120px 100px;
          gap: 12px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 4px;
        }
        .c-name { font-size: 13px; font-weight: 700; }
        .c-phone { font-size: 11px; font-family: var(--mono); color: var(--muted); margin-top: 2px; }
        .c-role { font-size: 12px; color: var(--muted); font-family: var(--mono); }
        .c-transcript { font-size: 11px; color: var(--muted); font-family: var(--mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-family: var(--mono);
          padding: 3px 10px; border-radius: 20px;
          font-weight: 500;
        }
        .status-badge.called { background: rgba(245,158,11,0.1); color: var(--amber); border: 1px solid rgba(245,158,11,0.2); }
        .status-badge.completed { background: rgba(34,197,94,0.1); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }
        .status-badge.pending { background: rgba(99,102,241,0.1); color: #818cf8; border: 1px solid rgba(99,102,241,0.2); }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .status-badge.called .status-dot { animation: pulse 1.5s infinite; }

        .score-bar-wrap { display: flex; flex-direction: column; gap: 3px; }
        .score-bar-row { display: flex; align-items: center; gap: 8px; }
        .score-num { font-size: 13px; font-weight: 700; font-family: var(--mono); min-width: 32px; }
        .score-bar { flex: 1; height: 4px; background: var(--surface2); border-radius: 2px; overflow: hidden; }
        .score-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
        .score-label-text { font-size: 10px; font-family: var(--mono); color: var(--muted); }

        .action-btns { display: flex; gap: 6px; }
        .action-btn {
          font-family: var(--mono);
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid var(--border2);
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
          font-weight: 500;
        }
        .action-btn.hire { color: var(--green); border-color: rgba(34,197,94,0.3); }
        .action-btn.hire:hover { background: rgba(34,197,94,0.1); }
        .action-btn.reject { color: var(--red); border-color: rgba(239,68,68,0.3); }
        .action-btn.reject:hover { background: rgba(239,68,68,0.1); }

        /* ── DETAIL PANEL ── */
        .detail-panel {
          position: fixed;
          right: 0; top: 0; bottom: 0;
          width: 420px;
          background: var(--surface);
          border-left: 1px solid var(--border2);
          padding: 32px;
          overflow-y: auto;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
          z-index: 100;
        }
        .detail-panel.open { transform: translateX(0); }
        .panel-close {
          position: absolute; top: 20px; right: 20px;
          width: 32px; height: 32px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--muted);
          font-size: 16px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .panel-close:hover { color: var(--text); border-color: var(--border2); }
        .panel-name { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
        .panel-role { font-size: 13px; font-family: var(--mono); color: var(--muted); margin-bottom: 20px; }
        .panel-score-big {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 24px;
          padding: 16px;
          background: var(--surface2);
          border-radius: 12px;
        }
        .panel-score-num { font-size: 40px; font-weight: 800; }
        .panel-transcript {
          background: var(--surface2);
          border-radius: 12px;
          padding: 16px;
          font-family: var(--mono);
          font-size: 12px;
          line-height: 1.7;
          color: var(--muted);
          white-space: pre-wrap;
        }
        .panel-section-title { font-size: 11px; font-family: var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; margin-top: 20px; }

        .empty-state {
          text-align: center; padding: 60px 20px;
        }
        .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.3; }
        .empty-text { font-size: 13px; color: var(--muted); font-family: var(--mono); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }

        @media (max-width: 900px) {
          .main-grid { grid-template-columns: 1fr; }
          .stats { grid-template-columns: repeat(2, 1fr); }
          .col-head, .candidate-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="wrap" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s' }}>
        {/* HEADER */}
        <header className="header">
          <div className="logo">
            <div className="logo-icon">🎯</div>
            <div>
              <div className="logo-text">HireAI</div>
              <div className="logo-sub">powered by bolna voice ai</div>
            </div>
          </div>
          <div className="header-right">
            <div className="live-badge">
              <div className="live-dot" />
              LIVE
            </div>
            <button className="export-btn" onClick={exportCSV}>↓ Export CSV</button>
          </div>
        </header>

        {/* STATS */}
        <div className="stats">
          {[
            { label: 'Total Screened', value: stats.total, cls: 'accent' },
            { label: 'In Progress', value: stats.called, cls: 'amber' },
            { label: 'Completed', value: stats.completed, cls: 'green' },
            { label: 'Avg Score', value: stats.avgScore ? `${stats.avgScore}` : '—', cls: stats.avgScore >= 70 ? 'green' : 'accent' },
          ].map((s, i) => (
            <div key={i} className="stat-card fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value ${s.cls}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="main-grid">
          {/* FORM */}
          <div className="form-card fade-in" style={{ animationDelay: '200ms' }}>
            <div className="card-title">Screen a Candidate</div>
            <div className="card-sub">Initiate an AI voice screening call</div>

            <div className="field">
              <label>Full Name</label>
              <input placeholder="Rahul Sharma" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Phone Number</label>
              <input placeholder="+918767092690" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            <button className="call-btn" onClick={triggerCall} disabled={loading}>
              {loading
                ? <><div className="calling-ring" /> Initiating Call...</>
                : <> 📞 Start Screening Call</>
              }
            </button>

            {message && (
              <div className={`msg ${message.type}`}>{message.text}</div>
            )}

            <hr className="divider" />

            <div className="quick-stats">
              <div className="qs">
                <div className="qs-val" style={{ color: 'var(--green)' }}>{stats.completed}</div>
                <div className="qs-label">Screened</div>
              </div>
              <div className="qs">
                <div className="qs-val" style={{ color: 'var(--amber)' }}>{stats.called}</div>
                <div className="qs-label">In Call</div>
              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div className="results-card fade-in" style={{ animationDelay: '280ms' }}>
            <div className="results-header">
              <div className="results-title">Screening Results</div>
              <div className="results-controls">
                <input className="search-input" placeholder="Search candidates..."
                  value={search} onChange={e => setSearch(e.target.value)} />
                <div className="filter-btns">
                  {['all', 'pending', 'called', 'completed'].map(f => (
                    <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`}
                      onClick={() => setFilter(f)}>{f}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-head">
              <span>Candidate</span>
              <span>Transcript</span>
              <span>Role</span>
              <span>Status</span>
              <span>Score</span>
              <span>Actions</span>
            </div>

            <div className="candidate-list">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎙️</div>
                  <div className="empty-text">No candidates yet. Trigger a screening call to get started.</div>
                </div>
              ) : filtered.map((c, i) => (
                <div key={c.id} className={`candidate-row fade-in ${selected?.id === c.id ? 'active' : ''}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}>

                  <div>
                    <div className="c-name">{c.name}</div>
                    <div className="c-phone">{c.phone}</div>
                  </div>

                  <div className="c-transcript">
                    {c.transcript || 'Waiting for call to complete...'}
                  </div>

                  <div className="c-role">{c.role}</div>

                  <div>
                    <span className={`status-badge ${c.status}`}>
                      <span className="status-dot" />
                      {c.status}
                    </span>
                  </div>

                  <div>
                    {c.score != null ? (
                      <div className="score-bar-wrap">
                        <div className="score-bar-row">
                          <div className="score-num" style={{ color: scoreColor(c.score) }}>{c.score}</div>
                          <div className="score-bar">
                            <div className="score-fill" style={{ width: `${c.score}%`, background: scoreColor(c.score) }} />
                          </div>
                        </div>
                        <div className="score-label-text">{scoreLabel(c.score)}</div>
                      </div>
                    ) : <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>}
                  </div>

                  <div className="action-btns" onClick={e => e.stopPropagation()}>
                    <button className="action-btn hire">✓ Hire</button>
                    <button className="action-btn reject">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL PANEL */}
      <div className={`detail-panel ${selected ? 'open' : ''}`}>
        <button className="panel-close" onClick={() => setSelected(null)}>✕</button>
        {selected && (
          <>
            <div className="panel-name">{selected.name}</div>
            <div className="panel-role">{selected.role} · {selected.phone}</div>

            {selected.score != null && (
              <div className="panel-score-big">
                <div className="panel-score-num" style={{ color: scoreColor(selected.score) }}>
                  {selected.score}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{scoreLabel(selected.score)}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>AI recommendation</div>
                </div>
              </div>
            )}

            <div className="panel-section-title">Status</div>
            <span className={`status-badge ${selected.status}`}>
              <span className="status-dot" />{selected.status}
            </span>

            <div className="panel-section-title">Call Transcript</div>
            <div className="panel-transcript">
              {selected.transcript || 'Transcript will appear here after the call completes.'}
            </div>

            <div className="panel-section-title">Actions</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="action-btn hire" style={{ padding: '8px 16px', fontSize: 12 }}>✓ Move to Interview</button>
              <button className="action-btn reject" style={{ padding: '8px 16px', fontSize: 12 }}>✕ Reject</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}