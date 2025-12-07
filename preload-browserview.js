// Preload script for BrowserView instances
// This masks Electron-specific properties to make WhatsApp Web think it's running in regular Chrome

// Delete Electron/Node.js globals that WhatsApp Web might detect
delete window.process;
delete window.require;
delete window.module;
delete window.exports;

// Override navigator properties to match real Chrome
Object.defineProperty(navigator, 'userAgent', {
  get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});

// Remove any Electron identifiers
if (window.navigator && window.navigator.userAgentData) {
  const originalGetHighEntropyValues = window.navigator.userAgentData.getHighEntropyValues;
  window.navigator.userAgentData.getHighEntropyValues = function() {
    return originalGetHighEntropyValues.call(this).then(ua => {
      // Remove any Electron branding
      if (ua.brands) {
        ua.brands = ua.brands.filter(b => !b.brand.includes('Electron'));
      }
      return ua;
    });
  };
}

// CRITICAL: Polyfill window.chrome object that WhatsApp Web expects
if (!window.chrome) {
  window.chrome = {};
}
if (!window.chrome.runtime) {
  window.chrome.runtime = {
    onConnect: { addListener: () => {} },
    onMessage: { addListener: () => {} },
    sendMessage: () => {},
    connect: () => ({ 
      onMessage: { addListener: () => {} }, 
      postMessage: () => {},
      disconnect: () => {}
    })
  };
}

console.log('BrowserView preload: Electron environment masked + window.chrome polyfilled');
