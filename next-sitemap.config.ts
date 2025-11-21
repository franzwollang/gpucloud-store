/* eslint-disable @typescript-eslint/no-require-imports */

import type { IConfig } from "next-sitemap";
import { supportedLocales } from "./src/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_DOMAIN!;

const config = {
  siteUrl: siteUrl,
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  generateRobotsTxt: true,
  exclude: ["/server-sitemap-index.xml"], // exclude route for dynamic sitemaps
  alternateRefs: supportedLocales.map((locale: string) => ({
    href: `${siteUrl}/${locale}`,
    hreflang: locale,
  })),
  transform: async (config, path) => {
    return {
      loc: path, // exported as http(s)://<config.siteUrl>/<path>
      changefreq: config.changefreq,
      priority: config.priority as number,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  additionalPaths: async () => [],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      // {
      // 	userAgent: "white-listed-bot",
      // 	allow: ["/path-1", "/path-2"]
      // },
      // {
      // 	userAgent: "black-listed-bot",
      // 	disallow: ["/path-3", "/path-4"]
      // }
    ],
    additionalSitemaps: [
      // include routes for dynamic sitemaps here
      // e.g. "https://example.com/server-sitemap-index.xml"
    ],
  },
} as const satisfies IConfig;

export default config;
