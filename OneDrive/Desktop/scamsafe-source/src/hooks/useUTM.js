import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

export function useUTM() {
  const { setContact } = useApp();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      term: params.get('utm_term'),
      content: params.get('utm_content')
    };
    
    // Store UTM data if any parameter exists
    if (utm.source || utm.medium || utm.campaign) {
      sessionStorage.setItem('utm_data', JSON.stringify(utm));
      
      // Store in context for later use during signup/checkout
      if (utm.source) {
        console.log('UTM data captured:', utm);
      }
    }

    // Clean up URL parameters after capturing
    if (utm.source || utm.medium || utm.campaign) {
      const url = new URL(window.location);
      // Remove all UTM parameters
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        url.searchParams.delete(param);
      });
      
      // Update URL without page reload
      window.history.replaceState({}, '', url.toString());
    }
  }, [setContact]);

  // Function to get stored UTM data
  function getUTMData() {
    try {
      const raw = sessionStorage.getItem('utm_data');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // Function to clear UTM data
  function clearUTMData() {
    sessionStorage.removeItem('utm_data');
  }

  // Function to send UTM data to API
  async function sendUTMToAPI(userId, phone) {
    const utmData = getUTMData();
    if (!utmData || !utmData.source) return;

    try {
      // Send to backend for tracking
      const response = await fetch('/api/v1/user/utm-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('scamsafe_token')}`
        },
        body: JSON.stringify({
          user_id: userId,
          phone: phone,
          utm_source: utmData.source,
          utm_medium: utmData.medium,
          utm_campaign: utmData.campaign,
          utm_term: utmData.term,
          utm_content: utmData.content,
          landing_page: window.location.pathname,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('UTM data sent successfully');
        clearUTMData(); // Clear after successful submission
      }
    } catch (error) {
      console.error('Failed to send UTM data:', error);
    }
  }

  return {
    getUTMData,
    clearUTMData,
    sendUTMToAPI
  };
}
