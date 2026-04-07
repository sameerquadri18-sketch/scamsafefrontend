import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Shield, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`ScamSafe Contact: ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:support@scamsafe.in?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold mb-2">Contact Us</h1>
        <p className="text-gray-400 text-sm">We're here to help. Reach out anytime.</p>
      </motion.div>

      {/* Email Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 flex flex-col items-center gap-3 text-center border-accent-purple/20"
        style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.08)' }}
      >
        <div className="w-14 h-14 rounded-2xl bg-accent-purple/15 flex items-center justify-center">
          <Mail size={28} className="text-accent-purple" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Email us at</p>
          <a href="mailto:support@scamsafe.in" className="text-lg font-bold text-accent-purple hover:text-accent-purple/80 transition-colors">
            support@scamsafe.in
          </a>
        </div>
        <p className="text-[11px] text-gray-500">We typically respond within 24 hours</p>
      </motion.div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5"
      >
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
          <MessageSquare size={16} className="text-accent-orange" />
          Send us a message
        </h2>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-6"
          >
            <div className="w-14 h-14 rounded-full bg-accent-green/20 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-accent-green" />
            </div>
            <p className="text-sm font-semibold">Your email app should open now</p>
            <p className="text-[11px] text-gray-500 text-center">
              If it didn't open, please email us directly at{' '}
              <a href="mailto:support@scamsafe.in" className="text-accent-purple font-medium">support@scamsafe.in</a>
            </p>
            <button
              onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}
              className="text-xs text-gray-500 hover:text-white transition-colors mt-2"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Your Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent-purple/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Your Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent-purple/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1 block">Message</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help you?"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent-purple/50 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-indigo-600 text-white font-bold text-sm shadow-lg shadow-accent-purple/20 hover:shadow-accent-purple/40 transition-all"
            >
              <Send size={14} />
              Send Message
            </button>
          </form>
        )}
      </motion.div>

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 text-[10px] text-gray-600"
      >
        <Shield size={12} className="text-accent-green" />
        <span>Your information is secure and never shared with third parties</span>
      </motion.div>
    </div>
  );
}
