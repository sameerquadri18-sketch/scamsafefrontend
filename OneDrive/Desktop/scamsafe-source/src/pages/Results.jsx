import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Lock, MessageCircle, ChevronRight, Send, Sparkles, User, MapPin, Wifi, Phone, Loader2, CheckCircle, Mail, Shield, FileDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AI_QUICK_QUESTIONS } from '../utils/constants';
import { sendChatMessage, startRemovalAPI, pollRemovalStatus, subscribeForUpdates } from '../utils/api';
// BreachIntelligence removed per business requirement

const FALLBACK_RESPONSES = {
  'How did scammers get my number?': `Your phone number likely entered these databases through:\n\n1. **Online registrations** — property sites like 99acres, job portals, and e-commerce\n2. **Data brokers** — companies like Digibrood and BinaryClues buy bulk telecom data\n3. **SIM dealer leaks** — unauthorized copies of KYC documents\n4. **App permissions** — apps that access your contacts and sell them\n\nOnce in one database, your number gets resold across all of them within weeks.`,
  'What can they do with my Aadhaar?': `With your Aadhaar number, scammers can:\n\n1. **Take loans in your name** — micro-lending apps use just Aadhaar + OTP\n2. **Create fake bank accounts** — for money laundering\n3. **Impersonate government officials** — they call saying "Aadhaar verification pending" to get your OTP\n4. **Link to fake mobile numbers** — enabling further fraud\n\nThis is why removing your Aadhaar from these databases is critical. Under DPDP Act 2023, brokers face ₹250 crore penalty for non-compliance.`,
  'Is removal guaranteed?': `We have a **92% success rate** across all 72 databases.\n\nHere's how it works:\n1. We send formal **DPDP Act Section 12 & 13** legal removal notices\n2. We auto-submit opt-out forms on every broker site\n3. We re-scan monthly to ensure your data stays removed\n\nIf a broker doesn't comply within 7 days, we escalate to the Data Protection Board. The ₹250 crore penalty provision makes most brokers comply quickly.\n\nFor directories like JustDial and Sulekha, removal is near-instant. Data brokers take 3-7 business days.`,
  'How does DPDP Act protect me?': `The **Digital Personal Data Protection Act, 2023** gives you powerful rights:\n\n1. **Right to Erasure (Section 12)** — you can demand any company delete your personal data\n2. **Right to Correction (Section 13)** — you can correct inaccurate data\n3. **Penalties up to ₹250 crore** — for companies that don't comply\n4. **Data Protection Board** — an authority to hear your complaints\n\nScamSafe automates this entire process. We cite specific sections, set legal deadlines, and follow up until confirmation.`,
};

function RiskBadge({ risk }) {
  const cls = `risk-badge-${risk.toLowerCase()}`;
  return <span className={cls}>{risk}</span>;
}

function DataTag({ type }) {
  return <span className="data-tag">{type}</span>;
}

