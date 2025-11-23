#!/usr/bin/env node
/**
 * Simple env checker for local/mobile builds.
 * Loads .env.local (if present) or .env and ensures required public variables are set.
 * Server-side secrets are intentionally not enforced here to avoid bundling them into the client.
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const cwd = process.cwd();
const envFile = fs.existsSync(path.join(cwd, ".env.local")) ? ".env.local" : ".env";

dotenv.config({ path: path.join(cwd, envFile) });

const required = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  "EXPO_PUBLIC_API_URL_PROD",
  "EXPO_PUBLIC_API_URL_DEV_IOS",
  "EXPO_PUBLIC_API_URL_DEV_ANDROID",
  "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY",
  "EXPO_PUBLIC_GOOGLE_CLIENT_ID",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required env variables in ${envFile}:`);
  missing.forEach((key) => console.error(` - ${key}`));
  process.exit(1);
}

console.log(`Env check passed using ${envFile}. All required public variables are set.`);
