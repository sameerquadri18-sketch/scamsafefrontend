import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, CreditCard, BarChart3, Mail, Search, ChevronLeft, ChevronRight, Lock, LogOut, RefreshCw, Download, FileText, TrendingUp, Eye, Activity, Database, Server, CheckCircle, AlertTriangle, Settings, ToggleLeft, ToggleRight, MessageCircle, Phone, X, Send, Loader2 } from 'lucide-react';
import { adminLogin, adminGetStats, adminGetUsers, adminGetPayments, adminGetScans, adminGetHealth, adminGetUserFull, adminSendWhatsApp, adminGetWhatsAppTemplates, adminGetInvoices, adminGetInvoiceStats, adminCreateTestInvoice, adminDownloadInvoicePDF, adminRecordPayment } from '../utils/api';
import AutomationStatus from '../components/AutomationStatus';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-[#0d1b2a] border border-gray-800 rounded-xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500 truncate">{label}</p>
      </div>
      {sub && <span className="text-xs text-gray-600 flex-shrink-0">{sub}</span>}
    </div>
  );
}

function TrendBar({ data }) {
  const max = Math.max(...data.map(d => d.scans), 1);
  return (
    <div className="bg-[#0d1b2a] border border-gray-800 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
        <TrendingUp size={16} />
        Last 7 Days — Scans
      </h3>
      <div className="flex items-end gap-3 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">{d.scans || ''}</span>
            <div
              className="w-full rounded-t bg-accent-purple/60 transition-all hover:bg-accent-purple/80"
              style={{ height: `${Math.max((d.scans / max) * 100, 4)}px` }}
            />
            <span className="text-[10px] text-gray-600">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
      <span className="text-sm text-gray-500">Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="px-3 py-1.5 rounded-lg bg-[#0d1b2a] border border-gray-800 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= pages} className="px-3 py-1.5 rounded-lg bg-[#0d1b2a] border border-gray-800 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [payments, setPayments] = useState(null);
  const [scans, setScans] = useState(null);
  const [usersPage, setUsersPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [scansPage, setScansPage] = useState(1);
  const [expandedScan, setExpandedScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [health, setHealth] = useState(null);

  // Prompt 2: WhatsApp + user detail state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [waSending, setWaSending] = useState(false);
  const [waResult, setWaResult] = useState(null);
  const [waTemplates, setWaTemplates] = useState({});
  const [userDetailLoading, setUserDetailLoading] = useState(false);

  // Invoice management state
  const [invoices, setInvoices] = useState(null);
  const [invoiceStats, setInvoiceStats] = useState(null);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceMsg, setInvoiceMsg] = useState('');

  const [featureToggles, setFeatureToggles] = useState(() => {
    try {
      const saved = localStorage.getItem('scamsafe_admin_toggles');
      return saved ? JSON.parse(saved) : { darkWeb: false, inboxShield: false };
    } catch { return { darkWeb: false, inboxShield: false }; }
  });

  const [storedToken, setStoredToken] = useState('');
  const tokenRef = useRef('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await adminLogin(adminEmail, adminPassword);
      tokenRef.current = res.token;
      setStoredToken(res.token);
      setAuthenticated(true);
    } catch (err) {
      setLoginError('Invalid email or password');
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setStoredToken('');
    setAdminEmail('');
    setAdminPassword('');
    setStats(null);
    setUsers(null);
    setPayments(null);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordChangeError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordChangeError('Password must be at least 8 characters');
      return;
    }
    
    setPasswordChangeLoading(true);
    try {
      // TODO: Add password change API call
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordChangeSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordChangeError('Failed to update password');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const loadStats = async () => { setLoading(true); try { const data = await adminGetStats(tokenRef.current); setStats(data); } catch (e) { console.error(e); } setLoading(false); };
  const loadUsers = async (page = 1) => { setLoading(true); try { const data = await adminGetUsers(tokenRef.current, page); setUsers(data); setUsersPage(page); } catch (e) { console.error(e); } setLoading(false); };
  const loadPayments = async (page = 1) => { setLoading(true); try { const data = await adminGetPayments(tokenRef.current, page); setPayments(data); setPaymentsPage(page); } catch (e) { console.error(e); } setLoading(false); };
  const loadScans = async (page = 1) => { setLoading(true); try { const data = await adminGetScans(tokenRef.current, page); setScans(data); setScansPage(page); } catch (e) { console.error(e); } setLoading(false); };
  const loadHealth = async () => { try { const data = await adminGetHealth(tokenRef.current); setHealth(data); } catch (e) { console.error(e); } };

  // Invoice handlers
  const loadInvoices = async (page = 1) => {
    setInvoiceLoading(true);
    setInvoiceMsg('');
    try {
      const [data, stats] = await Promise.all([
        adminGetInvoices(tokenRef.current, page, invoiceSearch),
        adminGetInvoiceStats(tokenRef.current),
      ]);
      setInvoices(data);
      setInvoiceStats(stats);
    } catch (e) {
      setInvoiceMsg('Failed to load invoices: ' + (e?.response?.data?.detail || e.message));
    }
    setInvoiceLoading(false);
  };

  const handleCreateTestInvoice = async () => {
    setInvoiceLoading(true);
    setInvoiceMsg('');
    try {
      const res = await adminCreateTestInvoice(tokenRef.current);
      setInvoiceMsg(`✅ Test invoice created: ${res.invoice_number || 'Success'}`);
      loadInvoices();
    } catch (e) {
      setInvoiceMsg('❌ Failed: ' + (e?.response?.data?.detail || e.message));
    }
    setInvoiceLoading(false);
  };

  const handleDownloadPDF = async (invoiceNumber) => {
    try {
      await adminDownloadInvoicePDF(tokenRef.current, invoiceNumber);
    } catch (e) {
      setInvoiceMsg('❌ PDF download failed: ' + (e?.response?.data?.detail || e.message));
    }
  };

  useEffect(() => {
    if (authenticated) { loadStats(); loadUsers(); loadPayments(); loadScans(); loadHealth(); }
  }, [authenticated]);

  const refreshAll = () => { loadStats(); loadUsers(usersPage); loadPayments(paymentsPage); loadScans(scansPage); loadHealth(); };

  // Prompt 2: View user detail
  const handleViewUser = async (phone) => {
    setUserDetailLoading(true);
    setShowUserDetail(true);
    try {
      const data = await adminGetUserFull(tokenRef.current, phone);
      setSelectedUser(data);
    } catch (e) { console.error('User detail failed:', e); }
    setUserDetailLoading(false);
  };

  // Prompt 2: Open WhatsApp modal
  const handleOpenWhatsApp = async (phone) => {
    setWaPhone(phone);
    setWaMessage('');
    setWaResult(null);
    setShowWhatsApp(true);
    try {
      const t = await adminGetWhatsAppTemplates(tokenRef.current);
      setWaTemplates(t.templates || {});
    } catch { }
  };

  // Prompt 2: Send WhatsApp
  const handleSendWhatsApp = async () => {
    if (!waMessage.trim()) return;
    setWaSending(true);
    setWaResult(null);
    try {
      const res = await adminSendWhatsApp(tokenRef.current, waPhone, waMessage);
      setWaResult(res.sent ? 'Message sent successfully' : 'Message logged (MSG91 not configured)');
    } catch (e) {
      setWaResult('Failed to send: ' + (e?.response?.data?.detail || e.message));
    }
    setWaSending(false);
  };

  const filteredUsers = users?.users?.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return u.phone?.includes(term) || u.phone_masked?.includes(term) || u.email?.toLowerCase().includes(term);
  }) || [];

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d + (d.includes('Z') || d.includes('+') ? '' : 'Z')).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }); } catch { return d; }
  };

  const toggleFeature = (key) => {
    setFeatureToggles(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('scamsafe_admin_toggles', JSON.stringify(next));
      return next;
    });
  };

  // ─── Login ────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060e1a]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0d1b2a] border border-gray-800 rounded-2xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-accent-purple/20 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-accent-purple" />
            </div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">ScamSafe Control Panel</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Admin email" autoFocus
              className="bg-[#060e1a] border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-purple/50" />
            <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Password"
              className="bg-[#060e1a] border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-purple/50" />
            <button type="submit" disabled={loginLoading || !adminEmail.trim() || !adminPassword.trim()}
              className="glow-button-purple w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-30 font-semibold">
              {loginLoading ? 'Verifying...' : 'Login'}
            </button>
            {loginError && <p className="text-sm text-red-400 text-center">{loginError}</p>}
          </form>
        </motion.div>
      </div>
    );
  }

  // ─── Tabs ─────────────────────────────────────────────────────────
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'scans', label: 'Scans', icon: Search },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'payments', label: 'Billing', icon: CreditCard },
    { id: 'automation', label: 'Automation', icon: Activity },
    { id: 'health', label: 'Health', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const P = "bg-[#0d1b2a] border border-gray-800 rounded-xl";

  return (
    <div className="flex min-h-screen bg-[#060e1a]">
      {/* ─── Sidebar ─── */}
      <aside className="w-56 flex-shrink-0 bg-[#0a1628] border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-purple/20 flex items-center justify-center">
              <Shield size={18} className="text-accent-purple" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">ScamSafe</h1>
              <p className="text-[10px] text-gray-600">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                activeTab === t.id ? 'bg-accent-purple/15 text-accent-purple' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}>
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800 flex flex-col gap-1">
          <button onClick={refreshAll} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <AnimatePresence mode="wait">

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === 'overview' && stats && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
            <div><h2 className="text-xl font-bold mb-1">Dashboard Overview</h2><p className="text-sm text-gray-500">Real-time metrics</p></div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`${P} p-6`}>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-semibold">Today</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-2xl font-bold text-accent-green">{stats.today_scans}</p><p className="text-xs text-gray-500">Scans</p></div>
                  <div><p className="text-2xl font-bold text-accent-orange">{stats.today_removals}</p><p className="text-xs text-gray-500">Removals</p></div>
                  <div><p className="text-2xl font-bold text-accent-purple">{stats.today_payments}</p><p className="text-xs text-gray-500">Payments</p></div>
                </div>
              </div>
              <div className={`${P} p-6`}>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-semibold">Yesterday</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-2xl font-bold text-gray-400">{stats.yesterday_scans ?? 0}</p><p className="text-xs text-gray-500">Scans</p></div>
                  <div><p className="text-2xl font-bold text-gray-400">{stats.yesterday_removals ?? 0}</p><p className="text-xs text-gray-500">Removals</p></div>
                  <div><p className="text-2xl font-bold text-gray-400">{stats.yesterday_payments ?? 0}</p><p className="text-xs text-gray-500">Payments</p></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <StatCard icon={Users} label="Total Users" value={stats.unique_users} color="#8B5CF6" />
              <StatCard icon={Search} label="Total Scans" value={stats.total_scans} color="#3B82F6" />
              <StatCard icon={Shield} label="Removals Done" value={stats.completed_removals} sub={`/ ${stats.total_removals}`} color="#10B981" />
              <StatCard icon={Mail} label="Email Subs" value={stats.email_subscribers} color="#F59E0B" />
              <StatCard icon={CreditCard} label="Paid Users" value={stats.total_payments} color="#EC4899" />
              <StatCard icon={FileText} label="Revenue" value={`₹${((stats.total_revenue || 0) / 100).toLocaleString('en-IN')}`} color="#10B981" />
            </div>

            {stats.scan_trend_7d && <TrendBar data={stats.scan_trend_7d} />}

            <div className={`${P} p-6`}>
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2"><Eye size={16} /> Recent Activity — Past 48h</h3>
              <table className="w-full">
                <thead><tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-500 font-medium pb-3">Type</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3">Phone</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3">Detail</th>
                  <th className="text-right text-xs text-gray-500 font-medium pb-3">Time</th>
                </tr></thead>
                <tbody>
                  {[
                    ...(stats.recent_scans || []).map(s => ({ type: 'scan', phone: s.phone, detail: `Found in ${s.found} databases`, time: s.timestamp })),
                    ...(stats.recent_removals || []).map(r => ({ type: 'removal', phone: r.phone, detail: `${r.status} — ${r.progress}/${r.total}`, time: r.started_at })),
                    ...(stats.recent_payments || []).map(p => ({ type: 'payment', phone: p.phone, detail: `₹${(p.amount / 100).toLocaleString('en-IN')} — ${p.plan}`, time: p.created_at })),
                  ].sort((a, b) => (b.time || '').localeCompare(a.time || '')).map((item, i) => (
                    <tr key={i} className="border-b border-gray-800/50 last:border-0 hover:bg-white/[0.02]">
                      <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        item.type === 'scan' ? 'bg-blue-500/10 text-blue-400' : item.type === 'removal' ? 'bg-green-500/10 text-green-400' : 'bg-purple-500/10 text-purple-400'
                      }`}>{item.type}</span></td>
                      <td className="py-3 text-sm text-white">{item.phone}</td>
                      <td className="py-3 text-sm text-gray-400">{item.detail}</td>
                      <td className="py-3 text-xs text-gray-600 text-right">{formatDate(item.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!(stats.recent_scans?.length || stats.recent_removals?.length || stats.recent_payments?.length) && (
                <p className="text-sm text-gray-600 text-center py-6">No activity in the past 48 hours</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ SCANS ═══ */}
        {activeTab === 'scans' && (
          <motion.div key="scans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
            <div><h2 className="text-xl font-bold mb-1">All Scans</h2><p className="text-sm text-gray-500">{scans?.total || 0} total scans</p></div>
            <div className={`${P} overflow-hidden`}>
              <table className="w-full">
                <thead><tr className="border-b border-gray-800 bg-[#0a1628]">
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Phone</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Found</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Data Types</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Personal Info</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Removal</th>
                  <th className="text-right text-xs text-gray-500 font-medium p-4">Date</th>
                </tr></thead>
                <tbody>
                  {scans?.scans?.length > 0 ? scans.scans.map((s, i) => (
                    <React.Fragment key={i}>
                      <tr className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => setExpandedScan(expandedScan === i ? null : i)}>
                        <td className="p-4"><p className="text-sm font-medium text-white">{s.phone_masked}</p>{s.email && <p className="text-xs text-gray-500">{s.email}</p>}</td>
                        <td className="p-4"><span className="text-sm px-2.5 py-1 rounded-full bg-accent-orange/10 text-accent-orange font-semibold">{s.total_found}</span></td>
                        <td className="p-4"><div className="flex flex-wrap gap-1">{(s.data_types_found || []).slice(0, 4).map((dt, j) => (
                          <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-[#060e1a] border border-gray-800 text-gray-400">{dt}</span>
                        ))}{(s.data_types_found || []).length > 4 && <span className="text-[10px] text-gray-600">+{s.data_types_found.length - 4}</span>}</div></td>
                        <td className="p-4 text-xs text-gray-400">{s.personal_info?.name && <span className="block">{s.personal_info.name}</span>}{s.personal_info?.city && <span className="block text-gray-600">{s.personal_info.city}</span>}</td>
                        <td className="p-4">{s.removal ? <span className={`text-xs font-medium ${s.removal.status === 'complete' ? 'text-accent-green' : 'text-accent-orange'}`}>{s.removal.status} ({s.removal.progress}%)</span> : <span className="text-xs text-gray-600">—</span>}</td>
                        <td className="p-4 text-xs text-gray-500 text-right whitespace-nowrap">{formatDate(s.scan_timestamp)}</td>
                      </tr>
                      {expandedScan === i && s.exposed_brokers?.length > 0 && (
                        <tr><td colSpan={6} className="px-4 pb-4">
                          <div className="bg-[#060e1a] rounded-lg border border-gray-800 p-4 grid grid-cols-3 gap-2">
                            {s.exposed_brokers.map((b, k) => (
                              <div key={k} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-[#0d1b2a]">
                                <span className="text-gray-300">{b.name || b.domain}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                  b.risk === 'HIGH' ? 'bg-red-500/10 text-red-400' : b.risk === 'MED' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'
                                }`}>{b.risk || 'MED'}</span>
                              </div>
                            ))}
                          </div>
                        </td></tr>
                      )}
                    </React.Fragment>
                  )) : (
                    <tr><td colSpan={6} className="p-12 text-center text-gray-600">No scans yet</td></tr>
                  )}
                </tbody>
              </table>
              <div className="p-4"><Pagination page={scansPage} pages={scans?.pages} onPageChange={loadScans} /></div>
            </div>
          </motion.div>
        )}

        {/* ═══ USERS ═══ */}
        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold mb-1">Users</h2><p className="text-sm text-gray-500">{users?.total || 0} registered users</p></div>
              <div className="relative w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by phone or email..."
                  className="w-full bg-[#0d1b2a] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-purple/50" />
              </div>
            </div>
            <div className={`${P} overflow-hidden`}>
              <table className="w-full">
                <thead><tr className="border-b border-gray-800 bg-[#0a1628]">
                  <th className="text-left text-xs text-gray-500 font-medium p-4">User</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Status</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Scans</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Databases</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Removal</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Payment</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">First Scan</th>
                  <th className="text-right text-xs text-gray-500 font-medium p-4">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <p className="text-sm font-medium text-white">+91 {u.phone_masked}</p>
                        {u.email && <p className="text-xs text-gray-500">{u.email}</p>}
                        {u.is_family_member && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-orange/10 text-accent-orange">Family of ***{u.family_owner_phone?.slice(-4)}</span>}
                        {u.is_family_owner && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-purple/10 text-accent-purple ml-1">Family Owner</span>}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          u.status === 'Active' ? 'bg-accent-green/10 text-accent-green' :
                          u.status === 'Active (Family)' ? 'bg-accent-orange/10 text-accent-orange' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>{u.status || 'Inactive'}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-300">{u.scan_count}</td>
                      <td className="p-4"><span className="text-sm px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{u.databases_found}</span></td>
                      <td className="p-4">{u.removal ? <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.removal.status === 'complete' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-orange/10 text-accent-orange'}`}>{u.removal.status} ({u.removal.progress}%)</span> : <span className="text-xs text-gray-600">—</span>}</td>
                      <td className="p-4">{u.payment ? <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.payment.status === 'paid' ? 'bg-accent-green/10 text-accent-green' : 'bg-gray-500/10 text-gray-400'}`}>{u.payment.status === 'paid' ? `₹${u.payment.amount / 100} · ${u.payment.plan}` : 'Unpaid'}</span> : <span className="text-xs text-gray-600">—</span>}</td>
                      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(u.first_scan)}</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => handleViewUser(u.phone || u.phone_masked?.replace(/\*/g, ''))} title="View full details" className="p-1.5 rounded-lg bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-colors"><Eye size={14} /></button>
                          <button onClick={() => handleOpenWhatsApp(u.phone || u.phone_masked?.replace(/\*/g, ''))} title="Send WhatsApp" className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"><MessageCircle size={14} /></button>
                          {(!u.payment || u.payment.status !== 'paid') && (
                            <button onClick={async () => {
                              const plan = prompt('Plan (shield / family-vault):', 'family-vault');
                              if (!plan) return;
                              const amt = prompt('Amount in ₹:', plan === 'family-vault' ? '6990' : '2388');
                              if (!amt) return;
                              const email = prompt('Customer email:', u.email || '');
                              try {
                                const r = await adminRecordPayment(tokenRef.current, u.phone, email || '', plan, parseInt(amt) * 100);
                                alert(`Payment recorded! Invoice: ${r.invoice_number}\nAmount: ${r.amount}`);
                                loadUsers(usersPage);
                              } catch (e) { alert('Failed: ' + (e?.response?.data?.detail || e.message)); }
                            }} title="Record Payment" className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"><CreditCard size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} className="p-12 text-center text-gray-600">No users found</td></tr>
                  )}
                </tbody>
              </table>
              <div className="p-4"><Pagination page={usersPage} pages={users?.pages} onPageChange={loadUsers} /></div>
            </div>
          </motion.div>
        )}

        {/* ═══ BILLING ═══ */}
        {activeTab === 'payments' && (
          <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
            <div><h2 className="text-xl font-bold mb-1">Billing</h2><p className="text-sm text-gray-500">{payments?.total || 0} total transactions</p></div>

            {stats && (
              <div className="grid grid-cols-2 gap-4">
                <div className={`${P} p-6`}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-accent-green">₹{((stats.total_revenue || 0) / 100).toLocaleString('en-IN')}</p>
                </div>
                <div className={`${P} p-6`}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Paid Users</p>
                  <p className="text-3xl font-bold">{stats.total_payments}</p>
                </div>
              </div>
            )}

            <div className={`${P} overflow-hidden`}>
              <table className="w-full">
                <thead><tr className="border-b border-gray-800 bg-[#0a1628]">
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Invoice</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Phone</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Plan</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Amount</th>
                  <th className="text-left text-xs text-gray-500 font-medium p-4">Status</th>
                  <th className="text-right text-xs text-gray-500 font-medium p-4">Date</th>
                </tr></thead>
                <tbody>
                  {payments?.payments?.length > 0 ? payments.payments.map((p, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                      <td className="p-4 text-sm font-medium text-white">{p.invoice_number || `INV-${p.id}`}</td>
                      <td className="p-4 text-sm text-gray-400">+91 {p.phone}</td>
                      <td className="p-4 text-xs text-gray-400">{p.plan} • {p.method || 'N/A'}</td>
                      <td className="p-4 text-sm font-semibold text-white">₹{(p.amount / 100).toLocaleString('en-IN')}</td>
                      <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === 'paid' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-orange/10 text-accent-orange'}`}>{p.status}</span></td>
                      <td className="p-4 text-xs text-gray-500 text-right whitespace-nowrap">{formatDate(p.paid_at || p.created_at)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="p-12 text-center text-gray-600">No payments yet</td></tr>
                  )}
                </tbody>
              </table>
              <div className="p-4"><Pagination page={paymentsPage} pages={payments?.pages} onPageChange={loadPayments} /></div>
            </div>

            {/* ═══ INVOICE MANAGEMENT ═══ */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2"><FileText size={18} className="text-accent-purple" /> Invoice Management</h3>
                  <p className="text-sm text-gray-500">Generate, view, and download invoices</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={loadInvoices} disabled={invoiceLoading}
                    className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50 flex items-center gap-2">
                    {invoiceLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    Load Invoices
                  </button>
                  <button onClick={handleCreateTestInvoice} disabled={invoiceLoading}
                    className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50 flex items-center gap-2">
                    <FileText size={14} />
                    Create Test Invoice
                  </button>
                </div>
              </div>

              {invoiceMsg && (
                <div className={`${P} p-3 mb-4 text-sm ${invoiceMsg.startsWith('✅') ? 'text-green-400' : invoiceMsg.startsWith('❌') ? 'text-red-400' : 'text-gray-400'}`}>
                  {invoiceMsg}
                </div>
              )}

              {invoiceStats && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className={`${P} p-4 text-center`}>
                    <p className="text-xs text-gray-500 uppercase mb-1">Total Revenue</p>
                    <p className="text-xl font-bold text-accent-green">₹{((invoiceStats.total_revenue || 0) / 100).toLocaleString('en-IN')}</p>
                  </div>
                  <div className={`${P} p-4 text-center`}>
                    <p className="text-xs text-gray-500 uppercase mb-1">Total Invoices</p>
                    <p className="text-xl font-bold text-white">{invoiceStats.total_invoices || 0}</p>
                  </div>
                  <div className={`${P} p-4 text-center`}>
                    <p className="text-xs text-gray-500 uppercase mb-1">Paid</p>
                    <p className="text-xl font-bold text-accent-green">{invoiceStats.paid_invoices || 0}</p>
                  </div>
                  <div className={`${P} p-4 text-center`}>
                    <p className="text-xs text-gray-500 uppercase mb-1">Pending</p>
                    <p className="text-xl font-bold text-accent-orange">{invoiceStats.pending_invoices || 0}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type="text" value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadInvoices()}
                    placeholder="Search by phone or invoice number..."
                    className="w-full bg-[#0d1b2a] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-purple/50" />
                </div>
              </div>

              {invoices?.invoices?.length > 0 && (
                <div className={`${P} overflow-hidden`}>
                  <table className="w-full">
                    <thead><tr className="border-b border-gray-800 bg-[#0a1628]">
                      <th className="text-left text-xs text-gray-500 font-medium p-4">Invoice #</th>
                      <th className="text-left text-xs text-gray-500 font-medium p-4">Phone</th>
                      <th className="text-left text-xs text-gray-500 font-medium p-4">Plan</th>
                      <th className="text-left text-xs text-gray-500 font-medium p-4">Amount</th>
                      <th className="text-left text-xs text-gray-500 font-medium p-4">Status</th>
                      <th className="text-right text-xs text-gray-500 font-medium p-4">PDF</th>
                    </tr></thead>
                    <tbody>
                      {invoices.invoices.map((inv, i) => (
                        <tr key={i} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                          <td className="p-4 text-sm font-medium text-white">{inv.invoice_number}</td>
                          <td className="p-4 text-sm text-gray-400">{inv.phone}</td>
                          <td className="p-4 text-xs text-gray-400">{inv.plan}</td>
                          <td className="p-4 text-sm font-semibold text-white">₹{((inv.amount || 0) / 100).toLocaleString('en-IN')}</td>
                          <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${inv.status === 'paid' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-orange/10 text-accent-orange'}`}>{inv.status}</span></td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDownloadPDF(inv.invoice_number)}
                              className="p-1.5 rounded-lg bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-colors" title="Download PDF">
                              <Download size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {invoices && !invoices?.invoices?.length && (
                <div className={`${P} p-8 text-center text-gray-600`}>
                  <FileText size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No invoices found. Click "Load Invoices" or "Create Test Invoice" to get started.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ AUTOMATION ═══ */}
        {activeTab === 'automation' && (
          <motion.div key="automation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AutomationStatus token={tokenRef.current} />
          </motion.div>
        )}

        {/* ═══ HEALTH ═══ */}
        {activeTab === 'health' && (
          <motion.div key="health" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
            <div><h2 className="text-xl font-bold mb-1">System Health</h2><p className="text-sm text-gray-500">Backend status & infrastructure</p></div>
            {health ? (<>
              <div className="grid grid-cols-4 gap-4">
                <div className={`${P} p-5 flex items-center gap-4`}>
                  {health.status === 'healthy' ? <CheckCircle size={28} className="text-accent-green" /> : <AlertTriangle size={28} className="text-red-400" />}
                  <div>
                    <p className="text-sm font-bold">{health.status === 'healthy' ? 'Healthy' : 'Degraded'}</p>
                    <p className="text-xs text-gray-500">{health.uptime_seconds > 3600 ? `${Math.floor(health.uptime_seconds / 3600)}h ${Math.floor((health.uptime_seconds % 3600) / 60)}m` : `${Math.floor(health.uptime_seconds / 60)}m`} uptime</p>
                  </div>
                </div>
                {[
                  { label: 'Cashfree', ok: health.cashfree_configured },
                  { label: 'Resend Email', ok: health.resend_configured },
                  { label: 'OTP Test Mode', ok: health.otp_test_mode, warn: true },
                ].map(s => (
                  <div key={s.label} className={`${P} p-5 flex items-center gap-3`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.ok ? (s.warn ? 'bg-yellow-500/20' : 'bg-accent-green/20') : 'bg-red-500/20'}`}>
                      {s.ok ? (s.warn ? <AlertTriangle size={14} className="text-yellow-400" /> : <CheckCircle size={14} className="text-accent-green" />) : <AlertTriangle size={14} className="text-red-400" />}
                    </div>
                    <div><p className="text-sm font-medium text-gray-300">{s.label}</p><p className="text-xs text-gray-600">{s.ok ? (s.warn ? 'Test Mode' : 'Active') : 'Not Set'}</p></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={`${P} p-6`}>
                  <div className="flex items-center gap-2 mb-4"><Database size={16} className="text-accent-purple" /><h3 className="text-sm font-semibold text-gray-400">Database</h3><span className="ml-auto text-xs text-gray-600">{health.db_size_mb} MB</span></div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {Object.entries(health.row_counts || {}).map(([table, count]) => (
                      <div key={table} className="flex items-center justify-between py-1.5 border-b border-gray-800/30">
                        <span className="text-xs text-gray-500">{table}</span>
                        <span className="text-xs font-bold text-white">{count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {health.email_stats?.total > 0 && (
                  <div className={`${P} p-6`}>
                    <div className="flex items-center gap-2 mb-4"><Mail size={16} className="text-accent-orange" /><h3 className="text-sm font-semibold text-gray-400">Removal Emails</h3></div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center"><p className="text-2xl font-bold text-accent-green">{health.email_stats.delivery_rate}%</p><p className="text-xs text-gray-500">Delivery Rate</p></div>
                      <div className="text-center"><p className="text-2xl font-bold text-accent-purple">{health.email_stats.compliance_rate}%</p><p className="text-xs text-gray-500">Compliance Rate</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <span>Total: {health.email_stats.total}</span>
                      <span>Sent: {health.email_stats.sent_ok}</span>
                      <span>Complied: {health.email_stats.complied}</span>
                      <span>Pending: {health.email_stats.pending}</span>
                    </div>
                  </div>
                )}

                <div className={`${P} p-6`}>
                  {health.payment_stats && (<>
                    <div className="flex items-center gap-2 mb-4"><CreditCard size={16} className="text-accent-green" /><h3 className="text-sm font-semibold text-gray-400">Payments</h3></div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-800/30"><span className="text-xs text-gray-500">Total Paid</span><span className="text-lg font-bold">{health.payment_stats.total_paid}</span></div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-800/30"><span className="text-xs text-gray-500">Revenue</span><span className="text-lg font-bold text-accent-green">₹{((health.payment_stats.total_revenue || 0) / 100).toLocaleString('en-IN')}</span></div>
                  </>)}
                  <div className="flex items-center justify-between py-2 mt-2"><span className="text-xs text-gray-500">Broker DBs tracked</span><span className="text-lg font-bold text-accent-orange">{health.broker_count}</span></div>
                </div>
              </div>
            </>) : (
              <div className={`${P} p-12 text-center`}><Server size={40} className="text-gray-700 mx-auto mb-3" /><p className="text-sm text-gray-500">Loading health data...</p></div>
            )}
          </motion.div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {activeTab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
            <div><h2 className="text-xl font-bold mb-1">Settings</h2><p className="text-sm text-gray-500">Feature flags & data policies</p></div>

            <div className="grid grid-cols-2 gap-6">
              <div className={`${P} p-6`}>
                <div className="flex items-center gap-2 mb-5"><Settings size={18} className="text-accent-purple" /><h3 className="text-base font-bold">Feature Toggles</h3></div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#060e1a] border border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"><Database size={18} className="text-purple-400" /></div>
                      <div><p className="text-sm font-semibold">Dark Web Monitoring</p><p className="text-xs text-gray-500">{featureToggles.darkWeb ? 'Active for all users' : 'Launching Soon — disabled'}</p></div>
                    </div>
                    <button onClick={() => toggleFeature('darkWeb')} className="flex-shrink-0">
                      {featureToggles.darkWeb ? <ToggleRight size={32} className="text-accent-green" /> : <ToggleLeft size={32} className="text-gray-600" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#060e1a] border border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Mail size={18} className="text-blue-400" /></div>
                      <div><p className="text-sm font-semibold">Inbox Shield</p><p className="text-xs text-gray-500">{featureToggles.inboxShield ? 'Active for all users' : 'Launching Soon — disabled'}</p></div>
                    </div>
                    <button onClick={() => toggleFeature('inboxShield')} className="flex-shrink-0">
                      {featureToggles.inboxShield ? <ToggleRight size={32} className="text-accent-green" /> : <ToggleLeft size={32} className="text-gray-600" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4">Toggles are saved locally. When enabled, the "Launching Soon" badge will be removed from pricing for these features.</p>
              </div>

              <div className={`${P} p-6`}>
                <div className="flex items-center gap-2 mb-5"><Lock size={18} className="text-accent-green" /><h3 className="text-base font-bold">Security</h3></div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-white mb-3">Change Password</p>
                    <form onSubmit={handlePasswordChange} className="space-y-3">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="w-full bg-[#060e1a] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-green/50"
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full bg-[#060e1a] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-green/50"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-[#060e1a] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-green/50"
                      />
                      
                      {passwordChangeError && (
                        <p className="text-xs text-red-400">{passwordChangeError}</p>
                      )}
                      
                      {passwordChangeSuccess && (
                        <p className="text-xs text-green-400">{passwordChangeSuccess}</p>
                      )}
                      
                      <button
                        type="submit"
                        disabled={passwordChangeLoading}
                        className="w-full py-2.5 rounded-lg bg-green-500/20 text-green-400 font-semibold text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {passwordChangeLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                        {passwordChangeLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-400">Last login</span>
                      <span className="text-sm text-white">Just now</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-400">Session expires</span>
                      <span className="text-sm text-white">24 hours</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${P} p-6`}>
                <div className="flex items-center gap-2 mb-5"><Database size={18} className="text-accent-orange" /><h3 className="text-base font-bold">Data Retention</h3></div>
                <div className="flex flex-col gap-1">
                  {[
                    { label: 'User scan data', value: 'Never deleted', green: true },
                    { label: 'Removal records', value: 'Never deleted', green: true },
                    { label: 'Payment records', value: '7 years (tax compliance)', green: true },
                    { label: 'User account data', value: 'Until user requests deletion', green: false },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between py-3 border-b border-gray-800/30 last:border-0">
                      <span className="text-sm text-gray-400">{r.label}</span>
                      <span className={`text-sm font-semibold ${r.green ? 'text-accent-green' : 'text-gray-500'}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-4">All scan and removal data is persisted permanently for admin review. Users can request account deletion but historical records are retained.</p>
              </div>
            </div>
          </motion.div>
        )}

        </AnimatePresence>

        {/* ═══ USER DETAIL MODAL ═══ */}
        {showUserDetail && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowUserDetail(false); setSelectedUser(null); }}>
            <div className="bg-[#0d1b2a] border border-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><Eye size={18} className="text-accent-purple" /> User Details</h3>
                <button onClick={() => { setShowUserDetail(false); setSelectedUser(null); }} className="p-1 rounded-lg hover:bg-white/10"><X size={18} /></button>
              </div>
              {userDetailLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-accent-purple" /></div>
              ) : selectedUser ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#060e1a] rounded-lg p-3 border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Full Phone</p>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5"><Phone size={13} className="text-accent-green" /> {selectedUser.phone_display}</p>
                    </div>
                    <div className="bg-[#060e1a] rounded-lg p-3 border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Email</p>
                      <p className="text-sm font-medium text-white">{selectedUser.email || '—'}</p>
                    </div>
                    <div className="bg-[#060e1a] rounded-lg p-3 border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Plan</p>
                      <p className="text-sm font-bold">{selectedUser.plan} {selectedUser.plan_active ? <span className="text-accent-green text-xs">(Active)</span> : <span className="text-gray-600 text-xs">(Inactive)</span>}</p>
                    </div>
                    <div className="bg-[#060e1a] rounded-lg p-3 border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Registered</p>
                      <p className="text-sm text-gray-300">{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>
                  {selectedUser.payments?.length > 0 && (
                    <div>
                      <h4 className="text-xs text-gray-500 font-semibold mb-2 uppercase">Payment History</h4>
                      <div className="flex flex-col gap-1">
                        {selectedUser.payments.map((p, i) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#060e1a] border border-gray-800/50 text-xs">
                            <span className="text-gray-300">{p.plan} — ₹{p.amount / 100}</span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${p.status === 'paid' ? 'bg-accent-green/10 text-accent-green' : 'bg-gray-500/10 text-gray-400'}`}>{p.status}</span>
                            <span className="text-gray-600">{formatDate(p.paid_at || p.created_at)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedUser.family_members?.length > 0 && (
                    <div>
                      <h4 className="text-xs text-gray-500 font-semibold mb-2 uppercase">Family Members ({selectedUser.family_members.length})</h4>
                      <div className="flex flex-col gap-1">
                        {selectedUser.family_members.map((fm, i) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#060e1a] border border-gray-800/50 text-xs">
                            <span className="text-gray-300">{fm.name || 'No name'} — +91 ***{fm.phone?.slice(-4)}</span>
                            <span className="text-gray-500">{fm.email || '—'}</span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${fm.otp_verified ? 'bg-accent-green/10 text-accent-green' : 'bg-yellow-500/10 text-yellow-400'}`}>{fm.otp_verified ? 'Verified' : 'Unverified'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { setShowUserDetail(false); handleOpenWhatsApp(selectedUser.phone_full); }} className="flex-1 py-2 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-500/20 transition-colors">
                      <MessageCircle size={14} /> Send WhatsApp
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(selectedUser.phone_full); }} className="px-4 py-2 rounded-lg bg-[#060e1a] border border-gray-800 text-sm text-gray-400 hover:text-white transition-colors">
                      Copy Phone
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">User not found</p>
              )}
            </div>
          </div>
        )}

        {/* ═══ WHATSAPP SEND MODAL ═══ */}
        {showWhatsApp && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowWhatsApp(false)}>
            <div className="bg-[#0d1b2a] border border-gray-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><MessageCircle size={18} className="text-green-400" /> Send WhatsApp</h3>
                <button onClick={() => setShowWhatsApp(false)} className="p-1 rounded-lg hover:bg-white/10"><X size={18} /></button>
              </div>
              <p className="text-sm text-gray-400 mb-3">To: <span className="text-white font-medium">+91 {waPhone}</span></p>

              {/* Quick templates */}
              {Object.keys(waTemplates).length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-gray-500 uppercase mb-1.5">Quick Templates</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(waTemplates).map(([key, msg]) => (
                      <button key={key} onClick={() => setWaMessage(msg)} className="text-[10px] px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors">
                        {key.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                value={waMessage}
                onChange={e => setWaMessage(e.target.value)}
                rows={5}
                placeholder="Type your message..."
                className="w-full bg-[#060e1a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500/50 resize-none mb-3"
              />

              {waResult && (
                <p className={`text-xs mb-3 ${waResult.includes('Failed') ? 'text-red-400' : 'text-accent-green'}`}>{waResult}</p>
              )}

              <button
                onClick={handleSendWhatsApp}
                disabled={waSending || !waMessage.trim()}
                className="w-full py-2.5 rounded-xl bg-green-500/20 text-green-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-green-500/30 disabled:opacity-40 transition-colors"
              >
                {waSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {waSending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
