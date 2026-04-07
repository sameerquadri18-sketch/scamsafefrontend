import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Trash2, Mail, Download, Edit3, AlertTriangle, ExternalLink, Eye, Server, FileCheck, Scale, Activity } from 'lucide-react';
import ScamSafeLogo from '../components/ScamSafeLogo';

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-30px' } };

const DATA_TABLE = [
  { type: 'Phone number', why: 'To scan databases and send removal requests', how_long: 'Until you delete account' },
  { type: 'Email address', why: 'To send scan results and removal updates', how_long: 'Until you delete account' },
  { type: 'Removal records', why: 'To track which databases received removal requests', how_long: 'Until you delete account' },
  { type: 'Payment reference', why: 'Tax compliance (Indian law 7yr requirement)', how_long: '7 years' },
];

const NEVER_COLLECT = [
  'Your name', 'Home address', 'Aadhaar / PAN',
  'Email content', 'Chat history', 'Device info',
  'Browsing data', 'Location', 'Financial details',
];

const SECURITY_PRACTICES = [
  { icon: Lock, title: '256-bit AES Encryption', desc: 'All data encrypted at rest and in transit via TLS 1.3' },
  { icon: Server, title: 'Indian Data Residency', desc: 'Primary servers hosted in India-region infrastructure' },
  { icon: Eye, title: 'Minimal Data Collection', desc: 'We collect only phone + email — nothing else stored' },
  { icon: Trash2, title: 'Account Deletion on Request', desc: 'Submit a deletion request and we remove your data from our systems' },
  { icon: FileCheck, title: 'Automated Compliance', desc: 'DPDP Act Sections 12 & 13 cited in every removal notice' },
  { icon: Activity, title: 'Escalation Engine', desc: '2nd & 3rd notices auto-sent to non-compliant brokers' },
];

