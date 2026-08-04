#!/usr/bin/env node
// Update Sisense connection credentials across all example demo apps.

import { parseArgs as nodeParseArgs } from 'node:util';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  chmodSync,
  existsSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, '..');

// ---------------------------------------------------------------------------
// Demo registry — the three credential profiles, verified against demo source.
// `keys` lists the exact variable names each demo reads; an absent wat/sso key
// means that auth mode is unsupported for the demo (it is skipped with a warning).
// ---------------------------------------------------------------------------

const VITE = {
  url: 'VITE_APP_SISENSE_URL',
  token: 'VITE_APP_SISENSE_TOKEN',
  wat: 'VITE_APP_SISENSE_WAT',
  sso: 'VITE_APP_SISENSE_SSO_ENABLED',
};

const viteFull = { url: VITE.url, token: VITE.token, wat: VITE.wat, sso: VITE.sso };
const viteTokenOnly = { url: VITE.url, token: VITE.token };

export const DEMOS = [
  { name: 'react-ts-demo', format: 'env', dir: 'examples/react-ts-demo', target: '.env.local', seed: '.env.local.example', keys: viteTokenOnly },
  { name: 'vue-ts-demo', format: 'env', dir: 'examples/vue-ts-demo', target: '.env.local', seed: '.env.local.example', keys: viteFull },
  { name: 'react-fusion', format: 'env', dir: 'examples/react-fusion', target: '.env.local', seed: '.env.local.example', keys: viteFull },
  { name: 'simple-table-paginated', format: 'env', dir: 'examples/simple-table-paginated', target: '.env.local', seed: '.env.local.example', keys: viteTokenOnly },
  { name: 'simple-table-plugin', format: 'env', dir: 'examples/simple-table-plugin', target: '.env.local', seed: '.env.local.example', keys: viteFull },
  { name: 'plugins-demo/react', format: 'env', dir: 'examples/plugins-demo/react', target: '.env.local', seed: '.env.local.example', keys: viteFull },
  { name: 'plugins-demo/vue', format: 'env', dir: 'examples/plugins-demo/vue', target: '.env.local', seed: '.env.local.example', keys: viteFull },
  {
    name: 'angular-demo',
    format: 'angular',
    dir: 'examples/angular-demo',
    target: 'src/environments/environment.development.ts',
    seed: 'src/environments/environment.example.ts',
    keys: { url: 'APP_SISENSE_URL', token: 'APP_SISENSE_TOKEN', sso: 'APP_SSO_ENABLED' },
  },
  {
    name: 'plugins-demo/angular',
    format: 'angular',
    dir: 'examples/plugins-demo/angular',
    target: 'src/environments/environment.development.ts',
    seed: 'src/environments/environment.ts',
    keys: { url: 'APP_SISENSE_URL', token: 'APP_SISENSE_TOKEN' },
  },
];

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const { values } = nodeParseArgs({
    args: argv,
    strict: true,
    allowPositionals: false,
    options: {
      url: { type: 'string' },
      token: { type: 'string' },
      wat: { type: 'string' },
      sso: { type: 'boolean' },
      login: { type: 'boolean' },
      username: { type: 'string' },
      password: { type: 'string' },
      'dry-run': { type: 'boolean' },
      'no-save': { type: 'boolean' },
      help: { type: 'boolean' },
    },
  });

  if (values.help) return { help: true };

  const modes = [];
  if (values.token !== undefined) modes.push('token');
  if (values.wat !== undefined) modes.push('wat');
  if (values.sso) modes.push('sso');
  if (values.login) modes.push('login');

  if (modes.length === 0) {
    throw new Error('An auth mode is required: one of --token, --wat, --sso, --login.');
  }
  if (modes.length > 1) {
    throw new Error(`Auth modes are mutually exclusive; got ${modes.join(', ')}. Pass exactly one.`);
  }

  const mode = modes[0];
  const secret = mode === 'token' ? values.token : mode === 'wat' ? values.wat : undefined;

  return {
    help: false,
    mode,
    url: values.url,
    secret,
    username: values.username,
    password: values.password,
    dryRun: Boolean(values['dry-run']),
    save: !values['no-save'],
  };
}

// ---------------------------------------------------------------------------
// Auth resolution
// ---------------------------------------------------------------------------

export function computeAuth(mode, secret) {
  switch (mode) {
    case 'token':
    case 'login':
      return { token: secret ?? '', wat: '', sso: false };
    case 'wat':
      return { token: '', wat: secret ?? '', sso: false };
    case 'sso':
      return { token: '', wat: '', sso: true };
    default:
      throw new Error(`Unknown auth mode: ${mode}`);
  }
}

export function demoSupportsMode(demo, mode) {
  if (mode === 'token' || mode === 'login') return true;
  if (mode === 'wat') return Boolean(demo.keys.wat);
  if (mode === 'sso') return Boolean(demo.keys.sso);
  return false;
}

