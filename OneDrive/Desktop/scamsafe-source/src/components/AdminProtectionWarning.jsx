import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, X, Eye, EyeOff } from 'lucide-react';

export default function AdminProtectionWarning() {
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_protection_warning_dismissed');
    if (saved) {
      const dismissedTime = parseInt(saved);
      // Show again after 24 hours
      if (Date.now() - dismissedTime > 24 * 60 * 60 * 1000) {
        setDismissed(false);
        localStorage.removeItem('admin_protection_warning_dismissed');
      } else {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('admin_protection_warning_dismissed', Date.now().toString());
  };

  if (dismissed) return null;

  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle size={20} className="text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-red-400 mb-2">
            IMPORTANT: Paid Customer Protection Rules
          </h3>
          
          <div className="text-xs text-gray-300 space-y-2">
            <p>
              <strong>NEVER delete paid customer data</strong> - even if requested. Paid customers have legal rights to their service.
            </p>
            
            <div className="bg-black/30 rounded-lg p-3 border border-red-500/20">
              <p className="text-red-400 font-semibold mb-1">Database Protections Active:</p>
              <ul className="text-xs space-y-1 text-gray-300">
                <li> Customers with payments cannot be deleted (database constraint)</li>
                <li> All deletion attempts are logged in admin_audit_log</li>
                <li> Only soft delete allowed (is_deleted=true flag)</li>
                <li> Historical payment/invoice data preserved forever</li>
              </ul>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-red-400 hover:text-red-300 underline flex items-center gap-1"
              >
                {showDetails ? <EyeOff size={12} /> : <Eye size={12} />}
                {showDetails ? 'Hide' : 'Show'} Details
              </button>
            </div>
            
            {showDetails && (
              <div className="mt-3 p-3 bg-black/40 rounded-lg border border-gray-700 text-xs space-y-2">
                <p><strong>What to do instead of deleting:</strong></p>
                <ul className="space-y-1 text-gray-300">
                  <li>1. Set subscription_status = 'CANCELLED'</li>
                  <li>2. Set next_billing_date = NULL</li>
                  <li>3. Add note to customer record</li>
                  <li>4. Preserve all historical data</li>
                </ul>
                
                <p className="mt-2 text-yellow-400">
                  <strong>Customer 9810174444 (Shield Pro)</strong> has been restored and is now protected.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-green-400" />
              <span className="text-xs text-green-400">Protection system active</span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <X size={12} />
              Dismiss (24h)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
