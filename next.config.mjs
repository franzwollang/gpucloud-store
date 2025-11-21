/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import createNextIntlPlugin from 'next-intl/plugin';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import './src/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const config = {
  serverRuntimeConfig: {
    PROJECT_ROOT: process.cwd()
  }
};

export default withNextIntl(config);
