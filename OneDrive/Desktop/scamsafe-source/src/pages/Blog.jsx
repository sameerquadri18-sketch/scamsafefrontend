import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronUp, Shield, AlertTriangle, Scale, Newspaper } from 'lucide-react';

// SEO keywords for blog
const BLOG_SEO_KEYWORDS = [
  'data breach India 2026', 'scam alerts India', 'DPDP Act 2023 updates', 
  'cybersecurity news India', 'data protection laws', 'online fraud prevention',
  'personal data security', 'scam awareness India', 'digital privacy rights',
  'data broker regulations', 'cybercrime trends India', 'online safety tips',
  'fraud prevention guide', 'data leak alerts', 'scammer tactics exposed',
  'privacy protection tools', 'data removal services', 'scam prevention measures'
];

// Update page meta for SEO
useEffect(() => {
  // Update page title
  document.title = 'ScamSafe Blog - Latest Scam Alerts & Data Protection News | India 2026';
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = 'Stay updated with latest scam alerts, data breaches, and cybersecurity news in India. Expert insights on DPDP Act 2023, data protection, and fraud prevention.';
  }
  
  // Update meta keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.content = BLOG_SEO_KEYWORDS.join(', ');
  
  // Update canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = 'https://scamsafe.in/blog';
  
  // Add Open Graph tags
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.property = 'og:title';
    document.head.appendChild(ogTitle);
  }
  ogTitle.content = 'ScamSafe Blog - Latest Scam Alerts & Data Protection News';
  
  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (!ogDescription) {
    ogDescription = document.createElement('meta');
    ogDescription.property = 'og:description';
    document.head.appendChild(ogDescription);
  }
  ogDescription.content = 'Stay updated with latest scam alerts, data breaches, and cybersecurity news in India. Expert insights on DPDP Act 2023.';
  
  // Add structured data for Blog
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "ScamSafe Blog",
    "description": "Latest scam alerts, data breach news, and cybersecurity insights for India",
    "url": "https://scamsafe.in/blog",
    "publisher": {
      "@type": "Organization",
      "name": "ScamSafe",
      "url": "https://scamsafe.in"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://scamsafe.in/blog"
    }
  };
  
  // Remove existing structured data script if any
  const existingScript = document.querySelector('script[data-type="blog-structured-data"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-type', 'blog-structured-data');
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}, []);

