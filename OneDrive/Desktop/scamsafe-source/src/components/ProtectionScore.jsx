import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, RefreshCw, AlertTriangle, CheckCircle2, Clock, Shield } from 'lucide-react';
import { getProtectionScore } from '../utils/api';

const COLORS = {
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  blue: '#3B82F6',
  purple: '#8B5CF6',
};

function getScoreColor(score) {
  if (score >= 70) return COLORS.green;
  if (score >= 50) return COLORS.amber;
  return COLORS.red;
}

function CircularGauge({ score, size = 160, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);
  const color = getScoreColor(score);

  useEffect(() => {
    const timer = setTimeout(() => {
      const pct = Math.min(score, 100) / 100;
      setOffset(circumference - pct * circumference);
    }, 200);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out, stroke 0.5s ease' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-gray-500 font-medium mt-0.5">out of 100</span>
      </div>
    </div>
  );
}

export default function ProtectionScore({ phone }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const fetchScore = async () => {
    if (!phone) { setLoading(false); return; }
    setLoading(true);
    const result = await getProtectionScore(phone);
    if (mounted.current) {
      setData(result);
      setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    fetchScore();
    return () => { mounted.current = false; };
  }, [phone]);

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full border-2 border-accent-purple/30 border-t-accent-purple animate-spin" />
          <span className="text-xs text-gray-500">Calculating protection score...</span>
        </div>
      </div>
    );
  }

  // Fallback data when backend has no history yet
  const score = data?.score ?? 0;
  const label = data?.label ?? 'SCANNING';
  const totalRemoved = data?.total_removed ?? 0;
  const reappearances = data?.reappearances_caught ?? 0;
  const activeExposures = data?.active_exposures ?? 0;
  const daysClean = data?.days_clean ?? 0;
  const nextRescan = data?.next_rescan_in_days ?? 12;
  const withoutScamsafe = data?.without_scamsafe_count ?? 0;
  const color = getScoreColor(score);

  const LabelIcon = score >= 70 ? ShieldCheck : score >= 50 ? Shield : ShieldAlert;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
    >
      {/* Gauge card */}
      <div className="glass-card p-6 flex flex-col items-center gap-3 text-center"
        style={{ boxShadow: `0 0 30px ${color}15` }}>
        <div className="flex items-center gap-1.5 mb-1">
          <LabelIcon size={16} style={{ color }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
        </div>
        <CircularGauge score={score} />
        <p className="text-[11px] text-gray-500 mt-1">Your Protection Score</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="glass-card p-3.5 flex flex-col items-center gap-1">
          <CheckCircle2 size={18} className="text-accent-green" />
          <span className="text-lg font-extrabold text-white">{totalRemoved}</span>
          <span className="text-[10px] text-gray-500">Requests Sent</span>
        </div>
        <div className="glass-card p-3.5 flex flex-col items-center gap-1">
          <RefreshCw size={18} className="text-amber-400" />
          <span className="text-lg font-extrabold text-white">{reappearances}</span>
          <span className="text-[10px] text-gray-500">Reappearances Caught</span>
        </div>
        <div className="glass-card p-3.5 flex flex-col items-center gap-1">
          <AlertTriangle size={18} className={activeExposures > 0 ? 'text-accent-red' : 'text-accent-green'} />
          <span className="text-lg font-extrabold text-white">{activeExposures}</span>
          <span className="text-[10px] text-gray-500">Active Exposures</span>
        </div>
        <div className="glass-card p-3.5 flex flex-col items-center gap-1">
          <Clock size={18} className="text-blue-400" />
          <span className="text-lg font-extrabold text-white">{daysClean}</span>
          <span className="text-[10px] text-gray-500">Days Clean</span>
        </div>
      </div>

      {/* Next rescan */}
      <div className="glass-card p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent-purple/15 flex items-center justify-center flex-shrink-0">
          <RefreshCw size={16} className="text-accent-purple" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium">Next automatic rescan</p>
          <div className="w-full bg-dark-border rounded-full h-1.5 mt-1.5">
            <div
              className="h-1.5 rounded-full bg-accent-purple transition-all"
              style={{ width: `${Math.max(5, ((12 - nextRescan) / 12) * 100)}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-gray-500 font-medium flex-shrink-0">{nextRescan}d</span>
      </div>

      {/* Without ScamSafe message */}
      {withoutScamsafe > 0 && (
        <div className="glass-card p-4 border-accent-orange/25 text-center"
          style={{ boxShadow: '0 0 20px rgba(244, 98, 31, 0.08)' }}>
          <p className="text-xs text-gray-400 leading-relaxed">
            Without ScamSafe, <strong className="text-accent-orange text-sm font-extrabold">{withoutScamsafe} records</strong> would
            still be live and available to scammers.
          </p>
        </div>
      )}

      {/* Active exposure warning */}
      {activeExposures > 0 && (
        <div className="glass-card p-3 border-accent-red/25 flex items-center gap-2.5"
          style={{ boxShadow: '0 0 15px rgba(239, 68, 68, 0.08)' }}>
          <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse flex-shrink-0" />
          <p className="text-[11px] text-accent-red font-medium">
            Your data is currently exposed in {activeExposures} database{activeExposures > 1 ? 's' : ''}. Removal in progress.
          </p>
        </div>
      )}
    </motion.div>
  );
}
