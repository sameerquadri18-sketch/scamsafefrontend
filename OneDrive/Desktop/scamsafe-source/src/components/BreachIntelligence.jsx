import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, Globe, Calendar, Users, Lock } from 'lucide-react';
import { getBreachIntelligence } from '../utils/api';

const RISK_COLORS = {
  HIGH: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' },
  MEDIUM: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-500' },
  LOW: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-500' },
};

function formatCount(n) {
  if (!n) return '—';
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)} cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)} lakh`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

export default function BreachIntelligence({ phone, email }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!phone) return;
    let cancelled = false;
    setLoading(true);
    getBreachIntelligence(phone, email).then(res => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) { setError('Failed to load'); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [phone, email]);

  if (loading) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={16} className="text-red-400" />
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Scanning Breach Databases...</span>
        </div>
        <div className="h-4 bg-dark-border rounded w-3/4 mb-2" />
        <div className="h-3 bg-dark-border rounded w-1/2" />
      </div>
    );
  }

  if (!data || error || !data.scan_complete) return null;

  const hibp = data.hibp || {};
  const breaches = hibp.breaches || [];
  const totalBreaches = data.total_breaches || 0;
  const indianCount = hibp.indian_breach_count || 0;

  if (totalBreaches === 0 && breaches.length === 0) {
    return (
      <div className="glass-card p-4 border-green-500/20">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-green-400" />
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Breach Intelligence</span>
        </div>
        <p className="text-sm text-gray-400 mt-2">No known data breaches found for your email.</p>
      </div>
    );
  }

  const displayBreaches = expanded ? breaches : breaches.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 border-red-500/20"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-red-400" />
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Data Breach Intelligence</span>
        </div>
        <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
          {totalBreaches} breach{totalBreaches !== 1 ? 'es' : ''}
        </span>
      </div>

      <p className="text-sm text-gray-300 mb-3">
        Your data was found in <span className="text-white font-semibold">{totalBreaches} known data breach{totalBreaches !== 1 ? 'es' : ''}</span>
        {indianCount > 0 && <>, including <span className="text-red-400 font-semibold">{indianCount} Indian company breach{indianCount !== 1 ? 'es' : ''}</span></>}
      </p>

      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {displayBreaches.map((b, i) => {
            const rc = RISK_COLORS[b.risk] || RISK_COLORS.MEDIUM;
            return (
              <motion.div
                key={b.name}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`${rc.bg} ${rc.border} border rounded-lg p-3`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${rc.dot}`} />
                  <span className="text-sm font-semibold text-white">{b.name}</span>
                  {b.breach_date && (
                    <span className="text-[10px] text-gray-500 ml-auto flex items-center gap-1">
                      <Calendar size={10} /> {b.breach_date}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {b.pwn_count > 0 && (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Users size={10} /> {formatCount(b.pwn_count)} records
                    </span>
                  )}
                  {b.domain && (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Globe size={10} /> {b.domain}
                    </span>
                  )}
                </div>
                {b.data_classes && b.data_classes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 ml-4">
                    {b.data_classes.slice(0, 5).map(dc => (
                      <span key={dc} className="text-[9px] px-1.5 py-0.5 rounded bg-dark-bg text-gray-400">{dc}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {breaches.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1 transition-colors"
        >
          {expanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show all {breaches.length} breaches</>}
        </button>
      )}

      {/* Dehashed / LeakCheck summary */}
      {(data.dehashed?.found || data.leakcheck_phone?.found) && (
        <div className="mt-3 pt-3 border-t border-dark-border">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Dark Web & Leaked Databases</p>
          <div className="flex gap-3">
            {data.dehashed?.found && (
              <span className="text-xs text-amber-400">
                <AlertTriangle size={12} className="inline mr-1" />
                {data.dehashed.result_count} leaked database{data.dehashed.result_count !== 1 ? 's' : ''}
              </span>
            )}
            {data.leakcheck_phone?.found && (
              <span className="text-xs text-amber-400">
                <AlertTriangle size={12} className="inline mr-1" />
                {data.leakcheck_phone.source_count} dark web source{data.leakcheck_phone.source_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
