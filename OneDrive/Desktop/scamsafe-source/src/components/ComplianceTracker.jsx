import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, Scale } from 'lucide-react';
import { getComplianceTimeline } from '../utils/api';

const STATUS_ICON = {
  completed: <CheckCircle2 size={14} className="text-accent-green" />,
  current: <div className="w-3.5 h-3.5 rounded-full border-2 border-accent-orange bg-accent-orange/20 animate-pulse" />,
  upcoming: <Circle size={14} className="text-gray-700" />,
};

export default function ComplianceTracker({ phone }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!phone) return;
    (async () => {
      const res = await getComplianceTimeline(phone);
      setData(res);
      setLoading(false);
    })();
  }, [phone]);

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center">
        <Loader2 size={18} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (!data?.started) {
    return (
      <div className="glass-card p-5 text-center">
        <Scale size={24} className="text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Compliance tracking begins after your first removal request.</p>
      </div>
    );
  }

  const pct = Math.min(100, (data.day / data.total_days) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
    >
      {/* Header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-accent-orange" />
            <span className="text-sm font-bold">DPDP Compliance Tracker</span>
          </div>
          <span className="text-xs text-accent-orange font-bold">Day {data.day}/{data.total_days}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-dark-border rounded-full h-2 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-2 rounded-full"
            style={{
              background: pct >= 90 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#F4621F',
            }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-gray-600">
          <span>Day 1</span>
          <span>Day 30</span>
          <span>Day 60</span>
          <span>Day 90</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card p-4 flex flex-col gap-0">
        {data.milestones.map((m, idx) => {
          const isLast = idx === data.milestones.length - 1;
          return (
            <div key={m.day} className="flex gap-3">
              {/* Vertical line + icon */}
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 mt-0.5">{STATUS_ICON[m.status]}</div>
                {!isLast && (
                  <div className={`w-px flex-1 min-h-[24px] ${
                    m.status === 'completed' ? 'bg-accent-green/30' : 'bg-dark-border'
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    m.status === 'completed' ? 'text-accent-green' :
                    m.status === 'current' ? 'text-accent-orange' : 'text-gray-600'
                  }`}>
                    Day {m.day}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${
                  m.status === 'completed' ? 'text-gray-300' :
                  m.status === 'current' ? 'text-white font-medium' : 'text-gray-600'
                }`}>
                  {m.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
