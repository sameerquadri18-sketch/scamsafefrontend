import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Scale, FileText, Clock, ChevronDown, AlertTriangle, Search } from 'lucide-react';

const FAQS = [
  {
    q: 'How long does removal take?',
    a: 'Most data brokers comply within 7–30 days of receiving a legal removal request. Some respond within 48 hours, while others may take the full 30-day period allowed under the DPDP Act. ScamSafe sends automated follow-ups to ensure timely compliance.',
  },
  {
    q: 'What if a broker refuses to remove my data?',
    a: 'Under Section 18 of the DPDP Act 2023, non-compliance can result in penalties up to ₹250 crore. If a broker refuses after our final notice, we document the refusal and can guide you on escalating to the Data Protection Board of India.',
  },
  {
    q: 'Will my data stay removed forever?',
    a: 'Data brokers can re-acquire your information through public records, app permissions, and data sharing agreements. This is why ScamSafe offers recurring scans every 15 days — we continuously monitor and re-submit removal requests for any reappearances.',
  },
  {
    q: 'Is ScamSafe legal in India?',
    a: 'Yes. ScamSafe operates fully within Indian law. We act as your authorized representative under the DPDP Act 2023, submitting erasure requests on your behalf — similar to hiring a lawyer to send a legal notice. The Act gives every Indian citizen the Right to Erasure (Section 12).',
  },
  {
    q: 'What is a data broker?',
    a: 'Data brokers are companies that collect, aggregate, and sell personal information — your phone number, email, address, Aadhaar details, PAN, and more. They scrape this from public records, social media, app data leaks, and data breaches. There are 72+ known data brokers operating in India.',
  },
];

export default function DPDPAct() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-4">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Scale size={24} className="text-accent-orange" />
          <h1 className="text-2xl font-bold">DPDP Act 2023</h1>
        </div>
        <p className="text-sm text-gray-400">Your data protection rights under India's Digital Personal Data Protection Act</p>
      </motion.div>

      {/* Section 1: What is DPDP Act */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Shield size={18} className="text-accent-purple" /> What is the DPDP Act 2023?
        </h2>
        <div className="text-xs text-gray-400 leading-relaxed space-y-3">
          <p>
            The <strong className="text-white">Digital Personal Data Protection Act, 2023</strong> (DPDP Act) is India's comprehensive data privacy law, passed by Parliament in August 2023. It gives every Indian citizen legal rights over their personal data — including the right to know who has it, the right to correct it, and the right to have it deleted.
          </p>
          <p>
            The Act applies to all organizations (called "Data Fiduciaries") that collect or process personal data of Indian citizens, whether they operate in India or abroad. Non-compliance carries penalties of up to <strong className="text-accent-orange">₹250 crore</strong>.
          </p>
          <p>
            ScamSafe uses the DPDP Act as the legal basis for all data removal requests submitted on your behalf.
          </p>
        </div>
      </motion.div>

      {/* Section 2: Your 3 Key Rights */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <FileText size={18} className="text-accent-green" /> Your 3 Key Rights
        </h2>
        <div className="flex flex-col gap-3">
          {[
            { section: 'Section 11', title: 'Right to Know', desc: 'You have the right to know what personal data any organization holds about you, how they collected it, and who they shared it with.', color: 'border-accent-purple/30 bg-accent-purple/5' },
            { section: 'Section 12–13', title: 'Right to Erasure', desc: 'You can request any organization to permanently delete your personal data. They must comply unless they have a specific legal reason to retain it.', color: 'border-accent-orange/30 bg-accent-orange/5' },
            { section: 'Section 14', title: 'Right to Grievance Redressal', desc: 'If an organization refuses to comply, you can file a complaint with the Data Protection Board of India, which has the power to impose penalties.', color: 'border-accent-green/30 bg-accent-green/5' },
          ].map((right, i) => (
            <motion.div
              key={right.section}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className={`border rounded-xl p-4 ${right.color}`}
            >
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{right.section}</span>
              <h3 className="text-sm font-bold text-white mt-1 mb-1">{right.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{right.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Section 3: Why Does Removal Take Time? */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card p-5">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Clock size={18} className="text-yellow-400" /> Why Does Removal Take Time?
        </h2>
        <div className="text-xs text-gray-400 leading-relaxed space-y-2">
          <p>Data removal isn't instant because:</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Organizations have <strong className="text-white">up to 30 days</strong> to respond under the DPDP Act</li>
            <li>Some brokers require <strong className="text-white">identity verification</strong> before processing requests</li>
            <li>Large databases need time to locate and purge records from <strong className="text-white">backup systems</strong></li>
            <li>International brokers may need to comply with <strong className="text-white">multiple jurisdictions</strong></li>
          </ul>
          <p className="mt-2">ScamSafe handles all follow-ups automatically so you don't have to.</p>
        </div>
      </motion.div>

      {/* Section 5: FAQ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-yellow-400" /> Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-xs text-gray-400 leading-relaxed border-t border-dark-border pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center">
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 glow-button-orange px-6 py-3 text-sm font-semibold rounded-xl"
        >
          <Search size={14} /> Scan Your Data Exposure Free
        </Link>
        <p className="text-[10px] text-gray-500 mt-2">Free scan. No payment required.</p>
      </motion.div>

      <div className="flex items-center gap-4 text-[10px] text-gray-600 justify-center pt-4">
        <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
        <span>·</span>
        <Link to="/disclaimer" className="hover:text-gray-400 transition-colors">Disclaimer</Link>
        <span>·</span>
        <Link to="/" className="hover:text-gray-400 transition-colors">Home</Link>
      </div>
    </div>
  );
}
