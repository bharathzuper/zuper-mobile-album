/**
 * Mock data for Albums PRD (v1) — no API.
 * Photos are references into flat gallery items by id.
 */

import { A } from '../assets/figma-mcp.js';

/** Flat list of all job gallery media (matches demo grids) */
export const GALLERY_ITEMS = [
  ...[
    { src: A.g0, tag: true, video: false },
    { src: A.g1, tag: false, video: false },
    { src: A.g2, tag: true, video: true },
    { src: A.g3, tag: true, video: false },
    { src: A.g4, tag: false, video: false },
    { src: A.g5, tag: true, video: true },
    { src: A.g6, tag: false, video: false },
    { src: A.g7, tag: false, video: false },
    { src: A.g8, tag: false, video: true },
  ].map((x, i) => ({ ...x, id: `g28-${i}`, section: '28 May 2025' })),
  ...[A.g9, A.g10, A.g11, A.g12, A.g13, A.g14].map((src, i) => ({
    id: `g27-${i}`,
    src,
    tag: false,
    video: false,
    section: '27 May 2025',
  })),
];

/** Roofing default album names (PRD §2a) */
export function createInitialAlbums() {
  return [
    { id: 'album-adjuster', name: 'Adjuster', photoIds: [], shared: false },
    { id: 'album-build', name: 'Build', photoIds: ['g28-3', 'g28-4'], shared: false },
    { id: 'album-completion', name: 'Completion Photo', photoIds: ['g27-0'], shared: true },
    { id: 'album-crew', name: 'Crew', photoIds: [], shared: false },
    { id: 'album-homeowner', name: 'Homeowner', photoIds: ['g28-0', 'g28-1'], shared: false },
    { id: 'album-inspection', name: 'Inspection', photoIds: ['g28-2', 'g28-5', 'g27-2'], shared: false },
  ];
}

export function itemById(id) {
  return GALLERY_ITEMS.find((x) => x.id === id);
}

/**
 * Image URLs for album folder previews — same `src` as the main gallery (`itemById`).
 */
export function previewUrlsForAlbum(album, resolveItem = itemById) {
  const ids = album?.photoIds ?? [];
  return ids.map((id) => resolveItem(id)?.src).filter(Boolean);
}
