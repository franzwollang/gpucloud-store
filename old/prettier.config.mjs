/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  // Order matters: run import sorter before tailwind class sorter
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss'
  ],
  printWidth: 80,
  trailingComma: 'none',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  useTabs: false,
  arrowParens: 'avoid',
  bracketSpacing: true,
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '^@assets/(.*)$',
    '^@/(.*)$',
    '^@public/(.*)$',
    '^[./]'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderGroupNamespaceSpecifiers: true,
  importOrderCaseInsensitive: true
};

export default config;
