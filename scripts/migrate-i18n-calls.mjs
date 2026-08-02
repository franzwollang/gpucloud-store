#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const enUsSource = readFileSync(join(ROOT, 'public/locales/en-US.ts'), 'utf8');
const enUsBody = enUsSource
  .replace(/^const messages = /, '')
  .replace(/ as const;\s*export default messages;\s*$/, '');
const messages = new Function(`return (${enUsBody})`)();


function resolvePath(namespace, key) {
  const parts = namespace ? `${namespace}.${key}`.split('.') : key.split('.');
  let value = messages;
  for (const part of parts) {
    if (value == null || typeof value !== 'object') return null;
    value = value[part];
  }
  return typeof value === 'string' ? value : null;
}

function escapeForTs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === 'scripts') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (/\.(tsx?)$/.test(entry)) files.push(full);
  }
  return files;
}

function extractNamespaces(source) {
  const namespaces = new Map();
  const re =
    /(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?(?:useAppTranslations|getAppTranslations)\(\s*(?:'([^']*)'|"([^"]*)")?\s*\)/g;
  let match;
  while ((match = re.exec(source))) {
    namespaces.set(match[1], match[2] ?? match[3] ?? '');
  }
  return namespaces;
}

function migrateFile(filePath) {
  if (filePath.endsWith('/src/i18n/t.ts')) return false;

  const original = readFileSync(filePath, 'utf8');
  let source = original;
  const namespaces = extractNamespaces(source);
  if (namespaces.size === 0) return false;

  for (const [varName, ns] of namespaces) {
    const rawToken = `__RAW__${varName}__`;
    source = source.replace(
      new RegExp(`\\b${varName}\\.raw\\(`, 'g'),
      rawToken
    );

    // Add missing () after type arg
    source = source.replace(
      new RegExp(
        `\\b${varName}\\((['"\`])([^'"\`]+)\\1\\)<('(?:\\\\'|[^'])*'|"(?:\\\\"|[^"])*")>(?!\\()`,
        'g'
      ),
      (full, quote, key, typeArg) => `${varName}(${quote}${key}${quote})<${typeArg}>()`
    );

    // ICU values with type arg but missing outer parens on call
    source = source.replace(
      new RegExp(
        `\\b${varName}\\((['"\`])([^'"\`]+)\\1\\)<('(?:\\\\'|[^'])*'|"(?:\\\\"|[^"])*")>\\s*(\\{[\\s\\S]*?\\})(?!\\))`,
        'g'
      ),
      (full, quote, key, typeArg, values) =>
        `${varName}(${quote}${key}${quote})<${typeArg}>(${values})`
    );

    source = source.replace(
      new RegExp(
        `\\b${varName}\\((['"\`])([^'"\`]+)\\1\\)(?!\\s*<|\\s*\\.)`,
        'g'
      ),
      (full, quote, key) => {
        if (key.includes('${')) return full;
        const text = resolvePath(ns, key);
        if (!text) return full;
        return `${varName}(${quote}${key}${quote})<'${escapeForTs(text)}'>()`;
      }
    );

    source = source.replace(
      new RegExp(
        `\\b${varName}\\((['"\`])([^'"\`]+)\\1\\s*,\\s*(\\{[\\s\\S]*?\\})\\)(?!\\s*<)`,
        'g'
      ),
      (full, quote, key, values) => {
        if (key.includes('${')) return full;
        const text = resolvePath(ns, key);
        if (!text) return full;
        return `${varName}(${quote}${key}${quote})<'${escapeForTs(text)}'>(${values})`;
      }
    );

    source = source.replace(new RegExp(rawToken, 'g'), `${varName}.raw(`);
  }

  if (source !== original) {
    writeFileSync(filePath, source);
    return true;
  }
  return false;
}

const files = walk(join(ROOT, 'src'));
let changed = 0;
for (const file of files) {
  if (migrateFile(file)) {
    changed++;
    console.log(relative(ROOT, file));
  }
}
console.log(`Updated ${changed} files.`);
