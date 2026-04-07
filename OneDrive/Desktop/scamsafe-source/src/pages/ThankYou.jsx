import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, CheckCircle2, ArrowRight, Clock, Bell, Home, BookOpen } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { subscribeForUpdates, optInWhatsApp } from '../utils/api';

export default function ThankYou() {
  const navigate = useNavigate();
  const { phone, exposedBrokers, dataTypesFound, setContact } = useApp();
  const [email, setEmail] = useState('');
  const [subscribeState, setSubscribeState] = useState('idle'); // idle | loading | done | error
  const [whatsappOptInState, setWhatsappOptInState] = useState('idle'); // idle | loading | done | error
  const [showConfetti, setShowConfetti] = useState(true);

  const removedCount = exposedBrokers.length;

  useEffect(() => {
    if (!phone) {
      navigate('/');
    }
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!emailValid) return;
    
    setSubscribeState('loading');
    try {
      await subscribeForUpdates(phone, email);
      // Also update AppContext so email is available for removal
      setContact(phone, email);
      setSubscribeState('done');
    } catch (err) {
      console.error('Subscribe failed:', err);
      setSubscribeState('error');
    }
  };

  const handleWhatsAppOptIn = async () => {
    setWhatsappOptInState('loading');
    try {
      await optInWhatsApp(phone);
      setWhatsappOptInState('done');
    } catch (err) {
      console.error('WhatsApp opt-in failed:', err);
      setWhatsappOptInState('error');
    }
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1, rotate: 0 }}
              animate={{
                y: window.innerHeight + 20,
                rotate: Math.random() * 720 - 360,
                opacity: 0,
              }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                background: ['#10B981', '#8B5CF6', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899'][i % 6],
              }}
            />
          ))}
        </div>
      )}

      {/* Success card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 text-center border-accent-green/30"
        style={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.15)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4"
        >
          <ShieldCheck size={40} className="text-accent-green" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold mb-2"
        >
          Thank You! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-400 text-sm mb-4"
        >
          Your data removal request has been submitted successfully.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[11px] text-accent-green/80 font-medium italic mb-2"
        >
          ScamSafe deletes your data everywhere — including from ScamSafe itself when you're done.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-dark-bg/50 rounded-xl p-4 mb-3"
        >
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-green">{removedCount}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Databases</p>
            </div>
            <div className="w-px h-8 bg-dark-border"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-purple">{dataTypesFound.length}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Data Types</p>
            </div>
            <div className="w-px h-8 bg-dark-border"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-orange">DPDP</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Legal Notices</p>
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-gray-500">
          Phone: +91 ***{phone?.slice(-4) || '****'}
        </p>
      </motion.div>

      {/* What happens next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="glass-card p-5"
      >
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock size={16} className="text-accent-purple" />
          What Happens Next
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 size={12} className="text-accent-green" />
            </div>
            <div>
              <p className="text-sm font-medium">DPDP Act notices sent</p>
              <p className="text-xs text-gray-500">Legal removal emails sent to all {removedCount} databases</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-accent-orange">7d</span>
            </div>
            <div>
              <p className="text-sm font-medium">Brokers must comply within 7 days</p>
              <p className="text-xs text-gray-500">Under DPDP Act 2023, non-compliance attracts ₹250 crore penalty</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-accent-purple">12d</span>
            </div>
            <div>
              <p className="text-sm font-medium">Automatic rescan in 12 days</p>
              <p className="text-xs text-gray-500">We'll verify removal and send escalation notices if needed</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Email subscription — optional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="glass-card p-5 border-accent-purple/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Bell size={16} className="text-accent-purple" />
          <h2 className="text-sm font-semibold">Get Rescan Updates</h2>
          <span className="text-[10px] text-gray-600 bg-dark-bg px-2 py-0.5 rounded-full">Optional</span>
        </div>

        {subscribeState === 'done' ? (
          <div className="flex items-center gap-2 bg-accent-green/10 border border-accent-green/20 rounded-xl p-3">
            <CheckCircle2 size={16} className="text-accent-green" />
            <p className="text-sm text-accent-green font-medium">Subscribed! We'll email you with rescan results (monthly for Shield, weekly for Shield Pro).</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">
              Enter your email to receive removal status updates. We'll let you know which databases have complied and if any new exposures are found.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="flex-1 relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-purple/50"
                />
              </div>
              <button
                type="submit"
                disabled={!emailValid || subscribeState === 'loading'}
                className="glow-button-purple !px-4 !py-3 !rounded-xl disabled:opacity-30 flex items-center gap-1.5 text-sm"
              >
                {subscribeState === 'loading' ? 'Saving...' : 'Subscribe'}
              </button>
            </form>
            {subscribeState === 'error' && (
              <p className="text-xs text-red-400 mt-2">Failed to subscribe. Please try again.</p>
            )}
            <p className="text-[10px] text-gray-600 mt-2">
              We'll only send rescan updates. No spam, unsubscribe anytime. By subscribing, you agree to our <a href="/privacy" className="text-accent-purple">Privacy Policy</a>.
            </p>
          </>
        )}
      </motion.div>

      {/* WhatsApp Opt-in */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Bell size={18} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">WhatsApp Updates</h3>
            <p className="text-xs text-gray-500">Get instant removal status notifications</p>
          </div>
        </div>

        {whatsappOptInState === 'done' ? (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
            <CheckCircle2 size={16} className="text-green-400" />
            <p className="text-sm text-green-400 font-medium">WhatsApp enabled! You'll receive removal updates instantly.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">
              Enable WhatsApp notifications to receive instant updates when your data is removed from databases. Faster than email!
            </p>
            <button
              onClick={handleWhatsAppOptIn}
              disabled={whatsappOptInState === 'loading'}
              className="w-full bg-green-500/20 text-green-400 px-4 py-3 rounded-xl font-medium text-sm hover:bg-green-500/30 disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {whatsappOptInState === 'loading' ? 'Enabling...' : '📱 Enable WhatsApp Updates'}
            </button>
            {whatsappOptInState === 'error' && (
              <p className="text-xs text-red-400 mt-2">Failed to enable WhatsApp. Please try again.</p>
            )}
            <p className="text-[10px] text-gray-600 mt-2">
              Message and data rates may apply. Reply STOP to unsubscribe anytime.
            </p>
          </>
        )}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="flex flex-col gap-2"
      >
        <button
          onClick={() => navigate('/')}
          className="glass-card p-4 flex items-center gap-3 w-full text-left hover:border-accent-green/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-green/20 flex items-center justify-center flex-shrink-0">
            <Home size={18} className="text-accent-green" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Back to Home</p>
            <p className="text-xs text-gray-500">Scan another number</p>
          </div>
          <ArrowRight size={16} className="text-gray-600 group-hover:text-accent-green transition-colors" />
        </button>

        <button
          onClick={() => navigate('/blog')}
          className="glass-card p-4 flex items-center gap-3 w-full text-left hover:border-accent-purple/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} className="text-accent-purple" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Read Our Blog</p>
            <p className="text-xs text-gray-500">Learn how to stay safe from scams</p>
          </div>
          <ArrowRight size={16} className="text-gray-600 group-hover:text-accent-purple transition-colors" />
        </button>

        <button
          onClick={() => navigate('/live')}
          className="glass-card p-4 flex items-center gap-3 w-full text-left hover:border-accent-orange/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-orange/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-accent-orange" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Live Scam Dashboard</p>
            <p className="text-xs text-gray-500">Real-time cyber fraud data for India</p>
          </div>
          <ArrowRight size={16} className="text-gray-600 group-hover:text-accent-orange transition-colors" />
        </button>
      </motion.div>
    </div>
  );
}
