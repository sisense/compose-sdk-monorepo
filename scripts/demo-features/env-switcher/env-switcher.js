/**
 * CSDK demo — environment-switcher.
 *
 * Fixed "⚙ Env" button (bottom-right).
 * States:
 * - Black = built-in default active,
 * - Green = custom environment active.
 * Opens a panel to add/select/delete named environments stored in localStorage.
 *
 * localStorage keys:
 *   'csdk_demo_active_env'  { url, token } | absent — active override.
 *       Read by: demo-app-config.ts · App.vue · app.module.ts · react-ts-demo/main.tsx
 *   'csdk_demo_envs'  [{ id, label, url, token }] — saved envs list (widget only).
 *
 * Injected via:
 *   React / Vue  — vite-plugin.mjs (transformIndexHtml in each Vite config)
 *   Angular      — angular.json "scripts" array
 *
 * This file is the single source of truth. Never duplicate this logic.
 */
(function () {
  'use strict';

  var KEY_ACTIVE = 'csdk_demo_active_env';
  var KEY_ENVS = 'csdk_demo_envs';

  /* ── Storage ────────────────────────────────────────────────────────────── */

  function loadEnvs() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY_ENVS) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }
  function saveEnvs(list) {
    localStorage.setItem(KEY_ENVS, JSON.stringify(list));
  }

  function loadActive() {
    try {
      return JSON.parse(localStorage.getItem(KEY_ACTIVE) || 'null');
    } catch (e) {
      return null;
    }
  }

  /** Set the active override (or clear it) and reload the page. */
  function activate(env) {
    if (env) localStorage.setItem(KEY_ACTIVE, JSON.stringify({ url: env.url, token: env.token }));
    else localStorage.removeItem(KEY_ACTIVE);
    location.reload();
  }

  function genId() {
    return '_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  /* ── DOM helpers ────────────────────────────────────────────────────────── */

  function el(tag, css) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    return e;
  }

  /** Labeled input group. Returns { wrap, input }. */
  function inp(labelText, type, placeholder) {
    var wrap = el('div', 'margin-bottom:.45rem;');
    var label = el(
      'label',
      'display:block;font-size:.72rem;font-weight:600;color:#3f3f46;margin-bottom:.15rem;',
    );
    label.textContent = labelText;
    var input = el(
      'input',
      'width:100%;box-sizing:border-box;padding:.35rem .5rem;border:1px solid #d4d4d8;' +
        'border-radius:4px;font-size:.78rem;outline:none;',
    );
    input.type = type;
    input.placeholder = placeholder;
    wrap.appendChild(label);
    wrap.appendChild(input);
    return { wrap: wrap, input: input };
  }

  /* ── Environment-switcher ─────────────────────────────────────────────────────────────── */

  var PRIORITY = 10; // toolbar slot — rightmost

  // ── Shared demo toolbar ─────────────────────────────────────────────────
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

  function init() {
    /* Skip entirely when running under visual regression tests. */
    if (window.__CSDK_DISABLE_DEMO_BAR__) return;

    if (document.getElementById('csdk-env-switcher')) return;

    // position:relative so the absolute-positioned panel opens relative to this wrapper.
    var wrapper = el('div', 'position:relative;font-family:system-ui,sans-serif;font-size:.8rem;');
    wrapper.id = 'csdk-env-switcher';

    /* Button — label is always "⚙ Env"; only background changes */
    var btn = el(
      'button',
      'padding:.45rem .85rem;border:none;border-radius:6px;cursor:pointer;' +
        'font-family:system-ui,sans-serif;font-size:.8rem;font-weight:600;letter-spacing:.01em;' +
        'color:#fff;background:rgba(0,0,0,.72);' +
        'box-shadow:0 2px 8px rgba(0,0,0,.3);transition:background .15s;',
    );
    btn.title = 'Environment settings';
    btn.innerHTML = '&#9881; Env';

    /* Panel */
    var panel = el(
      'div',
      'display:none;position:absolute;bottom:calc(100% + .6rem);right:0;width:300px;' +
        'background:#fff;border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,.18);' +
        'border:1px solid #e4e4e7;overflow:hidden;',
    );

    var hdr = el(
      'div',
      'display:flex;align-items:center;justify-content:space-between;' +
        'padding:.5rem .8rem;background:#f4f4f5;border-bottom:1px solid #e4e4e7;',
    );
    var hdrTitle = el('strong', 'font-size:.78rem;color:#18181b;');
    hdrTitle.textContent = 'Sisense Environment';
    var closeBtn = el(
      'button',
      'background:none;border:none;cursor:pointer;color:#71717a;font-size:1rem;line-height:1;padding:.1rem;',
    );
    closeBtn.innerHTML = '&#10005;';
    closeBtn.addEventListener('click', function () {
      panel.style.display = 'none';
    });
    hdr.appendChild(hdrTitle);
    hdr.appendChild(closeBtn);

    var listEl = el('div', 'max-height:240px;overflow-y:auto;border-bottom:1px solid #e4e4e7;');
    var addEl = el('div', 'padding:.45rem .75rem .6rem;');

    panel.appendChild(hdr);
    panel.appendChild(listEl);
    panel.appendChild(addEl);
    wrapper.appendChild(btn);
    wrapper.appendChild(panel);
    addToToolbar(wrapper, PRIORITY);

    /* ── makeRow ─────────────────────────────────────────────────────────── */

    function makeRow(label, env, isActive, onDelete) {
      var row = el(
        'div',
        'display:flex;align-items:center;gap:.45rem;padding:.45rem .7rem;cursor:pointer;' +
          'border-bottom:1px solid #f4f4f5;' +
          (isActive ? 'background:#f0fdf4;' : ''),
      );

      row.addEventListener('mouseover', function () {
        if (!isActive) row.style.background = '#fafafa';
      });
      row.addEventListener('mouseout', function () {
        row.style.background = isActive ? '#f0fdf4' : '';
      });
      row.addEventListener('click', function () {
        if (!isActive) activate(env);
      });

      /* Indicator dot */
      row.appendChild(
        el(
          'span',
          'flex-shrink:0;width:8px;height:8px;border-radius:50%;' +
            'background:' +
            (isActive ? '#16a34a' : '#d4d4d8') +
            ';',
        ),
      );

      /* Name + URL hint */
      var text = el('div', 'flex:1;min-width:0;');
      var name = el(
        'span',
        'display:block;font-size:.78rem;font-weight:' +
          (isActive ? '700' : '500') +
          ';color:#18181b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
      );
      name.textContent = label;
      text.appendChild(name);
      if (env && env.url) {
        var hint = el(
          'span',
          'display:block;font-size:.69rem;color:#71717a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
        );
        hint.textContent = env.url;
        text.appendChild(hint);
      }
      row.appendChild(text);

      /* Delete button (custom envs only) */
      if (onDelete) {
        var del = el(
          'button',
          'flex-shrink:0;background:none;border:none;cursor:pointer;color:#d4d4d8;font-size:.8rem;line-height:1;padding:0 .2rem;transition:color .1s;',
        );
        del.title = 'Remove';
        del.innerHTML = '&#10005;';
        del.addEventListener('mouseover', function () {
          del.style.color = '#ef4444';
        });
        del.addEventListener('mouseout', function () {
          del.style.color = '#d4d4d8';
        });
        del.addEventListener('click', function (e) {
          e.stopPropagation();
          onDelete();
        });
        row.appendChild(del);
      }

      return row;
    }

    /* ── makeAddSection ──────────────────────────────────────────────────── */

    function makeAddSection(onSave) {
      var arrow = el('span', 'font-size:.65rem;display:inline-block;transition:transform .15s;');
      arrow.innerHTML = '&#9654;';

      var toggle = el(
        'button',
        'display:flex;align-items:center;gap:.3rem;width:100%;background:none;border:none;' +
          'cursor:pointer;font-size:.77rem;font-weight:500;color:#18181b;padding:.3rem 0;text-align:left;',
      );
      toggle.appendChild(arrow);
      toggle.appendChild(document.createTextNode('Add environment'));

      var form = el(
        'div',
        'display:none;padding-top:.4rem;border-top:1px solid #e4e4e7;margin-top:.3rem;',
      );
      var nameF = inp('Name', 'text', 'Production');
      var urlF = inp('URL', 'url', 'https://your-instance.sisense.com');
      var tokF = inp('Token', 'password', 'Paste API token');
      var saveBtn = el(
        'button',
        'width:100%;margin-top:.3rem;padding:.4rem;background:#18181b;color:#fff;border:none;' +
          'border-radius:5px;cursor:pointer;font-size:.77rem;font-weight:500;',
      );
      saveBtn.textContent = 'Save & Apply';
      [nameF, urlF, tokF].forEach(function (f) {
        form.appendChild(f.wrap);
      });
      form.appendChild(saveBtn);

      var open = false;
      toggle.addEventListener('click', function () {
        open = !open;
        form.style.display = open ? 'block' : 'none';
        arrow.style.transform = open ? 'rotate(90deg)' : '';
      });

      saveBtn.addEventListener('click', function () {
        var n = nameF.input.value.trim(),
          u = urlF.input.value.trim(),
          t = tokF.input.value.trim();
        nameF.input.style.borderColor = n ? '' : '#ef4444';
        urlF.input.style.borderColor = u ? '' : '#ef4444';
        if (!n) {
          nameF.input.focus();
          return;
        }
        if (!u) {
          urlF.input.focus();
          return;
        }
        onSave({ id: genId(), label: n, url: u, token: t });
      });

      var wrap = el('div', '');
      wrap.appendChild(toggle);
      wrap.appendChild(form);
      return wrap;
    }

    /* ── renderPanel ─────────────────────────────────────────────────────── */

    function renderPanel() {
      var active = loadActive();
      var envs = loadEnvs();

      /* Find which stored env matches the active override (by url + token). */
      var activeId = null;
      if (active) {
        for (var i = 0; i < envs.length; i++) {
          if (envs[i].url === active.url && envs[i].token === active.token) {
            activeId = envs[i].id;
            break;
          }
        }
      }

      /* Rebuild list */
      while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
      listEl.appendChild(makeRow('Default', null, !active, null));
      envs.forEach(function (env) {
        var isActive = env.id === activeId;
        listEl.appendChild(
          makeRow(env.label, env, isActive, function () {
            saveEnvs(
              loadEnvs().filter(function (e) {
                return e.id !== env.id;
              }),
            );
            if (isActive) activate(null); // reloads
            else renderPanel();
          }),
        );
      });

      /* Rebuild add section */
      while (addEl.firstChild) addEl.removeChild(addEl.firstChild);
      addEl.appendChild(
        makeAddSection(function (newEnv) {
          var list = loadEnvs();
          list.push(newEnv);
          saveEnvs(list);
          activate(newEnv); // reloads
        }),
      );

      /* Button color: green when any custom override is active */
      btn.style.background = active ? 'rgba(22,163,74,.85)' : 'rgba(0,0,0,.72)';
    }

    /* ── Events ──────────────────────────────────────────────────────────── */

    btn.addEventListener('click', function () {
      if (panel.style.display === 'none') {
        renderPanel();
        panel.style.display = 'block';
      } else panel.style.display = 'none';
    });

    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) panel.style.display = 'none';
    });

    /* Set initial button color without opening the panel */
    if (loadActive()) btn.style.background = 'rgba(22,163,74,.85)';
  }

  if (document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
