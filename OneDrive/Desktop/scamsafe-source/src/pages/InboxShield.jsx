import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail, Shield, ShieldAlert, AlertTriangle, Trash2, CheckCircle2,
  ChevronRight, Loader2, XCircle, Zap, Lock, MailX, MailCheck,
  RefreshCw, LogOut, Star, Ban
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import {
  inboxShieldStatus, inboxShieldConnectGmail, inboxShieldConnectOutlook,
  inboxShieldScan, inboxShieldUnsubscribe, inboxShieldBulkUnsubscribe,
  inboxShieldJobStatus, inboxShieldReportScam, inboxShieldDisconnect,
} from '../utils/api';

const CAT_CONFIG = {
  SCAM:       { icon: ShieldAlert, color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    label: 'Scam / Phishing' },
  BROKER:     { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Data Brokers' },
  MARKETING:  { icon: MailX,        color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  label: 'Marketing Spam' },
  SPAM:       { icon: Ban,          color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Spam' },
  FINANCE:    { icon: Zap,          color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'Finance Spam' },
  JOBS:       { icon: Star,         color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   label: 'Job Portal Spam' },
  NEWSLETTER: { icon: Mail,         color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   label: 'Newsletters' },
  LEGITIMATE: { icon: MailCheck,     color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  label: 'Legitimate' },
  UNKNOWN:    { icon: Mail,          color: 'text-gray-400',   bg: 'bg-gray-500/10',   border: 'border-gray-500/30',   label: 'Uncategorized' },
};

export default function InboxShield() {
  const navigate = useNavigate();
  const { user } = useApp();
  const phone = user?.phone || '';

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [connectLoading, setConnectLoading] = useState(null);
  const [unsubProgress, setUnsubProgress] = useState(null);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  // Show error/success from OAuth callback redirect
  useEffect(() => {
    const urlError = searchParams.get('error');
    const connected = searchParams.get('connected');
    if (urlError) setError(`OAuth error: ${decodeURIComponent(urlError)}`);
    if (connected === 'true') {
      // Re-check status after successful connection
      if (phone) inboxShieldStatus(phone).then(s => { setStatus(s); setLoading(false); });
    }
  }, [searchParams]);

  // Check connection status
  useEffect(() => {
    if (!phone) { setLoading(false); return; }
    inboxShieldStatus(phone).then(s => { setStatus(s); setLoading(false); });
  }, [phone]);

  // Plan gate
  const isPro = user?.plan === 'shield-pro' || user?.plan === 'shield_pro' || user?.plan === 'family-vault';

  const handleConnectGmail = useCallback(async () => {
    setConnectLoading('gmail');
    setError(null);
    try {
      const res = await inboxShieldConnectGmail(phone);
      if (res.auth_url) window.location.href = res.auth_url;
      else setError('No auth URL returned. Check backend configuration.');
    } catch (e) {
      const detail = e?.response?.data?.detail || e?.message || 'Unknown error';
      setError(`Gmail connect failed: ${detail}`);
    }
    setConnectLoading(null);
  }, [phone]);

  const handleConnectOutlook = useCallback(async () => {
    setConnectLoading('outlook');
    setError(null);
    try {
      const res = await inboxShieldConnectOutlook(phone);
      if (res.auth_url) window.location.href = res.auth_url;
      else setError('No auth URL returned. Check backend configuration.');
    } catch (e) {
      const detail = e?.response?.data?.detail || e?.message || 'Unknown error';
      setError(`Outlook connect failed: ${detail}`);
    }
    setConnectLoading(null);
  }, [phone]);

  const handleScan = useCallback(async () => {
    setScanning(true);
    setError(null);
    try {
      const res = await inboxShieldScan(phone);
      if (res.job_id) {
        // Poll for results (retry up to 5 failures)
        let failCount = 0;
        const poll = setInterval(async () => {
          try {
            const job = await inboxShieldJobStatus(res.job_id);
            failCount = 0; // reset on success
            if (job.status === 'done') {
              clearInterval(poll);
              setScanResult(job.result);
              setScanning(false);
            } else if (job.status === 'error') {
              clearInterval(poll);
              setError(job.error || 'Scan failed.');
              setScanning(false);
            }
            // else still scanning/classifying — keep polling
          } catch {
            failCount++;
            if (failCount >= 5) {
              clearInterval(poll);
              setError('Scan is taking too long. Please try again.');
              setScanning(false);
            }
          }
        }, 3000);
      } else if (res.scan_complete) {
        // Direct result (legacy)
        setScanResult(res);
        setScanning(false);
      }
    } catch (e) {
      setError(e?.response?.data?.detail || 'Inbox scan failed.');
      setScanning(false);
    }
  }, [phone]);

  const handleUnsubscribe = useCallback(async (item) => {
    // Instant UI feedback — mark as unsubscribed immediately
    setScanResult(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      for (const cat of Object.keys(updated.categories || {})) {
        updated.categories[cat] = updated.categories[cat].map(e =>
          e.message_id === item.message_id ? { ...e, _unsubscribed: true } : e
        );
      }
      return updated;
    });
    // Fire API call in background
    try {
      await inboxShieldUnsubscribe(
        phone, item.message_id, item.from, item.list_unsubscribe, item.list_unsubscribe_post
      );
    } catch { /* already shown as unsubscribed */ }
    return { success: true };
  }, [phone]);

  const handleBulkUnsubscribe = useCallback(async (categories) => {
    if (!scanResult) return;
    const allEmails = Object.values(scanResult.categories || {}).flat();

    // Instant UI feedback — mark all items in selected categories as unsubscribed
    setScanResult(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      for (const cat of categories) {
        if (updated.categories?.[cat]) {
          updated.categories[cat] = updated.categories[cat].map(e => ({ ...e, _unsubscribed: true }));
        }
      }
      return updated;
    });

    // Fire API in background
    try {
      await inboxShieldBulkUnsubscribe(phone, categories, allEmails);
    } catch {
      setError('Bulk unsubscribe may have partially failed. Emails are still being deleted in the background.');
    }
  }, [phone, scanResult]);

  const handleReportScam = useCallback(async (item) => {
    try {
      await inboxShieldReportScam(phone, item.message_id, item.from);
      setScanResult(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        for (const cat of Object.keys(updated.categories || {})) {
          updated.categories[cat] = updated.categories[cat].map(e =>
            e.message_id === item.message_id ? { ...e, _reported: true } : e
          );
        }
        return updated;
      });
    } catch {}
  }, [phone]);

  const handleDisconnect = useCallback(async () => {
    await inboxShieldDisconnect(phone);
    setStatus({ connected: false });
    setScanResult(null);
  }, [phone]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-500" />
      </div>
    );
  }

  // Not logged in
  if (!user || !phone) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Mail size={40} className="text-gray-600" />
        <h2 className="text-lg font-bold">Inbox Shield</h2>
        <p className="text-sm text-gray-500">Log in to access Inbox Shield</p>
        <button onClick={() => navigate('/')} className="glow-button-orange px-6 py-2 text-sm">Go to Home</button>
      </div>
    );
  }

  // Plan gate
  if (!isPro) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 flex items-center justify-center mx-auto mb-3">
            <Lock size={28} className="text-accent-purple" />
          </div>
          <h1 className="text-xl font-bold mb-2">Inbox Shield</h1>
          <p className="text-sm text-gray-400">Available on Shield Pro and Family Vault plans</p>
        </div>
        <div className="glass-card p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white">What Inbox Shield does:</h3>
          <ul className="flex flex-col gap-2 text-xs text-gray-400">
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-accent-green mt-0.5 flex-shrink-0" /> Identify scam and phishing senders</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-accent-green mt-0.5 flex-shrink-0" /> Detect data broker emails</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-accent-green mt-0.5 flex-shrink-0" /> One-click unsubscribe from spam</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-accent-green mt-0.5 flex-shrink-0" /> Report scam senders to community database</li>
          </ul>
          <p className="text-[10px] text-gray-600 mt-1">We only read sender + subject. Never email body.</p>
        </div>
        <button onClick={() => navigate('/pricing')} className="glow-button-orange w-full py-3 text-sm flex items-center justify-center gap-2">
          Upgrade to Shield Pro — ₹399/month <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  // SCREEN 1 — Connect (if not connected)
  if (!status?.connected) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 flex items-center justify-center mx-auto mb-3">
            <Mail size={28} className="text-accent-purple" />
          </div>
          <h1 className="text-xl font-bold mb-2">Inbox Shield</h1>
          <p className="text-sm text-gray-400">Connect your email to scan and clean your inbox</p>
        </div>

        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <CheckCircle2 size={14} className="text-accent-green mt-0.5 flex-shrink-0" />
            <span>Identify and unsubscribe from spam</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <CheckCircle2 size={14} className="text-accent-green mt-0.5 flex-shrink-0" />
            <span>Detect scam and phishing senders</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <CheckCircle2 size={14} className="text-accent-green mt-0.5 flex-shrink-0" />
            <span>Remove data broker emails</span>
          </div>
        </div>

        <div className="glass-card p-4 border-accent-green/20">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">Privacy Guarantee</p>
          <p className="text-xs text-gray-400"><span className="text-white font-medium">What we access:</span> sender + subject only</p>
          <p className="text-xs text-gray-400"><span className="text-white font-medium">What we NEVER read:</span> email body</p>
          <p className="text-xs text-gray-400"><span className="text-white font-medium">What we NEVER store:</span> any email content</p>
          <p className="text-xs text-gray-500 mt-2">Disconnect anytime — one tap</p>
        </div>

        {error && <p className="text-xs text-red-400 text-center">{error}</p>}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleConnectGmail}
            disabled={connectLoading}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-white text-gray-900 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {connectLoading === 'gmail' ? <Loader2 size={16} className="animate-spin" /> : (
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            )}
            Connect Gmail
          </button>
          <button
            onClick={handleConnectOutlook}
            disabled={connectLoading}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-[#0078D4] text-white flex items-center justify-center gap-2 hover:bg-[#006CBE] transition-colors disabled:opacity-50"
          >
            {connectLoading === 'outlook' ? <Loader2 size={16} className="animate-spin" /> : (
              <svg width="16" height="16" viewBox="0 0 24 24"><rect fill="#F25022" x="1" y="1" width="10" height="10"/><rect fill="#7FBA00" x="13" y="1" width="10" height="10"/><rect fill="#00A4EF" x="1" y="13" width="10" height="10"/><rect fill="#FFB900" x="13" y="13" width="10" height="10"/></svg>
            )}
            Connect Outlook
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 2 — Connected: Scan results or scan button
  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-accent-purple" />
          <h1 className="text-lg font-bold">Inbox Shield</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            {status.provider === 'gmail' ? 'Gmail' : 'Outlook'} connected
          </span>
          <button onClick={handleDisconnect} className="text-gray-600 hover:text-red-400 transition-colors" title="Disconnect">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Stats */}
      {status.emails_scanned > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="glass-card p-3 text-center">
            <p className="text-lg font-bold text-white">{status.emails_scanned}</p>
            <p className="text-[10px] text-gray-500">Scanned</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-lg font-bold text-accent-green">{status.emails_unsubscribed}</p>
            <p className="text-[10px] text-gray-500">Unsubscribed</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-lg font-bold text-red-400">{status.emails_reported}</p>
            <p className="text-[10px] text-gray-500">Reported</p>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      {/* Bulk unsubscribe progress */}
      <AnimatePresence>
        {unsubProgress && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-4">
            <p className="text-sm font-semibold mb-2">
              {unsubProgress.running ? 'Unsubscribing...' : 'Done!'}
            </p>
            <div className="w-full h-2 bg-dark-bg rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent-green rounded-full"
                initial={{ width: 0 }}
                animate={{ width: unsubProgress.total ? `${(unsubProgress.done / unsubProgress.total) * 100}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{unsubProgress.done} of {unsubProgress.total}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan button */}
      {!scanResult && !scanning && (
        <button onClick={handleScan} className="glow-button-orange w-full py-3.5 text-sm flex items-center justify-center gap-2">
          <RefreshCw size={16} /> Scan Inbox
        </button>
      )}

      {scanning && (
        <div className="glass-card p-6 flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-accent-purple" />
          <p className="text-sm text-gray-300">Scanning your inbox...</p>
          <p className="text-[10px] text-gray-600">Reading sender & subject only — never email body</p>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && (
        <>
          <div className="glass-card p-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Inbox Analysis — <span className="text-white font-semibold">{scanResult.total_scanned} emails scanned</span>
            </span>
            <button onClick={handleScan} className="text-xs text-accent-purple flex items-center gap-1">
              <RefreshCw size={12} /> Rescan
            </button>
          </div>

          {/* Category sections */}
          {['SCAM', 'BROKER', 'MARKETING', 'SPAM', 'FINANCE', 'JOBS', 'NEWSLETTER', 'LEGITIMATE', 'UNKNOWN'].map(cat => {
            const items = scanResult.categories?.[cat] || [];
            if (items.length === 0) return null;
            const cfg = CAT_CONFIG[cat] || CAT_CONFIG.LEGITIMATE;
            const Icon = cfg.icon;
            const actionable = cat !== 'LEGITIMATE' && cat !== 'NEWSLETTER';

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-3 ${cfg.border} border`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={cfg.color} />
                    <span className={`text-xs font-semibold ${cfg.color} uppercase tracking-wider`}>{cfg.label}</span>
                    <span className="text-[10px] text-gray-600">{items.length} sender{items.length !== 1 ? 's' : ''}</span>
                  </div>
                  {actionable && items.some(e => e.list_unsubscribe && !e._unsubscribed) && (
                    <button
                      onClick={() => handleBulkUnsubscribe([cat])}
                      className="text-[10px] text-accent-orange hover:text-accent-orange/80 font-semibold"
                    >
                      {cat === 'SCAM' ? 'Report + Delete All' : 'Unsubscribe All'}
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  {items.slice(0, 10).map((item, i) => (
                    <div key={item.message_id || i} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-dark-bg/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 truncate">{item.from}</p>
                        {item.subject && <p className="text-[10px] text-gray-600 truncate">{item.subject}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        {item._unsubscribed && <span className="text-[9px] text-green-400">Unsubscribed</span>}
                        {item._reported && <span className="text-[9px] text-red-400">Reported</span>}
                        {!item._unsubscribed && !item._reported && item.list_unsubscribe && cat !== 'LEGITIMATE' && (
                          <button
                            onClick={() => handleUnsubscribe(item)}
                            className="text-[10px] text-accent-orange hover:text-accent-orange/80 px-2 py-0.5 rounded bg-accent-orange/10"
                          >
                            Unsub
                          </button>
                        )}
                        {cat === 'SCAM' && !item._reported && (
                          <button
                            onClick={() => handleReportScam(item)}
                            className="text-[10px] text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-red-500/10"
                          >
                            Report
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {items.length > 10 && (
                    <p className="text-[10px] text-gray-600 text-center">+{items.length - 10} more</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </>
      )}
    </div>
  );
}
