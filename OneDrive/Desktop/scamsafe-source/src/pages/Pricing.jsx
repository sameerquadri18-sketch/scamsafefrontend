import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Shield, Star, Users, FileText, CreditCard, Loader2, Lock, Mail, Trash2, CheckCircle2, XCircle, AlertTriangle, ArrowRight, User, Phone as PhoneIcon, MapPin } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { PLANS } from '../utils/constants';
import { createCashfreeOrder, checkUserEmail, saveEmailCheckout, saveBillingDetails, checkSubscription, trackPricingView } from '../utils/api';

function loadCashfreeSDK() {
  if (window.Cashfree) return Promise.resolve();
  return new Promise((resolve, reject) => {
    // Remove any failed previous attempts
    const old = document.querySelector('script[src*="sdk.cashfree.com"]');
    if (old) old.remove();
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Payment SDK failed to load. Please check your internet connection.'));
    document.head.appendChild(script);
  });
}

const planIcons = { report: FileText, shield: Shield, 'shield-pro': Star, 'family-vault': Users };
const planButtons = {
  report: 'Get Full Report',
  shield: 'Start Protection',
  'shield-pro': 'Go Pro',
  'family-vault': 'Protect My Family',
};
const planSubs = {
  report: 'One payment. No subscription.',
  shield: '₹4.93/day — less than one chai',
  'shield-pro': 'Just ₹250 more than Shield',
  'family-vault': 'Just ₹140 per person per month',
};

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', '10minutemail.com', 'fakeinbox.com', 'trashmail.com',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'dispostable.com',
  'maildrop.cc', 'temp-mail.org', 'getnada.com', 'mohmal.com',
];

function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required';
  const e = email.trim().toLowerCase();
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e)) return 'Invalid email format';
  const domain = e.split('@')[1];
  if (DISPOSABLE_DOMAINS.includes(domain)) return 'Please use your real email, not a disposable one.';
  return null;
}

