/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { MessagesShape } from './src/i18n/appMessages';

// Key structure from default lang; leaf values are `string` so any locale
// that `satisfies MessagesShape` is assignable here.
declare module 'next-intl' {
  interface AppConfig {
    Messages: MessagesShape;
  }
}

// untyped JS libraries
declare module 'next-plugin-svgr';
declare module 'next-compose-plugins';
