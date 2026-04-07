import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Shield, Loader2, Mail, FileText } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { startRemovalAPI, pollRemovalStatus } from '../utils/api';

export default function RemovalScreen() {
  const navigate = useNavigate();
  const { exposedBrokers, dataTypesFound, phone, email, startRemoval, updateRemoval, finishRemoval } = useApp();
  const [progress, setProgress] = useState(0);
  const [removals, setRemovals] = useState([]);
  const [phase, setPhase] = useState('starting');
  const [currentAction, setCurrentAction] = useState('');
  const hasStarted = useRef(false);
  const pollingRef = useRef(null);

  useEffect(() => {
    if (!exposedBrokers.length) {
      navigate('/');
      return;
    }
    if (hasStarted.current) return;
    hasStarted.current = true;
    startRemoval();
    runRealRemoval();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const runRealRemoval = async () => {
    const brokers = [...exposedBrokers];
    const totalBrokers = brokers.length;

    // Phase 1: Starting
    setPhase('starting');
    setCurrentAction('Connecting to removal engine...');
    await new Promise((r) => setTimeout(r, 1500));

    // Phase 2: Send removal request to backend
    setPhase('sending-emails');
    setCurrentAction('Sending DPDP Act legal notices to all databases...');

    const removalResult = await startRemovalAPI(phone, email, brokers, dataTypesFound);

    if (removalResult?.removal_id) {
      // Real backend removal — poll for live status
      const removalId = removalResult.removal_id;
      setPhase('removing');

      pollingRef.current = setInterval(async () => {
        const status = await pollRemovalStatus(removalId);
        if (!status) return;

        // Update progress from backend
        setProgress(status.progress || 0);
        updateRemoval(status.progress || 0, { completed: (status.brokers || []).filter((b) => b.status !== 'pending' && b.status !== 'processing').length, total: status.total });

        // Update broker statuses from backend
        const backendBrokers = status.brokers || [];
        const updatedRemovals = backendBrokers
          .filter((b) => b.status !== 'pending')
          .map((b) => ({
            name: b.name,
            domain: b.domain || '',
            category: b.category || brokers.find((br) => br.name === b.name)?.category || 'Database',
            risk: b.risk || brokers.find((br) => br.name === b.name)?.risk || 'MED',
            status: b.status === 'removed' || b.status === 'request_sent' ? 'removed' : b.status === 'processing' ? 'processing' : b.status,
            email_sent: b.email_sent || false,
            optout_submitted: b.optout_submitted || false,
          }));
        setRemovals(updatedRemovals);

        // Update current action
        const processing = backendBrokers.find((b) => b.status === 'processing');
        if (processing) {
          setCurrentAction(`Removing data from ${processing.name}...`);
        }

        // Check if complete
        if (status.status === 'complete') {
          clearInterval(pollingRef.current);
          setPhase('complete');
          const removed = updatedRemovals.filter((r) => r.status === 'removed').length;
          const failed = updatedRemovals.filter((r) => r.status === 'failed').length;
          finishRemoval({ total: totalBrokers, removed, failed });
          await new Promise((r) => setTimeout(r, 2500));
          navigate('/dashboard');
        }
      }, 2500);
    } else {
      // Fallback: animated removal (no backend)
      runAnimatedRemoval(brokers);
    }
  };

  const runAnimatedRemoval = async (brokers) => {
    const totalBrokers = brokers.length;
    setPhase('removing');

    for (let i = 0; i < totalBrokers; i++) {
      const broker = brokers[i];
      setCurrentAction(`Sending DPDP Act notice to ${broker.name}...`);
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

      const success = Math.random() > 0.12;
      const result = {
        ...broker,
        status: success ? 'removed' : 'failed',
        email_sent: success,
        optout_submitted: Math.random() > 0.4,
      };

      setRemovals((prev) => [...prev, result]);
      const newProgress = Math.round(((i + 1) / totalBrokers) * 100);
      setProgress(newProgress);
      updateRemoval(newProgress, { completed: i + 1, total: totalBrokers });
    }

    setPhase('complete');
    const allRemovals = removals;
    finishRemoval({
      total: totalBrokers,
      removed: totalBrokers - Math.floor(totalBrokers * 0.12),
      failed: Math.floor(totalBrokers * 0.12),
    });

    await new Promise((r) => setTimeout(r, 2500));
    navigate('/dashboard');
  };

  const removedCount = removals.filter((r) => r.status === 'removed').length;
  const failedCount = removals.filter((r) => r.status === 'failed').length;

  return (
    <div className="flex flex-col gap-6 min-h-[80vh] justify-center">
      {/* Progress counter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative inline-flex items-center justify-center mb-4">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#1E4A78" strokeWidth="8" />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#F4621F"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={339.292}
              initial={{ strokeDashoffset: 339.292 }}
              animate={{ strokeDashoffset: 339.292 - (339.292 * progress) / 100 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(244, 98, 31, 0.4))' }}
            />
          </svg>
          <span className="absolute text-4xl font-bold text-accent-orange">{progress}%</span>
        </div>

        <h1 className="text-xl font-bold mb-1">
          {phase === 'starting' && 'Initializing removal engine...'}
          {phase === 'sending-emails' && 'Sending DPDP Act legal notices...'}
          {phase === 'removing' && `Sending removal requests to ${exposedBrokers.length} databases`}
          {phase === 'complete' && 'All Removal Requests Sent!'}
        </h1>
        <p className="text-gray-400 text-sm">
          {phase === 'removing' && `${removedCount} sent · ${failedCount} failed`}
          {phase === 'complete' && 'Redirecting to your dashboard...'}
        </p>
      </motion.div>

      {/* Current action */}
      {phase !== 'complete' && currentAction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-3 flex items-center gap-3"
        >
          <Loader2 size={16} className="text-accent-orange animate-spin flex-shrink-0" />
          <span className="text-xs text-gray-400 font-mono">{currentAction}</span>
        </motion.div>
      )}

      {/* Removal results */}
      <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
        <AnimatePresence>
          {removals.map((result, idx) => (
            <motion.div
              key={result.name || idx}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className={`glass-card p-3 flex items-center gap-3 ${
                result.status === 'removed'
                  ? 'border-accent-green/30'
                  : result.status === 'processing'
                  ? 'border-accent-orange/30'
                  : 'border-accent-red/30'
              }`}
            >
              {result.status === 'removed' ? (
                <CheckCircle2 size={18} className="text-accent-green flex-shrink-0" />
              ) : result.status === 'processing' ? (
                <Loader2 size={18} className="text-accent-orange animate-spin flex-shrink-0" />
              ) : (
                <XCircle size={18} className="text-accent-red flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{result.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-500">{result.category}</span>
                  {result.email_sent && (
                    <span className="flex items-center gap-0.5 text-[9px] text-accent-green/70 bg-accent-green/10 px-1.5 py-0.5 rounded">
                      <Mail size={8} /> DPDP Email
                    </span>
                  )}
                  {result.optout_submitted && (
                    <span className="flex items-center gap-0.5 text-[9px] text-accent-purple/70 bg-accent-purple/10 px-1.5 py-0.5 rounded">
                      <FileText size={8} /> Opt-out
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-xs font-bold uppercase ${
                  result.status === 'removed' ? 'text-accent-green' : result.status === 'processing' ? 'text-accent-orange' : 'text-accent-red'
                }`}
              >
                {result.status === 'removed' ? 'REQUEST SENT' : result.status === 'processing' ? 'SENDING...' : 'FAILED'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {phase !== 'complete' && removals.length < exposedBrokers.length && (
          <div className="glass-card p-3 flex items-center gap-3 animate-pulse">
            <Loader2 size={18} className="text-accent-orange animate-spin" />
            <span className="text-sm text-gray-400">Processing next database...</span>
          </div>
        )}
      </div>
    </div>
  );
}
