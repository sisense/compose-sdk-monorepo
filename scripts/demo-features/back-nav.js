/**
 * CSDK demo — "← All demos" back-navigation link.
 *
 * Registers into the shared demo toolbar (bottom-right corner).
 * Toolbar priority: 30 — leftmost, to the left of source-link and env-switcher.
 *
 * Only meaningful in the review app where "../" leads to the home page.
 *
 * Injected post-build by scripts/build-review-app.mjs — NOT present in any source index.html.
 *
 * This file is the single source of truth. Never duplicate this logic.
 */
(function () {
  'use strict';

  var PRIORITY = 30; // toolbar slot — leftmost

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

  function addBackNav() {
    if (document.getElementById('csdk-back-nav')) return;
    var a = document.createElement('a');
    a.id = 'csdk-back-nav';
    a.href = '../';
    a.textContent = '← All demos';
    a.style.cssText =
      'display:inline-flex;align-items:center;gap:.4rem;padding:.45rem .85rem;' +
      'background:rgba(0,0,0,.72);color:#fff;text-decoration:none;border-radius:6px;' +
      'font-family:system-ui,sans-serif;font-size:.8rem;font-weight:600;letter-spacing:.01em;' +
      'backdrop-filter:blur(4px);box-shadow:0 2px 8px rgba(0,0,0,.3);white-space:nowrap;';
    addToToolbar(a, PRIORITY);
  }

  if (document.readyState === 'complete') addBackNav();
  else document.addEventListener('DOMContentLoaded', addBackNav);
})();
