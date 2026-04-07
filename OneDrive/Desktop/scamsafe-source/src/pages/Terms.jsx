import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-4">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <FileText size={24} className="text-accent-orange" />
          <h1 className="text-2xl font-bold">Terms & Conditions</h1>
        </div>
        <p className="text-xs text-gray-500">Last updated: March 2026</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col gap-5">
        <Section title="1. Acceptance">
          These Terms of Service govern your use of ScamSafe (scamsafe.in), operated by Prodigious Digital Solutions, Hyderabad, Telangana, India. By using the service you agree to these terms. If you don't agree, please don't use the service.
        </Section>

        <Section title="2. Service Description">
          ScamSafe provides:
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Free scan of 72+ Indian data broker databases using your phone number</li>
            <li>OTP verification to confirm phone ownership and consent</li>
            <li>DPDP Act 2023 legal removal notices sent to exposed databases</li>
            <li>Automated opt-out form submissions to data brokers</li>
            <li>Periodic rescans — monthly (Shield) or weekly (Shield Pro) for subscribed users</li>
          </ul>
        </Section>

        <Section title="3. User Consent">
          By entering your phone number and verifying via OTP, you:
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Confirm you are the owner of the phone number</li>
            <li>Authorize ScamSafe to scan databases on your behalf</li>
            <li>Authorize us to send legal data deletion notices citing DPDP Act 2023</li>
            <li>Consent to receiving OTP messages for verification</li>
          </ul>
        </Section>

        <Section title="4. Free Scan">
          The initial scan is free and requires no payment. You can see your exposure score, which databases have your data, and what types of data are exposed.
        </Section>

        <Section title="5. Paid Services">
          Data removal, continuous monitoring, and auto-rescan require a paid subscription. Pricing and payment options are available on the /pricing page.
        </Section>

        <Section title="6. No Guarantee of Complete Removal">
          While we have a high success rate, we cannot guarantee 100% removal from all databases. Data brokers may re-acquire your data from new sources. This is why continuous monitoring is recommended.
        </Section>

        <Section title="7. DPDP Act Compliance">
          All removal requests are made under Sections 12 and 13 of the Digital Personal Data Protection Act, 2023. Data brokers are legally required to comply within 7 business days. Non-compliance may attract penalties of up to ₹250 crore.
        </Section>

        <Section title="8. Limitation of Liability">
          ScamSafe is not liable for:
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li>Data brokers failing to comply with legal removal notices</li>
            <li>Delays in removal processing by third-party databases</li>
            <li>Data reappearances from new sources after removal</li>
            <li>Any damages arising from data exposure prior to using our service</li>
          </ul>
        </Section>

        <Section title="9. Intellectual Property">
          All content, code, and branding on scamsafe.in is owned by ScamSafe. You may not copy, modify, or redistribute any part of the service without written permission.
        </Section>

        <Section title="10. Modifications">
          We may update these terms at any time. Continued use after changes constitutes acceptance of the updated terms.
        </Section>

        <Section title="11. Governing Law">
          These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.
        </Section>

        <Section title="12. Contact">
          For questions about these terms:
          <br />
          <strong>Email:</strong> support@scamsafe.in
          <br />
          <strong>Website:</strong> https://scamsafe.in
        </Section>
      </motion.div>

      <div className="flex items-center gap-4 text-[10px] text-gray-600 justify-center pt-4">
        <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link to="/terms" className="text-accent-orange">Terms & Conditions</Link>
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
