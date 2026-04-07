import React, { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import ScanScreen from './pages/ScanScreen';
import Results from './pages/Results';
import Pricing from './pages/Pricing';
import CompleteProfile from './pages/CompleteProfile';
import RemovalScreen from './pages/RemovalScreen';
import Dashboard from './pages/Dashboard';
import ReappearanceTracker from './pages/ReappearanceTracker';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Blog from './pages/Blog';
import ThankYou from './pages/ThankYou';
import Admin from './pages/Admin';
import MarketingLanding from './pages/MarketingLanding';
import Contact from './pages/Contact';
import Transparency from './pages/Transparency';
import About from './pages/About';
import RefundPolicy from './pages/RefundPolicy';
import Disclaimer from './pages/Disclaimer';
import Review from './pages/Review';
import DPDPAct from './pages/DPDPAct';
import InboxShield from './pages/InboxShield';
import Knowledge from './pages/Knowledge';
import InboxCallback from './pages/InboxCallback';
import PaymentCallback from './pages/PaymentCallback';
import InstallPrompt from './components/InstallPrompt';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import NavHeader from './components/NavHeader';
import { purgePIIFromStorage } from './utils/security';
import { useUTM } from './hooks/useUTM';

const LiveDashboard = React.lazy(() => import('./pages/LiveDashboard'));

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(e, info) { console.error('ErrorBoundary:', e, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, color: '#EF4444', background: '#0C2340', minHeight: '100vh' }}>
          <h2>Something went wrong</h2>
          <pre style={{ fontSize: 12, color: '#9090B8', whiteSpace: 'pre-wrap' }}>{this.state.error.toString()}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '8px 16px', background: '#F4621F', color: '#fff', border: 'none', borderRadius: 8 }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  useEffect(() => { purgePIIFromStorage(); }, []);
  useUTM();
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  if (isAdmin) {
    return (
      <ErrorBoundary>
        <Admin />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col items-center">
        <div className="w-full max-w-mobile mx-auto px-4 py-6">
          <NavHeader />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/scan" element={<ScanScreen />} />
            <Route path="/results" element={<Results />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/removal" element={<RemovalScreen />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reappearance" element={<ReappearanceTracker />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/welcome" element={<MarketingLanding />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/about" element={<About />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/review/:customerId/:token" element={<Review />} />
            <Route path="/dpdp-act" element={<DPDPAct />} />
            <Route path="/inbox-shield/callback" element={<InboxCallback />} />
            <Route path="/inbox-shield" element={<InboxShield />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/knowledge/:slug" element={<Knowledge />} />
            <Route path="/live" element={
              <Suspense fallback={<div style={{ color: '#9090B8', textAlign: 'center', paddingTop: 40 }}>Loading...</div>}>
                <LiveDashboard />
              </Suspense>
            } />
          </Routes>

        </div>
        <InstallPrompt />
        <PWAInstallPrompt />
      </div>
    </ErrorBoundary>
  );
}
