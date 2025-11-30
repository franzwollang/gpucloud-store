/* eslint-disable @typescript-eslint/consistent-type-imports */
import messages from './public/locales/en-US.json';

// For next-intl v4+ type safety
declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof messages;
  }
}

// untyped JS libraries
declare module 'next-plugin-svgr';
declare module 'next-compose-plugins';
