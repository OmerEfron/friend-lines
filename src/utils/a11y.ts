/**
 * Accessibility utilities and constants for Friendlines app.
 * Following WCAG 2.1 guidelines and platform-specific recommendations.
 */

import { useTranslation } from 'react-i18next';

/**
 * Minimum touch target size following Material Design (48dp) and iOS HIG (44pt).
 * Using 48 as it satisfies both platforms.
 */
export const MIN_TOUCH_TARGET = 48;

/**
 * Standard hitSlop preset for icon-only buttons to ensure 48x48dp touch target.
 * Use when the visual element is smaller than MIN_TOUCH_TARGET.
 * Note: hitSlop cannot extend beyond parent bounds.
 */
export const HIT_SLOP_48 = {
  top: 12,
  right: 12,
  bottom: 12,
  left: 12,
} as const;

/**
 * Larger hitSlop for very small icons (< 24dp)
 */
export const HIT_SLOP_LARGE = {
  top: 16,
  right: 16,
  bottom: 16,
  left: 16,
} as const;

/**
 * Common accessibility labels for reusable components.
 * @deprecated Use useA11y() hook for translated labels
 */
export const A11Y_LABELS = {
  // Navigation
  TAB_HOME: 'Home feed',
  TAB_GROUPS: 'Groups',
  TAB_PROFILE: 'Profile',

  // Actions
  BOOKMARK_ADD: 'Add to bookmarks',
  BOOKMARK_REMOVE: 'Remove from bookmarks',
  REFRESH: 'Refresh',
  CLOSE: 'Close',
  REMOVE: 'Remove',
  BACK: 'Go back',

  // Auth
  SHOW_PASSWORD: 'Show password',
  HIDE_PASSWORD: 'Hide password',
  
  // Content creation
  ADD_PHOTO: 'Add photo',
  REMOVE_PHOTO: 'Remove photo',
  PUBLISH: 'Publish newsflash',
  CANCEL: 'Cancel',
} as const;

/**
 * Common accessibility hints for screen reader users.
 * @deprecated Use useA11y() hook for translated hints
 */
export const A11Y_HINTS = {
  BOOKMARK_ADD: 'Double tap to save this newsflash',
  BOOKMARK_REMOVE: 'Double tap to remove from saved items',
  REFRESH: 'Double tap to refresh the list',
  TAB_NAVIGATE: 'Double tap to navigate',
  TOGGLE_PASSWORD: 'Double tap to toggle password visibility',
  REMOVE_FRIEND: 'Double tap to remove this friend',
} as const;

/**
 * Hook for getting translated accessibility labels and hints.
 * Use this instead of the static A11Y_LABELS and A11Y_HINTS constants.
 */
export function useA11y() {
  const { t } = useTranslation('a11y');

  return {
    labels: {
      // Navigation
      TAB_HOME: t('tabs.home'),
      TAB_GROUPS: t('tabs.groups'),
      TAB_PROFILE: t('tabs.profile'),

      // Actions
      BOOKMARK_ADD: t('actions.bookmarkAdd'),
      BOOKMARK_REMOVE: t('actions.bookmarkRemove'),
      REFRESH: t('actions.refresh'),
      CLOSE: t('actions.close'),
      REMOVE: t('actions.remove'),
      BACK: t('actions.back'),

      // Auth
      SHOW_PASSWORD: t('auth.showPassword'),
      HIDE_PASSWORD: t('auth.hidePassword'),

      // Content creation
      ADD_PHOTO: t('content.addPhoto'),
      REMOVE_PHOTO: t('content.removePhoto'),
      PUBLISH: t('content.publish'),
      CANCEL: t('content.cancel'),
      CREATE_NEWSFLASH: t('content.createNewsflash'),
      CREATE_GROUP: t('content.createGroup'),
    },
    hints: {
      BOOKMARK_ADD: t('hints.bookmarkAdd'),
      BOOKMARK_REMOVE: t('hints.bookmarkRemove'),
      REFRESH: t('hints.refresh'),
      TAB_NAVIGATE: t('hints.tabNavigate'),
      TOGGLE_PASSWORD: t('hints.togglePassword'),
      REMOVE_FRIEND: t('hints.removeFriend'),
    },
  };
}

/**
 * Accessibility roles for common UI patterns.
 */
export const A11Y_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  IMAGE: 'image',
  HEADER: 'header',
  TAB: 'tab',
  CHECKBOX: 'checkbox',
  SWITCH: 'switch',
} as const;
