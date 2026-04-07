import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Download, Trash2, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { getMyData, downloadMyData, deleteAccount } from '../utils/api';

const WE_STORE = [
  { label: 'Phone number (encrypted, masked)', stored: true },
  { label: 'Email address (encrypted, masked)', stored: true },
  { label: 'Removal records', stored: true, dynamic: true },
  { label: 'Payment processed by payment gateway', stored: true },
];

const WE_DONT = [
  'Your name', 'Your address', 'Any email content',
  'Chat history', 'Financial details', 'Browsing history',
  'Device information',
];

export default function DataMinimisation({ phone, onDeleted }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!phone) return;
    (async () => {
      const res = await getMyData(phone);
      setData(res);
      setLoading(false);
    })();
  }, [phone]);

  const handleDownload = async () => {
    setDownloading(true);
    await downloadMyData(phone);
    setDownloading(false);
  };

  const handleDelete = async () => {
    if (deleteText !== 'DELETE MY ACCOUNT') return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount(phone, deleteText);
      if (onDeleted) onDeleted();
    } catch (err) {
      setDeleteError(err?.response?.data?.detail || 'Deletion failed. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
    >
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Your Data at ScamSafe</h3>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* We Store */}
        <div className="glass-card p-3.5">
          <p className="text-[10px] text-accent-green font-bold uppercase tracking-wider mb-2.5">WE STORE</p>
          <div className="flex flex-col gap-2">
            {WE_STORE.map((item) => (
              <div key={item.label} className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-accent-green flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-gray-300 leading-tight">
                  {item.dynamic && data ? `${data.removal_records_count} removal records` : item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* We Don't Store */}
        <div className="glass-card p-3.5">
          <p className="text-[10px] text-accent-red font-bold uppercase tracking-wider mb-2.5">WE DO NOT STORE</p>
          <div className="flex flex-col gap-2">
            {WE_DONT.map((item) => (
              <div key={item} className="flex items-start gap-1.5">
                <XCircle size={12} className="text-gray-600 flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-gray-500 leading-tight">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-blue-400 border border-blue-400/25 rounded-xl py-2.5 hover:bg-blue-400/10 transition-all disabled:opacity-50"
        >
          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {downloading ? 'Exporting...' : 'Download My Data'}
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-accent-red border border-accent-red/25 rounded-xl py-2.5 hover:bg-accent-red/10 transition-all"
        >
          <Trash2 size={14} />
          Delete My Account
        </button>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-sm w-full border-accent-red/30"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-accent-red" />
                <h3 className="text-lg font-bold">Permanently Delete Account</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                This will immediately and permanently delete:
              </p>
              <ul className="text-xs text-gray-400 mb-4 flex flex-col gap-1">
                <li>• All your scan records</li>
                <li>• All removal request history</li>
                <li>• Your account credentials</li>
                <li>• Your subscription (no refund for current period)</li>
              </ul>
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="Type DELETE MY ACCOUNT to confirm"
                className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-red/50 mb-3"
              />
              {deleteError && (
                <p className="text-[11px] text-accent-red mb-2">{deleteError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 text-sm text-gray-400 border border-dark-border rounded-lg py-2.5 hover:bg-dark-border/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteText !== 'DELETE MY ACCOUNT' || deleting}
                  className="flex-1 text-sm font-medium text-white bg-accent-red rounded-lg py-2.5 hover:bg-accent-red/80 transition-all disabled:opacity-30"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
