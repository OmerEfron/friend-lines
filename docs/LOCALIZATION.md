# Localization Guide

This document describes the internationalization (i18n) setup for the Friendlines app, including namespace organization, development workflow, QA testing, and translation management.

## Overview

Friendlines uses [i18next](https://www.i18next.com/) with React Native integration via `react-i18next`. The app supports:
- **English** (en) - Default language
- **Spanish** (es)
- **Hebrew** (he) - RTL support

## Namespace Organization

Translation keys are organized into namespaces for better maintainability:

| Namespace | Description | Example Keys |
|-----------|-------------|--------------|
| `common` | Shared UI strings | `loading`, `cancel`, `save` |
| `auth` | Login/signup screens | `login.title`, `signup.passwordTooShort` |
| `feed` | Main feed screen | `empty`, `searchPlaceholder` |
| `newsflash` | Newsflash cards | `daysAgo`, `justNow` |
| `groups` | Groups screen | `members` |
| `profile` | Profile screen | `pressCredentials`, `edit.title` |
| `friends` | Friends management | `search.placeholder`, `status.friends` |
| `saved` | Saved items | `empty`, `subtitle` |
| `nav` | Navigation titles | `screens.myProfile`, `tabs.home` |
| `a11y` | Accessibility labels | `tabs.home`, `hints.refresh` |
| `errors` | Error messages | `network`, `unauthorized` |
| `creation` | Content creation | `newsflash.title`, `group.create` |

### File Structure

```
src/i18n/
├── index.ts           # i18n configuration
├── devUtils.ts        # Dev-only utilities (pseudo-locale, missing key handler)
└── locales/
    ├── en/            # English translations
    │   ├── common.json
    │   ├── auth.json
    │   ├── feed.json
    │   └── ...
    ├── es/            # Spanish translations
    │   └── ...
    └── he/            # Hebrew translations
        └── ...
```

## Using Translations

### In Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('profile'); // Specify namespace
  
  return (
    <Text>{t('title')}</Text>           // profile:title
    <Text>{t('edit.fullName')}</Text>   // profile:edit.fullName
  );
}
```

### Cross-Namespace Access

```tsx
const { t } = useTranslation('feed');

// Access key from different namespace
<Text>{t('create', { ns: 'newsflash' })}</Text>
```

### With Interpolation

```tsx
// Translation: "{{count}} newsflashes"
t('newsflashCount', { count: 5 })  // → "5 newsflashes"
```

### Pluralization

```tsx
// JSON: { "members": "{{count}} member", "members_plural": "{{count}} members" }
t('members', { count: 1 })  // → "1 member"
t('members', { count: 5 })  // → "5 members"
```

## Accessibility

Use the `useA11y` hook for localized accessibility labels:

```tsx
import { useA11y } from '../utils/a11y';

function MyComponent() {
  const { labels, hints } = useA11y();
  
  return (
    <IconButton
      accessibilityLabel={labels.REFRESH}
      accessibilityHint={hints.REFRESH}
    />
  );
}
```

## Development Workflow

### Adding New Keys

1. Add the key to the English JSON file first:
   ```json
   // src/i18n/locales/en/common.json
   { "newKey": "New value" }
   ```

2. Add translations to other locales (or mark as TODO):
   ```json
   // src/i18n/locales/es/common.json
   { "newKey": "Nuevo valor" }
   
   // src/i18n/locales/he/common.json
   { "newKey": "ערך חדש" }
   ```

3. Use in component:
   ```tsx
   const { t } = useTranslation('common');
   <Text>{t('newKey')}</Text>
   ```

### Missing Key Detection

In development mode, missing translation keys are logged to the console:

```
[i18n] Missing translation key: "newKey" in namespace "common" for language(s): es
```

### Key Extraction (CLI)

Extract translation keys from source code:

```bash
npm run i18n:extract     # Extract keys to locale files
npm run i18n:extract:ci  # CI mode (fails on missing keys)
npm run i18n:types       # Generate TypeScript types
```

## QA Testing

### RTL Testing

1. Switch to Hebrew in the app settings
2. The app will prompt to reload for RTL layout changes
3. Verify all layouts work correctly in RTL mode

### Pseudo-Locale Testing

In development mode, a "Pseudo (QA)" language option is available that:
- Wraps all translated strings in brackets: `[Ĥëľľö]`
- Adds accent marks to vowels for easy identification
- Makes untranslated strings obvious

**Usage:**
1. Run the app in development mode
2. Go to Profile → Language
3. Select "Pseudo (QA)"
4. Any text NOT wrapped in brackets is hardcoded and needs translation

### Testing Checklist

- [ ] All user-visible text is translated
- [ ] Pluralization works correctly
- [ ] RTL layout is correct for Hebrew
- [ ] Long translations don't break layouts
- [ ] Accessibility labels are translated
- [ ] Navigation titles update on language change

## Translation Process

### For Translators

1. Clone the repository
2. Navigate to `src/i18n/locales/{language}/`
3. Edit the JSON files
4. Keys marked `TODO_{language}:` need translation
5. Submit a pull request

### Translation Keys to Avoid

- Don't translate brand names ("Friendlines")
- Don't translate technical identifiers
- Keep interpolation placeholders: `{{count}}`
- Keep pluralization suffixes: `_plural`, `_zero`, etc.

## Configuration

### Supported Languages

Defined in `src/i18n/index.ts`:

```typescript
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', isRTL: false },
  es: { name: 'Spanish', nativeName: 'Español', isRTL: false },
  he: { name: 'Hebrew', nativeName: 'עברית', isRTL: true },
};
```

### Adding a New Language

1. Add language to `SUPPORTED_LANGUAGES`
2. Create locale folder: `src/i18n/locales/{code}/`
3. Copy English JSON files as templates
4. Translate all keys
5. Update imports in `src/i18n/index.ts`
6. Add to RTL_LANGUAGES if applicable

## Best Practices

1. **Use namespaces** - Keep translations organized by feature
2. **Avoid concatenation** - Use interpolation instead of string concatenation
3. **Handle plurals** - Use i18next pluralization for count-based text
4. **Test RTL** - Regularly test Hebrew layout
5. **Use pseudo-locale** - Catch hardcoded strings early
6. **Document context** - Add comments for ambiguous keys

## Troubleshooting

### Keys Not Updating

1. Check the namespace is correct
2. Verify key exists in JSON file
3. Ensure file is imported in `src/i18n/index.ts`
4. Try reloading the app

### RTL Not Working

1. Language must be in `RTL_LANGUAGES` array
2. App needs to reload after switching to RTL language
3. Check `I18nManager.isRTL` value

### TypeScript Errors

If you see type errors with translation keys:
1. Run `npm run i18n:types` to regenerate types
2. Ensure key exists in English locale file
3. Check for typos in key name
