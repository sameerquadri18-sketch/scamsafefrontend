import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, ShieldCheck, Search, Database, Lock, ChevronRight, ChevronDown, ChevronUp,
  AlertTriangle, Clock, Phone, Zap, Eye, FileText, Mail, CheckCircle2,
  Users, Star, ArrowRight, Instagram, Youtube, Scale, Smartphone, Globe,
  ShieldAlert, Trash2, Bell, BarChart3
} from 'lucide-react';
import ScamSafeLogo from '../components/ScamSafeLogo';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' } };

const STATS = [
  { value: '72+', label: 'Data Broker Databases Scanned', icon: Database, color: '#8B5CF6' },
  { value: '₹22,845 Cr', label: 'Lost to Cyber Fraud in 2024', icon: AlertTriangle, color: '#EF4444' },
  { value: '70,000+', label: 'Indians Scammed Every Day', icon: Users, color: '#F59E0B' },
  { value: 'DPDP 2023', label: 'Legal Framework Used', icon: ShieldCheck, color: '#10B981' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Enter Your Number', desc: 'Provide your 10-digit mobile number. We verify it with a one-time OTP — no spam, no storage.', icon: Phone, color: '#3B82F6' },
  { step: '02', title: 'We Scan 72+ Databases', desc: 'Our engine scans data brokers, spam lists, dark web leaks, and telemarketing databases.', icon: Search, color: '#F59E0B' },
  { step: '03', title: 'Legal Removal Notices Sent', desc: 'We send DPDP Act 2023 legal notices to every broker holding your data. Most comply within 3-7 business days.', icon: FileText, color: '#10B981' },
];

const FEATURES = [
  { title: 'Deep Scanning', desc: 'Scan your phone number across 72+ data broker databases.', icon: Zap, color: '#3B82F6' },
  { title: 'DPDP Act Compliance', desc: 'Legal removal notices under India\'s Digital Personal Data Protection Act 2023.', icon: Scale, color: '#10B981' },
  { title: '256-bit Encryption', desc: 'Your data is encrypted end-to-end. Subscriber data stored encrypted for protection.', icon: Lock, color: '#8B5CF6' },
  { title: 'Automated Rescans', desc: 'Shield rescans monthly, Shield Pro weekly — new removal requests sent automatically.', icon: Bell, color: '#F59E0B' },
  { title: 'Exposure Reports', desc: 'Detailed reports showing exactly which databases had your data.', icon: BarChart3, color: '#EC4899' },
  { title: 'Minimal Data Storage', desc: 'ScamSafe stores only what\'s needed for removal — and deletes your data from brokers.', icon: Trash2, color: '#EF4444' },
];

const TESTIMONIALS = [
  { name: 'Rajesh K.', location: 'Mumbai', text: 'I was getting 15+ spam calls daily. After ScamSafe removed my data, it dropped to almost zero within 2 weeks.', rating: 5 },
  { name: 'Priya S.', location: 'Bangalore', text: 'I had no idea my phone number was in 18 databases! ScamSafe found and removed them all. Finally some peace.', rating: 5 },
  { name: 'Amit P.', location: 'Delhi', text: 'My father almost fell for a digital arrest scam. Got ScamSafe for the whole family. Best ₹499 I\'ve spent.', rating: 5 },
  { name: 'Sneha M.', location: 'Pune', text: 'The scan was instant and the removal was automatic. No forms, no calls to customer care. Just works.', rating: 5 },
];

const FAQS = [
  { q: 'How does ScamSafe find my data?', a: 'We scan 72+ known data broker databases, spam caller lists, telemarketing databases, and dark web leak indexes using your phone number. Our scanner checks each source and reports exactly where your data was found.' },
  { q: 'Is it legal to demand data removal?', a: 'Yes. The Digital Personal Data Protection (DPDP) Act 2023 gives every Indian citizen the Right to Erasure (Section 12). Companies are legally required to delete your personal data upon request. ScamSafe sends formal legal notices on your behalf.' },
  { q: 'Will I stop getting spam calls?', a: 'Most users report a significant reduction in spam calls within 1-2 weeks of removal. However, new data brokers may acquire your number again, which is why we offer automated rescans (monthly or weekly) with our paid plans.' },
  { q: 'Is my data safe with ScamSafe?', a: 'Yes. Free scan data stays in your browser only. Subscriber data (phone + email) is stored with AES-256 encryption solely to power ongoing protection. All data deleted immediately on account deletion.' },
  { q: 'What happens after removal?', a: 'We send legally binding DPDP Act notices via email to every data broker. Most legitimate databases comply within 3-7 business days. For non-compliant brokers, we escalate automatically.' },
  { q: 'How is this different from DND/TRAI?', a: 'DND only blocks telemarketing calls from registered companies. It doesn\'t remove your data from broker databases or prevent scammers from accessing your information. ScamSafe goes to the source — removing your data from the databases scammers buy from.' },
];

const PROBLEMS = [
  { icon: Phone, text: '15+ spam calls every day', color: '#EF4444' },
  { icon: Mail, text: 'Phishing SMS and WhatsApp scams', color: '#F59E0B' },
  { icon: ShieldAlert, text: 'Digital arrest & KYC fraud attempts', color: '#8B5CF6' },
  { icon: Globe, text: 'Your data sold on dark web markets', color: '#EC4899' },
  { icon: Eye, text: 'Identity theft & financial fraud', color: '#3B82F6' },
  { icon: Smartphone, text: 'Loan app harassment', color: '#10B981' },
];

export default function MarketingLanding() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  // Live counter
  const [secsSinceMidnight, setSecsSinceMidnight] = useState(() => {
    const now = new Date();
    const ist = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 60 * 60 * 1000);
    return ist.getHours() * 3600 + ist.getMinutes() * 60 + ist.getSeconds();
  });
  const VICTIMS_PER_SEC = 70000 / 86400;
  const scamCount = Math.floor(secsSinceMidnight * VICTIMS_PER_SEC);

  useEffect(() => {
    const t = setInterval(() => setSecsSinceMidnight(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col gap-0 -mx-4 -mt-6">

      {/* ═══════════ HERO ═══════════ */}
      <section className="px-4 pt-10 pb-12 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0E1B2E 0%, #0C2340 100%)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 50% 0%, #F4621F33 0%, transparent 60%)' }} />

        <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="relative z-10">
          <div className="flex justify-center mb-4">
            <ScamSafeLogo size={48} showText={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-red/10 border border-accent-red/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
            <span className="text-[11px] text-accent-red font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {scamCount.toLocaleString('en-IN')} Indians scammed today
            </span>
          </div>

          <h1 className="text-3xl font-extrabold leading-tight mb-4">
            Your Phone Number Is In{' '}
            <span className="text-accent-orange">Scammer Databases</span>
            <br />Right Now.
          </h1>

          <p className="text-gray-400 text-sm leading-relaxed mb-2 max-w-sm mx-auto">
            Data brokers sell your personal information to telemarketers, scammers, and fraud syndicates.
            ScamSafe finds and removes your data from 72+ databases using India's DPDP Act 2023.
          </p>

          <p className="text-[11px] text-accent-green/80 font-medium italic mb-6">
            ScamSafe deletes your data everywhere — including from ScamSafe itself when you're done.
          </p>

          <button
            onClick={() => navigate('/')}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-accent-orange to-accent-red text-white font-bold text-sm shadow-lg shadow-accent-orange/20 hover:shadow-accent-orange/40 transition-all"
          >
            <Search size={18} />
            Scan My Number Free
            <ArrowRight size={16} />
          </button>
          <p className="text-[10px] text-gray-600 mt-2">Free scan · No credit card needed · Takes 30 seconds</p>
        </motion.div>
      </section>

      {/* ═══════════ PROBLEM ═══════════ */}
      <section className="px-4 py-10" style={{ background: '#0A0A14' }}>
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-widest text-accent-red font-bold">The Problem</span>
          <h2 className="text-xl font-bold mt-2">Your Data Is Being Used Against You</h2>
          <p className="text-gray-500 text-xs mt-2">Every day, data brokers profit from selling your personal information to:</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-2.5">
          {PROBLEMS.map((p, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05, duration: 0.4 }}
              className="glass-card p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}15` }}>
                <p.icon size={14} style={{ color: p.color }} />
              </div>
              <span className="text-[11px] text-gray-300 font-medium leading-tight">{p.text}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="px-4 py-10" style={{ background: 'linear-gradient(180deg, #0C2340 0%, #0E1B2E 100%)' }}>
        <div className="grid grid-cols-2 gap-3">
          {STATS.map((s, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass-card p-4 text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${s.color}15` }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div className="text-lg font-extrabold text-white">{s.value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="px-4 py-10" style={{ background: '#0A0A14' }}>
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-widest text-accent-green font-bold">How It Works</span>
          <h2 className="text-xl font-bold mt-2">3 Simple Steps to Protect Yourself</h2>
        </motion.div>

        <div className="flex flex-col gap-4">
          {HOW_IT_WORKS.map((item, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card p-4 flex gap-4 items-start relative overflow-hidden">
              <div className="absolute top-2 right-3 text-4xl font-black text-white/[0.03]">{item.step}</div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${item.color}20`, color: item.color }}>STEP {item.step}</span>
                  <h3 className="text-sm font-bold">{item.title}</h3>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="mt-6 text-center">
          <button onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-green to-emerald-600 text-white font-bold text-sm shadow-lg shadow-accent-green/20">
            <Shield size={16} />
            Start Free Scan Now
            <ArrowRight size={14} />
          </button>
        </motion.div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="px-4 py-10" style={{ background: 'linear-gradient(180deg, #0C2340 0%, #0E1B2E 100%)' }}>
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-widest text-accent-purple font-bold">Features</span>
          <h2 className="text-xl font-bold mt-2">Complete Data Protection</h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-2.5">
          {FEATURES.map((f, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.06, duration: 0.4 }}
              className="glass-card p-3.5 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${f.color}15` }}>
                <f.icon size={16} style={{ color: f.color }} />
              </div>
              <h3 className="text-xs font-bold">{f.title}</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ DPDP ACT ═══════════ */}
      <section className="px-4 py-10" style={{ background: '#0A0A14' }}>
        <motion.div {...fadeUp} transition={{ duration: 0.5 }}
          className="glass-card p-5 border-accent-green/20 text-center"
          style={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.08)' }}>
          <div className="w-14 h-14 rounded-2xl bg-accent-green/15 flex items-center justify-center mx-auto mb-3">
            <Scale size={28} className="text-accent-green" />
          </div>
          <h2 className="text-lg font-bold mb-2">Powered by DPDP Act 2023</h2>
          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            India's Digital Personal Data Protection Act gives you the <strong className="text-white">legal right to demand deletion</strong> of your personal data from any company.
            Non-compliance can result in penalties of up to <strong className="text-accent-orange">₹250 crore</strong>.
          </p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            ScamSafe sends formal legal notices under Section 12 (Right to Erasure) of the DPDP Act 2023 to every data broker holding your information. 
            This isn't just a request — it's a legally binding demand backed by Indian law.
          </p>
        </motion.div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="px-4 py-10" style={{ background: 'linear-gradient(180deg, #0C2340 0%, #0E1B2E 100%)' }}>
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Testimonials</span>
          <h2 className="text-xl font-bold mt-2">What Our Users Say</h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.4 }}
              className="glass-card p-4">
              <div className="flex gap-0.5 mb-2">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed mb-2 italic">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-accent-purple">{t.name[0]}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-white">{t.name}</span>
                  <span className="text-[10px] text-gray-600 ml-1.5">{t.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ PRICING PREVIEW ═══════════ */}
      <section className="px-4 py-10" style={{ background: '#0A0A14' }}>
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-widest text-accent-orange font-bold">Pricing</span>
          <h2 className="text-xl font-bold mt-2">Plans That Protect You</h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {[
            { name: 'Free Scan', price: '₹0', features: ['Scan 72+ databases', 'See where your data is exposed', 'Instant results'], cta: 'Scan Now', primary: false },
            { name: 'Shield', price: '₹139/mo', features: ['Everything in Free', 'Automated removal notices', 'Monthly rescans', 'Email support'], cta: 'Get Shield', primary: true },
            { name: 'Family Vault', price: '₹499/mo', features: ['Up to 5 family members', 'Weekly rescans', 'Priority removal', 'Phone support'], cta: 'Protect Family', primary: false },
          ].map((plan, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`glass-card p-4 ${plan.primary ? 'border-accent-orange/30 ring-1 ring-accent-orange/20' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold">{plan.name}</h3>
                  <span className="text-lg font-extrabold text-white">{plan.price}</span>
                </div>
                {plan.primary && (
                  <span className="text-[9px] font-bold bg-accent-orange/20 text-accent-orange px-2 py-1 rounded-full">POPULAR</span>
                )}
              </div>
              <ul className="flex flex-col gap-1.5 mb-3">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-[11px] text-gray-400">
                    <CheckCircle2 size={12} className="text-accent-green flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate(plan.primary ? '/pricing' : '/')}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                  plan.primary
                    ? 'bg-gradient-to-r from-accent-orange to-accent-red text-white'
                    : 'bg-dark-border/60 text-gray-300 hover:bg-dark-border'
                }`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="px-4 py-10" style={{ background: 'linear-gradient(180deg, #0C2340 0%, #0E1B2E 100%)' }}>
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">FAQ</span>
          <h2 className="text-xl font-bold mt-2">Frequently Asked Questions</h2>
        </motion.div>

        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05, duration: 0.4 }}
              className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-3.5 text-left"
              >
                <span className="text-xs font-semibold pr-4">{faq.q}</span>
                {openFaq === i ? <ChevronUp size={14} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-3.5 pb-3.5 -mt-1">
                  <p className="text-[11px] text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="px-4 py-12 text-center" style={{ background: 'linear-gradient(180deg, #0E1B2E 0%, #14060A 50%, #0E1B2E 100%)' }}>
        <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
          <div className="w-16 h-16 rounded-2xl bg-accent-orange/15 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-accent-orange" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2">
            Stop Scammers.<br />
            <span className="text-accent-orange">Protect Your Data.</span>
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
            Take back control of your personal data with legal DPDP Act protection.
          </p>
          <button onClick={() => navigate('/')}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-accent-orange to-accent-red text-white font-bold text-base shadow-xl shadow-accent-orange/25 hover:shadow-accent-orange/40 transition-all">
            <Search size={18} />
            Scan My Number — It's Free
          </button>
          <p className="text-[10px] text-gray-600 mt-3">No signup required · Results in 30 seconds · 100% private</p>
        </motion.div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <section className="px-4 py-8 text-center flex flex-col items-center gap-3" style={{ background: '#050510' }}>
        <ScamSafeLogo size={28} showText={true} />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20">
          <Shield size={12} className="text-accent-green" />
          <span className="text-[10px] text-accent-green font-medium">100% DPDP Act 2023 Compliant</span>
        </div>

        <div className="flex items-center gap-3">
          <a href="https://www.instagram.com/ssafe2026" target="_blank" rel="noopener noreferrer"
            className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/20 flex items-center justify-center hover:bg-pink-500/25 transition-colors">
            <Instagram size={16} className="text-pink-500" />
          </a>
          <a href="https://youtube.com/@scamsafe" target="_blank" rel="noopener noreferrer"
            className="w-9 h-9 rounded-xl bg-red-600/15 border border-red-600/20 flex items-center justify-center hover:bg-red-600/25 transition-colors">
            <Youtube size={16} className="text-red-500" />
          </a>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <Mail size={12} className="text-accent-purple" />
          <a href="mailto:support@scamsafe.in" className="hover:text-white transition-colors">support@scamsafe.in</a>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium">
          <Link to="/blog" className="hover:text-white transition-colors">Scam Watch</Link>
          <span className="text-gray-600">·</span>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span className="text-gray-600">·</span>
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          <span className="text-gray-600">·</span>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          <span className="text-gray-600">·</span>
          <Link to="/transparency" className="hover:text-white transition-colors">Transparency</Link>
        </div>
        <p className="text-[10px] text-gray-500">© 2026 ScamSafe. All rights reserved.</p>
      </section>
    </div>
  );
}
