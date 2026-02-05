/**
 * Development utilities for i18n QA testing
 * Only active in __DEV__ mode
 */

/**
 * Generate pseudo-locale translations from English source.
 * Wraps strings with brackets and adds accents to make untranslated strings obvious.
 * Example: "Hello World" -> "[Ĥëľľö Ŵöŕľð]"
 */
export const generatePseudoLocale = (englishResources: Record<string, unknown>): Record<string, unknown> => {
  const pseudoify = (value: unknown): unknown => {
    if (typeof value === 'string') {
      // Add accents to vowels and wrap in brackets
      const accented = value
        .replace(/a/g, 'ä')
        .replace(/A/g, 'Ä')
        .replace(/e/g, 'ë')
        .replace(/E/g, 'Ë')
        .replace(/i/g, 'ï')
        .replace(/I/g, 'Ï')
        .replace(/o/g, 'ö')
        .replace(/O/g, 'Ö')
        .replace(/u/g, 'ü')
        .replace(/U/g, 'Ü');
      return `[${accented}]`;
    }
    if (Array.isArray(value)) {
      return value.map(pseudoify);
    }
    if (typeof value === 'object' && value !== null) {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = pseudoify(val);
      }
      return result;
    }
    return value;
  };

  return pseudoify(englishResources) as Record<string, unknown>;
};

/**
 * Set of keys that have been logged as missing (to avoid spam)
 */
const loggedMissingKeys = new Set<string>();

/**
 * Handler for missing translation keys
 * Logs warnings in development to help identify untranslated strings
 */
export const missingKeyHandler = (
  lngs: readonly string[],
  ns: string,
  key: string,
  fallbackValue: string,
  updateMissing: boolean,
  options: Record<string, unknown>
): void => {
  if (!__DEV__) return;
  
  const cacheKey = `${lngs.join(',')}:${ns}:${key}`;
  
  // Only log each missing key once per session
  if (loggedMissingKeys.has(cacheKey)) return;
  loggedMissingKeys.add(cacheKey);
  
  console.warn(
    `[i18n] Missing translation key: "${key}" in namespace "${ns}" for language(s): ${lngs.join(', ')}`
  );
};

/**
 * Clear the logged keys cache (useful for testing)
 */
export const clearMissingKeyCache = (): void => {
  loggedMissingKeys.clear();
};
