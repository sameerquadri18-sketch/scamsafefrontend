import axios from 'axios';
import { API_BASE, BROKERS } from './constants';
import { storeTokens, getAccessToken, getRefreshToken, clearTokens } from './security';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000,
});

let backendAvailable = null;

async function checkBackend() {
  if (backendAvailable !== null) return backendAvailable;
  try {
    await api.get('/health', { timeout: 5000 });
    backendAvailable = true;
  } catch {
    backendAvailable = false;
  }
  return backendAvailable;
}

// Reset backend check every 60s so it re-detects if backend comes up
setInterval(() => { backendAvailable = null; }, 60000);

// Add request interceptor to handle backend unavailability
api.interceptors.request.use(async (config) => {
  const isAvailable = await checkBackend();
  if (!isAvailable && config.url !== '/health') {
    // For demo purposes, return mock data when backend is unavailable
    if (config.url?.includes('/scan/free')) {
      return Promise.reject({
        response: {
          status: 503,
          data: { error: 'Backend temporarily unavailable. Please try again later.' }
        }
      });
    }
  }
  return config;
});

// ---------- Scan ----------
export async function scanFree(phone, email) {
  const res = await api.post('/scan/free', { phone, email });
  backendAvailable = true;
  return res;
}

// ---------- OTP Auth (via Railway backend → Twilio Verify) ----------
export async function sendOTP(phone) {
  const res = await api.post('/auth/send-otp', { phone });
  backendAvailable = true;
  return { data: res.data };
}

export async function verifyOTP(phone, otp) {
  try {
    const res = await api.post('/auth/verify-otp', { phone, otp });
    backendAvailable = true;
    // Layer 4A: Store JWT tokens in sessionStorage (not localStorage)
    if (res.data?.token) {
      storeTokens(res.data.token, res.data.refresh_token || '');
    }
    return { data: res.data };
  } catch (err) {
    const detail = err?.response?.data?.detail || 'Invalid OTP. Please try again.';
    throw { response: { data: { detail } } };
  }
}

// ---------- Token Refresh ----------
export async function refreshAuthToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await api.post('/auth/refresh', { refresh_token: refresh });
    if (res.data?.access_token) {
      storeTokens(res.data.access_token, res.data.refresh_token || '');
    }
    return res.data;
  } catch {
    clearTokens();
    return null;
  }
}

// ---------- Removal ----------
export async function startRemovalAPI(phone, email, exposedBrokers, dataTypes = [], address = '') {
  const res = await api.post('/removal/start', {
    phone,
    email,
    exposed_brokers: exposedBrokers,
    data_types: dataTypes,
    address,
  });
  return res.data;
}

export async function pollRemovalStatus(removalId) {
  try {
    const res = await api.get(`/removal/status/${removalId}`);
    return res.data;
  } catch (err) {
    console.warn('Removal status poll failed:', err.message);
    return null;
  }
}

// ---------- User ----------
export const registerUser = (data) =>
  api.post('/user/register', data);

export const getUserStatus = (userId) =>
  api.get(`/user/${userId}/status`);

