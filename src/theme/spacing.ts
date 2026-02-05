/**
 * Spacing tokens following an 8-point grid system.
 * Use these constants for all spacing values to maintain visual consistency.
 */

// Base unit for the 8pt grid
const BASE = 8;

/**
 * Spacing scale based on 8pt grid system
 * Each step is a multiple of 8 for visual harmony
 */
export const SPACING = {
  /** 0px - No spacing */
  NONE: 0,
  /** 4px - Extra small (half unit for fine adjustments) */
  XS: BASE / 2,
  /** 8px - Small */
  SM: BASE,
  /** 16px - Medium (default) */
  MD: BASE * 2,
  /** 24px - Large */
  LG: BASE * 3,
  /** 32px - Extra large */
  XL: BASE * 4,
  /** 40px - 2X large */
  XXL: BASE * 5,
  /** 48px - 3X large */
  XXXL: BASE * 6,
  /** 64px - 4X large */
  HUGE: BASE * 8,
  /** 80px - 5X large */
  MASSIVE: BASE * 10,
  /** 96px - 6X large */
  GIANT: BASE * 12,
  /** 112px - For floating tab bar clearance */
  TAB_BAR_CLEARANCE: BASE * 14,
} as const;

/**
 * Floating tab bar specific dimensions following 8pt grid
 */
export const TAB_BAR = {
  /** Tab bar height (64px = 8 * 8) */
  HEIGHT: BASE * 8,
  /** Bottom offset from screen edge (24px = 8 * 3) */
  BOTTOM: BASE * 3,
  /** Horizontal margin from screen edges (16px = 8 * 2) */
  HORIZONTAL_MARGIN: BASE * 2,
  /** Border radius (24px = 8 * 3) */
  RADIUS: BASE * 3,
} as const;

/**
 * FAB (Floating Action Button) positioning following 8pt grid
 */
export const FAB = {
  /** Right margin from screen edge (16px = 8 * 2) */
  RIGHT: BASE * 2,
  /** Bottom offset to sit above floating tab bar (104px = 8 * 13) */
  BOTTOM: TAB_BAR.BOTTOM + TAB_BAR.HEIGHT + BASE * 2,
} as const;

/**
 * List content padding to clear the floating tab bar
 */
export const LIST = {
  /** Standard vertical padding (8px = 8 * 1) */
  VERTICAL_PADDING: BASE,
  /** Bottom padding to clear floating tab bar (112px = 8 * 14) */
  BOTTOM_CLEARANCE: SPACING.TAB_BAR_CLEARANCE,
  /** Standard horizontal padding (8px = 8 * 1) */
  HORIZONTAL_PADDING: BASE,
} as const;