// ---------------------------------------------------------------------------
// Writers
// ---------------------------------------------------------------------------

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function setEnvLine(content, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^[ \\t]*#?[ \\t]*${escapeRegExp(key)}[ \\t]*=.*$`, 'm');
  if (re.test(content)) return content.replace(re, line);
  const sep = content.length && !content.endsWith('\n') ? '\n' : '';
  return `${content}${sep}${line}\n`;
}

export function updateEnvContent(content, demo, { url, auth }) {
  let out = setEnvLine(content, demo.keys.url, url);
  if (demo.keys.token) out = setEnvLine(out, demo.keys.token, auth.token);
  if (demo.keys.wat) out = setEnvLine(out, demo.keys.wat, auth.wat);
  if (demo.keys.sso) out = setEnvLine(out, demo.keys.sso, String(auth.sso));
  return out;
}

function insertAngularProp(content, prop) {
  const re = /(export const environment\s*=\s*\{\s*\n)/;
  if (re.test(content)) return content.replace(re, `$1  ${prop},\n`);
  // Fail loudly rather than silently dropping the write — a silent no-op would
  // leave a credential unset while the run still reported the demo as updated.
  throw new Error(`Could not locate "export const environment = {" to insert ${prop}`);
}

function setAngularString(content, key, value) {
  const re = new RegExp(`(\\b${escapeRegExp(key)}[ \\t]*:[ \\t]*)(['"]).*?\\2`);
  if (re.test(content)) return content.replace(re, `$1'${value}'`);
  return insertAngularProp(content, `${key}: '${value}'`);
}

function setAngularBool(content, key, value) {
  const re = new RegExp(`(\\b${escapeRegExp(key)}[ \\t]*:[ \\t]*)(true|false)`);
  if (re.test(content)) return content.replace(re, `$1${value}`);
  return insertAngularProp(content, `${key}: ${value}`);
}

export function updateAngularContent(content, demo, { url, auth }) {
  let out = setAngularString(content, demo.keys.url, url);
  if (demo.keys.token) out = setAngularString(out, demo.keys.token, auth.token);
  if (demo.keys.wat) out = setAngularString(out, demo.keys.wat, auth.wat);
  if (demo.keys.sso) out = setAngularBool(out, demo.keys.sso, auth.sso);
  return out;
}

// ---------------------------------------------------------------------------
// Misc helpers
// ---------------------------------------------------------------------------

export function maskSecret(s) {
  if (!s) return '';
  if (s.length <= 8) return '*'.repeat(s.length);
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Credential memory
// ---------------------------------------------------------------------------

export function getConfigPath(env) {
  const base = env.XDG_CONFIG_HOME || join(env.HOME || '', '.config');
  return join(base, 'compose-sdk-demos', 'last-creds.json');
}

export function readMemory(path) {
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeMemory(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
  chmodSync(path, 0o600);
}

export function resolveInputs(opts, memory) {
  const url = opts.url ?? memory.url;
  if (!url) {
    throw new Error('No Sisense URL provided and none remembered. Pass --url.');
  }
  const resolved = { ...opts, url };
  if (opts.mode === 'login') {
    const username = opts.username ?? memory.username;
    if (!username) {
      throw new Error('Login mode requires a username. Pass --username (it is then remembered).');
    }
    resolved.username = username;
  }
  return resolved;
}

export function nextMemory(old, resolved) {
  const next = { ...old, url: resolved.url };
  if (resolved.mode === 'login') next.username = resolved.username;
  return next;
}

// ---------------------------------------------------------------------------
// I/O edges (not unit-tested): password prompt, token fetch, file application
// ---------------------------------------------------------------------------

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    rl._writeToOutput = (str) => {
      if (!muted) process.stdout.write(str);
    };
    rl.question(question, (value) => {
      rl.close();
      process.stdout.write('\n');
      resolve(value);
    });
    muted = true; // question is written synchronously above; mask keystrokes hereafter
  });
}

async function resolvePassword(resolved, env) {
  if (resolved.password) return resolved.password;
  if (env.SISENSE_PASSWORD) return env.SISENSE_PASSWORD;
  return promptHidden(`Enter password for '${resolved.username}': `);
}

async function fetchToken({ url, username, password }) {
  let mod;
  try {
    mod = await import('@sisense/sdk-rest-client');
  } catch {
    throw new Error('Could not load @sisense/sdk-rest-client. Build it first (e.g. `yarn build`).');
  }
  const { getAuthenticator, HttpClient } = mod;
  const auth = getAuthenticator({ url, username, password });
  if (!auth) throw new Error('Could not create an authenticator from the given credentials.');
  const client = new HttpClient(url, auth, 'update-demo-creds');
  const ok = await client.login();
  if (!ok) throw new Error('Wrong credentials.');
  const res = await client.get('/api/v1/authentication/tokens/api');
  const token = res?.token;
  if (!token) throw new Error('Login succeeded but no API token was returned.');
  return token;
}

