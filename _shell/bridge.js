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

  // ── Mobile fix: aggressive base CSS, then per-slug overrides ────────
  function getSlug() {
    // Tool slug comes from parent ?tool=<slug>
    try {
      const u = new URL(window.location.href);
      // If we're inside a srcdoc iframe, location is about:srcdoc. Read from parent.
      if (window.parent && window.parent !== window) {
        const pu = new URL(window.parent.location.href);
        return pu.searchParams.get('tool') || u.pathname.split('/').filter(Boolean)[0] || '';
      }
      return u.pathname.split('/').filter(Boolean)[0] || '';
    } catch(e) { return ''; }
  }
  var slug = getSlug();

  // Per-slug CSS overrides for tools that need targeted help (Path 3)
  // Strategy: collapse multi-col grids, kill min-widths, make nav scrollable.
  // These are surgical — only applied when the parent says we're on mobile.
  var SLUG_FIXES = {
    'job-pipeline': '.board, .columns, [class*="kanban"] { grid-template-columns: 1fr !important; }',
    'offer-compass': '.compare, .grid, [class*="compare"] { grid-template-columns: 1fr !important; }',
    'ship-log': '.heatmap, .grid { grid-template-columns: repeat(7, 1fr) !important; gap: 2px !important; } .heatmap > * { min-width: 0 !important; width: auto !important; }',
    'ab-tester': '.tabs, [role="tablist"] { overflow-x: auto !important; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; } .tabs > *, [role="tab"] { flex-shrink: 0 !important; }',
    'roadmap-hero': '.columns, .board { grid-template-columns: 1fr !important; } [class*="column"] { min-width: 0 !important; }',
    'competitor-radar': '.cards-grid, .grid, [class*="grid"] { grid-template-columns: 1fr !important; }',
    'decision-journal': '.split, .columns, .grid { grid-template-columns: 1fr !important; }',
    'changelog': '.split, [class*="split"], .grid { grid-template-columns: 1fr !important; } pre, code { white-space: pre-wrap !important; word-break: break-word !important; }',
    'launch-pad': '.tabs { overflow-x: auto !important; -webkit-overflow-scrolling: touch; flex-wrap: nowrap !important; } .tabs > * { flex-shrink: 0 !important; }',
    'canvas-lab': '.canvas-grid, .grid { grid-template-columns: 1fr !important; gap: 12px !important; }',
    'focus-flow': '.split, .columns, .grid { grid-template-columns: 1fr !important; }',
    'survey-forge': '.split, .columns, .builder { grid-template-columns: 1fr !important; } .preview { width: 100% !important; }',
    'knowledge-garden': '.split, .columns, .layout { grid-template-columns: 1fr !important; } aside, .sidebar-right { width: 100% !important; }',
    'api-playground': '.main { flex-direction: column !important; height: auto !important; overflow: visible !important; } .sidebar { width: 100% !important; max-width: 100% !important; max-height: 200px; border-right: none !important; border-bottom: 1px solid var(--border) !important; } .panel { min-width: 0 !important; width: 100% !important; } .request-pane, .response-pane, aside { width: 100% !important; min-width: 0 !important; }',
    'terminal-portfolio': '.terminal { width: 100% !important; height: auto !important; min-height: 80vh !important; padding: 12px !important; } pre, code { white-space: pre-wrap !important; word-break: break-word !important; font-size: 0.7rem !important; }',
    'estimate-engine': '.split, .grid, .columns { grid-template-columns: 1fr !important; } table { font-size: 0.8rem !important; }',
  };

  // "Hard" tools — layout is fundamentally 2D and shouldn't be force-collapsed.
  // Show a polite banner suggesting desktop, but still let user proceed.
  var HARD_MOBILE = ['retro-board', 'link-hub', 'wireframe-kit'];

  // "Desktop-only" tools — inherently desktop (multi-pane code editors, schema canvases at width).
  var DESKTOP_ONLY = ['snippet-vault'];

  // Inject base mobile-fix
  var style = document.createElement('style');
  style.setAttribute('data-mvpc', 'mobile-fix');
  var baseCss = [
    'html, body { overflow-x: hidden !important; max-width: 100vw !important; }',
    '* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }',
    ':where(input, select, textarea) { font-size: 16px !important; }',
    ':where(button, a.btn, .btn, [role="button"]) { min-height: 36px; }',
    '@media (max-width: 768px) {',
    '  html, body, main, .app, .container, .wrap, .layout, .root { max-width: 100vw !important; min-width: 0 !important; overflow-x: hidden !important; }',
    '  :where(table) { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; }',
    '  :where(.sidebar, aside, [class*="sidebar"]) { position: static !important; max-width: 100% !important; width: 100% !important; }',
    // generic tab strip overflow handling
    '  :where(.tabs, .tab-list, [role="tablist"], nav ul) { overflow-x: auto !important; -webkit-overflow-scrolling: touch; white-space: nowrap; flex-wrap: nowrap !important; max-width: 100%; }',
    // images and media
    '  :where(img, video, canvas, iframe, svg) { max-width: 100% !important; height: auto; }',
    // common 2/3-col grids collapse
    '  :where([style*="grid-template-columns"]) { /* leave inline as-is */ }',
    '}'
  ];
  if (slug && SLUG_FIXES[slug]) {
    baseCss.push('@media (max-width: 768px) {', SLUG_FIXES[slug], '}');
  }
  style.textContent = baseCss.join('\n');
  document.head.appendChild(style);

  // Inject "best on desktop" banner for hard/desktop-only tools when on mobile
  function isMobileViewport() {
    return window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  }
  if (slug && isMobileViewport() && (HARD_MOBILE.indexOf(slug) >= 0 || DESKTOP_ONLY.indexOf(slug) >= 0)) {
    var banner = document.createElement('div');
    banner.id = '__mvpcBanner';
    var isDesktopOnly = DESKTOP_ONLY.indexOf(slug) >= 0;
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(90deg,#7c3aed,#a78bfa);color:#fff;padding:10px 14px;font:600 12px/1.3 -apple-system,sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
    banner.innerHTML = (isDesktopOnly
      ? '🖥️ <span style="flex:1">This tool is designed for desktop. Mobile view is best-effort.</span>'
      : '📱 <span style="flex:1">Best on desktop. Mobile works but may need scrolling.</span>'
    ) + '<button onclick="this.parentElement.remove()" style="background:rgba(255,255,255,0.2);border:0;color:#fff;width:24px;height:24px;border-radius:4px;font-size:14px;line-height:1;cursor:pointer">✕</button>';
    document.body.appendChild(banner);
    // Push content down so banner doesn't overlap
    document.body.style.paddingTop = (parseInt(getComputedStyle(document.body).paddingTop) || 0) + 44 + 'px';
  }
})();
