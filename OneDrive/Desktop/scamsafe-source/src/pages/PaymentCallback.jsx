import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Shield } from 'lucide-react';
import { verifyCashfreeOrder } from '../utils/api';
import { useApp } from '../contexts/AppContext';

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectPlan, phone } = useApp();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed

  useEffect(() => {
    // Cashfree returns order_id in the URL
    const orderId = searchParams.get('order_id');

    // Read saved plan info
    let savedPlan = {};
    try {
      const raw = localStorage.getItem('scamsafe_payment');
      if (raw) savedPlan = JSON.parse(raw);
    } catch {}

    // Use order_id from URL or from saved payment
    const orderToVerify = orderId || savedPlan.order_id;

    if (!orderToVerify) {
      setStatus('failed');
      return;
    }

    // Verify with backend
    verifyCashfreeOrder(orderToVerify)
      .then((res) => {
        if (res.success && res.status === 'PAID') {
          setStatus('success');
          // Save payment receipt
          localStorage.setItem('scamsafe_payment', JSON.stringify({
            ...savedPlan,
            order_id: orderToVerify,
            paid: true,
            plan_id: res.plan_id || savedPlan.plan,
            billing_cycle: res.billing_cycle || savedPlan.billing,
          }));
          // Redirect to complete profile after 2.5s
          setTimeout(() => navigate('/complete-profile'), 2500);
        } else {
          setStatus('failed');
        }
      })
      .catch(() => {
        setStatus('failed');
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      {status === 'verifying' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-accent-purple/20 flex items-center justify-center">
            <Loader2 size={36} className="text-accent-purple animate-spin" />
          </div>
          <h2 className="text-xl font-bold">Verifying Payment...</h2>
          <p className="text-sm text-gray-400 text-center">Please wait while we confirm your payment.</p>
        </motion.div>
      )}

      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-accent-green" />
          </div>
          <h2 className="text-xl font-bold text-accent-green">Payment Successful!</h2>
          <p className="text-sm text-gray-400 text-center">Your ScamSafe protection plan is now active. Redirecting...</p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20">
            <Shield size={14} className="text-accent-green" />
            <span className="text-xs text-accent-green font-medium">DPDP Protection Activated</span>
          </div>
        </motion.div>
      )}

      {status === 'failed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle size={40} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-red-400">Payment Failed</h2>
          <p className="text-sm text-gray-400 text-center">Your payment could not be verified. Please try again.</p>
          <button
            onClick={() => navigate('/pricing')}
            className="glow-button-orange !px-6 !py-2.5 !text-sm mt-2"
          >
            Try Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
