'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');

const jsFiles = [
  'uk_engine.js',
  'sw.js',
  'qr-scanner-worker.min.js',
  'quotes.js',
  'qrgen.js'
];

for (const file of jsFiles) {
  const fullPath = path.join(root, file);
  execFileSync(process.execPath, ['-c', fullPath], { stdio: 'pipe' });
  console.log('✓ JS: ' + file);
}

const jsonFiles = [
  'manifest.json',
  'package.json',
  'uk_stages.json',
  'uk_drills.json',
  'uk_reading_presets.json'
];

for (const file of jsonFiles) {
  const fullPath = path.join(root, file);
  JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  console.log('✓ JSON: ' + file);
}

const htmlPath = path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptBlocks = [...html.matchAll(/<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi)];

if (scriptBlocks.length === 0) {
  throw new Error('No inline <script> blocks found in index.html');
}

scriptBlocks.forEach((match, idx) => {
  new vm.Script(match[1], { filename: `index.html#inline-script-${idx}` });
});
console.log(`✓ HTML inline scripts OK (${scriptBlocks.length})`);

console.log('ALL SYNTAX CHECKS PASSED.');