function applyToDemos(demos, mode, payload, { dryRun }) {
  const results = [];
  for (const demo of demos) {
    if (!demoSupportsMode(demo, mode)) {
      results.push({ name: demo.name, status: 'skipped' });
      continue;
    }
    const targetPath = join(REPO_ROOT, demo.dir, demo.target);
    const seedPath = join(REPO_ROOT, demo.dir, demo.seed);

    let content;
    const existed = existsSync(targetPath);
    if (existed) {
      content = readFileSync(targetPath, 'utf8');
    } else if (existsSync(seedPath)) {
      content = readFileSync(seedPath, 'utf8');
    } else {
      results.push({ name: demo.name, status: 'error', message: `no target or seed (${demo.seed})` });
      continue;
    }

    let updated;
    try {
      updated =
        demo.format === 'env'
          ? updateEnvContent(content, demo, payload)
          : updateAngularContent(content, demo, payload);
    } catch (err) {
      // A writer that cannot place a key surfaces as an error rather than a
      // false "updated"/"created"; other demos still process.
      results.push({ name: demo.name, status: 'error', message: err.message });
      continue;
    }

    if (!dryRun) {
      mkdirSync(dirname(targetPath), { recursive: true });
      writeFileSync(targetPath, updated);
    }
    results.push({ name: demo.name, status: existed ? 'updated' : 'created', targetPath });
  }
  return results;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const HELP = `update-demo-creds — set Sisense connection credentials in all demo apps

Usage:
  yarn update-demo-creds --url <url> --token <token>
  yarn update-demo-creds --url <url> --wat <wat>
  yarn update-demo-creds --url <url> --sso
  yarn update-demo-creds --url <url> --login --username <user> [--password <pw>]

Modes (exactly one required):
  --token <t>     Bearer API token (all demos)
  --wat <w>       Web Access Token (demos that support WAT; others skipped)
  --sso           Enable SSO (demos that support SSO; others skipped)
  --login         Log in with --username/password to fetch a token, then apply it

Options:
  --url <url>     Sisense instance URL (remembered; optional on later runs)
  --username <u>  Username for --login (remembered)
  --password <p>  Password for --login (else $SISENSE_PASSWORD, else prompt)
  --dry-run       Show planned changes; write nothing
  --no-save       Do not remember url/username
  --help          Show this help

Non-secret inputs (url, username) are remembered in
  $XDG_CONFIG_HOME/compose-sdk-demos/last-creds.json (or ~/.config/...).
Secrets are never stored.`;

function printSummary(resolved, secret, results, dryRun) {
  const prefix = dryRun ? '[dry-run] ' : '';
  const line = ['\n' + prefix + `Auth mode: ${resolved.mode}`, `URL: ${resolved.url}`];
  if (secret) line.push(`Secret: ${maskSecret(secret)}`);
  console.log(line.join('   '));
  console.log('');

  for (const r of results) {
    if (r.status === 'skipped') continue;
    console.log(`  ${r.status.padEnd(8)} ${r.name}`);
  }

  const created = results.filter((r) => r.status === 'created').length;
  const updated = results.filter((r) => r.status === 'updated').length;
  const errored = results.filter((r) => r.status === 'error');
  const skipped = results.filter((r) => r.status === 'skipped').map((r) => r.name);

  console.log('');
  console.log(`${prefix}Done: ${created + updated} ${dryRun ? 'would change' : 'updated/created'} (${created} created, ${updated} updated), ${skipped.length} skipped.`);
  if (skipped.length) {
    console.log(`Skipped (no ${resolved.mode.toUpperCase()} support): ${skipped.join(', ')}`);
  }
  for (const e of errored) {
    console.log(`  error    ${e.name}: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

export async function main(argv, env) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    console.error(`Error: ${err.message}\n`);
    console.error(HELP);
    process.exitCode = 2;
    return;
  }

  if (opts.help) {
    console.log(HELP);
    return;
  }

  const configPath = getConfigPath(env);
  const memory = readMemory(configPath);

  let resolved;
  try {
    resolved = resolveInputs(opts, memory);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exitCode = 2;
    return;
  }

  let secret = resolved.secret;
  if (resolved.mode === 'login') {
    if (opts.dryRun) {
      console.log(`[dry-run] would log in to ${resolved.url} as ${resolved.username} to fetch an API token.`);
    } else {
      try {
        const password = await resolvePassword(resolved, env);
        console.log(`Logging in to ${resolved.url} as ${resolved.username}...`);
        secret = await fetchToken({ url: resolved.url, username: resolved.username, password });
        console.log('Token retrieved.');
      } catch (err) {
        console.error(`Login failed: ${err.message}`);
        process.exitCode = 1;
        return;
      }
    }
  }

  const auth = computeAuth(resolved.mode, secret);
  const results = applyToDemos(DEMOS, resolved.mode, { url: resolved.url, auth }, { dryRun: opts.dryRun });

  printSummary(resolved, secret, results, opts.dryRun);

  if (results.some((r) => r.status === 'error')) {
    process.exitCode = 1;
  }

  if (!opts.dryRun && opts.save) {
    writeMemory(configPath, nextMemory(memory, resolved));
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main(process.argv.slice(2), process.env).catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
