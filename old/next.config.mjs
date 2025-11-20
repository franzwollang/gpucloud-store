import withPlugins from 'next-compose-plugins';
import createNextIntlPlugin from 'next-intl/plugin';
import withSVGR from 'next-plugin-svgr';

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.mjs');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    }
  }
};

export default withPlugins(
  [
    withNextIntl,
    [
      withSVGR,
      {
        svgrOptions: {
          titleProp: true,
          icon: true,
          svgProps: {
            fill: 'currentColor',
            stroke: 'currentColor',
            height: 'auto',
            width: 'auto'
          }
        }
      }
    ]
  ],
  nextConfig
);
