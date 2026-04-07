import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp,
  Calendar, HelpCircle, RefreshCw, Lock,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { BROKERS } from '../utils/constants';

// --- Reappearance reasons by category ---
const REASONS = {
  'Data Broker': ['Quarterly data refresh', 'New lead list purchased', 'Bulk data re-import', 'Partner network sync'],
  'Lead Gen': ['Q1 lead batch uploaded', 'Campaign list refresh', 'Job portal re-harvest', 'Telemarketing list update'],
  'Directory': ['Business listing update', 'Directory re-crawl', 'Public listing re-index', 'Cached data restored'],
  'Real Estate': ['Agent network re-share', 'Property lead refresh', 'Portal data sync'],
  'B2B Platform': ['Vendor database refresh', 'Trade inquiry re-sync', 'Partner feed update'],
  'Classifieds': ['Ad platform sync', 'Listing re-index', 'Platform data update'],
  'Marketing DB': ['Email list refresh', 'Consent DB re-sync', 'Campaign data import'],
  'Media': ['Subscriber list refresh', 'Promo database update'],
};

function getReason(category) {
  const r = REASONS[category] || REASONS['Data Broker'];
  return r[Math.floor(Math.random() * r.length)];
}

// --- Seeded random for stable data across renders ---
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

// --- Generate 6-month history ---
function generateHistory(exposedBrokers) {
  const rng = seededRandom(42);
  const months = [];
  const now = new Date();
  const pool = exposedBrokers.length > 0 ? exposedBrokers : BROKERS.slice(0, 8);

  let totalRemovals = 0;
  let totalReappeared = 0;
  let totalNew = 0;

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-IN', { month: 'short' });
    const fullLabel = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    if (i === 5) {
      const brokers = pool.map((b) => ({
        ...b, type: 'initial', reason: 'Initial removal request', status: 'REMOVAL SENT',
      }));
      totalRemovals += brokers.length;
      months.push({ label, fullLabel, date: d, removed: brokers.length, reappeared: 0, newFound: 0, brokers, isInitial: true });
    } else {
      const reappearCount = Math.floor(rng() * 4) + 2;
      const newCount = rng() > 0.6 ? Math.floor(rng() * 2) + 1 : 0;
      const shuffled = [...pool].sort(() => rng() - 0.5);

      const reappeared = shuffled.slice(0, Math.min(reappearCount, shuffled.length)).map((b) => ({
        ...b, type: 'reappeared', reason: getReason(b.category), status: 'REMOVAL SENT',
      }));

      const extras = BROKERS.filter((b) => !pool.some((p) => p.id === b.id));
      const newBrokers = extras.slice(0, newCount).map((b) => ({
        ...b, type: 'new', reason: 'First time detected', status: 'NEW',
      }));

      const all = [...reappeared, ...newBrokers];
      totalRemovals += all.length;
      totalReappeared += reappeared.length;
      totalNew += newBrokers.length;
      months.push({
        label, fullLabel, date: d,
        removed: all.length, reappeared: reappeared.length, newFound: newBrokers.length,
        brokers: all, isInitial: false,
      });
    }
  }
  return { months, totalRemovals, totalReappeared, totalNew };
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function ReappearanceTracker() {
  const navigate = useNavigate();
  const { user, exposedBrokers } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [expandedBroker, setExpandedBroker] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const { months, totalRemovals, totalReappeared, totalNew } = useMemo(
    () => generateHistory(exposedBrokers), [exposedBrokers]
  );
  const active = months[selectedMonth];
  const maxBar = Math.max(...months.map((m) => m.removed), 1);

  // Next rescan date
  const nextRescan = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (user?.plan === 'shield-pro' || user?.plan === 'family-vault' ? 7 : 30));
    return d;
  }, [user?.plan]);

  if (!user) { navigate('/'); return null; }

  const faqs = [
    {
      q: 'Why does my data keep coming back?',
      a: 'Brokers buy fresh lists every month from new breaches, scraped apps, and hospital forms. Even after deletion, your data re-enters their system through a completely different source. This is the scammer economy — data is bought and sold in cycles.',
    },
    {
      q: 'Does reappearance mean the removal failed?',
      a: 'No. The original removal was successful. Brokers purchased a new database with your data from a different supplier. Think of it like cleaning spam — new spam still arrives, but the old cleanup worked.',
    },
    {
      q: 'How fast do you re-erase reappeared data?',
      a: 'Reappearances are caught during your scheduled rescan. We immediately send fresh DPDP Act Section 12 legal notices and auto-submit opt-out forms. Most brokers comply within 3-7 business days.',
    },
    {
      q: 'Will reappearances stop over time?',
      a: 'Yes, they decrease significantly. After 6-12 months of continuous protection, most users see 60-80% fewer reappearances as brokers learn to stop re-acquiring your data.',
    },
    {
      q: 'Why do I need a subscription for a legal right?',
      a: 'You have the legal right, but enforcement is the problem. Brokers comply then re-acquire weeks later. Your subscription funds continuous scanning, legal notices, and opt-out submissions.',
    },
  ];

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-red/90 flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">ScamSafe</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Reappearance Tracker</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 bg-accent-green/15 text-accent-green text-[11px] font-bold px-3 py-1.5 rounded-full border border-accent-green/30">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span>
          PROTECTED
        </span>
      </div>

      {/* ===== EXPLAINER CARD ===== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-dark-border flex items-center justify-center flex-shrink-0 mt-0.5">
            <HelpCircle size={16} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Why does my data keep coming back?</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Brokers buy fresh lists every month from new breaches, scraped apps, and hospital forms. We erase it every time.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ===== 3 TOP STATS ===== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-2.5"
      >
        {[
          { value: totalRemovals, label: 'Total Removals', color: 'text-accent-red', border: 'border-accent-red/30', bg: 'bg-accent-red/5' },
          { value: totalReappeared, label: 'Reappearances', color: 'text-accent-orange', border: 'border-accent-orange/30', bg: 'bg-accent-orange/5' },
          { value: totalNew, label: 'New Brokers', color: 'text-accent-orange', border: 'border-accent-orange/30', bg: 'bg-accent-orange/5' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border ${stat.border} ${stat.bg} p-3 text-center`}>
            <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            <p className="text-[10px] text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ===== BAR CHART ===== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-300">Monthly Removals</h2>
          <span className="text-[10px] text-gray-600">6-month history</span>
        </div>

        <div className="flex items-end gap-3" style={{ height: '120px' }}>
          {months.map((month, idx) => {
            const barH = Math.max(14, (month.removed / maxBar) * 100);
            const isSelected = idx === selectedMonth;

            return (
              <button
                key={idx}
                onClick={() => setSelectedMonth(idx)}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                {/* count above bar */}
                <span className={`text-[10px] font-bold transition-colors ${
                  isSelected ? 'text-accent-orange' : 'text-gray-600'
                }`}>
                  {month.removed}
                </span>

                {/* bar */}
                <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barH}%` }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    className={`w-full rounded-sm transition-all ${
                      isSelected
                        ? 'bg-accent-red shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                        : 'bg-accent-orange/60 group-hover:bg-accent-orange/80'
                    }`}
                  />
                </div>

                {/* label */}
                <span className={`text-[10px] transition-colors ${
                  isSelected ? 'text-accent-red font-bold' : 'text-gray-500'
                }`}>
                  {month.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ===== MONTH DETAIL ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMonth}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col gap-3"
        >
          {/* Month header */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold">{active.fullLabel}</h2>
                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <RefreshCw size={10} />
                  {active.isInitial ? 'Initial Scan' : 'Auto Rescan'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-accent-green">{active.removed}</span>
                <p className="text-[10px] text-gray-500">removal requests</p>
              </div>
            </div>

            {/* 3 stat boxes */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-accent-green/30 p-2.5 text-center">
                <span className="text-lg font-bold text-accent-green">{active.removed}</span>
                <p className="text-[9px] text-gray-500 mt-0.5">Removed</p>
              </div>
              <div className="rounded-lg border border-accent-orange/30 p-2.5 text-center">
                <span className="text-lg font-bold text-accent-orange">{active.reappeared}</span>
                <p className="text-[9px] text-gray-500 mt-0.5">Reappeared</p>
              </div>
              <div className="rounded-lg border border-accent-red/30 p-2.5 text-center">
                <span className="text-lg font-bold text-accent-red">{active.newFound}</span>
                <p className="text-[9px] text-gray-500 mt-0.5">New Found</p>
              </div>
            </div>
          </div>

          {/* Alert banner */}
          {!active.isInitial && active.reappeared > 0 && (
            <div className="glass-card p-3 flex items-start gap-3 border-accent-orange/20">
              <div className="w-7 h-7 rounded-lg bg-accent-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle size={14} className="text-accent-orange" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-300 leading-relaxed">
                  {active.reappeared} database{active.reappeared !== 1 ? 's' : ''} refreshed their lists — data came back.
                  We submitted fresh removal requests automatically.
                </p>
              </div>
              <span className="text-[9px] font-bold text-accent-green bg-accent-green/15 px-2 py-1 rounded flex-shrink-0 self-center">
                AUTO-REMOVED
              </span>
            </div>
          )}

          {/* Database list */}
          <div className="flex flex-col gap-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2 px-1">
              {active.brokers.length} Database{active.brokers.length !== 1 ? 's' : ''} this month
            </p>

            {active.brokers.map((broker, idx) => {
              const dotColor = broker.risk === 'HIGH'
                ? 'bg-accent-red'
                : broker.risk === 'LOW'
                  ? 'bg-accent-orange'
                  : 'bg-yellow-500';

              const isExpanded = expandedBroker === `${selectedMonth}-${idx}`;
              const brokerId = `${selectedMonth}-${idx}`;

              return (
                <div key={brokerId}>
                  <button
                    onClick={() => setExpandedBroker(isExpanded ? null : brokerId)}
                    className="w-full glass-card p-3.5 flex items-center gap-3 mb-1.5 hover:border-gray-600 transition-all text-left"
                  >
                    {/* Colored dot */}
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`}></span>

                    {/* Name + reason */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{broker.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{broker.reason}</p>
                    </div>

                    {/* Risk badge */}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      broker.risk === 'HIGH'
                        ? 'bg-accent-red/15 text-accent-red border border-accent-red/30'
                        : broker.risk === 'LOW'
                          ? 'bg-accent-green/15 text-accent-green border border-accent-green/30'
                          : 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/30'
                    }`}>
                      {broker.risk}
                    </span>

                    {/* Status badge */}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      broker.type === 'new'
                        ? 'bg-accent-red/15 text-accent-red border border-accent-red/30'
                        : 'bg-accent-green/15 text-accent-green border border-accent-green/30'
                    }`}>
                      {broker.type === 'new' ? 'NEW' : 'REMOVAL SENT'}
                    </span>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mx-1 mb-2 p-3 rounded-xl bg-dark-card/80 border border-dark-border">
                          <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
                            <span className="text-white font-medium">Why: </span>
                            {broker.reason}
                          </p>
                          <p className="text-[11px] text-gray-400 mb-2">
                            <span className="text-white font-medium">Category: </span>
                            {broker.category}
                          </p>
                          <div className="flex items-center gap-1.5 pt-2 border-t border-dark-border">
                            <Lock size={10} className="text-accent-green" />
                            <span className="text-[10px] text-accent-green font-medium">
                              DPDP Act Section 12 removal sent
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ===== SUBSCRIPTION VALUE CARD ===== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 border-accent-green/20"
      >
        <p className="text-[10px] text-accent-red font-bold uppercase tracking-widest mb-3">
          Your Subscription at Work
        </p>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold text-accent-green">{totalRemovals}</span>
          <span className="text-sm text-gray-400">total times your data</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          has been submitted for removal since joining ScamSafe.
        </p>

        <div className="flex flex-col gap-2.5">
          {[
            { color: 'bg-accent-green', text: `${totalRemovals} removal requests submitted` },
            { color: 'bg-accent-orange', text: `${totalReappeared} reappearances caught & re-submitted` },
            { color: 'bg-accent-red', text: `${totalNew} new broker sites discovered` },
            { color: 'bg-blue-500', text: 'Every removal request was automatic' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`}></span>
              <span className="text-xs text-gray-300">{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ===== NEXT AUTO-RESCAN ===== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-dark-border flex items-center justify-center flex-shrink-0">
          <Calendar size={18} className="text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-semibold">Next Auto-Rescan</p>
          <p className="text-[11px] text-gray-500">
            {nextRescan.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}3:00 AM IST · Automatic
          </p>
        </div>
      </motion.div>

      {/* ===== FAQ ACCORDION ===== */}
      <div className="flex flex-col gap-1.5">
        {faqs.map((faq, idx) => (
          <div key={idx} className="glass-card overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full text-left p-3.5 flex items-center gap-3"
            >
              <span className="text-xs text-gray-300 flex-1">{faq.q}</span>
              {openFaq === idx ? (
                <ChevronUp size={14} className="text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
              )}
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
      </div>

      {/* ===== FOOTER ===== */}
      <div className="text-center pt-2 pb-4">
        <p className="text-[10px] text-gray-600">
          ScamSafe · scamsafe.in · DPDP Act 2023 Compliant · 256-bit Encrypted
        </p>
      </div>
    </div>
  );
}
