import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-4">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <FileText size={24} className="text-accent-orange" />
          <h1 className="text-2xl font-bold">Refund Policy</h1>
        </div>
        <p className="text-xs text-gray-500">Last updated: March 2026</p>
        <p className="text-xs text-gray-500">Operated by: PRODIGIOUS DIGITAL SOLUTIONS</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col gap-5">
        <Section title="1. Free Scan">
          The initial exposure scan is completely free. No payment required.
        </Section>

        <Section title="2. Subscription Refunds">
          <strong>If you have not run any scan after payment:</strong>
          <br />Full refund within 7 days of purchase.
          <br />Request at: <a href="mailto:support@scamsafe.in" className="text-accent-orange underline">support@scamsafe.in</a>
          <br /><br />
          <strong>If you have run a scan after payment:</strong>
          <br />No refund — service has been delivered. Data removal requests have been submitted on your behalf.
        </Section>

        <Section title="3. Annual Plans">
          Annual subscriptions are refundable within 7 days of purchase if no scan has been run. After 7 days or after the first scan: no refund.
        </Section>

        <Section title="4. How to Request">
          <strong>Email:</strong> <a href="mailto:support@scamsafe.in" className="text-accent-orange underline">support@scamsafe.in</a>
          <br /><strong>Subject:</strong> Refund Request — [your phone number]
          <br /><strong>Response within:</strong> 48 business hours
          <br /><strong>Processing time:</strong> 5-7 business days
        </Section>

        <Section title="5. Chargebacks">
          Filing a chargeback without contacting us first may result in account suspension. We resolve all genuine disputes directly.
        </Section>

        <Section title="6. Contact">
          <strong>PRODIGIOUS DIGITAL SOLUTIONS</strong>
          <br />Hyderabad, Telangana, India
          <br /><a href="mailto:support@scamsafe.in" className="text-accent-orange underline">support@scamsafe.in</a>
        </Section>
      </motion.div>

      <div className="flex items-center gap-4 text-[10px] text-gray-600 justify-center pt-4">
        <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
        <span>.</span>
        <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
        <span>.</span>
        <Link to="/" className="hover:text-gray-400 transition-colors">Home</Link>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="glass-card p-4">
      <h2 className="text-sm font-bold text-white mb-2">{title}</h2>
      <div className="text-xs text-gray-400 leading-relaxed">{children}</div>
    </div>
  );
}
