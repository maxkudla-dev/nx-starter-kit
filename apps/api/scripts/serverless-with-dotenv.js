'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const projectRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const stage = resolveStage(args);

// Load base + stage env files so .env acts as a fallback for stage-specific files.
const envFiles = resolveEnvFiles(stage);
const mergedEnv = loadEnvFiles(envFiles);
applyEnv(mergedEnv);

const serverlessBin = require.resolve('serverless/bin/serverless');
const result = spawnSync(process.execPath, [serverlessBin, ...args], {
  stdio: 'inherit',
  cwd: projectRoot,
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);

function resolveStage(argv) {
  const stageValue = readFlag(argv, '--stage') || readFlag(argv, '-s');
  return stageValue || process.env.STAGE || process.env.NODE_ENV || 'development';
}

function readFlag(argv, flag) {
  const index = argv.indexOf(flag);
  if (index !== -1 && argv[index + 1]) {
    return argv[index + 1];
  }

  const prefix = `${flag}=`;
  const match = argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

function resolveEnvFiles(stageValue) {
  const files = [
    '.env',
    stageValue !== 'test' ? '.env.local' : null,
    `.env.${stageValue}`,
    `.env.${stageValue}.local`,
  ].filter(Boolean);

  return [...new Set(files)];
}

function loadEnvFiles(files) {
  const merged = {};

  for (const file of files) {
    const fullPath = path.join(projectRoot, file);
    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const parsed = dotenv.parse(fs.readFileSync(fullPath));
    Object.assign(merged, parsed);
  }

  const expanded = dotenvExpand.expand({
    parsed: merged,
    ignoreProcessEnv: true,
  }).parsed;

  return expanded || merged;
}

function applyEnv(envVars) {
  for (const [key, value] of Object.entries(envVars)) {
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
