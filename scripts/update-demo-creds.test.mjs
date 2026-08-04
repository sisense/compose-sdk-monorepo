import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  DEMOS,
  parseArgs,
  computeAuth,
  demoSupportsMode,
  updateEnvContent,
  updateAngularContent,
  maskSecret,
  getConfigPath,
  resolveInputs,
  nextMemory,
  readMemory,
  writeMemory,
} from './update-demo-creds.mjs';

const demo = (name) => DEMOS.find((d) => d.name === name);

// ---------------------------------------------------------------------------
// registry
// ---------------------------------------------------------------------------

test('registry contains all 9 demos with required shape', () => {
  const names = DEMOS.map((d) => d.name).sort();
  assert.deepEqual(names, [
    'angular-demo',
    'plugins-demo/angular',
    'plugins-demo/react',
    'plugins-demo/vue',
    'react-fusion',
    'react-ts-demo',
    'simple-table-paginated',
    'simple-table-plugin',
    'vue-ts-demo',
  ]);
  for (const d of DEMOS) {
    assert.ok(d.format === 'env' || d.format === 'angular', `${d.name} format`);
    assert.ok(d.dir && d.target && d.seed, `${d.name} paths`);
    assert.ok(d.keys.url && d.keys.token, `${d.name} url/token keys`);
  }
});

// ---------------------------------------------------------------------------
// computeAuth
// ---------------------------------------------------------------------------

test('computeAuth token mode sets token, clears wat, sso=false', () => {
  assert.deepEqual(computeAuth('token', 'SEC'), { token: 'SEC', wat: '', sso: false });
});

test('computeAuth login mode behaves like token mode', () => {
  assert.deepEqual(computeAuth('login', 'SEC'), { token: 'SEC', wat: '', sso: false });
});

test('computeAuth wat mode sets wat, clears token, sso=false', () => {
  assert.deepEqual(computeAuth('wat', 'SEC'), { token: '', wat: 'SEC', sso: false });
});

test('computeAuth sso mode sets sso=true, clears token and wat', () => {
  assert.deepEqual(computeAuth('sso'), { token: '', wat: '', sso: true });
});

// ---------------------------------------------------------------------------
// demoSupportsMode
// ---------------------------------------------------------------------------

test('all demos support token and login', () => {
  for (const d of DEMOS) {
    assert.equal(demoSupportsMode(d, 'token'), true, `${d.name} token`);
    assert.equal(demoSupportsMode(d, 'login'), true, `${d.name} login`);
  }
});

test('wat supported only by the 5 full env demos', () => {
  const watSupported = DEMOS.filter((d) => demoSupportsMode(d, 'wat')).map((d) => d.name).sort();
  assert.deepEqual(watSupported, [
    'plugins-demo/react',
    'plugins-demo/vue',
    'react-fusion',
    'simple-table-plugin',
    'vue-ts-demo',
  ]);
});

test('sso supported by the 5 full env demos plus angular-demo', () => {
  const ssoSupported = DEMOS.filter((d) => demoSupportsMode(d, 'sso')).map((d) => d.name).sort();
  assert.deepEqual(ssoSupported, [
    'angular-demo',
    'plugins-demo/react',
    'plugins-demo/vue',
    'react-fusion',
    'simple-table-plugin',
    'vue-ts-demo',
  ]);
});

// ---------------------------------------------------------------------------
// updateEnvContent
// ---------------------------------------------------------------------------

const VUE_ENV = [
  'VITE_APP_SISENSE_URL=http://old:1',
  'VITE_APP_SISENSE_SSO_ENABLED=false',
  'VITE_APP_SISENSE_TOKEN=oldtoken',
  '# VITE_APP_SISENSE_WAT=<wat>',
  'VITE_APP_WIDGETS="keep-me"',
  '',
].join('\n');

test('env writer sets url + token, clears wat (uncommented empty) and sso=false', () => {
  const out = updateEnvContent(VUE_ENV, demo('vue-ts-demo'), {
    url: 'http://new:2/',
    auth: computeAuth('token', 'NEWTOK'),
  });
  assert.match(out, /^VITE_APP_SISENSE_URL=http:\/\/new:2\/$/m);
  assert.match(out, /^VITE_APP_SISENSE_TOKEN=NEWTOK$/m);
  assert.match(out, /^VITE_APP_SISENSE_WAT=$/m);
  assert.match(out, /^VITE_APP_SISENSE_SSO_ENABLED=false$/m);
  assert.match(out, /^VITE_APP_WIDGETS="keep-me"$/m); // unrelated line preserved
});

