import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Suppress automatic browser network logs in development
if (process.env.NODE_ENV === 'development') {
  // Override console methods to filter out browser auto-logs
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  const shouldSuppress = (message) => {
    const str = message?.toString() || '';
    return str.includes('XHR finished') || 
           str.includes('Fetch finished') ||
           str.includes('Download the React DevTools');
  };
  
  console.log = function(...args) {
    if (!shouldSuppress(args[0])) {
      originalLog.apply(console, args);
    }
  };
  
  console.warn = function(...args) {
    if (!shouldSuppress(args[0])) {
      originalWarn.apply(console, args);
    }
  };
  
  console.error = function(...args) {
    if (!shouldSuppress(args[0])) {
      originalError.apply(console, args);
    }
  };

  // Also suppress browser's internal fetch/XHR logging by overriding console.time/timeEnd
  const originalTime = console.time;
  const originalTimeEnd = console.timeEnd;
  
  console.time = function(label) {
    if (label && !label.includes('XHR') && !label.includes('Fetch')) {
      originalTime.apply(console, arguments);
    }
  };
  
  console.timeEnd = function(label) {
    if (label && !label.includes('XHR') && !label.includes('Fetch')) {
      originalTimeEnd.apply(console, arguments);
    }
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
