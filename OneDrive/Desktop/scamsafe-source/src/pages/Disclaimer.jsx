import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Shield, AlertTriangle, Scale, Clock } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors mb-4">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle size={24} className="text-accent-orange" />
          <h1 className="text-2xl font-bold">Disclaimer</h1>
        </div>
        <p className="text-xs text-gray-500">Last updated: April 2026</p>
        <p className="text-xs text-gray-500">Operated by: PRODIGIOUS DIGITAL SOLUTIONS</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col gap-5">
        <Section title="1. Nature of Service" icon={Shield}>
          ScamSafe is a data privacy platform that submits personal data removal requests on your behalf under the Digital Personal Data Protection Act, 2023 (DPDP Act). We act as your authorized representative in sending legal erasure notices to data brokers and databases.
        </Section>

        <Section title="2. Best-Efforts Basis" icon={AlertTriangle}>
          All data removal requests are submitted on a <strong>best-efforts basis</strong>. ScamSafe does not guarantee that any specific data broker, database, or third-party platform will comply with removal requests. Removal outcomes depend entirely on the cooperation and compliance of third-party platforms.
          <br /><br />
          While the DPDP Act 2023 mandates data fiduciaries to comply with valid erasure requests, enforcement timelines and compliance vary across organizations.
        </Section>

        <Section title="3. No Guarantee of Complete Removal" icon={Clock}>
          <strong>ScamSafe cannot guarantee:</strong>
          <br />• Complete removal of your data from all databases
          <br />• Specific timelines for data deletion by brokers
          <br />• That removed data will not reappear in the future
          <br />• That all instances of your data across the internet will be found
          <br /><br />
          Data brokers may re-acquire your information through public records, app sign-ups, and other data sharing channels. This is why ScamSafe offers recurring scans and automated re-submission of removal requests.
        </Section>

        <Section title="4. Limitation of Liability" icon={Scale}>
          Prodigious Digital Solutions (the operator of ScamSafe) shall not be held liable for:
          <br /><br />
          • Failed, delayed, or partial data removals by third-party data brokers
          <br />• Any damages resulting from continued exposure of personal data
          <br />• Actions or inactions of data brokers and third-party platforms
          <br />• Interruptions or errors in the scanning or removal service
          <br />• Any indirect, incidental, or consequential damages arising from use of the service
          <br /><br />
          Our total liability in any case shall not exceed the amount paid by you for the service in the preceding 12 months.
        </Section>

        <Section title="5. Accuracy of Scan Results">
          Scan results show data exposure based on our database of known data brokers and public directories. Results may not be exhaustive. Some databases may not be accessible for scanning, and new databases appear regularly. ScamSafe continuously expands its coverage but cannot guarantee detection of all data exposures.
        </Section>

        <Section title="6. Third-Party Services">
          ScamSafe uses third-party services for payment processing (Cashfree), communication (WhatsApp Business API), and other functionalities. We are not responsible for the privacy practices, terms, or reliability of these third-party services.
        </Section>

        <Section title="7. Legal Compliance">
          ScamSafe operates in compliance with Indian law, including the DPDP Act 2023 and the Information Technology Act, 2000. However, ScamSafe is not a law firm and does not provide legal advice. For specific legal questions about your data protection rights, please consult a qualified legal professional.
        </Section>

        <Section title="8. Changes to This Disclaimer">
          We may update this disclaimer from time to time. Continued use of ScamSafe after changes constitutes acceptance of the updated terms. Material changes will be communicated via email or WhatsApp to active subscribers.
        </Section>

        <Section title="9. Contact">
          <strong>PRODIGIOUS DIGITAL SOLUTIONS</strong>
          <br />Hyderabad, Telangana, India
          <br />Email: <a href="mailto:support@scamsafe.in" className="text-accent-orange underline">support@scamsafe.in</a>
          <br />Website: <a href="https://scamsafe.in" className="text-accent-orange underline">scamsafe.in</a>
        </Section>
      </motion.div>

      <div className="flex items-center gap-4 text-[10px] text-gray-600 justify-center pt-4">
        <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
        <span>·</span>
        <Link to="/refund-policy" className="hover:text-gray-400 transition-colors">Refund Policy</Link>
        <span>·</span>
        <Link to="/" className="hover:text-gray-400 transition-colors">Home</Link>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={16} className="text-accent-orange flex-shrink-0" />}
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <div className="text-xs text-gray-400 leading-relaxed">{children}</div>
    </div>
  );
}
