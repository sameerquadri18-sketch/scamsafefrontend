import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const AppContext = createContext(null);
const STORAGE_KEY = 'dataeraser_state';

const initialState = {
  phone: '',
  email: '',
  scanResults: null,
  scanProgress: 0,
  isScanning: false,
  exposedBrokers: [],
  dataTypesFound: [],
  user: null,
  userId: null,
  selectedPlan: null,
  billingCycle: 'annual',
  removalStatus: null,
  removalProgress: 0,
  isRemoving: false,
  chatHistory: [],
  dashboardData: null,
  authToken: null,
  otpSent: false,
  lastErasedAt: null,
  lastErasedPhone: '',
  lastErasedEmail: '',
};

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const saved = JSON.parse(raw);
    return {
      ...initialState,
      phone: saved.phone || '',
      email: saved.email || '',
      user: saved.user || null,
      userId: saved.userId || null,
      selectedPlan: saved.selectedPlan || null,
      billingCycle: saved.billingCycle || 'annual',
      exposedBrokers: saved.exposedBrokers || [],
      dataTypesFound: saved.dataTypesFound || [],
      scanResults: saved.scanResults || null,
      removalStatus: saved.removalStatus || null,
      dashboardData: saved.dashboardData || null,
      authToken: saved.authToken || null,
      lastErasedAt: saved.lastErasedAt || null,
      lastErasedPhone: saved.lastErasedPhone || '',
      lastErasedEmail: saved.lastErasedEmail || '',
    };
  } catch {
    return initialState;
  }
}

function persistState(state) {
  try {
    const toSave = {
      phone: state.phone,
      email: state.email,
      user: state.user,
      userId: state.userId,
      selectedPlan: state.selectedPlan,
      billingCycle: state.billingCycle,
      exposedBrokers: state.exposedBrokers,
      dataTypesFound: state.dataTypesFound,
      scanResults: state.scanResults,
      removalStatus: state.removalStatus,
      dashboardData: state.dashboardData,
      authToken: state.authToken,
      lastErasedAt: state.lastErasedAt,
      lastErasedPhone: state.lastErasedPhone,
      lastErasedEmail: state.lastErasedEmail,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* quota exceeded — ignore */ }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CONTACT':
      return { ...state, phone: action.phone, email: action.email };
    case 'SET_OTP_SENT':
      return { ...state, otpSent: action.sent };
    case 'SET_AUTH_TOKEN':
      return { ...state, authToken: action.token };
    case 'START_SCAN':
      return { ...state, isScanning: true, scanProgress: 0, exposedBrokers: [], dataTypesFound: [] };
    case 'UPDATE_SCAN_PROGRESS':
      return { ...state, scanProgress: action.progress };
    case 'ADD_EXPOSED_BROKER':
      return { ...state, exposedBrokers: [...state.exposedBrokers, action.broker] };
    case 'SET_SCAN_RESULTS':
      return {
        ...state,
        isScanning: false,
        scanResults: action.results,
        exposedBrokers: action.results.exposedBrokers || action.results.exposed_brokers || [],
        dataTypesFound: action.results.dataTypesFound || action.results.data_types_found || [],
        scanProgress: 100,
      };
    case 'SELECT_PLAN':
      return { ...state, selectedPlan: action.plan };
    case 'SET_BILLING_CYCLE':
      return { ...state, billingCycle: action.cycle };
    case 'SET_USER':
      return { ...state, user: action.user, userId: action.user?.id };
    case 'START_REMOVAL':
      return { ...state, isRemoving: true, removalProgress: 0 };
    case 'UPDATE_REMOVAL':
      return {
        ...state,
        removalProgress: action.progress,
        removalStatus: action.status,
      };
    case 'FINISH_REMOVAL':
      return {
        ...state,
        isRemoving: false,
        removalProgress: 100,
        removalStatus: action.status,
        lastErasedAt: new Date().toISOString(),
        lastErasedPhone: state.phone,
        lastErasedEmail: state.email,
      };
    case 'SET_DASHBOARD':
      return { ...state, dashboardData: action.data };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.message] };
    case 'RESET':
      localStorage.removeItem(STORAGE_KEY);
      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadPersistedState);

  // Persist on every state change
  useEffect(() => {
    persistState(state);
  }, [state]);

  const setContact = useCallback((phone, email) => {
    dispatch({ type: 'SET_CONTACT', phone, email });
  }, []);

  const startScan = useCallback(() => {
    dispatch({ type: 'START_SCAN' });
  }, []);

  const updateScanProgress = useCallback((progress) => {
    dispatch({ type: 'UPDATE_SCAN_PROGRESS', progress });
  }, []);

  const addExposedBroker = useCallback((broker) => {
    dispatch({ type: 'ADD_EXPOSED_BROKER', broker });
  }, []);

  const setScanResults = useCallback((results) => {
    dispatch({ type: 'SET_SCAN_RESULTS', results });
  }, []);

  const selectPlan = useCallback((plan) => {
    dispatch({ type: 'SELECT_PLAN', plan });
  }, []);

  const setBillingCycle = useCallback((cycle) => {
    dispatch({ type: 'SET_BILLING_CYCLE', cycle });
  }, []);

  const setUser = useCallback((user) => {
    dispatch({ type: 'SET_USER', user });
  }, []);

  const startRemoval = useCallback(() => {
    dispatch({ type: 'START_REMOVAL' });
  }, []);

  const updateRemoval = useCallback((progress, status) => {
    dispatch({ type: 'UPDATE_REMOVAL', progress, status });
  }, []);

  const finishRemoval = useCallback((status) => {
    dispatch({ type: 'FINISH_REMOVAL', status });
  }, []);

  const setDashboard = useCallback((data) => {
    dispatch({ type: 'SET_DASHBOARD', data });
  }, []);

  const addChatMessage = useCallback((message) => {
    dispatch({ type: 'ADD_CHAT_MESSAGE', message });
  }, []);

  const setOtpSent = useCallback((sent) => {
    dispatch({ type: 'SET_OTP_SENT', sent });
  }, []);

  const setAuthToken = useCallback((token) => {
    dispatch({ type: 'SET_AUTH_TOKEN', token });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    ...state,
    setContact,
    startScan,
    updateScanProgress,
    addExposedBroker,
    setScanResults,
    selectPlan,
    setBillingCycle,
    setUser,
    startRemoval,
    updateRemoval,
    finishRemoval,
    setDashboard,
    addChatMessage,
    setOtpSent,
    setAuthToken,
    reset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
