// typing pulled from default locale file
type Messages = typeof import("./public/locales/de.json");
declare interface IntlMessages extends Messages {}

// untyped JS libraries
declare module "next-plugin-svgr";
declare module "next-compose-plugins";
