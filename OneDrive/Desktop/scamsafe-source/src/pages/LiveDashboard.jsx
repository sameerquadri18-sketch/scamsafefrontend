import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   OFFICIAL DATA — MHA / I4C 2024
   ═══════════════════════════════════════════════════════════ */
const ANNUAL_INCIDENTS = 2268000;       // 22.68 lakh
const ANNUAL_LOSSES_CR = 22845;         // ₹22,845 crore
const REPORTED_PER_DAY = 7000;          // I4C 2024
const UNDERREPORTING_FACTOR = 10;       // NCRB consensus: 1 in 10 report
const ACTUAL_PER_DAY = REPORTED_PER_DAY * UNDERREPORTING_FACTOR; // 70,000
const LOSSES_PER_DAY_RS = (ANNUAL_LOSSES_CR * 1e7) / 365;       // in rupees
const SECS_IN_DAY = 86400;

const VICTIMS_PER_SEC = ACTUAL_PER_DAY / SECS_IN_DAY;     // ~0.810
const REPORTED_PER_SEC = REPORTED_PER_DAY / SECS_IN_DAY;  // ~0.081
const RUPEES_PER_SEC = LOSSES_PER_DAY_RS / SECS_IN_DAY;   // ~724

/* ═══════════════════════════════════════════════════════════
   SCAM TYPES — 18 types from I4C / MHA reports
   ═══════════════════════════════════════════════════════════ */
const SCAM_TYPES = [
  { name: 'UPI Fraud', icon: '📱', color: '#EF4444', cities: ['Mumbai', 'Delhi', 'Bengaluru'] },
  { name: 'Digital Arrest', icon: '🚨', color: '#F97316', cities: ['Delhi', 'Noida', 'Gurugram'] },
  { name: 'KYC Phishing', icon: '🪪', color: '#EF4444', cities: ['Bengaluru', 'Chennai', 'Pune'] },
  { name: 'Fake Loan App', icon: '💸', color: '#F59E0B', cities: ['Hyderabad', 'Ahmedabad', 'Surat'] },
  { name: 'Investment Scam', icon: '📈', color: '#F59E0B', cities: ['Pune', 'Mumbai', 'Bengaluru'] },
  { name: 'OTP Fraud', icon: '🔢', color: '#EF4444', cities: ['Chennai', 'Kolkata', 'Jaipur'] },
  { name: 'SIM Swap', icon: '📡', color: '#7C3AED', cities: ['Kolkata', 'Lucknow', 'Kanpur'] },
  { name: 'Aadhaar Misuse', icon: '🆔', color: '#F97316', cities: ['Ahmedabad', 'Bhopal', 'Indore'] },
  { name: 'Fake Job Offer', icon: '💼', color: '#F59E0B', cities: ['Jaipur', 'Patna', 'Ranchi'] },
  { name: 'Bank Impersonation', icon: '🏦', color: '#EF4444', cities: ['Lucknow', 'Varanasi', 'Agra'] },
  { name: 'Fake Courier Fraud', icon: '📦', color: '#F59E0B', cities: ['Surat', 'Baroda', 'Rajkot'] },
  { name: 'Crypto Ponzi', icon: '🪙', color: '#7C3AED', cities: ['Noida', 'Gurgaon', 'Faridabad'] },
  { name: 'Matrimonial Scam', icon: '💍', color: '#F59E0B', cities: ['Bhopal', 'Nagpur', 'Nashik'] },
  { name: 'Tech Support Scam', icon: '💻', color: '#7C3AED', cities: ['Indore', 'Coimbatore', 'Kochi'] },
  { name: 'Dark Web Data Sale', icon: '🌑', color: '#7C3AED', cities: ['Kanpur', 'Meerut', 'Allahabad'] },
  { name: 'PAN Card Fraud', icon: '🃏', color: '#EF4444', cities: ['Nagpur', 'Vizag', 'Vijayawada'] },
  { name: 'Fake Insurance', icon: '📋', color: '#F59E0B', cities: ['Visakhapatnam', 'Mysore', 'Mangalore'] },
  { name: 'WhatsApp Scam', icon: '💬', color: '#10B981', cities: ['Patna', 'Guwahati', 'Bhubaneswar'] },
];

const AMOUNTS = ['₹12,500', '₹45,000', '₹2.3L', '₹8,200', '₹1.1L', '₹67,000', '₹23,400', '₹3.5L', '₹15,000', '₹89,000', '₹4,500', '₹1.8L', '₹56,000', '₹34,200', '₹2.1L'];

