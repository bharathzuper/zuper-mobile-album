/**
 * Design tokens from Figma file "Pick-from-Job-Gallery"
 * Node: 1018:30316 — Job Detail Gallery
 * Extracted via Figma MCP (variable defs + design context).
 */
export const FIGMA = {
  fileKey: 'XSc4wJBMFIVunifOZ7Wvko',
  nodeId: '1018:30316',
};

export const T = {
  ink: { normal: '#252A31', light: '#4F5E71' },
  icon: { primary: '#252A31', secondary: '#4F5E71' },
  cloud: { dark: '#E8EDF1' },
  product: { normal: '#E44A19' },
  orange: { normal: '#E98305' },
  surface: { light2: '#F8FAFC' },
  white: '#FFFFFF',
  contentBg: '#FCFCFC',
  borderSubtle: 'rgba(0,0,0,0.1)',
  /** Album folder — empty state (lighter than content cards) */
  album: {
    emptyBg: '#F0F4F8',
    emptyBorder: '#D1DAE3',
    emptyMuted: '#B0BEC5',
  },
  /** Modals / sheets — single ink tint, not pure black */
  overlay: {
    scrim: 'rgba(37, 42, 49, 0.45)',
    scrimToast: 'rgba(37, 42, 49, 0.92)',
  },
  feedback: {
    danger: '#C62828',
  },
  /** Figma: Blue | Normal — Check box component node 570:5378 */
  blue: {
    normal: '#0172CB',
    /** Light wash on selected tiles in multi-select (above image, below chrome) */
    selectedTileOverlay: 'rgba(255, 255, 255, 0.28)',
  },
};

export const TYPE = {
  body1Medium: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: 0.2,
  },
  heading6: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  tabLabel: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '20px',
  },
  sectionDate: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.43,
    letterSpacing: 0.17,
  },
};
