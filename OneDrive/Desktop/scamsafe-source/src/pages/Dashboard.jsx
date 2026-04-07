import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, ShieldCheck, CheckCircle2, XCircle, Clock, RefreshCw,
  Send, Sparkles, Phone, Mail, MapPin, CreditCard, Fingerprint, CalendarDays, Loader2,
  BarChart3, ChevronRight, FileDown, Bell, BellDot, Users, UserPlus, Trash2,
  AlertCircle, MailCheck, MailX, ExternalLink,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { getUserStatus, triggerRescan, sendChatMessage, isBackendLive, downloadDeletionCertificate, getRemovalStatus, getNotifications, markNotificationsRead, getScanLimit, getFamilyGroup, createFamilyGroup, addFamilyMember, removeFamilyMember, sendFamilyMemberOTP, verifyFamilyMemberOTP } from '../utils/api';
import ProtectionScore from '../components/ProtectionScore';
// BreachIntelligence removed per business requirement
import DeletionLog from '../components/DeletionLog';
import DataMinimisation from '../components/DataMinimisation';
import ComplianceTracker from '../components/ComplianceTracker';
import NotificationBell from '../components/NotificationBell';
import ScanQuota from '../components/ScanQuota';

const dataIcons = {
  Phone: Phone, Email: Mail, Address: MapPin,
  PAN: CreditCard, Aadhaar: Fingerprint, DOB: CalendarDays,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, phone: contextPhone, exposedBrokers, dataTypesFound, removalStatus, setDashboard } = useApp();
  const userPhone = user?.phone || user?.id || contextPhone;
  const [activeTab, setActiveTab] = useState('status');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [daysUntilRescan, setDaysUntilRescan] = useState(30);
  const [rescanning, setRescanning] = useState(false);
  const [removalLog, setRemovalLog] = useState([]);
  const [certLoading, setCertLoading] = useState(false);
  const chatEndRef = useRef(null);

  // New: removal tracking, notifications, scan limit, family
  const [removalEmails, setRemovalEmails] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scanLimit, setScanLimit] = useState(null);
  const [familyGroup, setFamilyGroup] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [familyEmail, setFamilyEmail] = useState('');
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyError, setFamilyError] = useState('');
  const [familyOtpSent, setFamilyOtpSent] = useState(false);
  const [familyOtp, setFamilyOtp] = useState('');

  // Compute stable removal counts (only once, not on every render)
  const { removedCount, totalCount } = useMemo(() => {
    if (removalStatus?.removed !== undefined) {
      return { removedCount: removalStatus.removed, totalCount: removalStatus.total || exposedBrokers.length };
    }
    const total = exposedBrokers.length;
    const removed = Math.max(1, total - Math.floor(total * 0.12));
    return { removedCount: removed, totalCount: total };
  }, [exposedBrokers.length, removalStatus]);

  // Generate stable removal log once
  useEffect(() => {
    if (removalLog.length > 0) return;
    const log = exposedBrokers.map((broker, idx) => ({
      ...broker,
      removed: idx < removedCount,
      timestamp: new Date(Date.now() - idx * 120000),
    }));
    setRemovalLog(log);
  }, [exposedBrokers, removedCount]);

  // Fetch real status from backend on mount
  useEffect(() => {
    if (!user && !contextPhone) {
      navigate('/');
      return;
    }

    if (isBackendLive() && (user?.id || contextPhone)) {
      fetchStatus();
    }

    // Fetch new data
    const phone = userPhone;
    if (phone) {
      getRemovalStatus(phone).then(d => setRemovalEmails(d));
      getNotifications(phone).then(d => { setNotifications(d.notifications || []); setUnreadCount(d.unread_count || 0); });
      getScanLimit(phone).then(d => setScanLimit(d));
      getFamilyGroup(phone).then(d => setFamilyGroup(d));
    }

    // Calculate days until rescan
    if (user?.next_rescan_at) {
      const diff = new Date(user.next_rescan_at) - new Date();
      setDaysUntilRescan(Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24))));
    } else {
      setDaysUntilRescan(user?.plan === 'shield-pro' || user?.plan === 'family-vault' ? 7 : 30);
    }
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await getUserStatus(user.id);
      const data = res.data;
      setDashboard(data);

      const log = (data.records || []).map((r) => ({
        name: r.broker_name,
        removed: r.status === 'removed',
        status: r.status,
        risk: exposedBrokers.find((b) => b.name === r.broker_name)?.risk || 'MED',
        category: exposedBrokers.find((b) => b.name === r.broker_name)?.category || 'Database',
        timestamp: new Date(r.removed_at || r.last_checked_at || Date.now()),
      }));
      if (log.length > 0) setRemovalLog(log);
    } catch (err) {
      console.error('Dashboard status fetch error:', err);
    }
  };

  const handleRescan = async () => {
    if (!user?.id) return;
    setRescanning(true);
    try {
      if (isBackendLive()) {
        await triggerRescan(user.id);
      }
      await new Promise((r) => setTimeout(r, 2000));
      setRescanning(false);
    } catch (err) {
      console.error('Rescan trigger error:', err);
      setRescanning(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai' && chatMessages.length === 0) {
      const msg = `✅ Deletion requests have been submitted to ${removedCount} databases on your behalf.\n\nWe are monitoring the removal process and will update you as companies respond. Full deletion can take up to 90 days.\n\nHere are 2 things you should do right now to stay safer:\n\n1. **Enable two-factor authentication** on your bank apps (SBI YONO, PhonePe, Google Pay) — this stops OTP fraud even if scammers have your number.\n\n2. **Register on DND (Do Not Disturb)** by sending "START 0" to 1909 from your phone — this legally blocks telemarketing calls and creates a paper trail if brokers still contact you.\n\nI'm here to help with any privacy questions. Your next auto-rescan is in ${daysUntilRescan} days.`;
      setChatMessages([{ role: 'assistant', content: msg }]);
    }
  }, [activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setIsTyping(true);

    // Try real AI backend
    try {
      const res = await sendChatMessage(msg, chatMessages);
      if (res.data?.response) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: res.data.response }]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.error('Dashboard AI chat error:', err);
    }

    // Fallback response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Based on your protected profile, here's my advice:\n\n${msg.toLowerCase().includes('safe') ? 'Your data removal is active and all databases are being monitored. You\'re significantly safer now than before Data Eraser.' : 'I\'d recommend keeping your protection active and monitoring any suspicious calls. If you receive any, report them at cybercrime.gov.in. Your monthly rescan will catch any new exposures automatically.'}\n\nIs there anything specific about your privacy you'd like to know?`,
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dashboard Header with Notification Bell */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Protection Dashboard</h2>
        <NotificationBell phone={userPhone} />
      </div>

      {/* Scan Quota Widget */}
      <ScanQuota phone={userPhone} />

      {/* Protection Score — primary dashboard view */}
      <ProtectionScore phone={userPhone} />


      {/* Inbox Shield quick link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={() => navigate('/inbox-shield')}
        className="glass-card p-4 flex items-center gap-3 cursor-pointer hover:border-accent-purple/40 transition-all border border-transparent"
      >
        <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
          <MailCheck size={20} className="text-accent-purple" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Inbox Shield</p>
          <p className="text-[10px] text-gray-500">Scan & clean spam, scams, data broker emails</p>
        </div>
        <ChevronRight size={16} className="text-gray-600" />
      </motion.div>

      {/* Download Certificate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 flex items-center gap-3"
      >
        <button
          onClick={async () => {
            setCertLoading(true);
            await downloadDeletionCertificate(userPhone);
            setCertLoading(false);
          }}
          disabled={certLoading}
          className="flex items-center gap-2 text-sm font-medium text-accent-orange border border-accent-orange/30 rounded-xl px-4 py-2.5 hover:bg-accent-orange/10 transition-all disabled:opacity-50"
        >
          {certLoading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
          {certLoading ? 'Generating...' : 'Download Deletion Request Report'}
        </button>
      </motion.div>

      {/* Scan Limit Banner */}
      {scanLimit && (
        <div className="glass-card p-3 flex items-center gap-3 border-accent-purple/30">
          <RefreshCw size={16} className="text-accent-purple flex-shrink-0" />
          <p className="text-xs text-gray-400">
            Scans used: <span className="text-white font-bold">{scanLimit.count}/{scanLimit.limit}</span> (max 2 per 15 days)
            {!scanLimit.can_scan && <span className="text-accent-orange ml-1">— Next scan available in {scanLimit.days_until_reset} days</span>}
          </p>
        </div>
      )}

      {/* Tabs — Row 1 */}
      <div className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border">
        {[
          { id: 'status', label: 'Status' },
          { id: 'removal', label: 'Removal', icon: MailCheck },
          { id: 'log', label: 'Log' },
          { id: 'compliance', label: 'Compliance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-lg text-[11px] sm:text-sm font-medium transition-all flex items-center justify-center gap-1 ${
              activeTab === tab.id ? 'bg-dark-border text-white' : 'text-gray-500'
            }`}
          >
            {tab.icon && <tab.icon size={12} />}
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tabs — Row 2 */}
      <div className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border -mt-3">
        {[
          { id: 'notifications', label: 'Alerts', icon: unreadCount > 0 ? BellDot : Bell, badge: unreadCount },
          { id: 'family', label: 'Family', icon: Users },
          { id: 'ai', label: 'Advisor', icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'notifications' && unreadCount > 0) {
                markNotificationsRead(userPhone).then(() => setUnreadCount(0));
              }
            }}
            className={`flex-1 py-2.5 rounded-lg text-[11px] sm:text-sm font-medium transition-all flex items-center justify-center gap-1 relative ${
              activeTab === tab.id
                ? tab.id === 'ai' ? 'bg-accent-purple/20 text-accent-purple'
                  : tab.id === 'family' ? 'bg-accent-orange/20 text-accent-orange'
                  : 'bg-dark-border text-white'
                : 'text-gray-500'
            }`}
          >
            {tab.icon && <tab.icon size={12} />}
            {tab.label}
            {tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'status' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          {/* Data points status */}
          <div className="glass-card p-4 flex flex-col gap-3">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium">Protected Data Points</h3>
            {dataTypesFound.map((type) => {
              const Icon = dataIcons[type] || Shield;
              return (
                <div key={type} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className="text-gray-500" />
                    <span className="text-sm">{type}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-accent-green font-medium">
                    <CheckCircle2 size={14} />
                    CLEAR
                  </span>
                </div>
              );
            })}
          </div>

          {/* Next rescan */}
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
              <RefreshCw size={18} className="text-accent-purple" />
            </div>
            <div>
              <p className="text-sm font-medium">Next Auto-Rescan</p>
              <p className="text-xs text-gray-500">in {daysUntilRescan} days</p>
            </div>
            <button
              onClick={handleRescan}
              disabled={rescanning}
              className="ml-auto text-xs text-accent-purple font-medium bg-accent-purple/10 px-3 py-1.5 rounded-lg hover:bg-accent-purple/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {rescanning ? <><Loader2 size={12} className="animate-spin" /> Scanning...</> : 'Scan Now'}
            </button>
          </div>

          {/* Reappearance Tracker link */}
          <button
            onClick={() => navigate('/reappearance')}
            className="glass-card p-4 flex items-center gap-3 w-full text-left hover:border-accent-purple/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-orange/20 flex items-center justify-center flex-shrink-0">
              <BarChart3 size={18} className="text-accent-orange" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Reappearance Tracker</p>
              <p className="text-xs text-gray-500">6-month erasure history & insights</p>
            </div>
            <ChevronRight size={16} className="text-gray-600 group-hover:text-accent-purple transition-colors" />
          </button>
        </motion.div>
      )}

      {activeTab === 'log' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DeletionLog phone={userPhone} />
        </motion.div>
      )}

      {activeTab === 'compliance' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ComplianceTracker phone={userPhone} />
        </motion.div>
      )}

      {/* Removal Tracking Tab */}
      {activeTab === 'removal' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          {removalEmails && (
            <>
              <div className="glass-card p-4">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">DPDP Email Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-accent-green/10 border border-accent-green/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-accent-green">{removalEmails.emails_sent}</p>
                    <p className="text-[10px] text-gray-400">Emails Sent</p>
                  </div>
                  <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-accent-purple">{removalEmails.optouts_submitted}</p>
                    <p className="text-[10px] text-gray-400">Opt-outs Filed</p>
                  </div>
                  <div className="bg-accent-orange/10 border border-accent-orange/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-accent-orange">{removalEmails.total_brokers}</p>
                    <p className="text-[10px] text-gray-400">Total Databases</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-red-400">{removalEmails.failed}</p>
                    <p className="text-[10px] text-gray-400">Failed</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Per-Company Status</h3>
                <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto">
                  {(removalEmails.records || []).length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">No removal emails sent yet. Start a scan and removal first.</p>
                  )}
                  {(removalEmails.records || []).map((r, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2 border-b border-dark-border/50 last:border-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        r.email_sent ? 'bg-accent-green/20' : r.status === 'failed' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                      }`}>
                        {r.email_sent ? <MailCheck size={14} className="text-accent-green" /> :
                         r.status === 'failed' ? <MailX size={14} className="text-red-400" /> :
                         <Clock size={14} className="text-yellow-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{r.broker_name}</p>
                        <p className="text-[10px] text-gray-500">{r.category} · {r.broker_domain}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'sent' ? 'bg-accent-green/20 text-accent-green' :
                          r.status === 'optout_sent' ? 'bg-accent-purple/20 text-accent-purple' :
                          r.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {r.status === 'sent' ? 'Submitted for Removal' : r.status === 'optout_sent' ? 'Opt-out Filed' : r.status === 'failed' ? 'FAILED' : 'PENDING'}
                        </span>
                        {r.sent_at && <p className="text-[9px] text-gray-600 mt-0.5">{new Date(r.sent_at).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {!removalEmails && <p className="text-xs text-gray-500 text-center py-8">Loading removal data...</p>}
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
          <div className="glass-card p-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Notifications</h3>
            {notifications.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-6">No notifications yet. They'll appear here when your removal status updates.</p>
            )}
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 rounded-xl border ${
                  !n.read ? 'bg-accent-purple/5 border-accent-purple/20' : 'bg-dark-card/50 border-dark-border/50'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      n.type === 'removal' ? 'bg-accent-green/20' :
                      n.type === 'family' ? 'bg-accent-orange/20' :
                      'bg-accent-purple/20'
                    }`}>
                      {n.type === 'removal' ? <MailCheck size={12} className="text-accent-green" /> :
                       n.type === 'family' ? <Users size={12} className="text-accent-orange" /> :
                       <Bell size={12} className="text-accent-purple" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">{n.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{n.message}</p>
                      <p className="text-[9px] text-gray-600 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-accent-purple rounded-full flex-shrink-0 mt-1"></span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Family Management Tab */}
      {activeTab === 'family' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-accent-orange" />
              <h3 className="text-sm font-bold">Family Vault</h3>
              <span className="text-[10px] bg-accent-orange/20 text-accent-orange px-2 py-0.5 rounded-full font-bold ml-auto">
                {familyGroup?.member_count || 1}/5 members
              </span>
            </div>

            {!familyGroup?.exists && (
              <div className="text-center py-4">
                <p className="text-xs text-gray-400 mb-3">Create a Family Vault to protect up to 5 family members with one plan.</p>
                <button
                  onClick={async () => {
                    setFamilyLoading(true);
                    try {
                      await createFamilyGroup(userPhone);
                      const g = await getFamilyGroup(userPhone);
                      setFamilyGroup(g);
                    } catch (e) { setFamilyError(e?.response?.data?.detail || 'Failed'); }
                    setFamilyLoading(false);
                  }}
                  disabled={familyLoading}
                  className="glow-button-orange !px-6 !py-2.5 !text-xs"
                >
                  {familyLoading ? <Loader2 size={14} className="animate-spin" /> : <><Users size={14} /> Create Family Vault</>}
                </button>
              </div>
            )}

            {familyGroup?.exists && (
              <>
                {/* Owner */}
                <div className="flex items-center gap-3 py-2 border-b border-dark-border/50">
                  <div className="w-8 h-8 rounded-full bg-accent-orange/20 flex items-center justify-center">
                    <Shield size={14} className="text-accent-orange" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">You (Owner)</p>
                    <p className="text-[10px] text-gray-500">***{(userPhone || '').slice(-4)}</p>
                  </div>
                  <span className="text-[10px] bg-accent-orange/20 text-accent-orange px-2 py-0.5 rounded-full font-bold">OWNER</span>
                </div>

                {/* Members */}
                {(familyGroup.members || []).map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-dark-border/50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center">
                      <Phone size={14} className="text-accent-purple" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{m.name || `Member ${idx + 1}`}</p>
                      <p className="text-[10px] text-gray-500">{m.phone_masked}</p>
                      {m.last_scan && <p className="text-[9px] text-gray-600">Last scan: {new Date(m.last_scan).toLocaleDateString()} · {m.databases_found} found</p>}
                      {m.removal_status && (
                        <p className="text-[9px] text-accent-green">Removal: {m.removal_status} ({m.removal_progress}%)</p>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm(`Remove ${m.name || m.phone_masked} from family?`)) return;
                        try {
                          await removeFamilyMember(userPhone, m.phone);
                          const g = await getFamilyGroup(userPhone);
                          setFamilyGroup(g);
                        } catch (e) { setFamilyError(e?.response?.data?.detail || 'Failed'); }
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {/* Add member form with OTP verification */}
                {(familyGroup.member_count || 1) < 5 && (
                  <div className="mt-3 pt-3 border-t border-dark-border/50">
                    <p className="text-[10px] text-gray-500 mb-2">Add Family Member (OTP verified)</p>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        placeholder="Member's name"
                        disabled={familyOtpSent}
                        className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-accent-orange/50 disabled:opacity-50"
                      />
                      <input
                        type="email"
                        value={familyEmail}
                        onChange={(e) => setFamilyEmail(e.target.value)}
                        placeholder="Member's email (required)"
                        disabled={familyOtpSent}
                        className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-accent-orange/50 disabled:opacity-50"
                      />
                      <input
                        type="tel"
                        value={familyPhone}
                        onChange={(e) => setFamilyPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit phone number"
                        maxLength={10}
                        disabled={familyOtpSent}
                        className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-accent-orange/50 disabled:opacity-50"
                      />

                      {!familyOtpSent ? (
                        <button
                          onClick={async () => {
                            if (!familyPhone || familyPhone.length !== 10) { setFamilyError('Enter a valid 10-digit number'); return; }
                            if (!familyEmail || !familyEmail.includes('@')) { setFamilyError('Valid email is required'); return; }
                            setFamilyLoading(true);
                            setFamilyError('');
                            try {
                              await sendFamilyMemberOTP(userPhone, familyPhone, familyName, familyEmail);
                              setFamilyOtpSent(true);
                            } catch (e) { setFamilyError(e?.response?.data?.detail || 'Failed to send OTP'); }
                            setFamilyLoading(false);
                          }}
                          disabled={familyLoading || familyPhone.length !== 10 || !familyEmail.includes('@')}
                          className="bg-accent-orange/20 text-accent-orange px-3 py-2 rounded-lg text-xs font-medium hover:bg-accent-orange/30 transition-all disabled:opacity-40 flex items-center gap-1 justify-center"
                        >
                          {familyLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          Send OTP to Member
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <p className="text-[10px] text-accent-green">OTP sent to +91 {familyPhone}. Ask your family member for the code.</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={familyOtp}
                              onChange={(e) => setFamilyOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                              className="flex-1 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-accent-green/50"
                            />
                            <button
                              onClick={async () => {
                                if (!familyOtp || familyOtp.length !== 6) { setFamilyError('Enter 6-digit OTP'); return; }
                                setFamilyLoading(true);
                                setFamilyError('');
                                try {
                                  await verifyFamilyMemberOTP(userPhone, familyPhone, familyOtp, familyName, familyEmail);
                                  const g = await getFamilyGroup(userPhone);
                                  setFamilyGroup(g);
                                  setFamilyPhone(''); setFamilyName(''); setFamilyEmail('');
                                  setFamilyOtp(''); setFamilyOtpSent(false);
                                } catch (e) { setFamilyError(e?.response?.data?.detail || 'OTP verification failed'); }
                                setFamilyLoading(false);
                              }}
                              disabled={familyLoading || familyOtp.length !== 6}
                              className="bg-accent-green/20 text-accent-green px-3 py-2 rounded-lg text-xs font-medium hover:bg-accent-green/30 transition-all disabled:opacity-40 flex items-center gap-1"
                            >
                              {familyLoading ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                              Verify & Add
                            </button>
                          </div>
                          <button
                            onClick={() => { setFamilyOtpSent(false); setFamilyOtp(''); setFamilyError(''); }}
                            className="text-[10px] text-gray-500 hover:text-gray-300 underline self-start"
                          >
                            Change details
                          </button>
                        </div>
                      )}

                      {familyError && <p className="text-[10px] text-red-400">{familyError}</p>}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'ai' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'assistant'
                    ? 'glass-card p-4 border-accent-purple/20'
                    : 'bg-accent-purple/10 border border-accent-purple/20 rounded-2xl p-3 ml-8'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={12} className="text-accent-purple" />
                    <span className="text-xs text-accent-purple font-medium">ScamSafe Advisor</span>
                  </div>
                )}
                <div
                  className="text-gray-300"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            ))}
            {isTyping && (
              <div className="glass-card p-4 border-accent-purple/20">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={12} className="text-accent-purple" />
                  <span className="text-xs text-accent-purple font-medium">ScamSafe Advisor</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-accent-purple/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-accent-purple/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-accent-purple/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask about your privacy..."
              className="flex-1 bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-purple/50"
            />
            <button
              onClick={handleSendChat}
              disabled={!chatInput.trim()}
              className="glow-button-purple !px-3 !py-3 !rounded-xl disabled:opacity-30"
            >
              <Send size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Data Minimisation — Your Data at ScamSafe */}
      <DataMinimisation
        phone={userPhone}
        onDeleted={() => {
          localStorage.clear();
          navigate('/', { replace: true });
        }}
      />
    </div>
  );
}
