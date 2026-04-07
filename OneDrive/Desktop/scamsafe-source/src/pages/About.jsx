import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Building2, Mail, Scale } from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-4">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} className="text-accent-purple" />
          <h1 className="text-2xl font-bold">About ScamSafe</h1>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col gap-5">
        <div className="glass-card p-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            ScamSafe is India's first automated personal data removal service, built to protect Indians from spam calls, scam fraud, and data broker exploitation.
          </p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-accent-orange" />
            <h2 className="text-sm font-bold text-white">Operated by</h2>
          </div>
          <div className="text-xs text-gray-400 leading-relaxed flex flex-col gap-1">
            <p className="font-semibold text-gray-300">PRODIGIOUS DIGITAL SOLUTIONS</p>
            <p>Hyderabad, Telangana, India</p>
            <a href="mailto:support@scamsafe.in" className="text-accent-orange hover:underline">support@scamsafe.in</a>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-accent-green" />
            <h2 className="text-sm font-bold text-white">Our Service</h2>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            We scan 72+ Indian databases where your personal data is exposed without consent. We send formal legal removal requests under the DPDP Act 2023 and monitor compliance until your data is removed.
          </p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Scale size={16} className="text-accent-purple" />
            <h2 className="text-sm font-bold text-white">Legal Basis</h2>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            All removal requests are sent under the Digital Personal Data Protection Act 2023, Sections 12 and 13. Data fiduciaries must comply within 7 business days. Non-compliance attracts penalties up to ₹250 crore.
          </p>
        </div>

        <div className="glass-card p-4">
          <h2 className="text-sm font-bold text-white mb-3">Our Plans</h2>
          <div className="flex flex-col gap-2 text-xs text-gray-400">
            <div className="flex items-center justify-between py-1.5 border-b border-gray-800/30">
              <span className="font-medium text-gray-300">Shield</span>
              <span>₹149/month</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-gray-800/30">
              <span className="font-medium text-gray-300">Shield Pro</span>
              <span>₹399/month</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="font-medium text-gray-300">Family Vault</span>
              <span>₹699/month</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">All plans include a 15-day rescan cycle.</p>
        </div>

        <div className="glass-card p-4">
          <h2 className="text-sm font-bold text-white mb-3">Contact</h2>
          <div className="text-xs text-gray-400 flex flex-col gap-1">
            <a href="mailto:support@scamsafe.in" className="text-accent-orange hover:underline">support@scamsafe.in</a>
            <a href="mailto:grievance@scamsafe.in" className="text-accent-orange hover:underline">grievance@scamsafe.in</a>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center gap-4 text-[10px] text-gray-600 justify-center pt-4">
        <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms & Conditions</Link>
        <span>·</span>
        <Link to="/" className="hover:text-gray-400 transition-colors">Home</Link>
      </div>
    </div>
  );
}
