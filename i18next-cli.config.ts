import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: ['en', 'es', 'he'],

  extract: {
    input: ['src/**/*.{ts,tsx,js,jsx}', 'App.js'],
    output: 'src/i18n/locales/{{language}}/{{namespace}}.json',
    ignore: ['node_modules/**', '**/*.d.ts'],

    // Translation functions to detect
    functions: ['t', '*.t', 'i18next.t'],

    // React components to analyze
    transComponents: ['Trans'],

    // Hook-like functions that return a t function
    useTranslationNames: ['useTranslation'],

    // Namespace and key configuration
    defaultNS: 'common',
    nsSeparator: ':',
    keySeparator: '.',
    contextSeparator: '_',
    pluralSeparator: '_',

    // Output formatting
    sort: true,
    indentation: 2,

    // Primary language settings
    primaryLanguage: 'en',
    secondaryLanguages: ['es', 'he'],

    // Default value for missing keys in secondary languages
    // Makes untranslated keys obvious in PRs
    defaultValue: (key, namespace, language) => {
      if (language === 'en') return key;
      return `TODO:${key}`;
    },

    // Remove keys that are no longer in source code
    removeUnusedKeys: true,
  },

  // TypeScript type generation
  types: {
    input: ['src/i18n/locales/en/*.json'],
    output: 'src/types/i18next.d.ts',
    resourcesFile: 'src/types/resources.d.ts',
    enableSelector: true,
  },
});