test('env writer sso mode sets sso=true and empties token', () => {
  const out = updateEnvContent(VUE_ENV, demo('vue-ts-demo'), {
    url: 'http://new:2',
    auth: computeAuth('sso'),
  });
  assert.match(out, /^VITE_APP_SISENSE_SSO_ENABLED=true$/m);
  assert.match(out, /^VITE_APP_SISENSE_TOKEN=$/m);
});

test('env writer wat mode sets wat and empties token', () => {
  const out = updateEnvContent(VUE_ENV, demo('vue-ts-demo'), {
    url: 'http://new:2',
    auth: computeAuth('wat', 'WATVAL'),
  });
  assert.match(out, /^VITE_APP_SISENSE_WAT=WATVAL$/m);
  assert.match(out, /^VITE_APP_SISENSE_TOKEN=$/m);
});

test('env writer for token-only demo touches neither wat nor sso keys', () => {
  const input = 'VITE_APP_SISENSE_URL=old\nVITE_APP_SISENSE_TOKEN=old\n';
  const out = updateEnvContent(input, demo('react-ts-demo'), {
    url: 'U',
    auth: computeAuth('token', 'T'),
  });
  assert.doesNotMatch(out, /VITE_APP_SISENSE_WAT/);
  assert.doesNotMatch(out, /VITE_APP_SISENSE_SSO_ENABLED/);
  assert.match(out, /^VITE_APP_SISENSE_TOKEN=T$/m);
});

test('env writer appends a managed key when missing', () => {
  const input = 'VITE_APP_SISENSE_URL=old\n'; // token line absent
  const out = updateEnvContent(input, demo('react-ts-demo'), {
    url: 'U',
    auth: computeAuth('token', 'T'),
  });
  assert.match(out, /^VITE_APP_SISENSE_TOKEN=T$/m);
});

// ---------------------------------------------------------------------------
// updateAngularContent
// ---------------------------------------------------------------------------

const NG_ENV = [
  'export const environment = {',
  "  APP_SISENSE_URL: 'http://old:1',",
  "  APP_SISENSE_TOKEN: 'oldtoken',",
  '  APP_SSO_ENABLED: false,',
  "  APP_WIDGETS: 'keep-me',",
  '};',
  '',
].join('\n');

test('angular writer replaces quoted url + token strings', () => {
  const out = updateAngularContent(NG_ENV, demo('angular-demo'), {
    url: 'http://new:2/',
    auth: computeAuth('token', 'NEWTOK'),
  });
  assert.match(out, /APP_SISENSE_URL: 'http:\/\/new:2\/'/);
  assert.match(out, /APP_SISENSE_TOKEN: 'NEWTOK'/);
  assert.match(out, /APP_SSO_ENABLED: false/);
  assert.match(out, /APP_WIDGETS: 'keep-me'/); // preserved
});

test('angular writer sso mode toggles boolean and empties token', () => {
  const out = updateAngularContent(NG_ENV, demo('angular-demo'), {
    url: 'U',
    auth: computeAuth('sso'),
  });
  assert.match(out, /APP_SSO_ENABLED: true/);
  assert.match(out, /APP_SISENSE_TOKEN: ''/);
});

test('angular writer throws instead of silently dropping a write when a key is missing and the env block is unrecognizable', () => {
  // url present so it is replaced, but token absent AND no `export const environment = {` anchor
  const malformed = "APP_SISENSE_URL: 'x'\n";
  assert.throws(
    () => updateAngularContent(malformed, demo('angular-demo'), { url: 'U', auth: computeAuth('token', 'T') }),
    /export const environment/,
  );
});

// ---------------------------------------------------------------------------
// maskSecret
// ---------------------------------------------------------------------------

test('maskSecret shows first/last 4 for long secrets', () => {
  assert.equal(maskSecret('eyJabcdefghijklmnop'), 'eyJa…mnop');
});

test('maskSecret hides short secrets entirely and handles empty', () => {
  assert.equal(maskSecret('abcd'), '****');
  assert.equal(maskSecret(''), '');
});

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

