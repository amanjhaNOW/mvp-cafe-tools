/**
 * MVPC Shell — connected workspace for 80 overnight builds.
 * Manages nav (desktop sidebar + mobile full-screen switcher), iframe loading,
 * workspace storage, cross-tool flows.
 */
(function() {
  'use strict';

  const WORKSPACE_KEY = 'mvpc:workspace';
  const RECENT_KEY = 'mvpc:recent';

  // ── Tool Registry ──
  const TOOLS = [
    // 🚀 Build a Product
    { slug: 'idea-validator', name: 'Idea Validator', emoji: '💡', cluster: 'build' },
    { slug: 'prd-forge', name: 'PRD Forge', emoji: '📝', cluster: 'build' },
    { slug: 'persona-forge', name: 'Persona Forge', emoji: '🎭', cluster: 'build' },
    { slug: 'wireframe-kit', name: 'Wireframe Kit', emoji: '✏️', cluster: 'build' },
    { slug: 'schema-forge', name: 'Schema Forge', emoji: '🗄️', cluster: 'build' },
    { slug: 'roadmap-hero', name: 'Roadmap Hero', emoji: '🛤️', cluster: 'build' },
    { slug: 'sprint-board', name: 'Sprint Board', emoji: '🏃', cluster: 'build' },
    { slug: 'launch-pad', name: 'Launch Pad', emoji: '🚀', cluster: 'build' },
    { slug: 'ship-log', name: 'Ship Log', emoji: '🚢', cluster: 'build' },
    { slug: 'changelog', name: 'Changelog', emoji: '📜', cluster: 'build' },
    { slug: 'timeline-forge', name: 'Timeline Forge', emoji: '📆', cluster: 'build' },
    { slug: 'workflow-forge', name: 'Workflow Forge', emoji: '🔁', cluster: 'build' },
    { slug: 'architecture-forge', name: 'Architecture Forge', emoji: '🏗️', cluster: 'build' },
    { slug: 'state-machine', name: 'State Machine', emoji: '🔀', cluster: 'build' },
    { slug: 'flag-studio', name: 'Flag Studio', emoji: '🚩', cluster: 'build' },
    { slug: 'api-doc-studio', name: 'API Doc Studio', emoji: '📖', cluster: 'build' },
    // 💼 Career Loop
    { slug: 'job-pipeline', name: 'Job Pipeline', emoji: '💼', cluster: 'career' },
    { slug: 'interview-ace', name: 'Interview Ace', emoji: '🎤', cluster: 'career' },
    { slug: 'offer-compass', name: 'Offer Compass', emoji: '🧭', cluster: 'career' },
    { slug: 'network-crm', name: 'Network CRM', emoji: '🤝', cluster: 'career' },
    { slug: 'decision-journal', name: 'Decision Journal', emoji: '📓', cluster: 'career' },
    { slug: 'case-study-forge', name: 'Case Study Forge', emoji: '📚', cluster: 'career' },
    { slug: 'terminal-portfolio', name: 'Terminal Portfolio', emoji: '⌨️', cluster: 'career' },
    { slug: 'resume-forge', name: 'Resume Forge', emoji: '📄', cluster: 'career' },
    // 📊 Run a Product
    { slug: 'metric-pulse', name: 'Metric Pulse', emoji: '📊', cluster: 'product' },
    { slug: 'feedback-board', name: 'Feedback Board', emoji: '💬', cluster: 'product' },
    { slug: 'okr-forge', name: 'OKR Forge', emoji: '🎯', cluster: 'product' },
    { slug: 'ab-tester', name: 'AB Tester', emoji: '🧪', cluster: 'product' },
    { slug: 'growth-lab', name: 'Growth Lab', emoji: '📈', cluster: 'product' },
    { slug: 'competitor-radar', name: 'Competitor Radar', emoji: '🔎', cluster: 'product' },
    { slug: 'tech-radar', name: 'Tech Radar', emoji: '📡', cluster: 'product' },
    { slug: 'chart-forge', name: 'Chart Forge', emoji: '📈', cluster: 'product' },
    { slug: 'analytics-forge', name: 'Analytics Forge', emoji: '📉', cluster: 'product' },
    { slug: 'seo-forge', name: 'SEO Forge', emoji: '🔍', cluster: 'product' },
    // 👥 Run a Team
    { slug: 'sprint-board', name: 'Sprint Board', emoji: '🏃', cluster: 'team', aliasOf: 'build' },
    { slug: 'retro-board', name: 'Retro Board', emoji: '🔄', cluster: 'team' },
    { slug: 'team-pulse', name: 'Team Pulse', emoji: '💗', cluster: 'team' },
    { slug: 'meeting-forge', name: 'Meeting Forge', emoji: '📅', cluster: 'team' },
    { slug: 'postmortem-forge', name: 'Postmortem Forge', emoji: '🔍', cluster: 'team' },
    { slug: 'raid-log', name: 'RAID Log', emoji: '🚨', cluster: 'team' },
    { slug: 'stakeholder-map', name: 'Stakeholder Map', emoji: '🗺️', cluster: 'team' },
    { slug: 'status-beacon', name: 'Status Beacon', emoji: '🟢', cluster: 'team' },
    { slug: 'poker-planner', name: 'Poker Planner', emoji: '♠️', cluster: 'team' },
    { slug: 'org-chart-forge', name: 'Org Chart Forge', emoji: '🏢', cluster: 'team' },
    // 💰 Money & Pitch
    { slug: 'pricing-lab', name: 'Pricing Lab', emoji: '💰', cluster: 'money' },
    { slug: 'runway-calc', name: 'Runway Calc', emoji: '📉', cluster: 'money' },
    { slug: 'pitch-deck', name: 'Pitch Deck', emoji: '🎬', cluster: 'money' },
    { slug: 'invoice-forge', name: 'Invoice Forge', emoji: '🧾', cluster: 'money' },
    { slug: 'estimate-engine', name: 'Estimate Engine', emoji: '📐', cluster: 'money' },
    { slug: 'budget-forge', name: 'Budget Forge', emoji: '💵', cluster: 'money' },
    { slug: 'contract-forge', name: 'Contract Forge', emoji: '📑', cluster: 'money' },
    // 🧩 Loose / Personal
    { slug: 'focus-flow', name: 'Focus Flow', emoji: '🎧', cluster: 'personal' },
    { slug: 'habit-stack', name: 'Habit Stack', emoji: '🧱', cluster: 'personal' },
    { slug: 'knowledge-garden', name: 'Knowledge Garden', emoji: '🌱', cluster: 'personal' },
    { slug: 'email-craft', name: 'Email Craft', emoji: '✉️', cluster: 'personal' },
    { slug: 'survey-forge', name: 'Survey Forge', emoji: '📊', cluster: 'personal' },
    { slug: 'link-hub', name: 'Link Hub', emoji: '🔗', cluster: 'personal' },
    { slug: 'snippet-vault', name: 'Snippet Vault', emoji: '🧬', cluster: 'personal' },
    { slug: 'flashcard-forge', name: 'Flashcard Forge', emoji: '🃏', cluster: 'personal' },
    { slug: 'mind-map', name: 'Mind Map', emoji: '🧠', cluster: 'personal' },
    { slug: 'content-calendar', name: 'Content Calendar', emoji: '🗓️', cluster: 'personal' },
    { slug: 'canvas-lab', name: 'Canvas Lab', emoji: '🧩', cluster: 'personal' },
    { slug: 'dev-toolkit', name: 'Dev Toolkit', emoji: '🧰', cluster: 'personal' },
    { slug: 'api-playground', name: 'API Playground', emoji: '🛰️', cluster: 'personal' },
    { slug: 'design-tokens', name: 'Design Tokens', emoji: '🎨', cluster: 'personal' },
    { slug: 'draft-studio', name: 'Draft Studio', emoji: '✍️', cluster: 'personal' },
    { slug: 'qr-forge', name: 'QR Forge', emoji: '🔳', cluster: 'personal' },
    { slug: 'gradient-studio', name: 'Gradient Studio', emoji: '🌈', cluster: 'personal' },
    { slug: 'code-playground', name: 'Code Playground', emoji: '💻', cluster: 'personal' },
    { slug: 'table-forge', name: 'Table Forge', emoji: '📋', cluster: 'personal' },
    { slug: 'algo-arena', name: 'Algo Arena', emoji: '🏟️', cluster: 'personal' },
    { slug: 'logic-gate-lab', name: 'Logic Gate Lab', emoji: '⚡', cluster: 'personal' },
    { slug: 'data-forge', name: 'Data Forge', emoji: '🗃️', cluster: 'personal' },
    { slug: 'stack-radar', name: 'Stack Radar', emoji: '🧮', cluster: 'personal' },
    // Creative & Play (days 51–80 wave)
    { slug: 'pixel-forge', name: 'Pixel Forge', emoji: '🖼️', cluster: 'creative' },
    { slug: 'beat-lab', name: 'Beat Lab', emoji: '🥁', cluster: 'creative' },
    { slug: 'art-lab', name: 'Art Lab', emoji: '🖌️', cluster: 'creative' },
    { slug: 'arcade-cabinet', name: 'Arcade Cabinet', emoji: '🕹️', cluster: 'creative' },
    { slug: 'physics-lab', name: 'Physics Lab', emoji: '🪀', cluster: 'creative' },
    { slug: 'typing-arena', name: 'Typing Arena', emoji: '🏎️', cluster: 'creative' },
    { slug: 'dialogue-tree', name: 'Dialogue Tree', emoji: '🗨️', cluster: 'creative' },
    { slug: 'palette-forge', name: 'Palette Forge', emoji: '🎨', cluster: 'build' },
    { slug: 'sitemap-forge', name: 'Sitemap Forge', emoji: '🗺️', cluster: 'build' },
  ];

  // Deduplicate (sprint-board appears in both build and team)
  const seen = new Set();
  const UNIQUE_TOOLS = TOOLS.filter(t => {
    if (t.aliasOf) return false; // skip alias, show in primary cluster
    if (seen.has(t.slug)) return false;
    seen.add(t.slug);
    return true;
  });

  const CLUSTERS = [
    { id: 'build', label: '🚀 Build a Product', desc: 'From idea to launch', emoji: '🚀', short: 'Build a Product' },
    { id: 'career', label: '💼 Career Loop', desc: 'Job hunt to offer', emoji: '💼', short: 'Career Loop' },
    { id: 'product', label: '📊 Run a Product', desc: 'Metrics, feedback, growth', emoji: '📊', short: 'Run a Product' },
    { id: 'team', label: '👥 Run a Team', desc: 'Sprints, retros, alignment', emoji: '👥', short: 'Run a Team' },
    { id: 'money', label: '💰 Money & Pitch', desc: 'Pricing, runway, fundraise', emoji: '💰', short: 'Money & Pitch' },
    { id: 'personal', label: '🧩 Personal & Dev', desc: 'Tools, focus, learning', emoji: '🧩', short: 'Personal & Dev' },
    { id: 'creative', label: '🎨 Creative & Play', desc: 'Make art, music, games', emoji: '🎨', short: 'Creative & Play' },
  ];

  // Sprint Board should show in team cluster too (cross-ref)
  const CROSS_CLUSTER = { 'team': ['sprint-board'] };

  // ── Next Step Map ──
  const NEXT_MAP = {
    'idea-validator': { tool: 'prd-forge', label: 'Turn this into a PRD', emoji: '📝', condition: 'ideas' },
    'prd-forge': { tool: 'roadmap-hero', label: 'Plan the roadmap', emoji: '🛤️', condition: 'prds' },
    'roadmap-hero': { tool: 'sprint-board', label: 'Start a sprint', emoji: '🏃' },
    'sprint-board': { tool: 'retro-board', label: 'Run a retro', emoji: '🔄', condition: 'sprints' },
    'persona-forge': { tool: 'prd-forge', label: 'Write the PRD', emoji: '📝' },
    'job-pipeline': { tool: 'interview-ace', label: 'Prep for interviews', emoji: '🎤', condition: 'jobs' },
    'interview-ace': { tool: 'offer-compass', label: 'Compare offers', emoji: '🧭' },
    'okr-forge': { tool: 'metric-pulse', label: 'Track your KPIs', emoji: '📊', condition: 'okrs' },
    'retro-board': { tool: 'sprint-board', label: 'Plan next sprint', emoji: '🏃' },
    'feedback-board': { tool: 'okr-forge', label: 'Set OKRs from feedback', emoji: '🎯' },
    'schema-forge': { tool: 'api-playground', label: 'Test your API', emoji: '🛰️' },
    'wireframe-kit': { tool: 'prd-forge', label: 'Document in PRD', emoji: '📝' },
    'launch-pad': { tool: 'changelog', label: 'Write the changelog', emoji: '📜' },
    'pricing-lab': { tool: 'runway-calc', label: 'Model your runway', emoji: '📉' },
    'runway-calc': { tool: 'pitch-deck', label: 'Build the pitch deck', emoji: '🎬' },
  };

  // ── State ──
  let currentTool = null;
  let workspace = null;
  let sidebarOpen = false;
  let nextCardDismissed = false;
  let sheetCluster = 'all'; // current sheet filter

  function clusterTools(clusterId) {
    const tools = UNIQUE_TOOLS.filter(t => t.cluster === clusterId);
    const extra = CROSS_CLUSTER[clusterId] || [];
    for (const slug of extra) {
      if (!tools.find(t => t.slug === slug)) {
        const t = UNIQUE_TOOLS.find(t2 => t2.slug === slug);
        if (t) tools.push(t);
      }
    }
    return tools;
  }

  // ── Workspace ──
  function loadWorkspace() {
    try {
      const raw = localStorage.getItem(WORKSPACE_KEY);
      workspace = raw ? JSON.parse(raw) : defaultWorkspace();
    } catch(e) { workspace = defaultWorkspace(); }
    return workspace;
  }

  function saveWorkspace() {
    workspace.meta.updatedAt = new Date().toISOString();
    try { localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace)); } catch(e) {}
  }

  function defaultWorkspace() {
    return {
      version: 1,
      meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), name: 'My Workspace' },
      ideas: [], prds: [], contacts: [], decisions: [], okrs: [], jobs: [],
      retros: [], postmortems: [], experiments: [], feedback: [],
      sprints: [], metrics: [], features: []
    };
  }

  // ── Recent tools ──
  function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch(e) { return []; }
  }
  function trackRecent(slug) {
    try {
      let r = getRecent().filter(s => s !== slug);
      r.unshift(slug);
      r = r.slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(r));
    } catch(e) {}
  }

  // ── Rendering: desktop sidebar ──
  function renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    let html = '';

    for (const cluster of CLUSTERS) {
      const tools = clusterTools(cluster.id);
      if (!tools.length) continue;

      html += `<div class="cluster" data-cluster="${cluster.id}">`;
      html += `<div class="cluster__header" data-action="toggle-cluster" data-id="${cluster.id}">`;
      html += `<span class="cluster__arrow">▼</span> ${cluster.label}`;
      html += `</div>`;
      html += `<div class="cluster__desc">${cluster.desc}</div>`;
      html += `<div class="cluster__items">`;
      for (const tool of tools) {
        const active = currentTool === tool.slug ? ' active' : '';
        html += `<a class="tool-item${active}" data-slug="${tool.slug}">`;
        html += `<span class="tool-item__emoji">${tool.emoji}</span>`;
        html += `<span class="tool-item__name">${tool.name}</span>`;
        html += `</a>`;
      }
      html += `</div></div>`;
    }

    nav.innerHTML = html;
  }

  // ── Rendering: full-screen switcher sheet (mobile + ⌘K) ──
  function renderSheet() {
    const list = document.getElementById('sheetList');
    if (!list) return;
    let html = '';
    for (const cluster of CLUSTERS) {
      const tools = clusterTools(cluster.id);
      if (!tools.length) continue;
      html += `<div class="sheet__cluster" data-cluster="${cluster.id}">`;
      html += `<div class="sheet__cluster-header">${cluster.label}</div>`;
      for (const tool of tools) {
        html += `<div class="sheet__row" data-slug="${tool.slug}" data-name="${tool.name.toLowerCase()}">`;
        html += `<span class="sheet__row-emoji">${tool.emoji}</span>`;
        html += `<span class="sheet__row-name">${tool.name}</span>`;
        html += `</div>`;
      }
      html += `</div>`;
    }
    html += `<div class="sheet__empty" id="sheetEmpty" style="display:none">No tools match. Try another search.</div>`;
    list.innerHTML = html;
  }

  function openSheet(clusterId, query) {
    sheetCluster = clusterId || 'all';
    const sheet = document.getElementById('toolSheet');
    const title = document.getElementById('sheetTitle');
    const search = document.getElementById('sheetSearch');
    const c = CLUSTERS.find(x => x.id === sheetCluster);
    title.textContent = c ? c.emoji + ' ' + c.short : 'All tools';
    search.value = query || '';
    applySheetFilter();
    sheet.classList.add('open');
    document.getElementById('sheetList').scrollTop = 0;
    updateBottombarActive();
    // No autofocus on mobile (keyboard jump); focus only when opened via ⌘K (desktop)
  }

  function closeSheet() {
    document.getElementById('toolSheet').classList.remove('open');
    sheetCluster = 'all';
    updateBottombarActive();
  }

  function sheetIsOpen() {
    return document.getElementById('toolSheet').classList.contains('open');
  }

  function applySheetFilter() {
    const query = document.getElementById('sheetSearch').value.toLowerCase().trim();
    let visible = 0;
    document.querySelectorAll('#sheetList .sheet__cluster').forEach(sec => {
      const inCluster = sheetCluster === 'all' || sec.dataset.cluster === sheetCluster;
      let clusterVisible = 0;
      sec.querySelectorAll('.sheet__row').forEach(row => {
        const match = inCluster && (!query || row.dataset.name.includes(query));
        row.style.display = match ? '' : 'none';
        if (match) clusterVisible++;
      });
      sec.style.display = clusterVisible ? '' : 'none';
      visible += clusterVisible;
    });
    const empty = document.getElementById('sheetEmpty');
    if (empty) empty.style.display = visible ? 'none' : '';
  }

  function updateBottombarActive() {
    const open = sheetIsOpen();
    document.querySelectorAll('.bottombar__item').forEach(el => {
      const c = el.dataset.cluster;
      el.classList.toggle('active', open ? (c === sheetCluster || (c === 'all' && sheetCluster === 'all')) : false);
    });
  }

  // ── Rendering: welcome ──
  function renderWelcome() {
    const wrap = document.getElementById('iframeWrap');
    const recent = getRecent()
      .map(slug => UNIQUE_TOOLS.find(t => t.slug === slug))
      .filter(Boolean);

    const recentHtml = recent.length ? `
      <div class="welcome__section-title">Recent</div>
      <div class="welcome__recent">${recent.map(t =>
        `<div class="welcome__recent-chip" data-slug="${t.slug}"><span>${t.emoji}</span><span>${t.name}</span></div>`
      ).join('')}</div>` : '';

    const cards = CLUSTERS.map(c => {
      const count = clusterTools(c.id).length;
      return `<div class="welcome__card" data-cluster-card="${c.id}">
        <div class="welcome__card-emoji">${c.emoji}</div>
        <div class="welcome__card-name"><span>${c.short}</span><span class="welcome__card-count">${count} tools</span></div>
        <div class="welcome__card-desc">${c.desc}</div>
      </div>`;
    }).join('');

    wrap.innerHTML = `<div class="welcome">
      <div class="welcome__inner">
        <h2>⚡ 80 free tools for builders</h2>
        <p class="welcome__sub">Idea validation, PRDs, sprints, job hunt, pricing — all connected, no login.</p>
        <input class="welcome__search" id="welcomeSearch" type="search" placeholder="Search 80 tools…" autocomplete="off">
        ${recentHtml}
        <div class="welcome__section-title">Browse by goal</div>
        <div class="welcome__grid">${cards}</div>
      </div>
    </div>`;

    const ws = document.getElementById('welcomeSearch');
    ws.addEventListener('input', function() {
      if (this.value.trim()) {
        const q = this.value;
        this.value = '';
        openSheet('all', q);
      }
    });
  }

  // ── Next card ──
  function updateNextCard() {
    const card = document.getElementById('nextCard');
    if (!currentTool || nextCardDismissed) { card.classList.add('hidden'); return; }

    const next = NEXT_MAP[currentTool];
    if (!next) { card.classList.add('hidden'); return; }

    if (next.condition && workspace && (!workspace[next.condition] || workspace[next.condition].length === 0)) {
      card.classList.add('hidden'); return;
    }

    const targetTool = UNIQUE_TOOLS.find(t => t.slug === next.tool);
    if (!targetTool) { card.classList.add('hidden'); return; }

    document.getElementById('nextEmoji').textContent = next.emoji;
    document.getElementById('nextLabel').textContent = 'Next step';
    document.getElementById('nextTitle').textContent = next.label;
    card.classList.remove('hidden');
    card.onclick = function(e) {
      if (e.target.classList.contains('next-card__close')) return;
      window.__shell.openTool(next.tool);
    };
  }

  // ── Navigation ──
  function openTool(slug, skipHistory) {
    const tool = UNIQUE_TOOLS.find(t => t.slug === slug);
    if (!tool) return;

    currentTool = slug;
    nextCardDismissed = false;
    closeSheet();
    sidebarOpen = false;
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('visible');

    trackRecent(slug);

    // Update URL
    if (!skipHistory) history.pushState({ tool: slug }, '', '/?tool=' + slug);

    // Update topbar immediately (perceived speed)
    document.getElementById('topbarTitle').textContent = tool.emoji + ' ' + tool.name;

    // Update sidebar active
    document.querySelectorAll('.tool-item').forEach(el => {
      el.classList.toggle('active', el.dataset.slug === slug);
    });
    document.querySelectorAll('.sheet__row').forEach(el => {
      el.classList.toggle('active', el.dataset.slug === slug);
    });

    // Load iframe with loading overlay
    const wrap = document.getElementById('iframeWrap');
    wrap.innerHTML = `
      <div class="tool-loading" id="toolLoading">
        <div class="tool-loading__spinner"></div>
        <div class="tool-loading__label">Loading ${tool.name}…</div>
      </div>
      <iframe id="toolFrame" src="/${slug}/" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"></iframe>`;

    const iframe = document.getElementById('toolFrame');
    iframe.addEventListener('load', function() {
      // Remove loading overlay
      const loading = document.getElementById('toolLoading');
      if (loading) {
        loading.classList.add('done');
        setTimeout(function() { if (loading.parentNode) loading.parentNode.removeChild(loading); }, 250);
      }
      // Inject bridge
      try {
        const script = iframe.contentDocument.createElement('script');
        script.src = '/_shell/bridge.js';
        iframe.contentDocument.head.appendChild(script);
        // Send workspace
        setTimeout(function() {
          iframe.contentWindow.postMessage({ __mvpc: true, type: 'workspace-init', workspace: workspace }, '*');
        }, 100);
      } catch(e) {
        console.warn('Bridge injection failed:', e);
      }
    });

    updateNextCard();
  }

  function handlePopState(e) {
    const params = new URLSearchParams(window.location.search);
    const tool = params.get('tool');
    if (tool) openTool(tool, true);
    else {
      currentTool = null;
      document.getElementById('topbarTitle').textContent = 'Overnight Builds';
      document.querySelectorAll('.tool-item.active, .sheet__row.active').forEach(el => el.classList.remove('active'));
      renderWelcome();
      updateNextCard();
    }
  }

  // ── Search (desktop sidebar) ──
  function handleSearch(query) {
    query = query.toLowerCase().trim();
    document.querySelectorAll('#sidebarNav .tool-item').forEach(el => {
      const name = el.querySelector('.tool-item__name').textContent.toLowerCase();
      el.style.display = name.includes(query) || !query ? '' : 'none';
    });
    if (query) {
      document.querySelectorAll('.cluster').forEach(c => c.classList.remove('collapsed'));
    }
  }

  // ── PostMessage handler (from iframes) ──
  window.addEventListener('message', function(e) {
    if (!e.data || !e.data.__mvpc) return;
    const msg = e.data;

    if (msg.type === 'workspace-request') {
      const iframe = document.getElementById('toolFrame');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ __mvpc: true, type: 'workspace-init', workspace: workspace }, '*');
      }
    }
    if (msg.type === 'workspace-write') {
      workspace[msg.key] = msg.value;
      saveWorkspace();
    }
    if (msg.type === 'navigate-request') {
      if (msg.data) {
        workspace.__crossToolData = msg.data;
        saveWorkspace();
      }
      openTool(msg.tool);
    }
  });

  // ── Public API ──
  window.__shell = {
    openTool: openTool,
    openSheet: openSheet,
    closeSheet: closeSheet,
    toggleCluster: function(id) {
      const el = document.querySelector(`.cluster[data-cluster="${id}"]`);
      if (el) el.classList.toggle('collapsed');
    },
    toggleSidebar: function() {
      // On mobile, burger opens the full-screen switcher instead of the old drawer
      if (window.innerWidth <= 768) {
        sheetIsOpen() ? closeSheet() : openSheet('all');
        return;
      }
      sidebarOpen = !sidebarOpen;
      document.querySelector('.sidebar').classList.toggle('open', sidebarOpen);
      document.querySelector('.sidebar-overlay').classList.toggle('visible', sidebarOpen);
    },
    dismissNext: function(e) {
      e.stopPropagation();
      nextCardDismissed = true;
      document.getElementById('nextCard').classList.add('hidden');
    }
  };

  // ── Init ──
  document.addEventListener('DOMContentLoaded', function() {
    loadWorkspace();
    renderSidebar();
    renderSheet();

    // Desktop sidebar search
    const sidebarSearch = document.getElementById('sidebarSearch');
    if (sidebarSearch) {
      sidebarSearch.addEventListener('input', function(e) { handleSearch(e.target.value); });
    }

    // Sidebar nav: event delegation
    document.getElementById('sidebarNav').addEventListener('click', function(e) {
      const header = e.target.closest('[data-action="toggle-cluster"]');
      if (header) { window.__shell.toggleCluster(header.dataset.id); return; }
      const item = e.target.closest('.tool-item');
      if (item) openTool(item.dataset.slug);
    });

    // Sheet: event delegation + search + close
    document.getElementById('sheetList').addEventListener('click', function(e) {
      const row = e.target.closest('.sheet__row');
      if (row) openTool(row.dataset.slug);
    });
    document.getElementById('sheetSearch').addEventListener('input', applySheetFilter);
    document.getElementById('sheetClose').addEventListener('click', closeSheet);

    // Sidebar overlay close (desktop fallback)
    document.querySelector('.sidebar-overlay').addEventListener('click', function() {
      sidebarOpen = false;
      document.querySelector('.sidebar').classList.remove('open');
      this.classList.remove('visible');
    });

    // Bottom bar — cluster tabs open the switcher filtered to that cluster
    document.querySelectorAll('.bottombar__item').forEach(el => {
      el.addEventListener('click', function() {
        const cluster = this.dataset.cluster;
        if (sheetIsOpen() && sheetCluster === cluster) { closeSheet(); return; }
        openSheet(cluster === 'all' ? 'all' : cluster);
      });
    });

    // Check URL for tool
    const params = new URLSearchParams(window.location.search);
    const tool = params.get('tool');
    if (tool) openTool(tool, true);
    else renderWelcome();

    window.addEventListener('popstate', handlePopState);

    // Keyboard: ⌘K opens search, Esc closes sheet
    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (window.innerWidth <= 768) {
          openSheet('all');
        } else {
          const searchEl = document.getElementById('sidebarSearch');
          if (searchEl) searchEl.focus();
        }
      }
      if (e.key === 'Escape' && sheetIsOpen()) closeSheet();
    });
  });
})();
