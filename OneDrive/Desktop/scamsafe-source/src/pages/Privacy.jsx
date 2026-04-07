import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-4">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} className="text-accent-green" />
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-xs text-gray-500">Last updated: March 2026</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col gap-5">
        <Section title="1. Who We Are">
          ScamSafe is operated by Prodigious Digital Solutions, a business registered in Hyderabad, Telangana, India. We provide automated data privacy protection services under the Digital Personal Data Protection Act 2023.
        </Section>

        <Section title="2. Data We Collect">
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Phone number</strong> — to scan databases and verify your identity via OTP</li>
            <li><strong>Email</strong> (optional) — to check breach databases and send removal confirmations</li>
            <li><strong>Scan results</strong> — which databases contain your data (stored locally on your device)</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Scan 72+ data broker databases for your exposed information</li>
            <li>Send DPDP Act legal removal notices on your behalf</li>
            <li>Submit opt-out forms to data brokers</li>
            <li>Rescan periodically (Shield: every 30 days, Shield Pro: every 7 days) to detect reappearances</li>
          </ul>
        </Section>

        <Section title="4. Data Storage">
          <strong>Free Scan Users:</strong> Your phone number is used only during the scan session. Scan results are cached in your browser's local storage. Nothing stored on our servers beyond what is needed to run the scan.
          <br /><br />
          <strong>Subscribed Users:</strong> To provide ongoing protection, we store on encrypted servers:
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Your phone number (AES-256 encrypted)</li>
            <li>Your email address (AES-256 encrypted, if provided)</li>
            <li>Your removal request records and history</li>
            <li>Your subscription status and scan history</li>
          </ul>
          <br />
          <strong>We do NOT store:</strong> name, address, Aadhaar, PAN, financial data, chat history, or browsing data.
          <br />
          All stored data is deleted immediately on account deletion. Payment records retained 7 years (Indian tax law).
        </Section>

        <Section title="5. Third-Party Services">
          We use trusted third-party providers for essential services including OTP verification, email delivery, cloud hosting, and payment processing. All providers are contractually bound to process data only as instructed by ScamSafe and in compliance with applicable data protection laws. No personal data is shared with third parties for marketing purposes.
        </Section>

        <Section title="6. Your Rights (DPDP Act 2023)">
          Under the Digital Personal Data Protection Act, 2023, you have the right to:
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Access</strong> — know what personal data we hold</li>
            <li><strong>Correction</strong> — request correction of inaccurate data</li>
            <li><strong>Erasure</strong> — request complete deletion of your data</li>
            <li><strong>Withdraw consent</strong> — stop processing at any time</li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          <strong>Free users:</strong> No personal data retained on our servers beyond the scan session. Browser local storage can be cleared at any time.
          <br /><br />
          <strong>Subscribers:</strong> Data retained while subscription is active. All data deleted immediately upon account deletion request.
          <br /><br />
          <strong>Payment records:</strong> Retained for 7 years as required by Indian tax law.
        </Section>

        <Section title="8. Security">
          All data transmission is encrypted via HTTPS/TLS. We do not store passwords or payment information. OTP verification ensures only the phone owner can initiate a scan.
        </Section>

        <Section title="9. Contact">
          For privacy queries or data deletion requests:
          <br />
          <strong>Email:</strong> support@scamsafe.in
          <br />
          <strong>Website:</strong> https://scamsafe.in
        </Section>

        <Section title="10. Grievance Officer">
          <a href="mailto:grievance@scamsafe.in" className="text-accent-orange underline">grievance@scamsafe.in</a>
        </Section>
      </motion.div>

      <div className="flex items-center gap-4 text-[10px] text-gray-600 justify-center pt-4">
        <Link to="/privacy" className="text-accent-green">Privacy Policy</Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms & Conditions</Link>
        <span>·</span>
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
