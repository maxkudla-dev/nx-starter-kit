#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const dotenv = require('dotenv');

const appRoot = path.resolve(__dirname, '..');

const loadEnvFiles = () => {
  const root = appRoot;
  const stage = process.env.STAGE || process.env.NODE_ENV || 'development';
  const envFiles = [
    '.env',
    stage !== 'test' ? '.env.local' : null,
    `.env.${stage}`,
    `.env.${stage}.local`,
  ].filter(Boolean);
  const uniqueFiles = [...new Set(envFiles)];
  const merged = {};

  for (const file of uniqueFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    Object.assign(merged, dotenv.parse(fs.readFileSync(fullPath)));
  }

  for (const [key, value] of Object.entries(merged)) {
    const currentValue = process.env[key];
    if (currentValue === undefined || currentValue === '') {
      process.env[key] = value;
    }
  }
};

loadEnvFiles();

const nodePath = [path.join(appRoot, 'node_modules'), process.env.NODE_PATH]
  .filter(Boolean)
  .join(path.delimiter);

const command =
  process.platform === 'win32' ? 'typeorm-ts-node-commonjs.cmd' : 'typeorm-ts-node-commonjs';
const result = spawnSync(
  command,
  ['-d', 'src/data-source.ts', 'migration:run', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    cwd: appRoot,
    env: {
      ...process.env,
      NODE_PATH: nodePath,
      TS_NODE_PROJECT: process.env.TS_NODE_PROJECT || path.join(appRoot, 'tsconfig.app.json'),
      TS_NODE_TRANSPILE_ONLY: process.env.TS_NODE_TRANSPILE_ONLY || '1',
    },
  },
);

process.exit(result.status ?? 1);
