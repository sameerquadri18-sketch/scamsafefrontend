/**
 * ScamSafe Frontend Security Utilities
 * Layer 4: Phone/email masking, no PII in storage, token handling
 */

// ─── Layer 4B: Phone & Email Masking ────────────────────────────────
export function maskPhone(phone) {
  if (!phone || phone.length < 5) return phone || '';
  const digits = phone.replace(/\D/g, '');
  const last5 = digits.slice(-5);
  return `+91 XXXXX ${last5}`;
}

export function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '';
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

// ─── Layer 4A: Secure Token Storage ─────────────────────────────────
// Use sessionStorage (cleared on tab close) instead of localStorage
// Tokens should be short-lived and rotated via refresh endpoint

const TOKEN_KEY = 'ss_token';
const REFRESH_KEY = 'ss_refresh';

export function storeTokens(accessToken, refreshToken) {
  try {
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      sessionStorage.setItem(REFRESH_KEY, refreshToken);
    }
  } catch {
    // Storage not available (private browsing, etc.)
  }
}

export function getAccessToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function getRefreshToken() {
  try {
    return sessionStorage.getItem(REFRESH_KEY) || '';
  } catch {
    return '';
  }
}

export function clearTokens() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    // noop
  }
}

// ─── Layer 4C: Purge any PII from localStorage ─────────────────────
// Call this once on app startup to clean legacy data
export function purgePIIFromStorage() {
  const piiKeys = ['phone', 'email', 'user_phone', 'user_email', 'otp', 'token', 'auth_token'];
  try {
    for (const key of piiKeys) {
      localStorage.removeItem(key);
    }
  } catch {
    // noop
  }
}

// ─── Layer 4D: Result Integrity ─────────────────────────────────────
// The backend signs scan results; the frontend can call /api/v1/verify-results
// to check integrity before displaying. This is a defensive measure.
export async function verifyResultIntegrity(apiBase, results, signature) {
  if (!signature) return true; // No signature = legacy result, allow
  try {
    const resp = await fetch(`${apiBase}/api/v1/verify-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results, signature }),
    });
    const data = await resp.json();
    return data.valid === true;
  } catch {
    return true; // Network error = allow (don't block user)
  }
}
