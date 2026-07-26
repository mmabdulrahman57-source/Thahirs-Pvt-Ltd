const { cpSync, rmSync } = require('fs');
const { join } = require('path');

const root = join(__dirname, '..');
const source = join(root, 'frontend', 'dist');
const target = join(root, 'dist');

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log('Copied frontend/dist to dist/');
