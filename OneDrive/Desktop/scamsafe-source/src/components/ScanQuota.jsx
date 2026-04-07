import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Calendar } from 'lucide-react';
import { getScanLimit } from '../utils/api';

export default function ScanQuota({ phone }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!phone) return;
    getScanLimit(phone).then(setInfo);
  }, [phone]);

  if (!info) return null;

  const used = info.scans_used || info.count || 0;
  const limit = info.scans_limit || 2;
  const remaining = info.scans_remaining ?? (limit - used);
  const pct = Math.min(100, (used / Math.max(limit, 1)) * 100);

  return (
    <div className="glass-card p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-accent-purple/15 flex items-center justify-center flex-shrink-0">
        <Search size={14} className="text-accent-purple" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-400 font-medium">Scans This Month</span>
          <span className="text-[10px] font-bold text-white">{used} of {limit} used</span>
        </div>
        <div className="h-1.5 rounded-full bg-dark-border overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: pct >= 100 ? '#EF4444' : pct >= 50 ? '#F59E0B' : '#10B981' }}
          />
        </div>
        {!info.can_scan && info.reason === 'too_soon' && (
          <div className="flex items-center gap-1 mt-1">
            <Clock size={10} className="text-accent-orange" />
            <span className="text-[9px] text-accent-orange font-medium">
              Next scan: {info.next_available_date || `in ${info.days_remaining} days`}
            </span>
          </div>
        )}
        {!info.can_scan && info.reason === 'monthly_limit_reached' && (
          <div className="flex items-center gap-1 mt-1">
            <Calendar size={10} className="text-red-400" />
            <span className="text-[9px] text-red-400 font-medium">
              Resets {info.next_reset_date || `in ${info.days_until_reset} days`}
            </span>
          </div>
        )}
        {info.can_scan && remaining === 1 && (
          <span className="text-[9px] text-accent-orange font-medium mt-0.5 block">1 scan remaining this month</span>
        )}
      </div>
    </div>
  );
}
