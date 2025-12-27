#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { config: loadEnv } = require('dotenv');

const appRoot = path.resolve(__dirname, '..');

const loadEnvFiles = () => {
  const root = appRoot;
  if (process.env.NODE_ENV === 'local') {
    loadEnv({ path: path.join(root, '.env.local') });
  }
  loadEnv({ path: path.join(root, '.env') });
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
