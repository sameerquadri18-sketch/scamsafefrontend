import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldAlert, Phone, Mail, MapPin, CreditCard, Fingerprint, Calendar, User, Wifi } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { BROKERS } from '../utils/constants';
import { scanFree } from '../utils/api';

function maskPhone(p) { return p ? `+91 ${p.slice(0, 2)}••••${p.slice(-4)}` : '+91 ••••••••••'; }

const DATA_ICONS = {
  Phone: Phone,
  Email: Mail,
  Address: MapPin,
  PAN: CreditCard,
  Aadhaar: Fingerprint,
  DOB: Calendar,
  Name: User,
  Carrier: Wifi,
};

export default function ScanScreen() {
  const navigate = useNavigate();
  const { phone, email, startScan, updateScanProgress, setScanResults, scanProgress } = useApp();
  const [currentBrokerIdx, setCurrentBrokerIdx] = useState(0);
  const [scannedBrokers, setScannedBrokers] = useState([]);
  const [foundBrokers, setFoundBrokers] = useState([]);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [cooldownMsg, setCooldownMsg] = useState('');
  const hasStarted = useRef(false);
  const apiResultRef = useRef(null);

  useEffect(() => {
    if (!phone) {
      navigate('/');
      return;
    }
    if (hasStarted.current) return;
    hasStarted.current = true;
    startScan();
    runScan();
  }, []);

  const runScan = async () => {
    // Fire real API call in parallel with the animation
    const apiPromise = scanFree(phone, email || '')
      .then((res) => {
        apiResultRef.current = res.data;
        // Show personal info as soon as available
        if (res.data?.personal_info) {
          setPersonalInfo(res.data.personal_info);
        }
      })
      .catch((err) => {
        console.error('Scan API error:', err);
        if (err?.response?.status === 429) {
          const d = err.response.data || {};
          const msg = d.message || d.detail || 'Please wait before rescanning.';
          setCooldownMsg(msg);
          // If backend returned cached scan data, use it
          if (d.cached_scan) {
            apiResultRef.current = { ...d.cached_scan, cooldown: true, cached: true,
              scans_used: d.scans_used, scans_limit: d.scans_limit };
          } else {
            apiResultRef.current = { cooldown: true };
          }
          return;
        }
        apiResultRef.current = { error: true, message: err?.response?.data?.detail || err?.message || 'Scan failed' };
      });

    // Run animated UX scan in parallel
    const shuffled = [...BROKERS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      await new Promise((r) => setTimeout(r, 350 + Math.random() * 150));
      const broker = shuffled[i];
      setCurrentBrokerIdx(i);
      setScannedBrokers((prev) => [...prev, broker]);

      // Progressively reveal found brokers from API results if available
      const apiData = apiResultRef.current;
      if (apiData) {
        const match = apiData.exposed_brokers?.find((b) => b.name === broker.name || b.domain === broker.domain);
        if (match) {
          setFoundBrokers((prev) => {
            if (prev.some((b) => b.name === match.name)) return prev;
            return [...prev, { ...broker, ...match, found: true, dataTypes: match.data_types || [] }];
          });
        }
      }
      updateScanProgress(Math.round(((i + 1) / shuffled.length) * 100));
    }

    // Wait for API to finish if it hasn't yet
    await apiPromise;
    await new Promise((r) => setTimeout(r, 600));

    const apiData = apiResultRef.current;

    // If cooldown active but has cached data, show cached results
    if (apiData?.cooldown && apiData?.exposed_brokers) {
      const exposed = (apiData.exposed_brokers || []).map((b) => ({
        ...b, found: true, dataTypes: b.data_types || [], risk: b.risk || 'MED',
      }));
      setScanResults({
        exposedBrokers: exposed,
        dataTypesFound: apiData.data_types_found || [...new Set(exposed.flatMap((b) => b.dataTypes))],
        totalScanned: apiData.total_scanned || shuffled.length,
        personalInfo: apiData.personal_info || null,
        cached: true,
        scans_used: apiData.scans_used || 0,
        scans_limit: apiData.scans_limit || 2,
      });
      navigate('/results');
      return;
    }
    if (apiData?.cooldown) return;

    if (apiData && !apiData.error) {
      const exposed = (apiData.exposed_brokers || []).map((b) => ({
        ...b,
        found: true,
        dataTypes: b.data_types || [],
        risk: b.risk || 'MED',
      }));
      const dataTypes = apiData.data_types_found || [...new Set(exposed.flatMap((b) => b.dataTypes))];

      setScanResults({
        exposedBrokers: exposed,
        dataTypesFound: dataTypes,
        totalScanned: apiData.total_scanned || shuffled.length,
        personalInfo: apiData.personal_info || null,
        cached: apiData.cached || false,
        days_until_rescan: apiData.days_until_rescan || 0,
        scans_used: apiData.scans_used || 0,
        scans_limit: apiData.scans_limit || 2,
      });
    } else if (apiData?.error) {
      // API failed — still navigate but with whatever we found
      setScanResults({
        exposedBrokers: foundBrokers,
        dataTypesFound: [...new Set(foundBrokers.flatMap((b) => b.dataTypes))],
        totalScanned: shuffled.length,
        personalInfo: null,
      });
    }

    navigate('/results');
  };

  const currentBroker = BROKERS[currentBrokerIdx] || BROKERS[0];

  // Build personal data display from real backend data
  const displayData = {};
  displayData['Phone'] = maskPhone(phone);
  if (personalInfo?.name) displayData['Name'] = personalInfo.name;
  if (personalInfo?.city) displayData['City'] = personalInfo.city + (personalInfo.state ? `, ${personalInfo.state}` : '');
  if (personalInfo?.address) displayData['Address'] = personalInfo.address;
  if (personalInfo?.carrier) displayData['Carrier'] = personalInfo.carrier;
  if (email) displayData['Email'] = email.replace(/(.{2})(.*)(@.*)/, '$1•••$3');

  if (cooldownMsg) {
    return (
      <div className="flex flex-col gap-6 min-h-[80vh] justify-center items-center text-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-16 h-16 rounded-full bg-accent-orange/15 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={28} className="text-accent-orange" />
          </div>
          <h2 className="text-xl font-bold mb-2">Rescan Cooldown Active</h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto mb-6">{cooldownMsg}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="glow-button !py-3 !px-8 !text-sm"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-[80vh] justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold mb-2">Scanning 72 Databases</h1>
        <p className="text-gray-400 text-sm">
          Checking data brokers, directories & leaked databases...
        </p>
      </motion.div>

      {/* Progress bar */}
      <div className="scan-progress-bar">
        <motion.div
          className="scan-progress-fill"
          initial={{ width: '0%' }}
          animate={{ width: `${scanProgress}%` }}
        />
      </div>
      <p className="text-center text-xs text-gray-500 -mt-4 font-mono">{scanProgress}%</p>

      {/* Current scan target */}
      <motion.div
        key={currentBrokerIdx}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-4 flex items-center gap-3"
      >
        <Loader2 size={20} className="text-accent-orange animate-spin" />
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Currently scanning</p>
          <p className="font-mono text-sm font-medium text-white">{currentBroker.name}</p>
        </div>
      </motion.div>

      {/* Real Personal Data Found — shows actual data from backend */}
      {(Object.keys(displayData).length > 1 || foundBrokers.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 border-accent-red/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={14} className="text-accent-red" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-red">
              {personalInfo?.name ? `${personalInfo.name}'s Data Found` : 'Your Data Found in Databases'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(displayData).map(([type, value]) => {
              const Icon = DATA_ICONS[type] || DATA_ICONS['Phone'];
              return (
                <div key={type} className="flex items-center gap-2 bg-dark-bg/50 rounded-lg px-2.5 py-1.5">
                  <Icon size={12} className="text-accent-red flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-gray-600">{type}</p>
                    <p className="text-[11px] text-gray-300 font-mono truncate">{value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Found brokers */}
      <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
        <AnimatePresence>
          {foundBrokers.map((broker) => (
            <motion.div
              key={broker.id || broker.name}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="glass-card p-3 flex items-center gap-3 border-accent-red/30"
            >
              <span className="relative flex h-3 w-3 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{broker.name}</span>
                  <span className={`risk-badge-${(broker.risk || 'med').toLowerCase()}`}>{broker.risk}</span>
                </div>
                <p className="text-[10px] text-gray-500">
                  {broker.category} · <span className="text-accent-red">{(broker.dataTypes || ['Phone']).join(', ')}</span>
                </p>
              </div>
              <ShieldAlert size={16} className="text-red-400 flex-shrink-0" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Scanned count */}
      <div className="text-center text-xs text-gray-600">
        <span className="text-accent-red font-bold">{foundBrokers.length}</span> databases found with your data
        {' · '}
        <span className="text-gray-500">{scannedBrokers.length}/{BROKERS.length} scanned</span>
      </div>
    </div>
  );
}
