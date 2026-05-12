/**
 * MVPC Bridge — injected into each iframe tool by the shell.
 * Provides workspace read/write via postMessage to shell parent.
 * Also injects mobile-fix.css.
 */
(function() {
  'use strict';
  if (window.__mvpcBridge) return; // already loaded
  window.__mvpcBridge = true;

  const WORKSPACE_KEY = 'mvpc:workspace';
  let workspace = null;
  let pendingCallbacks = {};
  let cbId = 0;

  // Default workspace shape
  function defaultWorkspace() {
    return {
      version: 1,
      meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), name: 'My Workspace' },
      ideas: [],
      prds: [],
      contacts: [],
      decisions: [],
      okrs: [],
      jobs: [],
      retros: [],
      postmortems: [],
      experiments: [],
      feedback: [],
      sprints: [],
      metrics: [],
      features: []
    };
  }

  // Listen for messages from shell
  window.addEventListener('message', function(e) {
    if (!e.data || !e.data.__mvpc) return;
    const msg = e.data;

    if (msg.type === 'workspace-init') {
      workspace = msg.workspace || defaultWorkspace();
    }
    if (msg.type === 'workspace-updated') {
      workspace = msg.workspace;
    }
    if (msg.type === 'workspace-response') {
      const cb = pendingCallbacks[msg.cbId];
      if (cb) { cb(msg.data); delete pendingCallbacks[msg.cbId]; }
    }
    if (msg.type === 'navigate') {
      // Shell asking us to accept data before navigating away
      // Tools can listen: window.addEventListener('mvpc:before-navigate', ...)
      window.dispatchEvent(new CustomEvent('mvpc:before-navigate', { detail: msg }));
    }
    if (msg.type === 'inject-data') {
      // Cross-tool flow: another tool pushed data for us
      window.dispatchEvent(new CustomEvent('mvpc:data', { detail: msg.payload }));
    }
  });

  // Public API
  window.mvpc = {
    read: function(key) {
      if (!workspace) {
        // Try localStorage fallback (same-origin)
        try {
          const raw = localStorage.getItem(WORKSPACE_KEY);
          workspace = raw ? JSON.parse(raw) : defaultWorkspace();
        } catch(e) { workspace = defaultWorkspace(); }
      }
      return key ? (workspace[key] || []) : workspace;
    },

    write: function(key, value) {
      if (!workspace) workspace = defaultWorkspace();
      workspace[key] = value;
      workspace.meta.updatedAt = new Date().toISOString();
      // Notify shell
      if (window.parent !== window) {
        window.parent.postMessage({ __mvpc: true, type: 'workspace-write', key: key, value: value, workspace: workspace }, '*');
      }
      // Also persist locally as fallback
      try { localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace)); } catch(e) {}
    },

    navigate: function(toolSlug, data) {
      // Request shell to navigate to another tool, optionally passing data
      if (window.parent !== window) {
        window.parent.postMessage({ __mvpc: true, type: 'navigate-request', tool: toolSlug, data: data }, '*');
      }
    },

    // Get current tool slug
    currentTool: function() {
      try { return window.location.pathname.split('/').filter(Boolean).pop(); } catch(e) { return ''; }
    }
  };

  // Request workspace from shell on load
  if (window.parent !== window) {
    window.parent.postMessage({ __mvpc: true, type: 'workspace-request' }, '*');
  } else {
    // Not in iframe — load from localStorage
    try {
      const raw = localStorage.getItem(WORKSPACE_KEY);
      workspace = raw ? JSON.parse(raw) : defaultWorkspace();
    } catch(e) { workspace = defaultWorkspace(); }
  }

  // Inject mobile-fix.css
  var style = document.createElement('style');
  style.textContent = [
    'html, body { overflow-x: hidden; }',
    '* { -webkit-tap-highlight-color: transparent; }',
    ':where(input, select, textarea) { font-size: 16px !important; }',
    ':where(button, a, .btn) { min-height: 44px; min-width: 44px; }',
    '@media (max-width: 768px) {',
    '  :where(table) { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }',
    '  :where(.sidebar, [class*="sidebar"]) { position: static !important; width: 100% !important; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);
})();
