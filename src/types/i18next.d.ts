/**
 * i18next type definitions.
 * Basic configuration without strict key checking to allow
 * namespace-scoped t() calls (e.g., useTranslation('feed') + t('key')).
 */

import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    // Disable strict key checking to allow namespace-scoped usage
    returnNull: false;
  }
}
