import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, LogOut, Phone } from 'lucide-react';
import ScamSafeLogo from './ScamSafeLogo';
import { useApp } from '../contexts/AppContext';

export default function NavHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, reset } = useApp();

  // Don't show on landing page
  if (location.pathname === '/') return null;

  const handleLogout = () => {
    reset();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex items-center justify-between mb-4 -mt-2">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors py-1.5 pr-2"
      >
        <ArrowLeft size={16} />
        <span className="text-xs font-medium">Back</span>
      </button>
      <ScamSafeLogo size={22} showText={true} />
      <div className="flex items-center gap-2">
        {phone && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <Phone size={10} />
            <span>***{phone.slice(-4)}</span>
          </div>
        )}
        {phone ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors py-1.5 pl-1"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-accent-orange transition-colors py-1.5 pl-2"
          >
            <Home size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