export default function Pricing() {
  const navigate = useNavigate();
  const { selectPlan, billingCycle, setBillingCycle, phone, email: savedEmail, setContact } = useApp();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');
  const [sdkReady, setSdkReady] = useState(!!window.Cashfree);

  // Billing form state
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [billingData, setBillingData] = useState({
    full_name: '',
    phone_number: phone || '',
    email: savedEmail || '',
    pincode: '',
    state: '',
  });
  const [billingErrors, setBillingErrors] = useState({});
  const [billingSaving, setBillingSaving] = useState(false);
  const [hasBilling, setHasBilling] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);

  // Duplicate plan state
  const [activeSub, setActiveSub] = useState(null);

  // Preload Cashfree SDK + check email + subscription on mount
  useEffect(() => {
    loadCashfreeSDK().then(() => setSdkReady(true)).catch(() => {});
    
    // Track pricing page view for abandoned checkout automation
    if (phone) {
      trackPricingView().catch(() => {}); // Silently track
      
      checkUserEmail(phone).then(res => {
        if (res.has_email) {
          setHasBilling(true);
          setBillingData(prev => ({ ...prev, email: res.email || prev.email }));
        }
      });
      checkSubscription(phone).then(res => {
        if (res.has_active) setActiveSub(res);
      });
    }
  }, [phone]);

  const validateBilling = () => {
    const errs = {};
    if (!billingData.full_name.trim()) errs.full_name = 'Name is required';
    if (!billingData.phone_number.trim() || !/^[6-9]\d{9}$/.test(billingData.phone_number.replace(/\D/g, '').slice(-10))) errs.phone_number = 'Valid 10-digit number required';
    const emailErr = validateEmail(billingData.email);
    if (emailErr) errs.email = emailErr;
    if (!billingData.state.trim()) errs.state = 'State is required';
    if (!billingData.pincode.trim() || !/^\d{6}$/.test(billingData.pincode.trim())) errs.pincode = 'Valid 6-digit pincode required';
    if (!disclaimerAccepted) errs.disclaimer = 'You must accept the terms to proceed';
    return errs;
  };

  const handleBillingSubmit = async () => {
    const errs = validateBilling();
    setBillingErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBillingSaving(true);
    try {
      await saveBillingDetails(phone, {
        full_name: billingData.full_name.trim(),
        phone_number: billingData.phone_number.trim(),
        email: billingData.email.trim().toLowerCase(),
        pincode: billingData.pincode.trim(),
        state: billingData.state.trim(),
        disclaimer_accepted: true,
      });
      // Also save email via existing endpoint for backward compat
      await saveEmailCheckout(phone, billingData.email.trim().toLowerCase()).catch(() => {});
      setHasBilling(true);
      setShowBillingForm(false);
      if (pendingPlan) {
        proceedToPayment(pendingPlan);
        setPendingPlan(null);
      }
    } catch (e) {
      setBillingErrors({ submit: e?.response?.data?.detail || 'Failed to save billing details. Try again.' });
    } finally {
      setBillingSaving(false);
    }
  };

  const proceedToPayment = async (plan) => {
    setLoadingPlan(plan.id);
    setError('');
    try {
      await loadCashfreeSDK();
      const cycle = plan.oneTime ? 'monthly' : billingCycle;
      const data = await createCashfreeOrder(plan.id, cycle, phone || '');
      localStorage.setItem('scamsafe_payment', JSON.stringify({
        plan: plan.id, billing: cycle, phone: phone || '', order_id: data.order_id,
      }));
      const cashfree = window.Cashfree({ mode: 'production' });
      await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: '_self' });
    } catch (err) {
      console.error('Payment initiation failed:', err);
      setError(err?.response?.data?.detail || err?.message || 'Payment failed to start. Please try again.');
      setLoadingPlan(null);
    }
  };

  const handlePayment = async (plan) => {
    setError('');
    // Check duplicate subscription first
    if (phone && plan.id !== 'report') {
      const sub = await checkSubscription(phone, plan.id);
      if (!sub.can_subscribe) {
        setActiveSub(sub);
        setError(sub.message || 'You already have an active subscription.');
        return;
      }
    }
    // Billing form gate
    if (!hasBilling && phone) {
      setPendingPlan(plan);
      setBillingData(prev => ({ ...prev, phone_number: phone || prev.phone_number }));
      setShowBillingForm(true);
      return;
    }
    proceedToPayment(plan);
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold mb-2">Choose Your Protection</h1>
        <p className="text-gray-400 text-sm">
          Send legal DPDP Act removal requests to 72+ databases.
        </p>
        <p className="text-[11px] text-gray-500 mt-2">ScamSafe is operated by Prodigious Digital Solutions. All plans are SaaS subscriptions with digital delivery. Billed in INR.</p>
      </motion.div>

      {/* Billing toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border mx-auto"
      >
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            billingCycle === 'monthly' ? 'bg-dark-border text-white' : 'text-gray-500'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('annual')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            billingCycle === 'annual' ? 'bg-accent-orange/20 text-accent-orange' : 'text-gray-500'
          }`}
        >
          Annual
          <span className="text-[10px] bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded-full font-bold">
            2 MONTHS FREE
          </span>
        </button>
      </motion.div>

      {/* Plan cards */}
      <div className="flex flex-col gap-4">
        {PLANS.map((plan, idx) => {
          const Icon = planIcons[plan.id] || Shield;
          const isOneTime = plan.oneTime;
          const isAnnual = billingCycle === 'annual' && !isOneTime && plan.annual;
          const price = isOneTime ? plan.monthly : (billingCycle === 'monthly' ? plan.monthly : plan.annual);
          const perMonth = isOneTime ? plan.monthly : (isAnnual ? (plan.annualPerMonth || Math.round(plan.annual / 12)) : plan.monthly);
          const savings = isAnnual ? (plan.saving || plan.monthly * 12 - plan.annual) : 0;
          const isPopular = plan.popular;
          const isBestValue = plan.bestValue;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.08 }}
              className={`glass-card p-5 relative ${
                isPopular ? 'border-accent-orange/50 shadow-glow-orange' : ''
              }${isBestValue ? ' border-accent-green/40' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-orange text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              {isBestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-green text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Best Value
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={18} className={isPopular ? 'text-accent-orange' : isBestValue ? 'text-accent-green' : 'text-accent-purple'} />
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                </div>
                <div className="text-right">
                  {isAnnual ? (
                    <>
                      <div className="text-sm text-gray-600 line-through">₹{plan.monthly}/mo</div>
                      <div className="flex items-baseline gap-0.5 justify-end">
                        <span className="text-sm font-semibold text-gray-400">₹</span>
                        <span className="text-3xl font-extrabold">{perMonth}</span>
                      </div>
                      <span className="text-[11px] font-medium text-gray-500">/month</span>
                      <p className="text-[10px] font-bold text-accent-orange mt-0.5">Billed as ₹{plan.annual.toLocaleString()}/year</p>
                      <p className="text-[11px] font-bold text-accent-green mt-0.5">
                        You save ₹{savings.toLocaleString()} — 2 months free
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-0.5 justify-end">
                        <span className="text-sm font-semibold text-gray-400">₹</span>
                        <span className="text-3xl font-extrabold">{price}</span>
                      </div>
                      <span className="text-[11px] font-medium text-gray-500">
                        {isOneTime ? 'one-time' : '/month'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={14} className="text-accent-green flex-shrink-0" />
                    <span className="text-xs text-gray-300">{f}</span>
                  </div>
                ))}
                {plan.notIncluded && plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <X size={14} className="text-gray-600 flex-shrink-0" />
                    <span className="text-xs text-gray-600">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePayment(plan)}
                disabled={!!loadingPlan}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  isPopular
                    ? 'glow-button-orange'
                    : isBestValue
                    ? 'bg-accent-green/20 text-accent-green border border-accent-green/30 hover:bg-accent-green/30'
                    : 'bg-dark-border text-white hover:bg-dark-border/80'
                } ${loadingPlan ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {loadingPlan === plan.id ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                {loadingPlan === plan.id ? 'Processing...' : (
                  isAnnual
                    ? `Get ${plan.name} — ₹${perMonth}/mo`
                    : (planButtons[plan.id] || `Get ${plan.name}`)
                )}
              </button>
              <p className="text-[10px] text-gray-500 text-center mt-2">
                {isAnnual
                  ? `Billed as ₹${plan.annual.toLocaleString()}/year · Cancel anytime`
                  : (planSubs[plan.id] || 'Cancel anytime. No questions asked.')}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Prompt 6: Already a Member Banner */}
      {activeSub && !activeSub.can_subscribe && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent-orange/10 border border-accent-orange/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-accent-orange" />
            <span className="text-sm font-bold text-accent-orange">Already a Member</span>
          </div>
          <p className="text-xs text-gray-300">
            You are on the <strong>{activeSub.current_plan}</strong> plan.
            {activeSub.subscription_end && (
              <> Active until <strong>{new Date(activeSub.subscription_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>.</>
            )}
          </p>
          {activeSub.reason === 'same_plan' && (
            <p className="text-[11px] text-gray-400 mt-1">You already have this exact plan active. No action needed.</p>
          )}
          {activeSub.reason === 'downgrade' && (
            <p className="text-[11px] text-gray-400 mt-1">Your current plan already includes everything in lower tiers.</p>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-3 text-xs text-accent-orange font-semibold flex items-center gap-1 hover:underline"
          >
            Go to Dashboard <ArrowRight size={12} />
          </button>
        </motion.div>
      )}

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center"
        >
          <p className="text-xs text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Billing Details Modal */}
      <AnimatePresence>
        {showBillingForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowBillingForm(false); setPendingPlan(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent-orange/20 flex items-center justify-center">
                  <CreditCard size={20} className="text-accent-orange" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Billing Details</h3>
                  <p className="text-[11px] text-gray-400">Required for invoice generation & payment receipt</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1 block">Full Name *</label>
                  <div className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5">
                    <User size={14} className="text-gray-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={billingData.full_name}
                      onChange={(e) => { setBillingData(p => ({ ...p, full_name: e.target.value })); setBillingErrors(p => ({ ...p, full_name: undefined })); }}
                      placeholder="Your full name"
                      autoFocus
                      className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
                    />
                  </div>
                  {billingErrors.full_name && <p className="text-[10px] text-red-400 mt-1">{billingErrors.full_name}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1 block">Phone Number *</label>
                  <div className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5">
                    <PhoneIcon size={14} className="text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-400">+91</span>
                    <input
                      type="tel"
                      value={billingData.phone_number}
                      onChange={(e) => { setBillingData(p => ({ ...p, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })); setBillingErrors(p => ({ ...p, phone_number: undefined })); }}
                      placeholder="10-digit number"
                      maxLength={10}
                      className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
                    />
                  </div>
                  {billingErrors.phone_number && <p className="text-[10px] text-red-400 mt-1">{billingErrors.phone_number}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1 block">Email Address *</label>
                  <div className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5">
                    <Mail size={14} className="text-gray-500 flex-shrink-0" />
                    <input
                      type="email"
                      value={billingData.email}
                      onChange={(e) => { setBillingData(p => ({ ...p, email: e.target.value })); setBillingErrors(p => ({ ...p, email: undefined })); }}
                      placeholder="you@example.com"
                      className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
                    />
                  </div>
                  {billingErrors.email && <p className="text-[10px] text-red-400 mt-1">{billingErrors.email}</p>}
                </div>

                {/* State + Pincode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1 block">State *</label>
                    <div className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5">
                      <MapPin size={14} className="text-gray-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={billingData.state}
                        onChange={(e) => { setBillingData(p => ({ ...p, state: e.target.value })); setBillingErrors(p => ({ ...p, state: undefined })); }}
                        placeholder="State"
                        className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1 w-full"
                      />
                    </div>
                    {billingErrors.state && <p className="text-[10px] text-red-400 mt-1">{billingErrors.state}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1 block">Pincode *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={billingData.pincode}
                      onChange={(e) => { setBillingData(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })); setBillingErrors(p => ({ ...p, pincode: undefined })); }}
                      placeholder="6-digit"
                      maxLength={6}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-accent-orange/50 transition-colors"
                    />
                    {billingErrors.pincode && <p className="text-[10px] text-red-400 mt-1">{billingErrors.pincode}</p>}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2.5 p-3 bg-yellow-900/10 border border-yellow-700/20 rounded-xl">
                  <input
                    type="checkbox"
                    id="billing_disclaimer"
                    checked={disclaimerAccepted}
                    onChange={(e) => { setDisclaimerAccepted(e.target.checked); setBillingErrors(p => ({ ...p, disclaimer: undefined })); }}
                    className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-dark-bg cursor-pointer accent-accent-orange"
                  />
                  <label htmlFor="billing_disclaimer" className="text-[10px] text-gray-300 leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" className="text-accent-orange underline">Terms of Service</Link>{' '}and{' '}
                    <Link to="/privacy" target="_blank" className="text-accent-orange underline">Privacy Policy</Link>.
                    I understand ScamSafe submits removal requests on a best-efforts basis under the DPDP Act 2023.
                  </label>
                </div>
                {billingErrors.disclaimer && <p className="text-[10px] text-red-400 -mt-1">{billingErrors.disclaimer}</p>}

                {billingErrors.submit && (
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
                    <p className="text-[11px] text-red-400">{billingErrors.submit}</p>
                  </div>
                )}

                <button
                  onClick={handleBillingSubmit}
                  disabled={billingSaving}
                  className="w-full glow-button-orange py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {billingSaving ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                  {billingSaving ? 'Saving...' : 'Continue to Payment'}
                </button>

                <div className="flex items-start gap-2 mt-1">
                  <Lock size={12} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Your details are encrypted and used only for invoicing and payment receipts. We never send marketing emails.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-wrap items-center justify-center gap-4 py-4"
      >
        {[
          { icon: Lock, label: 'Encrypted' },
          { icon: Mail, label: 'Zero marketing emails' },
          { icon: Trash2, label: 'Cancel anytime' },
          { icon: Shield, label: 'DPDP Act compliant' },
        ].map(({ icon: TIcon, label }) => (
          <Link key={label} to="/transparency" className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
            <TIcon size={12} />
            <span>{label}</span>
          </Link>
        ))}
      </motion.div>

      <p className="text-[11px] text-gray-500 text-center mb-2">
        Annual plans include 2 months free. Cancel anytime. No questions asked.
      </p>
      <p className="text-[10px] text-gray-600 text-center leading-relaxed max-w-xs mx-auto pb-4">
        By subscribing, you authorise ScamSafe.in to send legal DPDP Act notices and removal requests to exposed databases on your behalf.
      </p>
    </div>
  );
}