const BREAKDOWN = [
  { label: 'UPI / Payment Fraud', pct: 34, color: '#EF4444' },
  { label: 'Identity / KYC Theft', pct: 22, color: '#F97316' },
  { label: 'Investment Scams', pct: 18, color: '#F59E0B' },
  { label: 'Digital Arrest', pct: 12, color: '#7C3AED' },
  { label: 'Loan App Fraud', pct: 9, color: '#10B981' },
  { label: 'Other', pct: 5, color: '#4A4A6A' },
];

const OFFICIAL_2024 = [
  { label: 'Total Incidents 2024', value: '22.68 Lakh', color: '#EF4444' },
  { label: 'Financial Losses 2024', value: '₹22,845 Cr', color: '#F59E0B' },
  { label: 'Cases by Sep 2024', value: '12L+', color: '#F97316' },
  { label: 'Fraudulent SIMs Blocked', value: '9.42 Lakh', color: '#7C3AED' },
  { label: 'Fraud Numbers Blocked', value: '2.75 Lakh', color: '#7C3AED' },
  { label: 'Rise in Losses vs 2023', value: '206%', color: '#EF4444' },
];

/* ═══════════════════════════════════════════════════════════
   UTILITY HELPERS
   ═══════════════════════════════════════════════════════════ */
function getISTNow() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + istOffset);
}

function getSecondsSinceMidnightIST() {
  const ist = getISTNow();
  return ist.getHours() * 3600 + ist.getMinutes() * 60 + ist.getSeconds() + ist.getMilliseconds() / 1000;
}

function formatISTTime(d) {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatIndian(n) {
  const s = Math.floor(n).toString();
  if (s.length <= 3) return s;
  let last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest.length) parts.unshift(rest);
  return parts.join(',') + ',' + last3;
}

