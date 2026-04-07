import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, Search, Database, Lock, ChevronRight, ChevronDown, ChevronUp, AlertTriangle, Clock, Radio, Loader2, Phone, RefreshCw, Instagram, Youtube, Mail, Check, Star, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { sendOTP, verifyOTP, getUserHistory, optInWhatsApp } from '../utils/api';
import ScamSafeLogo from '../components/ScamSafeLogo';

const COOLDOWN_DAYS = 29;

export default function Landing() {
  const navigate = useNavigate();
  const { setContact, lastErasedAt, lastErasedPhone, user, setScanResults, setUser } = useApp();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'verifying'
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true); // Pre-checked for better UX
  const [openFaq, setOpenFaq] = useState(null);

  const phoneValid = /^[6-9]\d{9}$/.test(phone);

  // Real-time victim counter derived from MHA/I4C 2024 data
  const [secsSinceMidnight, setSecsSinceMidnight] = useState(() => {
    const now = new Date();
    const ist = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 60 * 60 * 1000);
    return ist.getHours() * 3600 + ist.getMinutes() * 60 + ist.getSeconds();
  });
  const VICTIMS_PER_SEC = 70000 / 86400;
  const RUPEES_PER_SEC = (22845 * 1e7) / 365 / 86400;
  const scamCount = Math.floor(secsSinceMidnight * VICTIMS_PER_SEC);
  const rupeesLost = secsSinceMidnight * RUPEES_PER_SEC;

  // Cooldown check
  const cooldown = useMemo(() => {
    if (!lastErasedAt) return null;
    const erasedDate = new Date(lastErasedAt);
    const now = new Date();
    const diffDays = (now - erasedDate) / (1000 * 60 * 60 * 24);
    if (diffDays >= COOLDOWN_DAYS) return null;
    if (phone && phone === lastErasedPhone) {
      return { daysLeft: Math.ceil(COOLDOWN_DAYS - diffDays), nextScanDate: new Date(erasedDate.getTime() + COOLDOWN_DAYS * 86400000), erasedDate };
    }
    return null;
  }, [phone, lastErasedAt, lastErasedPhone]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const ist = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 60 * 60 * 1000);
      setSecsSinceMidnight(ist.getHours() * 3600 + ist.getMinutes() * 60 + ist.getSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!phoneValid || cooldown || loading) return;
    setLoading(true);
    setOtpError('');
    try {
      await sendOTP(phone);
      setStep('otp');
      setResendTimer(30);
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to send OTP. Please try again.';
      setOtpError(detail);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6 || loading) return;
    setLoading(true);
    setOtpError('');
    try {
      const res = await verifyOTP(phone, otp);
      if (res?.data?.success) {
        setStep('verifying');
        setContact(phone, '');

        // Handle WhatsApp opt-in if checked
        if (whatsappOptIn) {
          try {
            await optInWhatsApp(phone);
          } catch (err) {
            console.warn('WhatsApp opt-in failed:', err);
            // Don't fail the OTP verification if WhatsApp opt-in fails
          }
        }

        // Check if user has previous scan/removal history
        const history = await getUserHistory(phone);
        if (history?.has_history && history?.removal_jobs?.length > 0) {
          // User has previous removal data — restore context and go to dashboard
          const lastScan = history.last_scan;
          if (lastScan) {
            setScanResults({
              exposedBrokers: lastScan.exposed_brokers || [],
              dataTypesFound: lastScan.data_types_found || [],
              totalScanned: lastScan.total_scanned || 72,
            });
          }
          setUser({
            id: phone,
            phone,
            plan: 'shield',
            removalHistory: history.removal_jobs,
            totalRemoved: history.total_removed,
            totalPending: history.total_pending,
          });
          setTimeout(() => navigate('/dashboard'), 500);
        } else {
          // New user — proceed to scan
          setTimeout(() => navigate('/scan'), 500);
        }
      }
    } catch (err) {
      setOtpError(err?.response?.data?.detail || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp('');
    setOtpError('');
    handleSendOTP();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Live counter */}
      <Link to="/live">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-accent-red/10 border border-accent-red/20 mx-auto cursor-pointer hover:bg-accent-red/15 transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-red-400 text-sm font-medium">
            <span className="font-mono font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{scamCount.toLocaleString('en-IN')}</span> Indians scammed today
          </span>
          <ChevronRight size={12} className="text-red-400" />
        </motion.div>
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <div className="flex justify-center mb-2">
          <ScamSafeLogo size={40} showText={true} />
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <Shield size={12} className="text-accent-green" />
          <span className="text-[10px] text-accent-green font-medium">Powered by DPDP Act 2023</span>
          <span className="text-[10px] text-gray-300 font-medium">— India's data protection law that gives you the right to erase your personal data from any company</span>
        </div>
        <h1 className="text-3xl font-bold leading-tight mb-3">
          Your data is being sold to scammers{' '}
          <span className="text-accent-orange">right now.</span>
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Enter your phone number to see exactly where your personal data is exposed across 72+ databases. We'll remove it for you.
        </p>
      </motion.div>

      {/* Scan Form — Phone Only + OTP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 flex flex-col gap-4"
      >
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Phone Number</label>
              <div className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded-xl px-4 py-3">
                <span className="text-sm text-gray-400 flex items-center gap-1.5">🇮🇳 +91</span>
                <input
                  type="tel"
                  placeholder="Enter your 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="bg-transparent text-white placeholder-gray-600 outline-none flex-1 text-sm"
                  maxLength={10}
                  autoFocus
                />
              </div>
              {phone.length > 0 && !phoneValid && (
                <p className="text-[10px] text-accent-red mt-0.5">Enter a valid 10-digit Indian mobile number</p>
              )}
            </div>

            {cooldown ? (
              <div className="rounded-xl border border-accent-green/30 bg-accent-green/5 p-4 flex flex-col items-center gap-3 text-center">
                <ShieldCheck size={24} className="text-accent-green" />
                <p className="text-sm font-semibold text-accent-green">You're Already Protected</p>
                <p className="text-xs text-gray-400">
                  Removal requests sent on {cooldown.erasedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.
                  Next scan in <span className="text-accent-orange font-bold">{cooldown.daysLeft} days</span>.
                </p>
                {user && (
                  <button type="button" onClick={() => navigate('/dashboard')} className="w-full py-2.5 rounded-xl text-sm bg-dark-border text-white flex items-center justify-center gap-2">
                    <Shield size={14} /> Go to Dashboard <ChevronRight size={12} />
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={!phoneValid || loading}
                  className={`glow-button-orange w-full py-4 text-base flex items-center justify-center gap-2 ${!phoneValid || loading ? 'opacity-40 cursor-not-allowed !shadow-none' : ''}`}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  {loading ? 'Sending OTP...' : 'Verify & Scan My Data'}
                  {!loading && <ChevronRight size={16} />}
                </button>
                <p className="text-[10px] text-gray-500 text-center leading-relaxed mt-1">
                  By providing your number, you agree you are entering a number owned only by you, and to receive a verification code. Subject to ScamSafe <Link to="/terms" className="text-accent-orange underline">Terms of Service</Link>, Prohibited Use, and acknowledge the <Link to="/privacy" className="text-accent-orange underline">Privacy Policy</Link>.
                </p>
              </>
            )}
            {otpError && <p className="text-xs text-accent-red text-center">{otpError}</p>}
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
            <div className="text-center">
              <Phone size={24} className="text-accent-orange mx-auto mb-2" />
              <p className="text-sm text-gray-300 font-medium">OTP sent to +91 {phone}</p>
              <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code to verify & start scanning</p>
            </div>

            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const newOtp = otp.split('');
                    newOtp[i] = val;
                    setOtp(newOtp.join('').slice(0, 6));
                    if (val && e.target.nextElementSibling) e.target.nextElementSibling.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[i] && e.target.previousElementSibling) {
                      e.target.previousElementSibling.focus();
                    }
                  }}
                  className="w-11 h-13 text-center text-xl font-bold bg-dark-bg border border-dark-border rounded-xl text-white outline-none focus:border-accent-orange/60 transition-colors"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {otpError && <p className="text-xs text-accent-red text-center">{otpError}</p>}

            {/* WhatsApp Opt-in Checkbox */}
            <div className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-3">
              <input
                type="checkbox"
                id="whatsapp-opt-in"
                checked={whatsappOptIn}
                onChange={(e) => setWhatsappOptIn(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-green-500/30 bg-dark-bg text-green-400 focus:ring-green-400/30 focus:ring-2"
              />
              <label htmlFor="whatsapp-opt-in" className="text-xs text-gray-300 leading-relaxed cursor-pointer">
                <span className="text-green-400 font-medium">📱 Enable WhatsApp updates</span> - Get instant notifications when your data is removed from databases. Faster than email! You can unsubscribe anytime.
              </label>
            </div>

            <button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className={`glow-button-orange w-full py-4 text-base flex items-center justify-center gap-2 ${otp.length !== 6 || loading ? 'opacity-40 cursor-not-allowed !shadow-none' : ''}`}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
              {loading ? 'Verifying...' : 'Verify & Start Scan'}
            </button>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <button type="button" onClick={() => { setStep('phone'); setOtp(''); setOtpError(''); }} className="hover:text-white transition-colors">
                ← Change number
              </button>
              <button type="button" onClick={handleResend} disabled={resendTimer > 0} className={`hover:text-white transition-colors ${resendTimer > 0 ? 'opacity-40' : ''}`}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 'verifying' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 size={32} className="text-accent-orange animate-spin" />
            <p className="text-sm text-gray-300 font-medium">Phone verified! Starting scan...</p>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: Database, label: '72+ Databases', color: 'text-accent-purple' },
          { icon: AlertTriangle, label: '₹11K Cr Lost in 2026', color: 'text-accent-red' },
          { icon: Shield, label: '256-bit Encrypted', color: 'text-accent-orange' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="glass-card p-3 flex flex-col items-center gap-2 text-center">
            <Icon size={20} className={color} />
            <span className="text-xs text-gray-300 font-medium leading-tight">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Trust: Data Removals Counter */}
      {/* Live Threat Card */}
      <Link to="/live">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-4 relative overflow-hidden cursor-pointer hover:border-accent-red/30 transition-colors"
          style={{ background: 'linear-gradient(135deg, #0E1B2E 0%, #163558 60%, #0E1B2E 100%)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-accent-red" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-red">Live Threat Dashboard</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-red/10 border border-accent-red/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse"></span>
              <span className="text-[9px] font-bold text-accent-red">LIVE</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-accent-red" style={{ fontVariantNumeric: 'tabular-nums' }}>{scamCount.toLocaleString('en-IN')}</div>
              <div className="text-[9px] text-gray-500">Victims today</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400" style={{ fontVariantNumeric: 'tabular-nums' }}>₹{(rupeesLost / 1e7).toFixed(1)} Cr</div>
              <div className="text-[9px] text-gray-500">Lost to fraud</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">48/min</div>
              <div className="text-[9px] text-gray-500">New victims</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-500">
            <span>Tap to view live dashboard</span>
            <ChevronRight size={12} />
          </div>
        </motion.div>
      </Link>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-4"
      >
        <h2 className="text-lg font-bold text-center">How ScamSafe Works</h2>
        <div className="flex flex-col gap-3">
          {[
            { step: '1', title: 'Verify', desc: 'Enter your phone number and verify with OTP — this is your consent to scan', icon: Phone },
            { step: '2', title: 'Scan', desc: 'We scan 72+ Indian data broker databases and show your real exposed data', icon: Search },
            { step: '3', title: 'Remove', desc: 'We submit legal DPDP Act deletion notices to every database and monitor the removal process on your behalf', icon: Shield },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="glass-card p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-accent-orange/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-orange font-bold text-sm">{step}</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security & Encryption */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.43 }}
        className="flex flex-col gap-3"
      >
        <h2 className="text-lg font-bold text-center">Your Security is Our Priority</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Lock, title: '256-bit AES Encryption', desc: 'Your data is encrypted at rest and in transit' },
            { icon: Shield, title: 'DPDP Act Compliant', desc: 'Fully compliant with India\'s data protection law' },
            { icon: ShieldCheck, title: 'Minimal Data Storage', desc: 'Free scan data stays in your browser. Subscriber data encrypted for ongoing protection.' },
            { icon: Phone, title: 'OTP Verified Only', desc: 'Only you can scan and remove your own data' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card p-3 flex flex-col gap-2">
              <Icon size={18} className="text-accent-green" />
              <h3 className="text-xs font-semibold leading-tight">{title}</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Rescan info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-card p-4 flex items-start gap-3"
      >
        <RefreshCw size={18} className="text-accent-purple flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm mb-0.5">Automated Rescans</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Brokers re-acquire data constantly. ScamSafe rescans every 15 days and sends fresh DPDP Act removal notices automatically if your data reappears.</p>
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-2"
      >
        <h2 className="text-lg font-bold text-center mb-1">FAQs</h2>
        {[
          { q: 'Is the scan really free?', a: 'Yes. Enter your phone, verify via OTP, and see which databases have your data — completely free. No card needed. You can scan twice per month (every 15 days).' },
          { q: 'How did my data get leaked?', a: 'Through app sign-ups, property sites, job portals, KYC copies, and data brokers who buy/sell phone databases in bulk.' },
          { q: 'What happens when I remove my data?', a: 'We submit legal DPDP Act deletion notices to each database on your behalf. We then monitor the removal process and update you on progress. Most brokers acknowledge within 7-30 days, but full deletion can take up to 90 days since your data has been circulating for a long time.' },
          { q: 'Why does deletion take up to 90 days?', a: 'Your personal data has been sold and resold across multiple databases over months or years. Each company has its own internal process to locate and delete your records from all their systems. Under DPDP Act 2023, companies are legally required to comply, but the process takes time. We send follow-up notices and escalate to the Data Protection Board if needed.' },
          { q: 'Will my data come back?', a: 'Brokers buy fresh lists regularly. That\'s why ScamSafe rescans every 15 days and re-sends removal notices automatically if your data reappears.' },
          { q: 'Is this legal?', a: 'Yes. We use your rights under DPDP Act 2023 (Sections 12 & 13). Non-compliant brokers face up to ₹250 crore penalty.' },
          { q: 'What is DPDP Act 2023 and why is it important?', a: 'The Digital Personal Data Protection Act, 2023 is India\'s landmark data protection law. It gives every Indian citizen the legal right to: (1) Know which companies hold your personal data, (2) Demand deletion of your data from any company, (3) File complaints with the Data Protection Board if companies refuse. Companies that don\'t comply face penalties up to ₹250 crore. ScamSafe automates this entire process for you — we cite specific sections, set legal deadlines, and follow up until your data is removed.' },
        ].map((faq, idx) => (
          <div key={idx} className="glass-card overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full text-left p-3.5 flex items-center gap-3"
            >
              <span className="text-xs text-gray-300 flex-1 font-medium">{faq.q}</span>
              {openFaq === idx ? <ChevronUp size={14} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />}
            </button>
            <AnimatePresence>
              {openFaq === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3.5 pb-3.5">
                    <p className="text-[11px] text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {/* Trust + Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col items-center gap-4 pb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20">
          <Shield size={14} className="text-accent-green" />
          <span className="text-xs text-accent-green font-medium">100% DPDP Act 2023 Compliant</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <a href="https://www.instagram.com/ssafe2026" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/20 flex items-center justify-center hover:bg-pink-500/25 transition-colors">
            <Instagram size={16} className="text-pink-500" />
          </a>
          <a href="https://youtube.com/@scamsafe" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-red-600/15 border border-red-600/20 flex items-center justify-center hover:bg-red-600/25 transition-colors">
            <Youtube size={16} className="text-red-500" />
          </a>
          <a href="mailto:support@scamsafe.in" className="w-9 h-9 rounded-xl bg-accent-purple/15 border border-accent-purple/20 flex items-center justify-center hover:bg-accent-purple/25 transition-colors">
            <Mail size={16} className="text-accent-purple" />
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-400 font-medium">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span className="text-gray-600">|</span>
          <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          <span className="text-gray-600">|</span>
          <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
          <span className="text-gray-600">|</span>
          <Link to="/transparency" className="hover:text-white transition-colors">Transparency</Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-400 font-medium">
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <span className="text-gray-600">|</span>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          <span className="text-gray-600">|</span>
          <Link to="/blog" className="hover:text-white transition-colors">ScamWatch</Link>
          <span className="text-gray-600">|</span>
          <Link to="/knowledge" className="hover:text-white transition-colors">Knowledge Center</Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-400 font-medium">
          <Link to="/dpdp-act" className="hover:text-white transition-colors">DPDP Act</Link>
          <span className="text-gray-600">|</span>
          <Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
        </div>
        <div className="flex flex-col items-center gap-1 pt-4 border-t border-white/10 w-full">
          <p className="text-[11px] text-gray-500">&copy; 2026 ScamSafe. All rights reserved.</p>
          <p className="text-[12px] text-gray-300 font-medium">PRODIGIOUS DIGITAL SOLUTIONS</p>
          <p className="text-[11px] text-gray-600">Hyderabad, Telangana, India &middot; <a href="mailto:support@scamsafe.in" className="hover:text-gray-400 transition-colors">support@scamsafe.in</a></p>
        </div>
      </motion.div>
    </div>
  );
}
