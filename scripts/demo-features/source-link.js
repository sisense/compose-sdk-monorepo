/**
 * CSDK demo — source link badge.
 *
 * Registers into the shared demo toolbar (bottom-right corner).
 * Toolbar priority: 20 — between source-link and env-switcher.
 *
 * Shows a badge that links to the originating source for the current deployment:
 *   MR review app → orange "MR !<id>" → links to the GitLab MR
 *   Staging       → green  "master"   → links to the master branch
 *
 * Mode is detected by scanning every segment of the URL path for /mr-<digits>/
 * or /staging/, so the script works at any depth (home page, react/, vue/, angular/).
 *
 * Injected post-build by scripts/build-review-app.mjs — NOT present in any
 * source index.html. This file is the single source of truth for sub-app injection.
 * The home page (public/index.html) inlines equivalent logic directly (mode variables
 * are already in scope there); keep both in sync if the badge style changes.
 *
 * Never duplicate this logic elsewhere.
 */
(function () {
  'use strict';

  var PRIORITY = 20; // toolbar slot — between env-switcher and back-nav

  var GL = 'https://gitlab.rnd.sisense.com/SisenseTeam/compose-sdk-monorepo';

  // ── Shared demo toolbar ───────────────────────────────────────────────────
  // One fixed container (bottom-right). Each feature self-registers with a
  // priority value — lower number = closer to the right edge:
  //   env-switcher=10  ·  source-link=20  ·  back-nav=30
  // Features may run in any order; the container is lazy-created on first use.
  function addToToolbar(element, priority) {
    var t = document.getElementById('csdk-demo-toolbar');
    if (!t) {
      t = document.createElement('div');
      t.id = 'csdk-demo-toolbar';
      t.style.cssText =
        'position:fixed;bottom:1rem;right:1rem;z-index:9999;' +
        'display:flex;flex-direction:row-reverse;gap:.5rem;align-items:center;';
      document.body.appendChild(t);
    }
    element.dataset.csdkPriority = String(priority);
    var sibling = null;
    for (var i = 0; i < t.children.length; i++) {
      if (Number(t.children[i].dataset.csdkPriority || 0) > priority) {
        sibling = t.children[i];
        break;
      }
    }
    t.insertBefore(element, sibling);
  }

  // ── Feature ───────────────────────────────────────────────────────────────

  function detect() {
    var parts = window.location.pathname.split('/');
    for (var i = 0; i < parts.length; i++) {
      var m = /^mr-(\d+)$/.exec(parts[i]);
      if (m) return { type: 'mr', mrId: m[1] };
      if (parts[i] === 'staging') return { type: 'staging' };
    }
    return null;
  }

  function addSourceLink() {
    if (document.getElementById('csdk-source-link')) return;
    var mode = detect();
    if (!mode) return;

    var isMR = mode.type === 'mr';
    var href = isMR ? GL + '/-/merge_requests/' + mode.mrId : GL + '/-/tree/master';
    var label = isMR ? 'MR !' + mode.mrId : 'master';
    var rgb = isMR ? '234,88,12' : '22,163,74'; // orange-600 : green-600

    var a = document.createElement('a');
    a.id = 'csdk-source-link';
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = label;
    a.style.cssText =
      'display:inline-flex;align-items:center;padding:.45rem .85rem;' +
      'background:rgba(' +
      rgb +
      ',.82);color:#fff;text-decoration:none;border-radius:6px;' +
      'font-weight:600;backdrop-filter:blur(4px);box-shadow:0 2px 8px rgba(0,0,0,.25);' +
      'font-family:system-ui,sans-serif;font-size:.8rem;letter-spacing:.01em;white-space:nowrap;';
    addToToolbar(a, PRIORITY);
  }

  if (document.readyState === 'complete') addSourceLink();
  else document.addEventListener('DOMContentLoaded', addSourceLink);
})();