// ---------- Pricing tracking for abandoned checkout ----------
export const trackPricingView = () => {
  const token = getAccessToken();
  if (!token) return Promise.resolve();
  
  return api.post('/user/track-pricing-view', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const resetAbandonTracking = () => {
  const token = getAccessToken();
  if (!token) return Promise.resolve();
  
  return api.post('/user/reset-abandon-tracking', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getUserScans = (userId) =>
  api.get(`/user/${userId}/scans`);

export const triggerRescan = (userId) =>
  api.post(`/user/${userId}/rescan`);

// ─── Admin API ───────────────────────────────────────────────────────
export async function adminLogin(email, password) {
  const res = await api.post('/admin/login', { email, password });
  return res.data;
}

export async function adminGetStats(token) {
  const res = await api.get(`/admin/stats?token=${encodeURIComponent(token)}`);
  return res.data;
}

export async function adminGetUsers(token, page = 1) {
  const res = await api.get(`/admin/users?token=${encodeURIComponent(token)}&page=${page}`);
  return res.data;
}

export async function adminGetPayments(token, page = 1) {
  const res = await api.get(`/admin/payments?token=${encodeURIComponent(token)}&page=${page}`);
  return res.data;
}

export async function adminGetScans(token, page = 1) {
  const res = await api.get(`/admin/scans?token=${encodeURIComponent(token)}&page=${page}`);
  return res.data;
}

export async function subscribeForUpdates(phone, email) {
  try {
    const res = await api.post('/user/subscribe', { phone, email });
    return res.data;
  } catch (err) {
    console.warn('Subscribe failed:', err.message);
    throw err;
  }
}

export async function optInWhatsApp(phone) {
  try {
    const res = await api.post('/user/whatsapp-opt-in', { phone });
    return res.data;
  } catch (err) {
    console.warn('WhatsApp opt-in failed:', err.message);
    throw err;
  }
}

export async function getUserHistory(phone) {
  try {
    const res = await api.post('/user/history', { phone });
    return res.data;
  } catch (err) {
    console.warn('User history fetch failed:', err.message);
    return { has_history: false };
  }
}

// ---------- Scan Report PDF ----------
export async function downloadScanReport(phone) {
  try {
    const res = await api.post('/user/scan-report', { phone }, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScamSafe-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.warn('Scan report download failed:', err.message);
    return false;
  }
}

// ---------- Compliance Timeline ----------
export async function getComplianceTimeline(phone) {
  try {
    const res = await api.post('/user/compliance-timeline', { phone });
    return res.data;
  } catch (err) {
    console.warn('Compliance timeline fetch failed:', err.message);
    return null;
  }
}

// ---------- My Data / Account ----------
export async function getMyData(phone) {
  try {
    const res = await api.post('/user/my-data', { phone });
    return res.data;
  } catch (err) {
    console.warn('My data fetch failed:', err.message);
    return null;
  }
}

export async function downloadMyData(phone) {
  try {
    const res = await api.post('/user/download-my-data', { phone }, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScamSafe-MyData-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.warn('My data download failed:', err.message);
    return false;
  }
}

export async function deleteAccount(phone, confirmation) {
  const res = await api.post('/user/delete-account', { phone, confirmation });
  return res.data;
}

// ---------- Deletion Certificate ----------
export async function downloadDeletionCertificate(phone) {
  try {
    const res = await api.post('/user/deletion-certificate', { phone }, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScamSafe-Certificate-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.warn('Certificate download failed:', err.message);
    return false;
  }
}

// ---------- Deletion Log ----------
export async function getDeletionLog(phone) {
  try {
    const res = await api.post('/user/deletion-log', { phone });
    return res.data;
  } catch (err) {
    console.warn('Deletion log fetch failed:', err.message);
    return { records: [] };
  }
}

// ---------- Protection Score ----------
export async function getProtectionScore(phone) {
  try {
    const res = await api.post('/user/protection-score', { phone });
    return res.data;
  } catch (err) {
    console.warn('Protection score fetch failed:', err.message);
    return null;
  }
}

// ---------- Removal Status (per-company tracking) ----------
export async function getRemovalStatus(phone) {
  try {
    const res = await api.post('/user/removal-status', { phone });
    return res.data;
  } catch (err) {
    console.warn('Removal status fetch failed:', err.message);
    return { records: [], total_brokers: 0 };
  }
}

// ---------- Scan Limit ----------
export async function getScanLimit(phone) {
  try {
    const res = await api.post('/user/scan-limit', { phone });
    return res.data;
  } catch (err) {
    console.warn('Scan limit fetch failed:', err.message);
    return { count: 0, limit: 2, can_scan: true };
  }
}

// ---------- Notifications ----------
export async function getNotifications(phone) {
  try {
    const res = await api.post('/user/notifications', { phone });
    return res.data;
  } catch (err) {
    console.warn('Notifications fetch failed:', err.message);
    return { notifications: [], unread_count: 0 };
  }
}

export async function markNotificationsRead(phone) {
  try {
    const res = await api.post('/user/notifications/read', { phone });
    return res.data;
  } catch (err) {
    console.warn('Mark notifications read failed:', err.message);
    return { success: false };
  }
}

// ---------- Family Group ----------
export async function createFamilyGroup(phone) {
  const res = await api.post('/family/create', { phone });
  return res.data;
}

export async function addFamilyMember(phone, memberPhone, memberName = '') {
  const res = await api.post('/family/add-member', { phone, member_phone: memberPhone, member_name: memberName });
  return res.data;
}

export async function removeFamilyMember(phone, memberPhone) {
  const res = await api.post('/family/remove-member', { phone, member_phone: memberPhone });
  return res.data;
}

export async function getFamilyGroup(phone) {
  try {
    const res = await api.post('/family/group', { phone });
    return res.data;
  } catch (err) {
    console.warn('Family group fetch failed:', err.message);
    return { exists: false, members: [] };
  }
}

// ---------- AI Chat ----------
export async function sendChatMessage(message, history, exposureContext = null) {
  const live = await checkBackend();
  if (live) {
    return api.post('/ai/chat', { message, history, exposure_context: exposureContext });
  }
  return { data: { response: null, role: 'assistant' } };
}

// ---------- Payment (Cashfree) ----------
export async function createCashfreeOrder(planId, billingCycle, phone = '') {
  const res = await api.post('/payment/cashfree/create-order', {
    plan_id: planId,
    billing_cycle: billingCycle,
    phone,
  });
  return res.data;
}

export async function verifyCashfreeOrder(orderId) {
  const res = await api.get(`/payment/cashfree/verify/${orderId}`);
  return res.data;
}

export async function cancelCashfreeSubscription(phone, reason = '') {
  const res = await api.post('/payment/cashfree/cancel', { phone, reason });
  return res.data;
}

// ---------- User Dashboard ----------
export async function getUserDashboard(phone) {
  try {
    const res = await api.post('/user/dashboard', { phone });
    return res.data;
  } catch (err) {
    console.warn('User dashboard fetch failed:', err.message);
    return null;
  }
}

export async function cancelSubscription(phone, reason = '') {
  const res = await api.post('/user/cancel-subscription', { phone, reason });
  return res.data;
}

// ---------- Admin Health ----------
export async function adminGetHealth(token) {
  const res = await api.get(`/admin/health?token=${encodeURIComponent(token)}`);
  return res.data;
}

// ---------- Breach Intelligence ----------
export async function getBreachIntelligence(phone, email = '') {
  try {
    const res = await api.post('/user/breach-intelligence', { phone, email });
    return res.data;
  } catch (err) {
    console.warn('Breach intelligence fetch failed:', err.message);
    return null;
  }
}

// ---------- Inbox Shield ----------
export async function inboxShieldStatus(phone) {
  try {
    const res = await api.post('/inbox-shield/status', { phone });
    return res.data;
  } catch (err) {
    console.warn('Inbox shield status failed:', err.message);
    return { connected: false };
  }
}

export async function inboxShieldConnectGmail(phone) {
  const res = await api.post('/inbox-shield/connect/gmail', { phone });
  return res.data;
}

export async function inboxShieldConnectOutlook(phone) {
  const res = await api.post('/inbox-shield/connect/outlook', { phone });
  return res.data;
}

export async function inboxShieldExchangeCode(phone, code) {
  const res = await api.post('/inbox-shield/exchange-code', { phone, code });
  return res.data;
}

export async function inboxShieldScan(phone) {
  const res = await api.post('/inbox-shield/scan', { phone });
  return res.data;
}

export async function inboxShieldUnsubscribe(phone, messageId, sender, listUnsubscribe = '', listUnsubscribePost = '') {
  const res = await api.post('/inbox-shield/unsubscribe', {
    phone, message_id: messageId, sender,
    list_unsubscribe: listUnsubscribe,
    list_unsubscribe_post: listUnsubscribePost,
  });
  return res.data;
}

export async function inboxShieldBulkUnsubscribe(phone, categories, emails) {
  const res = await api.post('/inbox-shield/unsubscribe-bulk', { phone, categories, emails });
  return res.data;
}

export async function inboxShieldJobStatus(jobId) {
  const res = await api.get(`/inbox-shield/job/${jobId}`);
  return res.data;
}

export async function inboxShieldReportScam(phone, messageId, sender, senderDomain = '') {
  const res = await api.post('/inbox-shield/report-scam', {
    phone, message_id: messageId, sender, sender_domain: senderDomain,
  });
  return res.data;
}

export async function inboxShieldDisconnect(phone) {
  const res = await api.delete('/inbox-shield/disconnect', { data: { phone } });
  return res.data;
}

// ---------- Reviews ----------
export async function submitReview(customerId, token, rating, feedback) {
  const res = await api.post('/reviews/submit', { customer_id: customerId, token, rating, feedback });
  return res.data;
}

// ---------- Billing Details ----------
export async function saveBillingDetails(phone, billing) {
  const res = await api.post('/user/save-billing', { phone, ...billing });
  return res.data;
}

// ---------- Prompt 5: Email Gate ----------
export async function checkUserEmail(phone) {
  try {
    const res = await api.post('/user/check-email', { phone });
    return res.data;
  } catch (err) {
    console.warn('Check email failed:', err.message);
    return { has_email: false, email: null };
  }
}

export async function saveEmailCheckout(phone, email) {
  const res = await api.post('/user/save-email-checkout', { phone, email });
  return res.data;
}

// ---------- Prompt 6: Subscription Check ----------
export async function checkSubscription(phone, planId = '') {
  try {
    const res = await api.post('/user/check-subscription', { phone, plan_id: planId });
    return res.data;
  } catch (err) {
    console.warn('Check subscription failed:', err.message);
    return { can_subscribe: true, has_active: false };
  }
}

// ---------- Prompt 4: Knowledge Center ----------
export async function getBreaches() {
  try {
    const res = await api.get('/knowledge/breaches');
    return res.data;
  } catch (err) {
    console.warn('Breaches fetch failed:', err.message);
    return { breaches: [], total: 0 };
  }
}

export async function getArticles(category = '') {
  try {
    const url = category ? `/knowledge/articles?category=${encodeURIComponent(category)}` : '/knowledge/articles';
    const res = await api.get(url);
    return res.data;
  } catch (err) {
    console.warn('Articles fetch failed:', err.message);
    return { articles: [], total: 0 };
  }
}

export async function getArticleBySlug(slug) {
  try {
    const res = await api.get(`/knowledge/articles/${slug}`);
    return res.data;
  } catch (err) {
    console.warn('Article fetch failed:', err.message);
    return null;
  }
}

// ---------- Prompt 2: Admin WhatsApp ----------
export async function adminGetUserFull(token, phone) {
  const res = await api.get(`/admin/users/${phone}/full?token=${encodeURIComponent(token)}`);
  return res.data;
}

export async function adminSendWhatsApp(token, phone, message) {
  const res = await api.post(`/admin/users/${phone}/whatsapp?token=${encodeURIComponent(token)}`, { message });
  return res.data;
}

export async function adminGetWhatsAppTemplates(token) {
  const res = await api.get(`/admin/whatsapp-templates?token=${encodeURIComponent(token)}`);
  return res.data;
}

// ---------- Admin Invoice Management ----------
export async function adminGetInvoices(token, page = 1, search = '') {
  const params = new URLSearchParams({ token, page });
  if (search) params.append('search', search);
  const res = await api.get(`/admin/invoices?${params}`);
  return res.data;
}

export async function adminGetInvoiceStats(token) {
  const res = await api.get(`/admin/invoices/stats?token=${encodeURIComponent(token)}`);
  return res.data;
}

export async function adminCreateTestInvoice(token) {
  const res = await api.post(`/admin/invoices/test?token=${encodeURIComponent(token)}`);
  return res.data;
}

export async function adminDownloadInvoicePDF(token, invoiceNumber) {
  const res = await api.get(`/admin/invoices/${invoiceNumber}/pdf?token=${encodeURIComponent(token)}`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invoiceNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return true;
}

// ---------- Prompt 7: Admin Social ----------
export async function adminGetSocialStatus(token) {
  try {
    const res = await api.get(`/admin/social/status?token=${encodeURIComponent(token)}`);
    return res.data;
  } catch (err) {
    console.warn('Social status fetch failed:', err.message);
    return { platforms: [], recent_posts: [], upcoming_queue: [] };
  }
}

// ---------- Helpers ----------
export function isBackendLive() {
  return backendAvailable === true;
}

// Seeded PRNG (mulberry32) — deterministic results per input
function seededRng(seed) {
  let t = seed | 0;
  return function () {
    t = (t + 0x6D2B79F5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Detect fake/test numbers
function isFakeNumber(phone) {
  if (!phone || phone.length !== 10) return true;
  // All same digits (0000000000, 9999999999, etc.)
  if (/^(\d)\1{9}$/.test(phone)) return true;
  // Sequential (1234567890, 0987654321)
  if (phone === '1234567890' || phone === '0987654321') return true;
  // Starts with 0-5 (invalid Indian mobile)
  if (/^[0-5]/.test(phone)) return true;
  // Repeating patterns (1212121212, 1231231231)
  if (/^(\d{2})\1{4}$/.test(phone)) return true;
  if (/^(\d{3})\1+/.test(phone)) return true;
  return false;
}

function generateSimulatedScan(phone, email) {
  const seed = hashString((phone || '') + (email || ''));
  const rng = seededRng(seed);

  // Fake numbers get very few or no results
  const fake = isFakeNumber(phone);
  const maxExposed = fake ? Math.floor(rng() * 2) : Math.floor(rng() * 5) + 6; // 0-1 for fake, 6-10 for real

  // Shuffle brokers deterministically
  const brokersCopy = [...BROKERS];
  for (let i = brokersCopy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [brokersCopy[i], brokersCopy[j]] = [brokersCopy[j], brokersCopy[i]];
  }

  const exposed = [];
  const allTypes = new Set();

  for (let i = 0; i < Math.min(maxExposed, brokersCopy.length); i++) {
    const broker = brokersCopy[i];
    const types = ['Phone']; // Phone is always found
    if (email && rng() > 0.2) types.push('Email');
    if (rng() > 0.45) types.push('Address');
    if (rng() > 0.65) types.push('PAN');
    if (rng() > 0.75) types.push('Aadhaar');
    if (rng() > 0.55) types.push('DOB');
    types.forEach((t) => allTypes.add(t));
    exposed.push({ ...broker, data_found: true, data_types: types });
  }

  // Generate basic personal_info for simulation
  const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const cityIdx = Math.floor(rng() * cities.length);

  // TRAI 4-digit prefix carrier detection (matches backend carrier_detect.py)
  const p = (phone || '').replace(/\D/g, '').slice(-10);
  const p4 = p.substring(0, 4);
  const p2 = p.substring(0, 2);
  const jio4 = ['6000','6001','6002','6003','6004','6005','6006','6007','6008','6009','6200','6201','6202','6203','6204','6205','6206','6207','6209','6290','6291','6295','6296','6297','6299','6300','6301','6302','6303','6304','6305','6309','6360','6361','6362','6363','6364','6366','6369','6370','6371','6372','6374','6375','6376','6379','6380','6381','6382','6383','6384','6385','6386','6387','6388','6389','6390','6391','6392','6393','6394','6395','6396','6397','6398','6399','7000','7001','7002','7003','7004','7005','7006','7007','7008','7009','7010','7011','7012','7013','7014','7015','7016','7017','7018','7019','7020','7021','7022','7023','8000','8001','8002','8003','8009'];
  const airtel4 = ['7028','7029','7030','7031','7032','7033','7034','7035','7036','7037','7038','7039','7042','7043','7044','7045','7050','7051','7053','7054','7055','7056','7204','7205','7206','7207','7259','7290','7291','7292','7338','7339','7348','7349','7406','7411','8095','8096','8097','8098','8099','8105','8106','8108','8109','8130','8131','8178','8179','8191','8192','8285','8286','8287','8288','8289','8368','8369','8375','8376','8377','8383','8447','8448','8449','8527','8528','8529','8585','8586','8587','8588','8595','8596','8700','8701','8702','8744','8745','8750','8800','8801','8802','8826','8860','8861','9015','9016','9205','9206','9210','9211','9212','9310','9311','9312','9313','9350','9354','9355','9540','9541','9560','9582','9599','9650','9654','9711','9717','9718','9810','9811','9812','9813','9818','9871','9873','9891','9899','9900','9901','9902','9910','9911','9945','9980','9986','9100'];
  const vi4 = ['7024','7025','7026','7027','7041','7057','7058','7059','7060','7061','7065','7066','7069','7208','7209','7210','7276','7278','7303','7304','7305','7355','7356','7357','7376','7383','7384','7405','7407','7408','7499','7506','7507','7588','7620','7666','7709','7710','7715','7738','7739','7741','7798','7874','7878','7984','7990','8007','8010','8013','8017','8058','8080','8082','8087','8090','8140','8141','8160','8200','8208','8237','8238','8275','8276','8277','8291','8292','8308','8318','8319','8355','8356','8380','8390','8408','8411','8412','8446','8452','8459','8488','8490','8511','8530','8553','8600','8605','8607','8652','8655','8657','8668','8669','8698','8758','8766','8767','8793','8796','8805','8806','8828','8830','8879','8888','8898','8976','8980','9004','9007','9011','9028','9029','9049','9075','9082','9099','9106','9137','9152','9157','9167','9173','9220','9222','9223','9224','9225','9320','9321','9322','9323','9324','9325','9372','9373','9374','9375','9403','9404','9405','9408','9409','9422','9423','9503','9504','9545','9552','9579','9594','9595','9619','9637','9638','9664','9665','9702','9712','9714','9724','9725','9737','9757','9764','9765','9766','9767','9769','9773','9819','9820','9821','9822','9823','9824','9825','9833','9869','9870','9892','9920','9921','9960','9969','9970','9975'];
  const bsnl4 = ['7070','7071','7072','7085','7086','7087','7200','7201','7306','7307','7308','7309','7310','7311','7312','7460','7470','7558','7559','7736','7902','7907','8129','8136','8137','8138','8139','8157','8197','8249','8250','8258','8260','8271','8332','8333','8338','8339','8400','8415','8456','8457','8458','8464','8466','8467','8469','8474','8480','8500','8507','8547','8589','8592','8593','8594','8606','8690','8714','8733','8764','8768','8787','8794','8895','8943','9400','9401','9412','9413','9414','9415','9416','9417','9418','9425','9426','9427','9434','9435','9436','9437','9438','9439','9440','9441','9442','9443','9444','9446','9447','9448','9449','9450','9451','9452','9453','9454','9460','9461','9470','9471','9472','9473','9474','9476','9478','9479','9480','9481','9482','9483','9484','9485','9486','9487','9488','9489','9490','9491','9492','9493','9494','9495','9496','9497','9498'];
  // 2-digit fallback
  const fb2 = {'60':'Reliance Jio','61':'Reliance Jio','62':'Reliance Jio','63':'Reliance Jio','64':'Reliance Jio','65':'Reliance Jio','66':'Reliance Jio','67':'Reliance Jio','68':'Reliance Jio','69':'Reliance Jio','70':'Reliance Jio','80':'Bharti Airtel','81':'Bharti Airtel','82':'Vi (Vodafone Idea)','83':'BSNL','84':'BSNL','85':'BSNL','86':'Vi (Vodafone Idea)','87':'Bharti Airtel','88':'Bharti Airtel','89':'BSNL','90':'Vi (Vodafone Idea)','91':'Bharti Airtel','92':'Vi (Vodafone Idea)','93':'Vi (Vodafone Idea)','94':'BSNL','95':'Bharti Airtel','96':'Vi (Vodafone Idea)','97':'Vi (Vodafone Idea)','98':'Bharti Airtel','99':'Bharti Airtel'};
  let detectedCarrier = 'Unknown';
  if (jio4.includes(p4)) detectedCarrier = 'Reliance Jio';
  else if (airtel4.includes(p4)) detectedCarrier = 'Bharti Airtel';
  else if (vi4.includes(p4)) detectedCarrier = 'Vi (Vodafone Idea)';
  else if (bsnl4.includes(p4)) detectedCarrier = 'BSNL';
  else if (fb2[p2]) detectedCarrier = fb2[p2];

  return {
    total_scanned: brokersCopy.length,
    total_found: exposed.length,
    exposed_brokers: exposed,
    data_types_found: [...allTypes],
    personal_info: {
      name: null,
      city: fake ? null : cities[cityIdx],
      state: null,
      carrier: detectedCarrier,
      address: null,
    },
  };
}

// ---------- Admin Automation Status ----------
export async function getAutomationStatus(token) {
  const res = await api.get('/admin/automation-status', {
    params: { token }
  });
  return res.data;
}

export default api;