test('parseArgs parses token mode', () => {
  const o = parseArgs(['--url', 'U', '--token', 'T']);
  assert.equal(o.mode, 'token');
  assert.equal(o.url, 'U');
  assert.equal(o.secret, 'T');
  assert.equal(o.save, true);
  assert.equal(o.dryRun, false);
});

test('parseArgs parses login mode with username and flags', () => {
  const o = parseArgs(['--url', 'U', '--login', '--username', 'me', '--dry-run', '--no-save']);
  assert.equal(o.mode, 'login');
  assert.equal(o.username, 'me');
  assert.equal(o.dryRun, true);
  assert.equal(o.save, false);
});

test('parseArgs throws when no auth mode given', () => {
  assert.throws(() => parseArgs(['--url', 'U']), /auth mode/i);
});

test('parseArgs throws when multiple auth modes given', () => {
  assert.throws(() => parseArgs(['--url', 'U', '--token', 'T', '--sso']), /mutually exclusive|one auth/i);
});

test('parseArgs help short-circuits without requiring a mode', () => {
  const o = parseArgs(['--help']);
  assert.equal(o.help, true);
});

// ---------------------------------------------------------------------------
// resolveInputs + nextMemory
// ---------------------------------------------------------------------------

test('resolveInputs falls back to stored url when --url omitted', () => {
  const r = resolveInputs({ mode: 'token', url: undefined, secret: 'T' }, { url: 'MEM' });
  assert.equal(r.url, 'MEM');
});

test('resolveInputs prefers explicit url over stored', () => {
  const r = resolveInputs({ mode: 'token', url: 'X', secret: 'T' }, { url: 'MEM' });
  assert.equal(r.url, 'X');
});

test('resolveInputs throws when url is neither passed nor stored', () => {
  assert.throws(() => resolveInputs({ mode: 'token', secret: 'T' }, {}), /url/i);
});

test('resolveInputs falls back to stored username in login mode', () => {
  const r = resolveInputs({ mode: 'login', url: 'U' }, { username: 'stored' });
  assert.equal(r.username, 'stored');
});

test('resolveInputs throws when login username missing everywhere', () => {
  assert.throws(() => resolveInputs({ mode: 'login', url: 'U' }, {}), /username/i);
});

test('nextMemory updates url but preserves username outside login mode', () => {
  assert.deepEqual(nextMemory({ username: 'old' }, { mode: 'token', url: 'U' }), {
    username: 'old',
    url: 'U',
  });
});

test('nextMemory updates both url and username in login mode', () => {
  assert.deepEqual(nextMemory({}, { mode: 'login', url: 'U', username: 'nu' }), {
    url: 'U',
    username: 'nu',
  });
});

// ---------------------------------------------------------------------------
// getConfigPath
// ---------------------------------------------------------------------------

test('getConfigPath honors XDG_CONFIG_HOME', () => {
  assert.equal(
    getConfigPath({ XDG_CONFIG_HOME: '/xdg', HOME: '/home/u' }),
    '/xdg/compose-sdk-demos/last-creds.json',
  );
});

test('getConfigPath falls back to ~/.config', () => {
  assert.equal(
    getConfigPath({ HOME: '/home/u' }),
    '/home/u/.config/compose-sdk-demos/last-creds.json',
  );
});

// ---------------------------------------------------------------------------
// readMemory / writeMemory (against a temp dir)
// ---------------------------------------------------------------------------

test('writeMemory round-trips through readMemory and is 0600', () => {
  const dir = mkdtempSync(join(tmpdir(), 'creds-mem-'));
  const path = join(dir, 'nested', 'last-creds.json');
  try {
    writeMemory(path, { url: 'U', username: 'me' });
    assert.deepEqual(readMemory(path), { url: 'U', username: 'me' });
    assert.equal(statSync(path).mode & 0o777, 0o600);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('readMemory returns {} for a missing file', () => {
  assert.deepEqual(readMemory(join(tmpdir(), 'definitely-missing-creds-xyz.json')), {});
});

test('readMemory returns {} for invalid json', () => {
  const dir = mkdtempSync(join(tmpdir(), 'creds-mem-'));
  const path = join(dir, 'bad.json');
  try {
    writeFileSync(path, 'not json{');
    assert.deepEqual(readMemory(path), {});
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
