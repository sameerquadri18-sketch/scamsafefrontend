import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN || process.env.REACT_APP_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE || 'production',
    enabled: import.meta.env.PROD || !!dsn,
    
    // beforeSend filter to avoid spamming with PII
    beforeSend(event) {
      // Remove any potential PII from URLs
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/\/api\/v1\/user\/[^\/]+/g, '/api/v1/user/***');
      }

      // Remove PII from extra data
      if (event.extra) {
        Object.keys(event.extra).forEach(key => {
          if (typeof event.extra[key] === 'string') {
            // Mask phone numbers and emails
            event.extra[key] = event.extra[key]
              .replace(/\b\d{10}\b/g, '***-***-****')
              .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***@***.***');
          }
        });
      }

      // Filter out common non-critical errors
      const ignoreErrors = [
        'Network Error',
        'Request aborted',
        'Loading chunk',
        'Non-Error promise rejection',
        'ResizeObserver loop limit exceeded',
        'Script error',
      ];

      if (event.exception?.values?.[0]?.value) {
        const errorMessage = event.exception.values[0].value;
        if (ignoreErrors.some(error => errorMessage.includes(error))) {
          return null;
        }
      }

      return event;
    },

    // Custom tags for better filtering
    tags: {
      app: 'scamsafe-frontend',
      version: import.meta.env.VITE_VERSION || '1.0.0',
    },

    // Release tracking
    release: import.meta.env.VITE_VERSION || '1.0.0',
  });

  console.log('Sentry initialized for frontend');
}

// Helper function to capture errors with context
export function captureError(error, context = {}) {
  Sentry.captureException(error, {
    tags: {
      feature: context.feature || 'unknown',
      action: context.action || 'unknown',
    },
    extra: {
      ...context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    },
  });
}

// Helper function to capture user actions
export function captureUserAction(action, data = {}) {
  Sentry.addBreadcrumb({
    message: action,
    category: 'user',
    level: 'info',
    data: {
      ...data,
      url: window.location.pathname,
    },
  });
}

// Helper function to capture performance issues
export function capturePerformance(metricName, value, unit = 'ms') {
  Sentry.addBreadcrumb({
    message: `Performance: ${metricName}`,
    category: 'performance',
    level: 'info',
    data: {
      metric: metricName,
      value: value,
      unit: unit,
    },
  });
}

export { Sentry };