export default function Transparency() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <motion.div {...fadeUp} className="text-center pt-4">
        <Link to="/" className="inline-block mb-4">
          <ScamSafeLogo size={28} />
        </Link>
        <h1 className="text-2xl font-bold mb-2">We are a privacy company.</h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
          That means we hold ourselves to a higher standard. Here is everything ScamSafe does with your data — nothing hidden.
        </p>
      </motion.div>

      {/* Section 1 — What We Collect */}
      <motion.div {...fadeUp} className="flex flex-col gap-3">
        <h2 className="text-lg font-bold px-1">What We Collect</h2>
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-3 gap-0 text-[10px] font-bold text-gray-500 uppercase tracking-wider p-3 border-b border-dark-border">
            <span>Data Type</span><span>Why</span><span>How Long</span>
          </div>
          {DATA_TABLE.map((row) => (
            <div key={row.type} className="grid grid-cols-3 gap-0 text-[11px] p-3 border-b border-dark-border/50 last:border-b-0">
              <span className="font-medium text-white">{row.type}</span>
              <span className="text-gray-400">{row.why}</span>
              <span className="text-gray-500">{row.how_long}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 2 — What We Never Collect */}
      <motion.div {...fadeUp} className="flex flex-col gap-3">
        <h2 className="text-lg font-bold px-1">What We Never Collect</h2>
        <div className="grid grid-cols-3 gap-2">
          {NEVER_COLLECT.map((item) => (
            <div key={item} className="glass-card p-2.5 flex items-center gap-1.5">
              <span className="text-accent-red text-xs">✗</span>
              <span className="text-[10px] text-gray-400">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 3 — Email Policy */}
      <motion.div {...fadeUp}>
        <div className="glass-card p-5 border-l-2 border-l-accent-orange">
          <div className="flex items-center gap-2 mb-3">
            <Mail size={16} className="text-accent-orange" />
            <h2 className="text-base font-bold">Our Email Promise</h2>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            ScamSafe sends you exactly 3 types of emails:
          </p>
          <ol className="text-xs text-gray-300 leading-relaxed flex flex-col gap-1.5 mb-4">
            <li><strong>1.</strong> Your scan result (once, when you complete a scan)</li>
            <li><strong>2.</strong> Removal status update (while active subscription runs)</li>
            <li><strong>3.</strong> Reappearance alert (only if your data comes back)</li>
          </ol>
          <p className="text-xs text-gray-400 leading-relaxed mb-2">
            That is it. <strong className="text-white">No newsletters. No promotional offers. No "we miss you" emails. No partner promotions.</strong>
          </p>
          <p className="text-xs text-gray-400 leading-relaxed mb-2">
            If you cancel — we stop emailing immediately. Not after 30 days. <strong className="text-accent-orange">Immediately.</strong>
          </p>
          <p className="text-[10px] text-gray-600 italic">
            This is a contractual commitment in our Terms of Service.
          </p>
        </div>
      </motion.div>

      {/* Section 4 — Your Rights */}
      <motion.div {...fadeUp} className="flex flex-col gap-3">
        <h2 className="text-lg font-bold px-1">Your Rights</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: Download, title: 'Access', desc: 'Download all your data from the dashboard', color: 'text-blue-400', bg: 'bg-blue-400/15' },
            { icon: Trash2, title: 'Delete', desc: 'Request deletion of your data from the dashboard', color: 'text-accent-red', bg: 'bg-accent-red/15' },
            { icon: Edit3, title: 'Correct', desc: 'Update your email in account settings', color: 'text-accent-green', bg: 'bg-accent-green/15' },
            { icon: Mail, title: 'Contact', desc: 'privacy@scamsafe.in — 48hr response', color: 'text-accent-purple', bg: 'bg-accent-purple/15' },
          ].map((item) => (
            <div key={item.title} className="glass-card p-3.5 flex flex-col items-center text-center gap-2">
              <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}>
                <item.icon size={16} className={item.color} />
              </div>
              <span className="text-xs font-semibold">{item.title}</span>
              <span className="text-[10px] text-gray-500 leading-tight">{item.desc}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 6 — Security Practices */}
      <motion.div {...fadeUp} className="flex flex-col gap-3">
        <h2 className="text-lg font-bold px-1">Security & Compliance</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {SECURITY_PRACTICES.map((item) => (
            <div key={item.title} className="glass-card p-3 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-green/10 flex items-center justify-center flex-shrink-0">
                <item.icon size={14} className="text-accent-green" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-white">{item.title}</span>
                <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 7 — Removal Accuracy */}
      <motion.div {...fadeUp}>
        <div className="glass-card p-5 border-l-2 border-l-accent-green">
          <div className="flex items-center gap-2 mb-3">
            <Scale size={16} className="text-accent-green" />
            <h2 className="text-base font-bold">Removal Accuracy & Honesty</h2>
          </div>
          <div className="flex flex-col gap-2 text-xs text-gray-400 leading-relaxed">
            <p>We scan 72+ databases. Not all will have your data. We report <strong className="text-white">exactly what we find</strong> — no inflated numbers.</p>
            <p>Removal requests are sent as formal DPDP Act legal notices. Most legitimate databases comply within <strong className="text-white">3-7 business days</strong>. Some take up to 30 days.</p>
            <p>We submit deletion requests on your behalf and <strong className="text-accent-orange">monitor the process until completion</strong>. Full deletion can take up to 90 days. We guarantee persistent, documented legal action with automated escalation for non-compliant brokers.</p>
            <p>If a broker confirms deletion, we verify via rescan. If data reappears, we re-send removal notices automatically.</p>
          </div>
        </div>
      </motion.div>

      {/* Section 8 — Grievance Officer */}
      <motion.div {...fadeUp} className="glass-card p-4">
        <h3 className="text-sm font-bold mb-2">Grievance Officer</h3>
        <p className="text-xs text-gray-400">Email: grievance@scamsafe.in</p>
        <p className="text-xs text-gray-400">Response time: 30 days (as required by DPDP Act 2023)</p>
      </motion.div>

      {/* Trust bar */}
      <motion.div {...fadeUp} className="flex flex-wrap justify-center gap-3">
        {[
          { icon: Lock, label: 'End-to-end encrypted' },
          { icon: Mail, label: 'Zero marketing emails' },
          { icon: Trash2, label: 'Delete anytime' },
          { icon: Shield, label: 'DPDP Act compliant' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <item.icon size={12} className="text-accent-orange" />
            <span>{item.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Open Source Commitment */}
      <motion.div {...fadeUp} className="glass-card p-4 border-accent-purple/20">
        <div className="flex items-center gap-2 mb-2">
          <ExternalLink size={14} className="text-accent-purple" />
          <h3 className="text-sm font-bold">Accountability</h3>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          ScamSafe is built by a solo Indian developer committed to data privacy. We publish our data practices openly on this page. 
          If you believe we're doing something wrong, email <strong className="text-white">grievance@scamsafe.in</strong> — we respond within 48 hours.
        </p>
      </motion.div>

      {/* Last updated */}
      <p className="text-center text-[10px] text-gray-700">
        Last updated: March 2026
      </p>

      {/* Back to home */}
      <div className="text-center">
        <Link to="/" className="text-xs text-accent-purple hover:underline">← Back to ScamSafe</Link>
      </div>
    </div>
  );
}
