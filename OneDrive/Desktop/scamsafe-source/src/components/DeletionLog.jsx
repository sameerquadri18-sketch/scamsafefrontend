import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Clock } from 'lucide-react';
import { getDeletionLog } from '../utils/api';

const STATUS_CONFIG = {
  removed:    { emoji: '✅', color: 'text-accent-green',  bg: 'bg-accent-green/15', label: 'REQUESTED FOR DELETION' },
  pending:    { emoji: '⏳', color: 'text-amber-400',     bg: 'bg-amber-400/15',    label: 'SUBMITTED' },
  removing:   { emoji: '🔄', color: 'text-blue-400',      bg: 'bg-blue-400/15',     label: 'PROCESSING',  spin: true },
  scanning:   { emoji: '🔍', color: 'text-blue-400',      bg: 'bg-blue-400/15',     label: 'SCANNING' },
  failed:     { emoji: '❌', color: 'text-accent-red',    bg: 'bg-accent-red/15',   label: 'NO RESPONSE' },
  reappeared: { emoji: '🚨', color: 'text-accent-red',    bg: 'bg-accent-red/15',   label: 'REAPPEARED', pulse: true },
};

function formatTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + '  ' +
           d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function TimeAgo({ since }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [since]);
  if (seconds < 60) return <span>{seconds}s ago</span>;
  return <span>{Math.floor(seconds / 60)}m ago</span>;
}

export default function DeletionLog({ phone }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(Date.now());
  const intervalRef = useRef(null);

  const fetchLog = async () => {
    if (!phone) return;
    const data = await getDeletionLog(phone);
    setRecords(data?.records || []);
    setLastFetch(Date.now());
    setLoading(false);
  };

  useEffect(() => {
    fetchLog();
    intervalRef.current = setInterval(fetchLog, 30000);
    return () => clearInterval(intervalRef.current);
  }, [phone]);

  const handleRefresh = () => {
    setLoading(true);
    fetchLog();
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-3.5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-dark-border/50" />
              <div className="flex-1">
                <div className="h-3 w-28 bg-dark-border/50 rounded mb-2" />
                <div className="h-2 w-20 bg-dark-border/30 rounded" />
              </div>
              <div className="h-5 w-16 bg-dark-border/40 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-sm text-gray-500">No deletion records yet. Complete a scan and start removal to see your log.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-1">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-gray-600" />
          <span className="text-[10px] text-gray-600">
            Updated <TimeAgo since={lastFetch} />
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 text-[10px] text-accent-purple font-medium hover:text-accent-purple/80 transition-colors"
        >
          <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Records */}
      <AnimatePresence>
        {records.map((rec, idx) => {
          const cfg = STATUS_CONFIG[rec.status] || STATUS_CONFIG.pending;
          return (
            <motion.div
              key={rec.broker_name + rec.removal_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.3 }}
              className={`glass-card p-3 flex items-center gap-3 ${cfg.pulse ? 'border-accent-red/30' : ''}`}
            >
              {/* Status emoji */}
              <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 ${cfg.spin ? 'animate-spin-slow' : ''} ${cfg.pulse ? 'animate-pulse' : ''}`}>
                <span className="text-sm">{cfg.emoji}</span>
              </div>

              {/* Broker info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{rec.broker_name}</p>
                <p className="text-[10px] text-gray-600 truncate">{rec.domain || rec.category}</p>
                {rec.status === 'pending' && rec.days_elapsed < 7 && (
                  <p className="text-[9px] text-amber-400/80 mt-0.5">
                    7-day compliance window — {7 - rec.days_elapsed}d remaining
                  </p>
                )}
                {rec.status === 'reappeared' && (
                  <p className="text-[9px] text-accent-red mt-0.5">
                    Data reappeared — removal re-requested
                  </p>
                )}
                {rec.status === 'failed' && (
                  <p className="text-[9px] text-accent-red/80 mt-0.5">
                    2nd notice sent — escalation available
                  </p>
                )}
              </div>

              {/* Status + time */}
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className={`text-[9px] font-bold uppercase tracking-wide ${cfg.color}`}>
                  {cfg.label}
                </span>
                <span className="text-[9px] text-gray-600">
                  {formatTime(rec.updated_at)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