export default function Results() {
  const navigate = useNavigate();
  const { exposedBrokers, dataTypesFound, phone, email, scanResults } = useApp();
  const [activeTab, setActiveTab] = useState('report');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [removalState, setRemovalState] = useState('idle'); // idle | starting | running | done
  const [removalId, setRemovalId] = useState(null);
  const [removalProgress, setRemovalProgress] = useState(0);
  const [removalBrokers, setRemovalBrokers] = useState([]);
  const pollRef = useRef(null);

  const [removalError, setRemovalError] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const personalInfo = scanResults?.personalInfo || null;
  const exposureScore = exposedBrokers.length;
  // Show first 5 free, rest behind paywall
  const FREE_VISIBLE = 5;
  const visibleBrokers = exposedBrokers.slice(0, FREE_VISIBLE);
  const hiddenCount = Math.max(0, exposedBrokers.length - FREE_VISIBLE);

  const handleStartRemoval = async () => {
    setRemovalError('');
    
    // Defensive checks
    if (!phone) {
      setRemovalError('Phone number missing. Please go back and scan again.');
      return;
    }
    if (!exposedBrokers || exposedBrokers.length === 0) {
      setRemovalError('No exposed brokers found. Please scan first.');
      return;
    }

    setRemovalState('starting');
    try {
      // Clean broker data for API
      const cleanBrokers = exposedBrokers.map(b => ({
        name: b.name,
        domain: b.domain || '',
        category: b.category || 'Unknown',
        risk: b.risk || 'MED',
      }));

      const result = await startRemovalAPI(
        phone,
        email || '',
        cleanBrokers,
        dataTypesFound || [],
        scanResults?.personalInfo?.address || ''
      );
      if (!result || !result.removal_id) {
        setRemovalError('Server did not return a removal ID. Check backend connection.');
        setRemovalState('idle');
        return;
      }
      setRemovalId(result.removal_id);
      setRemovalState('running');
      setRemovalBrokers(result.brokers || cleanBrokers.map(b => ({ name: b.name, status: 'pending', email_sent: false })));

      pollRef.current = setInterval(async () => {
        const status = await pollRemovalStatus(result.removal_id);
        if (!status) return;
        setRemovalProgress(status.progress || 0);
        if (status.brokers) setRemovalBrokers(status.brokers);
        if (status.status === 'complete' || status.progress >= 100) {
          setRemovalState('done');
          setRemovalProgress(100);
          clearInterval(pollRef.current);
          // Navigate to Thank You page after short delay
          setTimeout(() => navigate('/thank-you'), 1500);
        }
      }, 2000);
    } catch (err) {
      console.error('Removal error:', err);
      const detail = err?.response?.data?.detail || err?.response?.statusText || err?.message || 'Unknown error';
      const status = err?.response?.status || '';
      setRemovalError(`Removal failed${status ? ` (${status})` : ''}: ${detail}`);
      setRemovalState('idle');
    }
  };

  useEffect(() => {
    if (!exposedBrokers.length) {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'ai' && chatMessages.length === 0) {
      const highRiskCount = exposedBrokers.filter((b) => b.risk === 'HIGH').length;
      const dataStr = dataTypesFound.join(', ');
      const opening = `⚠️ Your data was found in ${exposureScore} databases including ${highRiskCount} high-risk data brokers.\n\nScammers who buy from these databases get your ${dataStr}. With this combination, they can impersonate your bank, apply for loans in your name, or trick you with fake KYC calls.\n\nAap ki personal information abhi bhi openly bik rahi hai. Main aapko bata sakta hoon kaise ye remove karein — poochhiye kuch bhi.`;
      setChatMessages([{ role: 'assistant', content: opening }]);
    }
  }, [activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleQuickQuestion = (q) => {
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: q }]);
    getAIResponse(q);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: msg }]);
    getAIResponse(msg);
  };

  const getAIResponse = async (question) => {
    setIsTyping(true);
    const exposureContext = {
      total_found: exposureScore,
      exposed_brokers: exposedBrokers,
      data_types_found: dataTypesFound,
    };

    try {
      const res = await sendChatMessage(question, chatMessages, exposureContext);
      if (res.data?.response) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: res.data.response }]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.error('AI chat API error:', err);
    }

    // Fallback to pre-written responses
    const fallback = FALLBACK_RESPONSES[question]
      || `Based on your exposure profile showing ${exposureScore} database matches with ${dataTypesFound.join(', ')} data types compromised, I recommend immediate removal action.\n\nYour combination of exposed data points makes you vulnerable to targeted phishing attacks and identity fraud. The longer this data remains available, the more it gets resold.\n\nWould you like to know more about the specific risks or how our removal process works?`;

    setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Exposure Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6"
      >
        <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Your Exposure Score</p>
        <div className="relative inline-flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border-4 border-accent-red flex items-center justify-center animate-glow-pulse">
            <span className="text-5xl font-bold text-accent-red">{exposureScore}</span>
          </div>
        </div>
        <p className="text-red-400 text-sm font-medium mt-3">
          Found in {exposureScore} of 72 databases. Scammers can access your data today.
        </p>
      </motion.div>

      {/* Personal Info Card — real data from scan */}
      {personalInfo && (personalInfo.name || personalInfo.city || personalInfo.carrier) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4 border-accent-red/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={14} className="text-accent-red" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-red">Your Exposed Personal Information</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-dark-bg/50 rounded-lg px-3 py-2">
              <Phone size={12} className="text-accent-red flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] text-gray-600">Phone</p>
                <p className="text-xs text-gray-300 font-mono">+91 {phone?.slice(0, 2)}••••{phone?.slice(-4)}</p>
              </div>
            </div>
            {personalInfo.name && (
              <div className="flex items-center gap-2 bg-dark-bg/50 rounded-lg px-3 py-2">
                <User size={12} className="text-accent-red flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-gray-600">Name</p>
                  <p className="text-xs text-gray-300 font-mono truncate">{personalInfo.name}</p>
                </div>
              </div>
            )}
            {personalInfo.city && (
              <div className="flex items-center gap-2 bg-dark-bg/50 rounded-lg px-3 py-2">
                <MapPin size={12} className="text-accent-red flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-gray-600">Location</p>
                  <p className="text-xs text-gray-300 font-mono truncate">{personalInfo.city}{personalInfo.state ? `, ${personalInfo.state}` : ''}</p>
                </div>
              </div>
            )}
            {personalInfo.carrier && (
              <div className="flex items-center gap-2 bg-dark-bg/50 rounded-lg px-3 py-2">
                <Wifi size={12} className="text-accent-red flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-gray-600">Carrier</p>
                  <p className="text-xs text-gray-300 font-mono truncate">{personalInfo.carrier}</p>
                </div>
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center gap-2 bg-dark-bg/50 rounded-lg px-3 py-2 col-span-2">
                <MapPin size={12} className="text-accent-red flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-gray-600">Address</p>
                  <p className="text-xs text-gray-300 font-mono truncate">{personalInfo.address}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Data types found */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Data Types Exposed</h3>
        <div className="flex flex-wrap gap-2">
          {dataTypesFound.map((type) => (
            <span
              key={type}
              className="bg-accent-red/10 text-red-400 border border-accent-red/20 text-xs font-medium px-3 py-1.5 rounded-lg"
            >
              {type}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Cached data notice */}
      {scanResults?.cached && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 border-accent-purple/30 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-accent-purple/15 flex items-center justify-center flex-shrink-0">
            <Shield size={14} className="text-accent-purple" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-accent-purple">Previous Scan Data</p>
            <p className="text-[10px] text-gray-500">
              You've used your 2 monthly scans for this number. Scan limit resets in {scanResults.days_until_rescan || '—'} day{scanResults.days_until_rescan !== 1 ? 's' : ''}.
            </p>
          </div>
        </motion.div>
      )}

      {/* What happens next info card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 border-accent-green/20"
      >
        <h3 className="text-xs font-bold text-accent-green mb-2">What happens next:</h3>
        <div className="flex flex-col gap-1.5">
          {[
            'Deletion requests submitted to all found databases on your behalf',
            'Most databases acknowledge within 7-30 business days',
            'Full deletion can take up to 90 days as data has been circulating',
            'We monitor the removal process and send follow-up notices',
            'Non-compliant brokers are escalated to the Data Protection Board',
            'You\'ll receive status updates as companies respond',
          ].map((item) => (
            <p key={item} className="text-[10px] text-gray-400 flex items-start gap-1.5">
              <span className="text-accent-green mt-0.5">→</span>
              <span>{item}</span>
            </p>
          ))}
        </div>
      </motion.div>

      {/* Email Collection Card */}
      {!emailSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-4 border-accent-purple/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Mail size={16} className="text-accent-purple" />
            <h3 className="text-xs font-bold text-accent-purple">Get Removal Updates</h3>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">Enter your email to receive removal confirmations, rescan alerts, and compliance status updates.</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!emailInput || emailLoading) return;
            setEmailLoading(true);
            await subscribeForUpdates(phone, emailInput);
            setEmailSubmitted(true);
            setEmailLoading(false);
          }} className="flex gap-2">
            <input
              type="email"
              placeholder="you@email.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-purple/50"
            />
            <button
              type="submit"
              disabled={!emailInput || emailLoading}
              className="px-4 py-2 rounded-lg bg-accent-purple text-white text-xs font-bold disabled:opacity-40 flex items-center gap-1.5"
            >
              {emailLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Subscribe
            </button>
          </form>
          <p className="text-[8px] text-gray-600 mt-2">We'll only send removal-related updates. No spam. Unsubscribe anytime.</p>
        </motion.div>
      )}
      {emailSubmitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-4 border-accent-green/20 flex items-center gap-3"
        >
          <CheckCircle size={18} className="text-accent-green flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-accent-green">Subscribed!</p>
            <p className="text-[10px] text-gray-400">You'll receive removal updates at {emailInput}</p>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'report' ? 'bg-dark-border text-white' : 'text-gray-500'
          }`}
        >
          Report
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ai' ? 'bg-accent-purple/20 text-accent-purple' : 'text-gray-500'
          }`}
        >
          <Sparkles size={14} />
          ScamSafe Advisor
        </button>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'report' ? (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3"
          >
            {visibleBrokers.map((broker, idx) => (
              <motion.div
                key={broker.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <h3 className="font-semibold text-sm">{broker.name}</h3>
                  </div>
                  <RiskBadge risk={broker.risk} />
                </div>
                <p className="text-xs text-gray-500 mb-2">{broker.category}</p>
                <div className="flex flex-wrap gap-1.5">
                  {broker.dataTypes.map((t) => (
                    <DataTag key={t} type={t} />
                  ))}
                </div>
              </motion.div>
            ))}

            {hiddenCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 backdrop-blur-sm bg-dark-card/80 flex flex-col items-center justify-center gap-2">
                  <Lock size={24} className="text-gray-500" />
                  <p className="text-sm text-gray-400 font-medium">
                    +{hiddenCount} more databases hidden
                  </p>
                  <p className="text-xs text-gray-600">Pay to see all and remove</p>
                </div>
                <div className="opacity-20 blur-sm pointer-events-none">
                  <div className="h-16 bg-dark-border rounded-xl mb-2"></div>
                  <div className="h-16 bg-dark-border rounded-xl"></div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3"
          >
            {/* Chat messages */}
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'assistant'
                      ? 'glass-card p-4 border-accent-purple/20'
                      : 'bg-accent-purple/10 border border-accent-purple/20 rounded-2xl p-3 ml-8'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={12} className="text-accent-purple" />
                      <span className="text-xs text-accent-purple font-medium">ScamSafe Advisor</span>
                    </div>
                  )}
                  <div
                    className="text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                        .replace(/\n/g, '<br/>'),
                    }}
                  />
                </motion.div>
              ))}
              {isTyping && (
                <div className="glass-card p-4 border-accent-purple/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={12} className="text-accent-purple" />
                    <span className="text-xs text-accent-purple font-medium">ScamSafe Advisor</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-accent-purple/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-accent-purple/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-accent-purple/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick questions */}
            {chatMessages.length <= 1 && (
              <div className="flex flex-col gap-2">
                {AI_QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-left text-xs bg-dark-card border border-dark-border rounded-xl px-3 py-2.5 text-gray-400 hover:text-white hover:border-accent-purple/30 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Chat input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask about your privacy..."
                className="flex-1 bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-accent-purple/50"
              />
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim()}
                className="glow-button-purple !px-3 !py-3 !rounded-xl disabled:opacity-30"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Removal CTA + Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-2"
      >
        {removalState === 'idle' && (
          <>
            <button
              onClick={() => navigate('/pricing')}
              className="glow-button-orange w-full py-4 text-base flex items-center justify-center gap-2"
            >
              <Shield size={18} />
              Remove My Data Now — ₹124/mo
              <ChevronRight size={16} />
            </button>
            <p className="text-center text-xs text-gray-600 mt-2">
              Sends DPDP Act legal notices to all {exposedBrokers.length} databases
            </p>
            <p className="text-center text-[10px] text-gray-500 mt-1 leading-relaxed">
              Choose a plan to start sending legal DPDP Act removal notices to all exposed databases on your behalf.
            </p>
          </>
        )}

        {removalState === 'starting' && (
          <div className="glass-card p-5 flex items-center justify-center gap-3">
            <Loader2 size={20} className="animate-spin text-accent-orange" />
            <span className="text-sm text-gray-300">Starting removal process...</span>
          </div>
        )}

        {(removalState === 'running' || removalState === 'done') && (
          <div className="glass-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {removalState === 'done' ? (
                  <CheckCircle size={18} className="text-accent-green" />
                ) : (
                  <Loader2 size={18} className="animate-spin text-accent-orange" />
                )}
                <span className="text-sm font-semibold">
                  {removalState === 'done' ? 'All Deletion Requests Submitted!' : 'Submitting deletion requests...'}
                </span>
              </div>
              <span className="text-xs text-gray-400">{removalProgress}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-dark-bg rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${removalState === 'done' ? 'bg-accent-green' : 'bg-accent-orange'}`}
                initial={{ width: 0 }}
                animate={{ width: `${removalProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Broker status list */}
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {removalBrokers.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 bg-dark-bg/50 rounded-lg">
                  <span className="text-gray-300">{b.name}</span>
                  <div className="flex items-center gap-1.5">
                    {b.email_sent && (
                      <span className="flex items-center gap-1 text-accent-green">
                        <Mail size={10} /> Sent
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      b.status === 'removed' ? 'bg-accent-green/20 text-accent-green'
                      : b.status === 'processing' ? 'bg-accent-orange/20 text-accent-orange'
                      : 'bg-gray-700 text-gray-400'
                    }`}>
                      {b.status === 'removed' ? 'Submitted for Removal' : b.status === 'processing' ? 'Submitting...' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {removalState === 'done' && (
              <p className="text-[11px] text-accent-green text-center mt-1">
                Deletion requests submitted to all databases. We'll monitor the process and update you. Next rescan in 15 days.
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