const BLOG_POSTS = [
  {
    id: 101,
    category: 'Scam Alert',
    date: 'Mar 2026',
    title: 'AI Voice Cloning Scams Surge: ₹800 Crore Lost in 3 Months',
    summary: 'Scammers are using AI to clone voices of family members and colleagues, tricking victims into transferring money via UPI.',
    content: 'A new wave of AI-powered voice cloning scams has hit India in early 2026, with losses exceeding ₹800 crore in just Q1. Scammers use publicly available voice samples from social media and WhatsApp to create realistic AI voice clones. They then call victims pretending to be a family member in distress or a boss requesting an urgent fund transfer.\n\nKey findings:\n• Over 4.5 lakh cases reported via 1930 helpline in Jan-Mar 2026\n• Average loss per victim: ₹1.8 lakh\n• Most targeted: senior citizens and working professionals\n• Scammers source phone numbers from data broker databases\n\nCERT-In has issued an advisory urging citizens to verify callers through a callback and never transfer money based on voice alone. The DPDP Act 2023 gives you the right to remove your phone number from data broker lists — reducing your exposure to such attacks.',
    icon: AlertTriangle,
    color: 'text-accent-red',
  },
  {
    id: 102,
    category: 'Government Action',
    date: 'Feb 2026',
    title: 'DPDP Rules 2026 Notified: Data Brokers Now Face ₹250 Crore Penalty',
    summary: 'The government has finally notified the DPDP Rules, making it mandatory for data brokers to comply with deletion requests within 72 hours.',
    content: 'The Ministry of Electronics and Information Technology (MeitY) has notified the Digital Personal Data Protection Rules 2026, bringing the DPDP Act 2023 into full effect. Key highlights:\n\n• Data brokers must respond to deletion requests within 72 hours\n• Companies must appoint a Data Protection Officer (DPO)\n• Consent managers must be registered with the Data Protection Board\n• Non-compliance penalty: up to ₹250 crore per violation\n• Citizens can file complaints directly with the Data Protection Board online\n\nThis is a landmark moment for digital privacy in India. ScamSafe leverages these provisions to send legally binding removal notices to data brokers, ensuring your personal data is deleted from their databases.',
    icon: Scale,
    color: 'text-accent-green',
  },
  {
    id: 103,
    category: 'Data Leak',
    date: 'Jan 2026',
    title: 'Telecom Data Breach: 8 Crore Jio & Airtel Users\' Data Found on Dark Web',
    summary: 'A massive telecom data dump containing names, phone numbers, Aadhaar details, and location data of 8 crore users was found on dark web forums.',
    content: 'Security researchers discovered a massive database on dark web marketplaces containing personal data of approximately 8 crore Indian telecom subscribers from multiple carriers including Jio, Airtel, and Vi. The leaked data includes:\n\n• Full names and addresses\n• Phone numbers and alternate numbers\n• Aadhaar and PAN numbers\n• SIM activation dates and location data\n• Recharge history and usage patterns\n\nTRAI has launched an investigation and directed all telecom operators to conduct security audits. The breach is believed to have originated from a third-party vendor with access to telecom subscriber databases. This incident reinforces the importance of regularly scanning and removing your data from broker databases to minimize exposure.',
    icon: AlertTriangle,
    color: 'text-accent-red',
  },
  {
    id: 104,
    category: 'Scam Alert',
    date: 'Nov 2025',
    title: 'Fake Aadhaar Update Scam: 15 Lakh Citizens Targeted via SMS',
    summary: 'Scammers sent bulk SMS messages urging citizens to "update Aadhaar" through fake UIDAI websites, stealing biometric and financial data.',
    content: 'A widespread phishing campaign targeted over 15 lakh Indians with fake SMS messages claiming their Aadhaar would be deactivated unless updated immediately. Victims were directed to convincing fake UIDAI websites that collected:\n\n• Aadhaar numbers and OTPs\n• Bank account details\n• Fingerprint scans via phone cameras\n• PAN and address information\n\nThe real UIDAI clarified that Aadhaar updates are only done through official channels (uidai.gov.in or Aadhaar centres). Police arrested 23 suspects across Gujarat, Rajasthan, and Jharkhand. The scammers had purchased phone number lists from data brokers to execute the bulk SMS campaign.',
    icon: AlertTriangle,
    color: 'text-accent-red',
  },
  {
    id: 1,
    category: 'Scam Alert',
    date: 'Feb 2025',
    title: 'AIIMS Data Breach: 4 Crore Patient Records Leaked on Dark Web',
    summary: 'In one of India\'s largest healthcare data breaches, AIIMS Delhi suffered a ransomware attack that exposed 4 crore patient records including Aadhaar numbers, medical histories, and contact details.',
    content: 'The All India Institute of Medical Sciences (AIIMS) New Delhi was hit by a massive ransomware attack that crippled its servers for over two weeks. Hackers gained access to approximately 4 crore patient records containing sensitive information including Aadhaar numbers, addresses, phone numbers, and detailed medical histories. The data was reportedly listed for sale on dark web forums. The Indian Computer Emergency Response Team (CERT-In) was called in to investigate, and the incident highlighted the critical vulnerability of India\'s healthcare data infrastructure. The government subsequently issued new cybersecurity guidelines for all healthcare institutions.',
    icon: AlertTriangle,
    color: 'text-accent-red',
  },
  {
    id: 2,
    category: 'Government Action',
    date: 'Jan 2025',
    title: 'I4C Report: Indians Lost ₹22,812 Crore to Cyber Fraud in 2024',
    summary: 'The Indian Cybercrime Coordination Centre (I4C) revealed that cyber fraud losses in India reached ₹22,812 crore in 2024, with 70,000+ victims daily.',
    content: 'According to the Indian Cybercrime Coordination Centre (I4C) under the Ministry of Home Affairs, India witnessed an unprecedented surge in cybercrime in 2024. The total financial loss reached ₹22,812 crore, up 300% from 2021. The most common scam types included:\n\n• Digital arrest scams (₹2,140 Cr)\n• Trading/investment scams (₹4,636 Cr)\n• Romance and dating scams (₹1,800 Cr)\n• Phishing and OTP fraud (₹3,200 Cr)\n\nThe government has set up the 1930 helpline and the National Cybercrime Reporting Portal (cybercrime.gov.in) to help victims report fraud and freeze suspicious transactions within the golden hour.',
    icon: Scale,
    color: 'text-accent-orange',
  },
  {
    id: 3,
    category: 'Data Leak',
    date: 'Dec 2024',
    title: 'CoWIN Portal Data Leak: 150 Crore Indians\' Vaccination Data Exposed',
    summary: 'A Telegram bot was found serving personal data of Indian citizens from the CoWIN vaccination portal, including names, Aadhaar numbers, and passport details.',
    content: 'A security researcher discovered a Telegram bot that was openly serving personal data from India\'s CoWIN vaccination portal. By entering a phone number, anyone could retrieve the registered person\'s name, Aadhaar number, passport number, date of birth, and vaccination details. The breach potentially affected over 150 crore registered users. The Ministry of Health initially denied the breach, but CERT-In later confirmed unauthorized access. The incident raised serious concerns about the security of India\'s digital public infrastructure and the need for stronger data protection measures under the DPDP Act 2023.',
    icon: AlertTriangle,
    color: 'text-accent-red',
  },
  {
    id: 4,
    category: 'Government Action',
    date: 'Nov 2024',
    title: 'DPDP Act 2023: India\'s Data Protection Law — What It Means for You',
    summary: 'The Digital Personal Data Protection Act 2023 gives every Indian citizen the right to demand deletion of their personal data from any company.',
    content: 'The Digital Personal Data Protection (DPDP) Act 2023, passed by the Indian Parliament, is India\'s first comprehensive data protection law. Key provisions:\n\n• Right to Erasure (Section 12): You can demand any company delete your personal data\n• Right to Correction (Section 13): You can ask companies to correct inaccurate data\n• Consent Required (Section 6): Companies must get your explicit consent before collecting data\n• Penalties: Non-compliance can result in fines up to ₹250 crore\n• Data Protection Board: A new regulatory body will handle complaints\n\nThis law empowers Indian citizens to take control of their digital privacy. ScamSafe uses these provisions to send legal removal notices to data brokers on your behalf.',
    icon: Scale,
    color: 'text-accent-green',
  },
  {
    id: 5,
    category: 'Scam Alert',
    date: 'Oct 2024',
    title: '"Digital Arrest" Scam: How Scammers Stole ₹2,140 Crore in 2024',
    summary: 'Fraudsters impersonating police, CBI, and customs officers held victims under "digital arrest" via video calls, extorting thousands of crores.',
    content: 'The "digital arrest" scam emerged as one of India\'s most devastating fraud types in 2024. Scammers would call victims claiming to be from police, CBI, customs, or the RBI, and allege that the victim\'s Aadhaar or phone number was linked to criminal activity. Victims were then placed under "digital arrest" — forced to stay on a video call for hours or days while transferring money to "clear their name."\n\nPrime Minister Modi addressed this scam in his Mann Ki Baat broadcast, warning citizens that no government agency conducts arrests via video call. The MHA blocked over 6.69 lakh SIM cards and 1.32 lakh IMEIs used in such scams. The key protection: scammers can only target you if they have your phone number and personal data from data brokers.',
    icon: AlertTriangle,
    color: 'text-accent-red',
  },
  {
    id: 6,
    category: 'Data Leak',
    date: 'Sep 2024',
    title: 'Star Health Insurance Data Breach: 3.1 Crore Customer Records Leaked',
    summary: 'Star Health Insurance suffered a massive data breach exposing medical records, PAN, Aadhaar, and policy details of 3.1 crore customers via Telegram bots.',
    content: 'Star Health and Allied Insurance Company, one of India\'s largest health insurers, confirmed a data breach affecting 3.1 crore customers. The stolen data included:\n\n• Full names, addresses, phone numbers\n• PAN and Aadhaar numbers\n• Medical records and claim histories\n• Policy details and payment information\n\nThe data was being distributed via Telegram bots and dark web forums. Star Health filed a lawsuit against Telegram to remove the bots. The incident highlighted how insurance companies store vast amounts of sensitive personal and medical data, making them prime targets for cybercriminals. IRDAI issued new cybersecurity guidelines for all insurance companies following this breach.',
    icon: AlertTriangle,
    color: 'text-accent-red',
  },
  {
    id: 7,
    category: 'Government Action',
    date: 'Aug 2024',
    title: 'PM Modi Warns Against Cyber Scams in Mann Ki Baat',
    summary: 'PM Modi dedicated a segment of Mann Ki Baat to educating citizens about digital arrest scams, phishing, and the importance of reporting cybercrime.',
    content: 'In his monthly Mann Ki Baat radio broadcast, Prime Minister Narendra Modi addressed the growing menace of cyber fraud in India. Key points:\n\n• "No government agency will ever threaten you on a phone or video call"\n• Citizens should immediately report scams on the 1930 helpline\n• The government has frozen ₹1,200 crore in fraudulent accounts through quick action\n• CERT-In has blocked thousands of phishing websites targeting Indian citizens\n• The I4C has trained 5,000+ police officers in cybercrime investigation\n\nThe PM urged citizens to spread awareness about common scams and reminded them that personal data protection is crucial in preventing these attacks.',
    icon: Shield,
    color: 'text-accent-purple',
  },
  {
    id: 8,
    category: 'Scam Alert',
    date: 'Jul 2024',
    title: 'Job Scam Epidemic: 10 Lakh Indians Duped via Fake WhatsApp Job Offers',
    summary: 'Cybercriminals used data broker lists to send bulk WhatsApp messages offering fake work-from-home jobs, stealing ₹700+ crore from job seekers.',
    content: 'A massive job scam operation was uncovered that had duped over 10 lakh Indians through fake WhatsApp job offers. The scammers purchased phone number databases from data brokers and sent bulk messages offering lucrative work-from-home jobs. Victims were asked to:\n\n• Pay "registration fees" of ₹500-5,000\n• Complete fake tasks (like, review, rate) for small payments\n• Invest larger amounts for "premium tasks" with promised high returns\n\nOnce victims invested significant amounts, the scammers disappeared. The CBI arrested 45 people across multiple states and traced the operation to a Southeast Asian cyber fraud syndicate. The key enabler: data brokers who sell phone databases in bulk, allowing scammers to reach millions of potential victims.',
    icon: AlertTriangle,
    color: 'text-accent-red',
  },
  {
    id: 201,
    category: 'Government Action',
    date: 'Dec 2023',
    title: 'DPDP Act 2023 Passed: India Finally Gets a Data Protection Law',
    summary: 'After years of debate, India\'s Parliament passed the Digital Personal Data Protection Act 2023, giving citizens the right to erase their data from any company.',
    content: 'The Indian Parliament passed the Digital Personal Data Protection (DPDP) Act 2023 on August 11, 2023, marking a historic milestone for digital privacy in India. After over five years of deliberation and multiple draft versions, India now has a comprehensive data protection framework.\n\nKey provisions that protect you:\n• Right to Erasure: Demand any company delete your personal data\n• Right to Know: Companies must tell you what data they hold about you\n• Mandatory Consent: No data collection without your explicit consent\n• Child Protection: Special safeguards for minors\' data\n• Penalties up to ₹250 crore for violations\n\nThe Act empowers every Indian citizen to take control of their digital identity. ScamSafe was built on these principles — helping you exercise your legal right to remove personal data from data brokers and spam databases.',
    icon: Scale,
    color: 'text-accent-green',
  },
  {
    id: 202,
    category: 'Scam Alert',
    date: 'Sep 2023',
    title: 'KYC Fraud Wave: RBI Warns Against Fake Bank KYC Update Messages',
    summary: 'The RBI issued an urgent advisory as fraudsters sent millions of fake KYC update SMS messages, stealing banking credentials of lakhs of Indians.',
    content: 'The Reserve Bank of India (RBI) issued an urgent advisory warning citizens about a massive wave of fake KYC update scams. Fraudsters sent bulk SMS and WhatsApp messages claiming that victims\' bank accounts would be frozen unless they completed KYC verification through a provided link.\n\nHow the scam worked:\n• Victims received SMS: "Your account will be blocked. Update KYC now"\n• The link led to a fake bank website that looked identical to the real one\n• Victims entered their login credentials, debit card details, and OTPs\n• Scammers immediately drained their accounts\n\nOver 12 lakh complaints were filed on the 1930 helpline in September 2023 alone. The RBI clarified that banks never ask for KYC updates via SMS links. The scammers obtained phone numbers from data broker lists, enabling them to target millions of people simultaneously.',
    icon: AlertTriangle,
    color: 'text-accent-red',
  },
  {
    id: 203,
    category: 'Data Leak',
    date: 'Jun 2023',
    title: 'MobiKwik Data Breach: 10 Crore Users\' KYC Data Leaked Online',
    summary: 'Fintech platform MobiKwik suffered a breach exposing KYC documents, Aadhaar cards, and financial data of 10 crore users on dark web forums.',
    content: 'Digital payments platform MobiKwik faced allegations of a massive data breach affecting approximately 10 crore users. The leaked data reportedly included:\n\n• Aadhaar card images and numbers\n• PAN card details\n• Phone numbers and email addresses\n• KYC documents submitted during account verification\n• Transaction histories\n\nThe 8.2 TB database was found on dark web forums with a searchable interface. While MobiKwik initially denied the breach, independent security researchers confirmed the authenticity of the data. This incident highlighted the risks of sharing KYC documents with fintech platforms and the importance of data minimization — sharing only what is absolutely necessary.',
    icon: AlertTriangle,
    color: 'text-accent-red',
  },
];

