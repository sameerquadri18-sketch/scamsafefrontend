import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { inboxShieldExchangeCode } from '../utils/api';

export default function InboxCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useApp();
  const phone = user?.phone || '';
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const err = searchParams.get('error');

    if (err) {
      setStatus('error');
      setError(`Google returned error: ${err}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setError('No authorization code received from Google.');
      return;
    }

    const exchangeCode = async () => {
      try {
        const res = await inboxShieldExchangeCode(state || phone, code);
        if (res.success) {
          setStatus('success');
          setTimeout(() => navigate('/inbox-shield?connected=true'), 1500);
        } else {
          setStatus('error');
          setError(res.detail || 'Failed to connect email.');
        }
      } catch (e) {
        setStatus('error');
        setError(e?.response?.data?.detail || e?.message || 'Connection failed.');
      }
    };

    exchangeCode();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      {status === 'processing' && (
        <>
          <Loader2 size={36} className="animate-spin text-accent-purple" />
          <h2 className="text-lg font-bold">Connecting your email...</h2>
          <p className="text-sm text-gray-400">Please wait while we complete the setup.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle2 size={40} className="text-accent-green" />
          <h2 className="text-lg font-bold text-accent-green">Email Connected!</h2>
          <p className="text-sm text-gray-400">Redirecting to Inbox Shield...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle size={40} className="text-red-400" />
          <h2 className="text-lg font-bold text-red-400">Connection Failed</h2>
          <p className="text-sm text-gray-400 text-center">{error}</p>
          <button
            onClick={() => navigate('/inbox-shield')}
            className="glow-button-orange px-6 py-2 text-sm mt-2"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}
