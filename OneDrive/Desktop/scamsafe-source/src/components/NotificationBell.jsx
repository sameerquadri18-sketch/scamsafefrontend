import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertTriangle, Mail, Shield, CreditCard } from 'lucide-react';
import { getNotifications, markNotificationsRead } from '../utils/api';

const ICON_MAP = {
  removal: Shield,
  escalation: AlertTriangle,
  broker_reply: Mail,
  billing: CreditCard,
  scan: CheckCircle,
};

export default function NotificationBell({ phone }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!phone) return;
    const load = async () => {
      const data = await getNotifications(phone);
      setNotifications(data.notifications || []);
      setUnread(data.unread_count || 0);
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [phone]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open && unread > 0) {
      await markNotificationsRead(phone);
      setUnread(0);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen} className="relative p-2 rounded-xl bg-dark-card border border-dark-border hover:border-dark-border/80 transition-colors">
        <Bell size={18} className="text-gray-400" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-accent-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-72 max-h-80 overflow-y-auto rounded-2xl bg-dark-card border border-dark-border shadow-xl z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
              <span className="text-xs font-bold text-white">Notifications</span>
              <button onClick={() => setOpen(false)}>
                <X size={14} className="text-gray-500" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.slice(0, 15).map((n, i) => {
                  const Icon = ICON_MAP[n.type] || Bell;
                  return (
                    <div key={i} className={`px-4 py-3 border-b border-dark-border/50 last:border-0 ${!n.read ? 'bg-accent-orange/5' : ''}`}>
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-dark-border flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon size={12} className="text-accent-orange" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-white leading-tight">{n.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[9px] text-gray-600 mt-1">{formatTime(n.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