function formatRupeesCr(rs) {
  const cr = rs / 1e7;
  if (cr >= 1) return `₹${cr.toFixed(1)} Cr`;
  const lakh = rs / 1e5;
  if (lakh >= 1) return `₹${lakh.toFixed(1)}L`;
  return `₹${formatIndian(rs)}`;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function LiveDashboard() {
  const navigate = useNavigate();
  const [secsSinceMidnight, setSecsSinceMidnight] = useState(getSecondsSinceMidnightIST());
  const [istTime, setIstTime] = useState(getISTNow());
  const [activeTab, setActiveTab] = useState(0);
  const [feedItems, setFeedItems] = useState([]);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const feedTimerRef = useRef(null);
  const feedIdRef = useRef(0);

  // Tick every second
  useEffect(() => {
    const t = setInterval(() => {
      setSecsSinceMidnight(getSecondsSinceMidnightIST());
      setIstTime(getISTNow());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Derived counters
  const actualToday = Math.floor(secsSinceMidnight * VICTIMS_PER_SEC);
  const reportedToday = Math.floor(secsSinceMidnight * REPORTED_PER_SEC);
  const rupeesToday = secsSinceMidnight * RUPEES_PER_SEC;
  const perMinute = Math.round(VICTIMS_PER_SEC * 60);
  const perHour = Math.round(VICTIMS_PER_SEC * 3600);
  const dayPct = Math.min(100, (secsSinceMidnight / SECS_IN_DAY) * 100);

  // Live feed — add incident every 1.8–3s
  const addFeedItem = useCallback(() => {
    const scam = pickRandom(SCAM_TYPES);
    const city = pickRandom(scam.cities);
    const amount = pickRandom(AMOUNTS);
    const secsAgo = Math.floor(Math.random() * 30) + 1;
    feedIdRef.current += 1;
    setFeedItems(prev => {
      const next = [{ id: feedIdRef.current, scam, city, amount, secsAgo, ts: Date.now() }, ...prev];
      return next.slice(0, 20);
    });
  }, []);

  useEffect(() => {
    // Seed initial items
    for (let i = 0; i < 8; i++) addFeedItem();

    const scheduleNext = () => {
      const delay = 1800 + Math.random() * 1200;
      feedTimerRef.current = setTimeout(() => {
        addFeedItem();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(feedTimerRef.current);
  }, [addFeedItem]);

  // Update "time ago" labels
  useEffect(() => {
    const t = setInterval(() => {
      setFeedItems(prev => prev.map(item => ({
        ...item,
        secsAgo: Math.floor((Date.now() - item.ts) / 1000),
      })));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const timeAgoLabel = (s) => {
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  };

  const tabs = [
    { label: '🔴 Live Feed', color: '#EF4444' },
    { label: '📊 Breakdown', color: '#F59E0B' },
    { label: '📅 2024 Data', color: '#7C3AED' },
  ];

  return (
    <div className="min-h-screen bg-[#0C2340] text-[#F1F0FF] font-sans" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* ===== CUSTOM STYLES ===== */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1); opacity: 0.6; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .scanline-overlay {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none; border-radius: inherit;
        }
        .scanline-overlay::after {
          content: ''; position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent);
          animation: scanline 3s linear infinite;
        }
        .live-dot { animation: blink 1s infinite; }
        .glow-red { filter: drop-shadow(0 0 20px rgba(239,68,68,0.5)); }
        .glow-orange { filter: drop-shadow(0 0 12px rgba(244,98,31,0.4)); }
        .feed-row { animation: slideInLeft 0.4s ease; }
        .tabular { font-variant-numeric: tabular-nums; }
      `}</style>

      {/* ═════ SECTION 1: TOP BAR ═════ */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E4A78]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F4621F] to-[#F97316] flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight">ScamSafe</div>
            <div className="text-[9px] uppercase tracking-[0.15em] text-[#9090B8]">Live Threat Dashboard</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] live-dot"></span>
            <span className="text-[10px] font-semibold text-[#EF4444]">LIVE · IST</span>
          </div>
          <span className="text-[11px] font-mono tabular text-[#9090B8]">{formatISTTime(istTime)}</span>
        </div>
      </div>

      <div className="px-3 py-3 flex flex-col gap-3">

        {/* ═════ SECTION 2: HERO COUNTER CARD ═════ */}
        <div className="relative rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #163558 50%, #1a0808 100%)' }}>
          <div className="scanline-overlay"></div>
          <div className="relative z-10 p-4">
            {/* Top row */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" style={{ animation: 'ripple 1.8s infinite' }}></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444]"></span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#EF4444]">Indians Scammed Today</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                {dayPct.toFixed(0)}% of day elapsed
              </span>
            </div>

            {/* Giant counter */}
            <div className="text-center my-3">
              <div className="text-5xl font-extrabold tabular glow-red text-[#EF4444] leading-none">
                {formatIndian(actualToday)}
              </div>
              <p className="text-[10px] text-[#9090B8] mt-1.5">estimated actual victims · resets at midnight IST</p>
            </div>

            {/* Day progress bar */}
            <div className="h-1.5 rounded-full bg-[#1E4A78] mb-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${dayPct}%`, background: 'linear-gradient(90deg, #EF4444, #F59E0B)' }} />
            </div>

            {/* Sub-stat boxes */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#163558] border border-[#1E4A78] p-2 text-center">
                <div className="text-sm font-bold tabular text-[#EF4444]">{formatIndian(reportedToday)}</div>
                <div className="text-[8px] text-[#9090B8] mt-0.5">Reported to cops</div>
              </div>
              <div className="rounded-xl bg-[#163558] border border-[#1E4A78] p-2 text-center">
                <div className="text-sm font-bold tabular text-[#F59E0B]">{formatRupeesCr(rupeesToday)}</div>
                <div className="text-[8px] text-[#9090B8] mt-0.5">Lost to fraud</div>
              </div>
              <div className="rounded-xl bg-[#163558] border border-[#1E4A78] p-2 text-center">
                <div className="text-sm font-bold tabular text-[#7C3AED]">{perMinute}/min</div>
                <div className="text-[8px] text-[#9090B8] mt-0.5">Rate right now</div>
              </div>
            </div>
          </div>
        </div>

        {/* ═════ SECTION 3: SPEED STATS ROW ═════ */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[#163558] border border-[#1E4A78] p-2.5 text-center">
            <div className="text-lg font-bold text-[#EF4444]">Every 1.2s</div>
            <div className="text-[9px] text-[#9090B8]">1 new victim</div>
          </div>
          <div className="rounded-xl bg-[#163558] border border-[#1E4A78] p-2.5 text-center">
            <div className="text-lg font-bold tabular text-[#F59E0B]">{formatIndian(perHour)}</div>
            <div className="text-[9px] text-[#9090B8]">per hour</div>
          </div>
          <div className="rounded-xl bg-[#163558] border border-[#1E4A78] p-2.5 text-center">
            <div className="text-lg font-bold tabular text-[#7C3AED]">{perMinute}</div>
            <div className="text-[9px] text-[#9090B8]">per minute</div>
          </div>
        </div>

        {/* ═════ SECTION 4: TABS ═════ */}
        <div className="flex gap-1.5">
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-semibold transition-all ${
                activeTab === i
                  ? 'border-2 text-white'
                  : 'bg-[#163558] border border-[#1E4A78] text-[#9090B8]'
              }`}
              style={activeTab === i ? { borderColor: tab.color, background: `${tab.color}15`, color: tab.color } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

            {/* ═════ TAB 1: LIVE FEED ═════ */}
            {activeTab === 0 && (
              <div className="rounded-2xl bg-[#163558] border border-[#1E4A78] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E4A78]">
                  <span className="text-[10px] uppercase tracking-wider text-[#9090B8] font-semibold">Live Incidents — India</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EF4444]/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] live-dot"></span>
                    <span className="text-[9px] font-bold text-[#EF4444]">LIVE</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between border-b border-[#1E4A78]/50">
                  <span className="text-[9px] text-[#4A4A6A]">Type · City</span>
                  <span className="text-[9px] text-[#4A4A6A]">Amount · Time ago</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {feedItems.map((item) => (
                    <div key={item.id} className="feed-row flex items-center justify-between px-3 py-2 border-b border-[#1E4A78]/30"
                      style={{ borderLeft: `3px solid ${item.scam.color}` }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm flex-shrink-0">{item.scam.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{item.scam.name}</div>
                          <div className="text-[9px] text-[#4A4A6A]">{item.city}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-xs font-bold tabular" style={{ color: item.scam.color }}>{item.amount}</div>
                        <div className="text-[9px] text-[#4A4A6A]">{timeAgoLabel(item.secsAgo)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-[#1E4A78]">
                  <p className="text-[8px] text-[#4A4A6A] leading-relaxed">
                    Based on real scam types and rates reported by I4C and MHA 2024. Updated every ~2 seconds.
                  </p>
                </div>
              </div>
            )}

            {/* ═════ TAB 2: BREAKDOWN ═════ */}
            {activeTab === 1 && (
              <div className="flex flex-col gap-3">
                {/* Bar chart */}
                <div className="rounded-2xl bg-[#163558] border border-[#1E4A78] p-4">
                  <h3 className="text-[10px] uppercase tracking-wider text-[#9090B8] font-semibold mb-3">
                    Scam Type Breakdown · 2024
                  </h3>
                  <div className="flex flex-col gap-3">
                    {BREAKDOWN.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#F1F0FF]">{item.label}</span>
                          <span className="text-xs font-bold tabular" style={{ color: item.color }}>{item.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#1E4A78] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live victim count by type */}
                <div className="rounded-2xl bg-[#163558] border border-[#1E4A78] p-4">
                  <h3 className="text-[10px] uppercase tracking-wider text-[#9090B8] font-semibold mb-3">
                    Estimated Victims Today by Type
                  </h3>
                  <div className="flex flex-col gap-2">
                    {BREAKDOWN.map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-[#1E4A78]/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-xs">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold tabular" style={{ color: item.color }}>
                          {formatIndian(Math.floor(actualToday * item.pct / 100))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Broker Connection */}
                <div className="rounded-2xl bg-[#163558] border border-[#7C3AED]/20 p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🔗</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#7C3AED] mb-1">The Data Broker Connection</h4>
                      <p className="text-[11px] text-[#9090B8] leading-relaxed">
                        Every scam above starts with a phone number purchased from an Indian data broker for <span className="text-[#F59E0B] font-semibold">₹0.07 per contact</span>.
                        ScamSafe removes your data from <span className="text-white font-semibold">72+ such sources</span> so your number is never in the dataset scammers buy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═════ TAB 3: 2024 DATA ═════ */}
            {activeTab === 2 && (
              <div className="flex flex-col gap-3">
                {/* Official figures */}
                <div className="rounded-2xl bg-[#163558] border border-[#1E4A78] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#1E4A78]">
                    <h3 className="text-[10px] uppercase tracking-wider text-[#9090B8] font-semibold">
                      Official 2024 Data — MHA / I4C
                    </h3>
                  </div>
                  {OFFICIAL_2024.map((row, i) => (
                    <div key={row.label}
                      className={`flex items-center justify-between px-4 py-3 ${i < OFFICIAL_2024.length - 1 ? 'border-b border-[#1E4A78]/50' : ''}`}>
                      <span className="text-xs text-[#9090B8]">{row.label}</span>
                      <span className="text-sm font-bold tabular" style={{ color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                  {/* Avg loss per case */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E4A78]/50">
                    <span className="text-xs text-[#9090B8]">Avg loss per reported case</span>
                    <span className="text-sm font-bold tabular text-[#F59E0B]">~₹1.96L</span>
                  </div>
                </div>

                {/* Methodology collapsible */}
                <div className="rounded-2xl bg-[#163558] border border-[#1E4A78] overflow-hidden">
                  <button onClick={() => setMethodologyOpen(!methodologyOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left">
                    <span className="text-xs font-semibold text-[#9090B8]">How is this calculated?</span>
                    {methodologyOpen ? <ChevronUp size={14} className="text-[#9090B8]" /> : <ChevronDown size={14} className="text-[#9090B8]" />}
                  </button>
                  <AnimatePresence>
                    {methodologyOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }} className="overflow-hidden">
                        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-[#1E4A78]">
                          <div className="pt-3">
                            <h4 className="text-[10px] font-bold text-[#F59E0B] uppercase mb-1">Per-Second Rate Formula</h4>
                            <p className="text-[10px] text-[#9090B8] leading-relaxed font-mono">
                              Actual victims/sec = 70,000 ÷ 86,400 = 0.810/s<br />
                              Reported/sec = 7,000 ÷ 86,400 = 0.081/s<br />
                              ₹ lost/sec = ₹22,845 Cr ÷ 365 ÷ 86,400 = ₹724/s
                            </p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-[#7C3AED] uppercase mb-1">1-in-10 Reporting Estimate</h4>
                            <p className="text-[10px] text-[#9090B8] leading-relaxed">
                              NCRB and cybersecurity researchers estimate only 1 in 10 cybercrime victims in India files a complaint.
                              I4C reports ~7,000 complaints per day. Therefore estimated actual victims = 70,000 per day.
                            </p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-[#EF4444] uppercase mb-1">Midnight IST Reset</h4>
                            <p className="text-[10px] text-[#9090B8] leading-relaxed">
                              Counter calculates seconds elapsed since midnight IST (UTC+5:30) × per-second rate.
                              Naturally resets to near-zero at 00:00 IST each day.
                            </p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-[#10B981] uppercase mb-1">Sources</h4>
                            <ul className="text-[10px] text-[#9090B8] leading-relaxed list-disc list-inside">
                              <li><a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] underline">I4C (cybercrime.gov.in)</a> — Annual Report 2024</li>
                              <li><a href="https://www.mha.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] underline">MHA (mha.gov.in)</a> — Parliamentary Response, Dec 2024</li>
                              <li><a href="https://ncrb.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] underline">NCRB (ncrb.gov.in)</a> — Crime in India Report</li>
                              <li><a href="https://pib.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] underline">PIB (pib.gov.in)</a> — Official Press Releases</li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ═════ BOTTOM CTA ═════ */}
        <div className="rounded-2xl overflow-hidden mt-1"
          style={{ background: 'linear-gradient(135deg, #1a0f08 0%, #163558 50%, #0f0a1a 100%)' }}>
          <div className="p-4 text-center">
            <h3 className="text-base font-bold mb-1.5">Don't become tomorrow's statistic</h3>
            <p className="text-[11px] text-[#9090B8] leading-relaxed mb-3">
              Your phone number is already in scammer databases. ScamSafe removes it from <span className="text-white font-semibold">72+ sources</span> automatically every month.
            </p>
            <button onClick={() => navigate('/')}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all glow-orange"
              style={{ background: 'linear-gradient(135deg, #F4621F, #F97316)' }}>
              Scan Free → scamsafe.in
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ═════ FOOTER ═════ */}
        <div className="text-center py-3">
          <p className="text-[8px] text-[#4A4A6A] leading-relaxed">
            Counter = official per-second rate × seconds since midnight IST<br />
            Sources: MHA (mha.gov.in) · I4C (cybercrime.gov.in) · NCRB (ncrb.gov.in) · PIB (pib.gov.in)
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-[8px] text-[#4A4A6A]">
            <span>scamsafe.in</span>
            <span>·</span>
            <span>DPDP Act 2023</span>
            <span>·</span>
            <span>AES-256</span>
            <span>·</span>
            <span>India 🇮🇳</span>
          </div>
        </div>

      </div>
    </div>
  );
}
