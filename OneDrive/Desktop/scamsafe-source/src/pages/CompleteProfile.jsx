import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Plus, Trash2, UserPlus, CheckCircle2, CreditCard } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { registerUser, isBackendLive } from '../utils/api';
import { PLANS } from '../utils/constants';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { selectedPlan, phone, email, setUser } = useApp();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Read payment receipt from localStorage
  const paymentReceipt = useMemo(() => {
    try {
      const raw = localStorage.getItem('scamsafe_payment');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, []);

  const planInfo = selectedPlan || PLANS.find(p => p.id === paymentReceipt?.plan) || PLANS[0];

  const isFamily = selectedPlan?.id === 'family-vault';
  const maxFamily = 4;

  const addFamilyMember = () => {
    if (familyMembers.length >= maxFamily) return;
    setFamilyMembers([...familyMembers, { name: '', phone: '', email: '' }]);
  };

  const updateFamily = (idx, field, value) => {
    const updated = [...familyMembers];
    updated[idx] = { ...updated[idx], [field]: value };
    setFamilyMembers(updated);
  };

  const removeFamily = (idx) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let user;

    // Try real backend registration
    if (isBackendLive()) {
      try {
        const res = await registerUser({
          phone,
          email,
          plan: selectedPlan?.id || 'shield',
          family_members: isFamily ? familyMembers : null,
        });
        user = {
          id: res.data.id,
          phone_masked: res.data.phone_masked,
          email_masked: res.data.email_masked,
          plan: res.data.plan,
          plan_active: res.data.plan_active,
          next_rescan_at: res.data.next_rescan_at,
        };
      } catch (err) {
        console.error('Registration API error:', err);
        setError('Registration failed. Continuing in demo mode.');
      }
    }

    // Fallback demo user
    if (!user) {
      await new Promise((r) => setTimeout(r, 1500));
      user = {
        id: crypto.randomUUID(),
        phone_masked: phone.slice(0, 2) + '••••' + phone.slice(-4),
        email_masked: email,
        plan: selectedPlan?.id || 'shield',
        plan_active: true,
      };
    }

    user.phone = phone;
    user.email = email;
    user.familyMembers = isFamily ? familyMembers : [];

    setUser(user);
    navigate('/removal');
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-accent-green/20 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={24} className="text-accent-green" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Confirmed!</h1>
        <p className="text-gray-400 text-sm">
          Complete your profile so we can find and remove all your data.
        </p>
      </motion.div>

      {/* Payment receipt card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-4 border-accent-green/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={14} className="text-accent-green" />
          <span className="text-xs text-accent-green font-semibold uppercase tracking-wider">Payment Receipt</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Plan</span>
            <span className="text-sm font-semibold text-white">{planInfo.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Billing</span>
            <span className="text-sm text-gray-300">{paymentReceipt?.billing === 'annual' ? 'Annual' : 'Monthly'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Amount Paid</span>
            <span className="text-sm font-bold text-accent-green">₹{planInfo.monthly?.toLocaleString('en-IN')}</span>
          </div>
          {paymentReceipt?.utr && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">UTR / Txn ID</span>
              <span className="text-[10px] text-gray-400 font-mono">{paymentReceipt.utr}</span>
            </div>
          )}
          {paymentReceipt?.payment_id && !paymentReceipt?.utr && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Payment ID</span>
              <span className="text-[10px] text-gray-400 font-mono">{paymentReceipt.payment_id}</span>
            </div>
          )}
        </div>
      </motion.div>


      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-4"
      >
        {/* Pre-filled */}
        <div className="glass-card p-4 flex flex-col gap-3">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium">Already Provided</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-bg rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-gray-600 mb-0.5">Phone</p>
              <p className="text-sm text-gray-300 font-mono">+91 {phone}</p>
            </div>
            <div className="bg-dark-bg rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-gray-600 mb-0.5">Email</p>
              <p className="text-sm text-gray-300 truncate">{email}</p>
            </div>
          </div>
        </div>


        {/* Family members */}
        {isFamily && (
          <div className="glass-card p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium">Family Members</h3>
              <span className="text-xs text-gray-600">{familyMembers.length + 1}/5</span>
            </div>

            {familyMembers.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-dark-bg rounded-xl p-3 flex flex-col gap-2 relative"
              >
                <button
                  type="button"
                  onClick={() => removeFamily(idx)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
                <p className="text-xs text-accent-purple font-medium">Member {idx + 2}</p>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateFamily(idx, 'name', e.target.value)}
                  placeholder="Full name"
                  className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
                />
                <input
                  type="tel"
                  value={member.phone}
                  onChange={(e) => updateFamily(idx, 'phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Phone number"
                  className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none font-mono"
                />
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) => updateFamily(idx, 'email', e.target.value)}
                  placeholder="Email address"
                  className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
                />
              </motion.div>
            ))}

            {familyMembers.length < maxFamily && (
              <button
                type="button"
                onClick={addFamilyMember}
                className="flex items-center justify-center gap-2 py-3 border border-dashed border-dark-border rounded-xl text-sm text-gray-500 hover:text-accent-purple hover:border-accent-purple/30 transition-all"
              >
                <UserPlus size={16} />
                Add Family Member
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="glow-button-orange w-full py-4 text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Start Removing My Data
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}