export default function Blog() {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === filter);

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold mb-2">Scam Watch India</h1>
        <p className="text-gray-400 text-sm">
          Latest scams, data breaches & government actions to protect Indian citizens
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {['all', 'Scam Alert', 'Data Leak', 'Government Action'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === cat
                ? 'bg-accent-orange/20 text-accent-orange border border-accent-orange/30'
                : 'bg-dark-card text-gray-500 border border-dark-border'
            }`}
          >
            {cat === 'all' ? 'All Posts' : cat}
          </button>
        ))}
      </motion.div>

      {/* Blog Posts */}
      <div className="flex flex-col gap-3">
        {filtered.map((post, idx) => {
          const Icon = post.icon;
          const isExpanded = expandedId === post.id;
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : post.id)}
                className="w-full text-left p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    post.category === 'Scam Alert' ? 'bg-accent-red/15' :
                    post.category === 'Data Leak' ? 'bg-accent-red/15' :
                    'bg-accent-green/15'
                  }`}>
                    <Icon size={16} className={post.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] uppercase tracking-wider font-bold ${post.color}`}>{post.category}</span>
                      <span className="text-[9px] text-gray-600">·</span>
                      <span className="text-[9px] text-gray-600">{post.date}</span>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug mb-1">{post.title}</h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{post.summary}</p>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                  </div>
                </div>
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0">
                      <div className="border-t border-dark-border pt-3">
                        <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{post.content}</p>
                        <div className="mt-3 p-3 rounded-xl bg-accent-orange/5 border border-accent-orange/20">
                          <p className="text-[10px] text-accent-orange font-medium">
                            <Shield size={12} className="inline mr-1" />
                            Protect yourself: Scan your phone number on ScamSafe to check if your data is exposed in broker databases.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-5 text-center"
      >
        <Newspaper size={24} className="text-accent-orange mx-auto mb-3" />
        <h3 className="font-bold text-sm mb-1">Don't Be the Next Victim</h3>
        <p className="text-xs text-gray-500 mb-3">Data brokers sell your phone number to scammers. Remove your data today.</p>
        <Link
          to="/"
          className="glow-button-orange w-full py-3 text-sm flex items-center justify-center gap-2"
        >
          Scan My Data Now — Free
          <ChevronRight size={14} />
        </Link>
      </motion.div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 pb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20">
          <Shield size={14} className="text-accent-green" />
          <span className="text-xs text-accent-green font-medium">100% DPDP Act 2023 Compliant</span>
        </div>
        <p className="text-[9px] text-gray-700">© 2026 ScamSafe. All rights reserved.</p>
      </div>
    </div>
  );
}
