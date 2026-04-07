import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { A } from './assets/figma-mcp.js';
import { T, TYPE } from './tokens/figma.js';
import { GALLERY_ITEMS, createInitialAlbums, itemById } from './data/albumsMock.js';
import { AlbumFolderGrid } from './components/AlbumFolderGrid.jsx';
import { EmptyAlbumDetailLottie } from './components/EmptyAlbumDetailLottie.jsx';

function albumHasPhotos(albumId, albums) {
  const st = albums.find((a) => a.id === albumId);
  return !!st && st.photoIds.length > 0;
}

/** Album detail: Large 3 / Medium 4 / Small 6 thumbnails per row (when enough photos). */
const ALBUM_GRID_DENSITY = {
  large: { label: 'Large', colsPerRow: 3 },
  medium: { label: 'Medium', colsPerRow: 4 },
  small: { label: 'Small', colsPerRow: 6 },
};

/**
 * Never use more columns than photos (avoids empty trailing cells). Single photo stays one column, centered.
 */
function albumDetailEffectiveColumns(photoCount, colsPerRow) {
  if (photoCount <= 1) return 1;
  return Math.min(colsPerRow, photoCount);
}

/** Square grid icon: dim×dim cells (2 = 2×2 … 4 = 4×4) for density menu. */
function IconGridDensity({ dim, size = 18 }) {
  const vb = 24;
  const gap = 2;
  const cell = (vb - gap * (dim - 1)) / dim;
  const cells = [];
  for (let r = 0; r < dim; r += 1) {
    for (let c = 0; c < dim; c += 1) {
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={c * (cell + gap)}
          y={r * (cell + gap)}
          width={cell}
          height={cell}
          rx={1.2}
          fill="currentColor"
        />
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} aria-hidden style={{ display: 'block', color: 'inherit' }}>
      {cells}
    </svg>
  );
}

/** Share sheet and copy-link both need at least one photo */
const EMPTY_ALBUM_ACTIONS_MSG = 'Add photos before you can share an album or copy a link.';

/** Figma frame width (Job Detail Gallery — iOS) */
const W = 390;
const H = 844;
const BEZEL = 12;
const OUTER_W = W + BEZEL * 2;
const OUTER_H = H + BEZEL * 2;

const TABS = [
  { id: 'status', label: 'Status' },
  { id: 'gallery', label: 'Gallery', active: true },
  { id: 'notes', label: 'Notes (3)' },
  { id: 'messages', label: 'Messages (4)' },
  { id: 'activity', label: 'Activity' },
];

const FILTERS = [
  { label: 'Media type', wide: true },
  { label: 'Tags', wide: false },
  { label: 'Date', wide: false },
];

const ZUPER_CONNECT = true;

/** ~iOS Photos: long-press enters selection with this tile; tap toggles when already selecting */
const LONG_PRESS_MS = 450;

function GalleryTile({ src, tag, video, selected, selectionMode, onSelectInMode, onLongPressEnter }) {
  const longTimerRef = useRef(null);

  const clearLongPress = useCallback(() => {
    if (longTimerRef.current != null) {
      clearTimeout(longTimerRef.current);
      longTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearLongPress(), [clearLongPress]);

  const handlePointerDown = () => {
    if (selectionMode) {
      onSelectInMode?.();
      return;
    }
    if (!onLongPressEnter) return;
    clearLongPress();
    longTimerRef.current = window.setTimeout(() => {
      longTimerRef.current = null;
      onLongPressEnter();
    }, LONG_PRESS_MS);
  };

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={clearLongPress}
      onPointerCancel={clearLongPress}
      onPointerLeave={clearLongPress}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid ${T.borderSubtle}`,
        boxSizing: 'border-box',
        padding: 0,
        cursor: selectionMode ? 'pointer' : 'default',
        background: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
      }}
      data-name="Gallery image"
    >
      <img alt="" src={src} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
      {selectionMode && selected ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 8,
            backgroundColor: T.blue.selectedTileOverlay,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      ) : null}
      {tag ? (
        <div style={{ position: 'absolute', left: 6, top: 6, width: 20, height: 20, pointerEvents: 'none', zIndex: 2 }}>
          <img alt="" src={A.frameTag} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
      ) : null}
      {video ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 24,
            height: 24,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <img alt="" src={A.playerPlay} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
      ) : null}
      {selectionMode ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 3,
            width: 16,
            height: 16,
            borderRadius: 4,
            border: selected ? 'none' : `2px solid ${T.white}`,
            boxSizing: 'border-box',
            backgroundColor: selected ? T.blue.normal : 'rgba(37, 42, 49, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            boxShadow: selected ? 'none' : '0 1px 2px rgba(37, 42, 49, 0.25)',
          }}
        >
          {selected ? (
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M20 6L9 17l-5-5"
                stroke={T.white}
                strokeWidth={2.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </div>
      ) : null}
    </button>
  );
}

export function JobGalleryScreen() {
  const tabScrollRef = useRef(null);
  const [segment, setSegment] = useState('all');
  const [albums, setAlbums] = useState(() => createInitialAlbums());
  const [albumDetailId, setAlbumDetailId] = useState(null);
  const [shareAlbumId, setShareAlbumId] = useState(null);
  const [manageAlbumId, setManageAlbumId] = useState(null);
  const [albumMenuId, setAlbumMenuId] = useState(null);
  const [albumDetailTitleMenuOpen, setAlbumDetailTitleMenuOpen] = useState(false);
  const [albumGridMenuOpen, setAlbumGridMenuOpen] = useState(false);
  const [albumGridDensity, setAlbumGridDensity] = useState('medium');
  const titleBarAlbumActionsRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [toast, setToast] = useState(null);
  const [role, setRole] = useState('field');
  /** Device-uploaded images (blob URLs) merged into gallery + albums */
  const [extraGalleryItems, setExtraGalleryItems] = useState([]);
  const [jobGalleryPickerOpen, setJobGalleryPickerOpen] = useState(false);
  const [jobGalleryPickerAlbumId, setJobGalleryPickerAlbumId] = useState(null);
  const [jobGalleryPickerSelected, setJobGalleryPickerSelected] = useState(() => new Set());
  const deviceFileInputRef = useRef(null);
  const pendingAlbumForDeviceRef = useRef(null);
  const extraGalleryForCleanupRef = useRef([]);

  const isAdmin = role === 'admin';

  const resolveGalleryItem = useCallback(
    (id) => extraGalleryItems.find((x) => x.id === id) ?? itemById(id),
    [extraGalleryItems]
  );

  const groupedAllPhotos = useMemo(() => {
    const m = new Map();
    const all = [...GALLERY_ITEMS, ...extraGalleryItems];
    for (const item of all) {
      if (!m.has(item.section)) m.set(item.section, []);
      m.get(item.section).push(item);
    }
    return m;
  }, [extraGalleryItems]);

  const activeAlbum = albumDetailId ? albums.find((a) => a.id === albumDetailId) : null;

  useEffect(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollLeft = 24;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const ms = toast.length > 48 ? 3400 : 2200;
    const t = setTimeout(() => setToast(null), ms);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    pendingAlbumForDeviceRef.current = null;
    if (!albumDetailId) {
      setJobGalleryPickerOpen(false);
      setJobGalleryPickerAlbumId(null);
      setJobGalleryPickerSelected(new Set());
    }
  }, [albumDetailId]);

  useEffect(() => {
    if (!jobGalleryPickerOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setJobGalleryPickerOpen(false);
        setJobGalleryPickerAlbumId(null);
        setJobGalleryPickerSelected(new Set());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jobGalleryPickerOpen]);

  const showToast = useCallback((message) => setToast(message), []);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Long-press on a tile: enter selection mode with that photo selected (iOS-style). */
  const enterSelectionWith = useCallback((id) => {
    setSelecting(true);
    setSelectedIds(new Set([id]));
  }, []);

  const exitSelection = useCallback(() => {
    setSelecting(false);
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    extraGalleryForCleanupRef.current = extraGalleryItems;
  }, [extraGalleryItems]);

  useEffect(() => {
    return () => {
      extraGalleryForCleanupRef.current.forEach((item) => {
        if (String(item.id).startsWith('device-')) URL.revokeObjectURL(item.src);
      });
    };
  }, []);

  const startJobGalleryPick = useCallback(() => {
    if (!albumDetailId) return;
    setJobGalleryPickerAlbumId(albumDetailId);
    setJobGalleryPickerSelected(new Set());
    setJobGalleryPickerOpen(true);
  }, [albumDetailId]);

  const startDevicePick = useCallback(() => {
    if (!albumDetailId) return;
    pendingAlbumForDeviceRef.current = albumDetailId;
    window.setTimeout(() => deviceFileInputRef.current?.click(), 0);
  }, [albumDetailId]);

  const toggleJobGalleryPick = useCallback((id) => {
    setJobGalleryPickerSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const confirmJobGalleryToAlbum = useCallback(() => {
    const albumId = jobGalleryPickerAlbumId;
    if (!albumId) return;
    const ids = [...jobGalleryPickerSelected];
    if (ids.length === 0) return;
    const target = albums.find((a) => a.id === albumId);
    const existing = new Set(target?.photoIds ?? []);
    let added = 0;
    for (const pid of ids) {
      if (!existing.has(pid)) added += 1;
    }
    if (added === 0) {
      showToast('Those photos are already in this album.');
      return;
    }
    setAlbums((prev) =>
      prev.map((a) => {
        if (a.id !== albumId) return a;
        const set = new Set(a.photoIds);
        for (const pid of ids) {
          if (!set.has(pid)) set.add(pid);
        }
        return { ...a, photoIds: [...set] };
      })
    );
    showToast(`Added ${added} photo${added === 1 ? '' : 's'}.`);
    setJobGalleryPickerOpen(false);
    setJobGalleryPickerAlbumId(null);
    setJobGalleryPickerSelected(new Set());
  }, [jobGalleryPickerAlbumId, jobGalleryPickerSelected, albums, showToast]);

  const handleDeviceFiles = useCallback(
    (e) => {
      const albumId = pendingAlbumForDeviceRef.current;
      const files = e.target.files;
      e.target.value = '';
      pendingAlbumForDeviceRef.current = null;
      if (!albumId || !files?.length) return;
      const newItems = [];
      const newIds = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const id = `device-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`;
        const src = URL.createObjectURL(file);
        newItems.push({ id, src, tag: false, video: false, section: 'From device' });
        newIds.push(id);
      }
      if (newIds.length === 0) {
        showToast('No images selected.');
        return;
      }
      setExtraGalleryItems((prev) => [...prev, ...newItems]);
      setAlbums((prev) =>
        prev.map((a) => {
          if (a.id !== albumId) return a;
          const set = new Set(a.photoIds);
          for (const id of newIds) {
            set.add(id);
          }
          return { ...a, photoIds: [...set] };
        })
      );
      showToast(`Added ${newIds.length} photo${newIds.length === 1 ? '' : 's'} from device.`);
    },
    [showToast]
  );

  /** No Select control — leaving selection when the last photo is deselected avoids a dead end. */
  useEffect(() => {
    if (selecting && selectedIds.size === 0) setSelecting(false);
  }, [selecting, selectedIds]);

  const addToAlbum = useCallback(
    (albumId) => {
      const ids = [...selectedIds];
      if (ids.length === 0) return;
      const target = albums.find((a) => a.id === albumId);
      const existing = new Set(target?.photoIds ?? []);
      let added = 0;
      for (const pid of ids) {
        if (!existing.has(pid)) added += 1;
      }
      if (added === 0) showToast('All selected photos are already in this album.');
      else showToast(`Added ${added} photo${added === 1 ? '' : 's'} to album.`);
      setAlbums((prev) =>
        prev.map((a) => {
          if (a.id !== albumId) return a;
          const set = new Set(a.photoIds);
          for (const pid of ids) {
            if (!set.has(pid)) set.add(pid);
          }
          return { ...a, photoIds: [...set] };
        })
      );
      setPickerOpen(false);
      exitSelection();
    },
    [selectedIds, albums, showToast, exitSelection]
  );

  const copyAlbumLink = useCallback(
    async (albumId) => {
      const al = albums.find((a) => a.id === albumId);
      if (!al || !albumHasPhotos(albumId, albums)) {
        showToast(EMPTY_ALBUM_ACTIONS_MSG);
        return;
      }
      const url = `https://zuper.app/share/album/${albumId}?token=demo`;
      const write = navigator.clipboard?.writeText?.bind(navigator.clipboard);
      if (typeof write !== 'function') {
        showToast("Couldn't copy — try Share album or allow clipboard access.");
        setAlbumMenuId(null);
        return;
      }
      try {
        await write(url);
        showToast('Link copied');
        setAlbumMenuId(null);
      } catch {
        showToast("Couldn't copy — try Share album or allow clipboard access.");
        setAlbumMenuId(null);
      }
    },
    [albums, showToast, setAlbumMenuId]
  );

  const handleTitleShare = useCallback(() => {
    if (!albumDetailId) return;
    if (!albumHasPhotos(albumDetailId, albums)) {
      showToast(EMPTY_ALBUM_ACTIONS_MSG);
      setAlbumDetailTitleMenuOpen(false);
      return;
    }
    setShareAlbumId(albumDetailId);
    setAlbumDetailTitleMenuOpen(false);
  }, [albumDetailId, albums, showToast]);

  const handleTitleCopyLink = useCallback(async () => {
    if (!albumDetailId) return;
    await copyAlbumLink(albumDetailId);
    setAlbumDetailTitleMenuOpen(false);
  }, [albumDetailId, copyAlbumLink]);

  const handleTitleManageShares = useCallback(() => {
    if (!albumDetailId) return;
    setManageAlbumId(albumDetailId);
    setAlbumDetailTitleMenuOpen(false);
  }, [albumDetailId]);

  const handleTitleBack = () => {
    if (shareAlbumId) {
      setShareAlbumId(null);
      return;
    }
    if (jobGalleryPickerOpen) {
      setJobGalleryPickerOpen(false);
      setJobGalleryPickerAlbumId(null);
      setJobGalleryPickerSelected(new Set());
      return;
    }
    if (albumDetailId) {
      setAlbumDetailId(null);
      return;
    }
  };

  const font = TYPE.tabLabel.fontFamily;
  const titleCenter =
    shareAlbumId != null
      ? 'Share Album'
      : albumDetailId && activeAlbum
        ? activeAlbum.name
        : '\u00A0';

  const inAlbumFlow = albumDetailId != null || shareAlbumId != null;

  /** Album detail with at least one photo: show ⋮ with Share / Copy link / Manage (admin). Hidden on All Photos home, Share sheet, or empty album. */
  const showTitleBarMore =
    shareAlbumId == null &&
    albumDetailId != null &&
    activeAlbum != null &&
    activeAlbum.photoIds.length > 0;

  useEffect(() => {
    setAlbumDetailTitleMenuOpen(false);
    setAlbumGridMenuOpen(false);
  }, [albumDetailId]);

  useEffect(() => {
    setAlbumDetailTitleMenuOpen(false);
    setAlbumGridMenuOpen(false);
  }, [shareAlbumId]);

  useEffect(() => {
    if (!showTitleBarMore) {
      setAlbumDetailTitleMenuOpen(false);
      setAlbumGridMenuOpen(false);
    }
  }, [showTitleBarMore]);

  useEffect(() => {
    if (!albumDetailTitleMenuOpen && !albumGridMenuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setAlbumDetailTitleMenuOpen(false);
        setAlbumGridMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [albumDetailTitleMenuOpen, albumGridMenuOpen]);

  useEffect(() => {
    if (!albumDetailTitleMenuOpen && !albumGridMenuOpen) return undefined;
    const onDown = (e) => {
      if (titleBarAlbumActionsRef.current && !titleBarAlbumActionsRef.current.contains(e.target)) {
        setAlbumDetailTitleMenuOpen(false);
        setAlbumGridMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [albumDetailTitleMenuOpen, albumGridMenuOpen]);

  return (
    <>
      <style>{`
        .zuper-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .zuper-hide-scrollbar::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .zuper-figma button:focus-visible {
          outline: 2px solid ${T.product.normal};
          outline-offset: 2px;
        }
        .zuper-device-frame {
          box-sizing: border-box;
          padding: ${BEZEL}px;
          width: min(
            ${OUTER_W}px,
            calc(100vw - 24px),
            calc((100vh - 40px) * ${OUTER_W} / ${OUTER_H})
          );
          aspect-ratio: ${OUTER_W} / ${OUTER_H};
          max-height: min(${OUTER_H}px, calc(100vh - 40px));
        }
        .zuper-segment {
          border: none;
          outline: none;
          box-shadow: none;
        }
        .zuper-segment-pill {
          margin: 0;
          border: 0 !important;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          transition: background-color 0.22s cubic-bezier(0.33, 1, 0.68, 1),
            box-shadow 0.22s cubic-bezier(0.33, 1, 0.68, 1),
            color 0.22s cubic-bezier(0.33, 1, 0.68, 1);
        }
        .zuper-segment-pill::-moz-focus-inner {
          border: 0;
          padding: 0;
        }
        .zuper-segment-pill:focus-visible {
          outline: 2px solid ${T.product.normal};
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .zuper-segment-pill { transition: none; }
        }
        .zuper-empty-album {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          width: 100%;
          max-width: 320px;
          margin: 0;
          padding: 0 12px;
          box-sizing: border-box;
        }
        .zuper-empty-album-hint {
          font-family: ${font};
          font-size: 14px;
          font-weight: 500;
          color: ${T.ink.light};
          text-align: center;
          margin: 0;
          max-width: 280px;
          line-height: 1.45;
          letter-spacing: 0.15px;
        }
        .zuper-album-title-menu {
          position: absolute;
          top: 100%;
          right: 0;
          z-index: 30;
          margin-top: 4px;
          background: ${T.white};
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(37, 42, 49, 0.12);
          border: 1px solid ${T.cloud.dark};
          min-width: 176px;
          overflow: hidden;
        }
        .zuper-album-title-menu-item {
          display: flex;
          align-items: center;
          width: 100%;
          min-height: 44px;
          text-align: left;
          padding: 10px 14px;
          box-sizing: border-box;
          border: none;
          background: ${T.white};
          font-size: 15px;
          font-weight: 500;
          color: ${T.ink.normal};
          cursor: pointer;
          font-family: ${font};
          transition: background-color 0.15s cubic-bezier(0.33, 1, 0.68, 1);
        }
        .zuper-album-title-menu-item:hover {
          background: ${T.surface.light2} !important;
        }
        .zuper-album-title-menu-item:focus-visible {
          outline: 2px solid ${T.product.normal};
          outline-offset: -2px;
        }
        .zuper-album-detail-toolbar {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
          min-height: 44px;
        }
        .zuper-album-detail-grid {
          display: grid;
          gap: 12px;
          width: 100%;
        }
        .zuper-grid-density-menu {
          position: absolute;
          top: 100%;
          right: 0;
          z-index: 31;
          margin-top: 4px;
          background: ${T.white};
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(37, 42, 49, 0.12);
          border: 1px solid ${T.cloud.dark};
          min-width: 232px;
          overflow: hidden;
        }
        .zuper-grid-density-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          width: 100%;
          min-height: 44px;
          padding: 0 12px;
          gap: 0;
          border: none;
          border-bottom: 1px solid ${T.cloud.dark};
          background: ${T.white};
          font-size: 15px;
          font-weight: 500;
          color: ${T.ink.normal};
          cursor: pointer;
          font-family: ${font};
          transition: background-color 0.15s cubic-bezier(0.33, 1, 0.68, 1);
          box-sizing: border-box;
        }
        .zuper-grid-density-row:last-child {
          border-bottom: none;
        }
        .zuper-grid-density-row:hover {
          background: ${T.surface.light2};
        }
        .zuper-grid-density-row:focus-visible {
          outline: 2px solid ${T.product.normal};
          outline-offset: -2px;
        }
        .zuper-grid-density-check {
          width: 22px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${T.product.normal};
          font-size: 14px;
          font-weight: 600;
        }
        .zuper-grid-density-label {
          flex: 1 1 auto;
          text-align: left;
          padding-right: 8px;
        }
        .zuper-grid-density-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${T.ink.normal};
          opacity: 0.92;
        }
      `}</style>

      <div
        className="zuper-figma"
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, #e8e8ec 0%, #c8c8ce 45%, #b0b0b8 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '32px 20px',
          fontFamily: font,
        }}
      >
        <div
          className="zuper-device-frame"
          style={{
            borderRadius: 44,
            background: 'linear-gradient(152deg, #3d3d42 0%, #252528 42%, #1a1a1c 100%)',
            boxShadow:
              '0 32px 64px -16px rgba(0,0,0,0.55), 0 12px 24px -8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 56,
              height: 5,
              borderRadius: 3,
              backgroundColor: 'rgba(37, 42, 49, 0.45)',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
          <div
            data-name="Job Detail Gallery"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 32,
              overflow: 'hidden',
              backgroundColor: T.white,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            {/* NavigationBar iOS */}
            <div style={{ flexShrink: 0, width: '100%', backgroundColor: T.white }}>
              <div style={{ height: 44, position: 'relative', width: '100%' }} data-name="Status Bar">
                <p
                  style={{
                    position: 'absolute',
                    left: 48,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    margin: 0,
                    width: 54,
                    fontFamily: font,
                    fontSize: 15,
                    fontWeight: 600,
                    color: T.ink.normal,
                    textAlign: 'center',
                    letterSpacing: -0.3,
                  }}
                >
                  9:41
                </p>
                <div style={{ position: 'absolute', right: 64, top: '50%', transform: 'translateY(-50%)', width: 17, height: 10.67 }}>
                  <img alt="" src={A.cellular} style={{ width: '100%', height: '100%', display: 'block' }} />
                </div>
                <div style={{ position: 'absolute', right: 43.67, top: '50%', transform: 'translateY(-50%)', width: 15.33, height: 11 }}>
                  <img alt="" src={A.wifi} style={{ width: '100%', height: '100%', display: 'block' }} />
                </div>
                <div style={{ position: 'absolute', right: 16.67, top: '50%', transform: 'translateY(-50%)' }}>
                  <div
                    style={{
                      border: `1px solid ${T.ink.normal}`,
                      opacity: 0.35,
                      borderRadius: 2.67,
                      width: 22,
                      height: 11.33,
                      boxSizing: 'border-box',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 2,
                      top: 2,
                      width: 18,
                      height: 7.33,
                      backgroundColor: T.ink.normal,
                      borderRadius: 1.33,
                    }}
                  />
                </div>
              </div>

              <div style={{ width: '100%' }} data-name="Title Bar">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingTop: 10,
                    paddingBottom: 9,
                  }}
                >
                  <button
                    type="button"
                    aria-label={inAlbumFlow ? 'Back' : 'Back'}
                    onClick={inAlbumFlow ? handleTitleBack : undefined}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 0,
                      border: 'none',
                      background: 'none',
                      cursor: inAlbumFlow ? 'pointer' : 'default',
                      padding: 0,
                      minHeight: 44,
                      opacity: inAlbumFlow ? 1 : 1,
                    }}
                  >
                    <div style={{ width: 24, height: 24, flexShrink: 0 }}>
                      <img alt="" src={A.chevronLeft} style={{ width: '100%', height: '100%', display: 'block' }} />
                    </div>
                    <span style={{ ...TYPE.body1Medium, color: T.ink.normal }}>{inAlbumFlow ? 'Back' : 'Back'}</span>
                  </button>
                  <p
                    style={{
                      ...TYPE.heading6,
                      flex: '1 1 0',
                      margin: 0,
                      textAlign: 'center',
                      color: T.ink.normal,
                      minWidth: 0,
                      fontSize: shareAlbumId ? 16 : 18,
                    }}
                  >
                    {titleCenter}
                  </p>
                  <div
                    ref={titleBarAlbumActionsRef}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      flexShrink: 0,
                      visibility: showTitleBarMore ? 'visible' : 'hidden',
                      pointerEvents: showTitleBarMore ? 'auto' : 'none',
                    }}
                  >
                    <div style={{ position: 'relative', width: 44, flexShrink: 0 }}>
                      <button
                        type="button"
                        aria-label="Photo grid size"
                        aria-haspopup="menu"
                        aria-expanded={albumGridMenuOpen}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlbumDetailTitleMenuOpen(false);
                          setAlbumGridMenuOpen((o) => !o);
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          padding: 8,
                          width: 44,
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: T.ink.normal,
                        }}
                      >
                        <IconGridDensity dim={3} size={22} />
                      </button>
                      {albumGridMenuOpen && showTitleBarMore ? (
                        <div className="zuper-grid-density-menu" role="menu" aria-label="Grid size">
                          {['large', 'medium', 'small'].map((key) => (
                            <button
                              key={key}
                              type="button"
                              role="menuitemradio"
                              aria-checked={albumGridDensity === key}
                              className="zuper-grid-density-row"
                              onClick={() => {
                                setAlbumGridDensity(key);
                                setAlbumGridMenuOpen(false);
                              }}
                            >
                              <span className="zuper-grid-density-check" aria-hidden>
                                {albumGridDensity === key ? '✓' : '\u00A0'}
                              </span>
                              <span className="zuper-grid-density-label">{ALBUM_GRID_DENSITY[key].label}</span>
                              <span className="zuper-grid-density-icon" aria-hidden>
                                <IconGridDensity
                                  dim={key === 'large' ? 2 : key === 'medium' ? 3 : 4}
                                  size={20}
                                />
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div style={{ position: 'relative', width: 44, flexShrink: 0 }}>
                      <button
                        type="button"
                        aria-label="Album actions"
                        aria-haspopup="menu"
                        aria-expanded={albumDetailTitleMenuOpen}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlbumGridMenuOpen(false);
                          setAlbumDetailTitleMenuOpen((o) => !o);
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          padding: 8,
                          width: 44,
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img alt="" src={A.dotsVertical} width={24} height={24} />
                      </button>
                      {albumDetailTitleMenuOpen && showTitleBarMore ? (
                        <div className="zuper-album-title-menu" role="menu" aria-label="Album actions">
                          <button
                            type="button"
                            role="menuitem"
                            className="zuper-album-title-menu-item"
                            onClick={handleTitleShare}
                          >
                            Share album
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="zuper-album-title-menu-item"
                            onClick={handleTitleCopyLink}
                          >
                            Copy link
                          </button>
                          {isAdmin ? (
                            <button
                              type="button"
                              role="menuitem"
                              className="zuper-album-title-menu-item"
                              onClick={handleTitleManageShares}
                            >
                              Manage Shares
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div style={{ height: 1, width: '100%', backgroundColor: T.cloud.dark }} />
              </div>
            </div>

            {/* Share Album — full screen (PRD §11) */}
            {shareAlbumId ? (
              <ShareAlbumBody
                albumName={albums.find((a) => a.id === shareAlbumId)?.name ?? 'Album'}
                zuperConnect={ZUPER_CONNECT}
                onSubmit={() => {
                  showToast('Album shared.');
                  setShareAlbumId(null);
                }}
              />
            ) : null}

            {!shareAlbumId ? (
              <div
                className="zuper-hide-scrollbar"
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: T.contentBg,
                }}
              >
                <div
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    backgroundColor: T.contentBg,
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 12,
                  }}
                >
                  {!albumDetailId && !shareAlbumId ? (
                  <div
                    ref={tabScrollRef}
                    className="zuper-hide-scrollbar"
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'stretch',
                      overflowX: 'auto',
                      marginLeft: -16,
                      marginRight: -16,
                      paddingLeft: 16,
                      paddingRight: 16,
                      width: `calc(100% + 32px)`,
                      marginBottom: 8,
                    }}
                  >
                    {TABS.map((t) => {
                      const active = !!t.active;
                      const padX = t.id === 'gallery' ? 16 : 10;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          style={{
                            position: 'relative',
                            flexShrink: 0,
                            border: 'none',
                            background: T.contentBg,
                            cursor: 'pointer',
                            paddingLeft: padX,
                            paddingRight: padX,
                            paddingTop: 8,
                            paddingBottom: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: active ? 10 : 0,
                          }}
                        >
                          <span style={{ ...TYPE.tabLabel, color: active ? T.ink.normal : T.ink.light, whiteSpace: 'nowrap' }}>{t.label}</span>
                          {active ? (
                            <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', width: 56, height: 4 }}>
                              <img alt="" src={A.tabUnderline} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'fill' }} />
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  ) : null}

                  {/* All Photos | Albums — segmented control */}
                  {!albumDetailId ? (
                    <div
                      className="zuper-segment"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        backgroundColor: T.cloud.dark,
                        borderRadius: 10,
                        padding: 4,
                        gap: 4,
                        marginBottom: 12,
                        border: 'none',
                        outline: 'none',
                      }}
                    >
                      <button
                        type="button"
                        className="zuper-segment-pill"
                        onClick={() => {
                          setSegment('all');
                          exitSelection();
                        }}
                        style={{
                          flex: 1,
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontFamily: font,
                          fontSize: 14,
                          fontWeight: segment === 'all' ? 600 : 500,
                          color: segment === 'all' ? T.ink.normal : T.ink.light,
                          backgroundColor: segment === 'all' ? T.white : 'transparent',
                          cursor: 'pointer',
                          boxShadow: segment === 'all' ? '0 1px 3px rgba(37, 42, 49, 0.08)' : 'none',
                        }}
                      >
                        All Photos
                      </button>
                      <button
                        type="button"
                        className="zuper-segment-pill"
                        onClick={() => {
                          setSegment('albums');
                          exitSelection();
                        }}
                        style={{
                          flex: 1,
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontFamily: font,
                          fontSize: 14,
                          fontWeight: segment === 'albums' ? 600 : 500,
                          color: segment === 'albums' ? T.ink.normal : T.ink.light,
                          backgroundColor: segment === 'albums' ? T.white : 'transparent',
                          cursor: 'pointer',
                          boxShadow: segment === 'albums' ? '0 1px 3px rgba(37, 42, 49, 0.08)' : 'none',
                        }}
                      >
                        Albums
                      </button>
                    </div>
                  ) : null}

                  {/* Filters — All Photos only */}
                  {!albumDetailId && segment === 'all' ? (
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: 8, overflowX: 'auto' }} className="zuper-hide-scrollbar">
                        {FILTERS.map((f) => (
                          <button
                            key={f.label}
                            type="button"
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                              paddingLeft: 12,
                              paddingRight: 12,
                              paddingTop: 6,
                              paddingBottom: 6,
                              borderRadius: f.wide ? 23 : 24,
                              border: `0.998px solid ${T.cloud.dark}`,
                              backgroundColor: T.surface.light2,
                              boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
                              cursor: 'pointer',
                              flexShrink: 0,
                              ...TYPE.tabLabel,
                              fontSize: 14,
                              color: T.ink.normal,
                              letterSpacing: 0.2,
                            }}
                          >
                            {f.label}
                            <img alt="" src={A.chevronDown} width={16} height={16} style={{ display: 'block' }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Album detail: filters only when there is media to filter (empty album = no chips) */}
                  {albumDetailId && activeAlbum && activeAlbum.photoIds.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: 8, overflowX: 'auto', marginBottom: 8 }} className="zuper-hide-scrollbar">
                      {FILTERS.map((f) => (
                        <button
                          key={f.label}
                          type="button"
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            paddingLeft: 12,
                            paddingRight: 12,
                            paddingTop: 6,
                            paddingBottom: 6,
                            borderRadius: 24,
                            border: `0.998px solid ${T.cloud.dark}`,
                            backgroundColor: T.surface.light2,
                            boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            flexShrink: 0,
                            fontSize: 14,
                            fontWeight: 500,
                            color: T.ink.normal,
                          }}
                        >
                          {f.label}
                          <img alt="" src={A.chevronDown} width={16} height={16} />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Body — horizontal padding 16px for album grid; AlbumFolderGrid adds top padding only */}
                <div
                  style={{
                    flex: 1,
                    backgroundColor: T.white,
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: segment === 'albums' ? 0 : 8,
                    paddingBottom: 120,
                    width: '100%',
                    minHeight: 0,
                    ...(albumDetailId && activeAlbum && activeAlbum.photoIds.length === 0
                      ? {
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }
                      : {}),
                  }}
                >
                  {albumDetailId && activeAlbum ? (
                    activeAlbum.photoIds.length === 0 ? (
                      <div className="zuper-empty-album">
                        <EmptyAlbumDetailLottie />
                        <p className="zuper-empty-album-hint">
                          Photos you add to this album show up here. Use the camera or gallery button below.
                        </p>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const photoCount = activeAlbum.photoIds.length;
                          const colsPerRow = ALBUM_GRID_DENSITY[albumGridDensity].colsPerRow;
                          const gridCols = albumDetailEffectiveColumns(photoCount, colsPerRow);
                          return (
                            <>
                              <div className="zuper-album-detail-toolbar">
                                <p
                                  style={{
                                    ...TYPE.tabLabel,
                                    color: T.ink.light,
                                    margin: 0,
                                    flex: '1 1 auto',
                                    minWidth: 0,
                                  }}
                                >
                                  {photoCount} photo{photoCount === 1 ? '' : 's'}
                                </p>
                              </div>
                              <div
                                className="zuper-album-detail-grid"
                                style={{
                                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                                  ...(gridCols === 1
                                    ? { maxWidth: 260, marginLeft: 'auto', marginRight: 'auto' }
                                    : {}),
                                }}
                              >
                                {activeAlbum.photoIds.map((pid) => {
                                  const it = resolveGalleryItem(pid);
                                  if (!it) return null;
                                  return (
                                    <GalleryTile
                                      key={pid}
                                      src={it.src}
                                      tag={it.tag}
                                      video={it.video}
                                      selected={false}
                                      selectionMode={false}
                                    />
                                  );
                                })}
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )
                  ) : segment === 'albums' ? (
                    <AlbumFolderGrid
                      albums={albums}
                      resolveGalleryItem={resolveGalleryItem}
                      onOpenAlbum={(id) => setAlbumDetailId(id)}
                      onShare={(id) => {
                        if (!albumHasPhotos(id, albums)) {
                          showToast(EMPTY_ALBUM_ACTIONS_MSG);
                          setAlbumMenuId(null);
                          return;
                        }
                        setShareAlbumId(id);
                        setAlbumMenuId(null);
                      }}
                      onCopyLink={copyAlbumLink}
                      onManageShares={(id) => {
                        setManageAlbumId(id);
                        setAlbumMenuId(null);
                      }}
                      menuOpenId={albumMenuId}
                      setMenuOpenId={setAlbumMenuId}
                      showManageShares={isAdmin}
                    />
                  ) : (
                    <>
                      {[...groupedAllPhotos.entries()].map(([section, items]) => (
                        <div key={section}>
                          <p style={{ ...TYPE.sectionDate, margin: '0 0 16px 0', color: T.ink.normal }}>
                            {section} ({items.length})
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, width: '100%', marginBottom: 16 }}>
                            {items.map((item) => (
                              <GalleryTile
                                key={item.id}
                                src={item.src}
                                tag={item.tag}
                                video={item.video}
                                selected={selectedIds.has(item.id)}
                                selectionMode={selecting}
                                onSelectInMode={() => toggleSelect(item.id)}
                                onLongPressEnter={() => enterSelectionWith(item.id)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ) : null}

            {!shareAlbumId ? (
              <div
                style={{
                  flexShrink: 0,
                  paddingTop: 21,
                  paddingBottom: 8,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: T.white,
                }}
              >
                <div style={{ width: 134, height: 5, borderRadius: 100, backgroundColor: T.ink.normal, opacity: 0.35 }} />
              </div>
            ) : null}

            {/* Demo: role switcher (PRD §9 — hidden in prod) */}
            {!shareAlbumId ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 8,
                  zIndex: 50,
                  fontSize: 10,
                  color: T.ink.light,
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                <span>Preview as</span>
                <button type="button" onClick={() => setRole('field')} style={{ border: 'none', background: role === 'field' ? T.cloud.dark : 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 10 }}>
                  Field
                </button>
                <button type="button" onClick={() => setRole('admin')} style={{ border: 'none', background: role === 'admin' ? T.cloud.dark : 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 10 }}>
                  Admin
                </button>
              </div>
            ) : null}

            {/* FAB — camera / library when not in share and not album list-only weird */}
            {!shareAlbumId && !pickerOpen && segment === 'all' && !albumDetailId ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 50,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 24,
                  paddingRight: 22,
                  paddingTop: 18,
                  paddingBottom: 18,
                  borderRadius: 36,
                  backgroundColor: T.product.normal,
                  border: '1px solid rgba(255,255,255,0.25)',
                  zIndex: 40,
                }}
              >
                <button type="button" aria-label="Camera" style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', width: 26, height: 26, flexShrink: 0 }}>
                  <img alt="" src={A.fabCamera} width={26} height={26} />
                </button>
                <div style={{ width: 1, height: 32, flexShrink: 0, marginLeft: 16, marginRight: 16 }}>
                  <img alt="" src={A.fabDivider} style={{ width: 1, height: 32, display: 'block' }} />
                </div>
                <button type="button" aria-label="Photo library" style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', width: 26, height: 26, flexShrink: 0 }}>
                  <img alt="" src={A.fabGallery} width={26} height={26} />
                </button>
              </div>
            ) : null}

            {/* FAB — album detail: device (camera) / job gallery (same pill as All Photos home) */}
            {!shareAlbumId && !pickerOpen && albumDetailId && activeAlbum && !jobGalleryPickerOpen ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 50,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 24,
                  paddingRight: 22,
                  paddingTop: 18,
                  paddingBottom: 18,
                  borderRadius: 36,
                  backgroundColor: T.product.normal,
                  border: '1px solid rgba(255,255,255,0.25)',
                  zIndex: 40,
                }}
              >
                <button
                  type="button"
                  aria-label="Upload from device"
                  onClick={startDevicePick}
                  style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', width: 26, height: 26, flexShrink: 0 }}
                >
                  <img alt="" src={A.fabCamera} width={26} height={26} />
                </button>
                <div style={{ width: 1, height: 32, flexShrink: 0, marginLeft: 16, marginRight: 16 }}>
                  <img alt="" src={A.fabDivider} style={{ width: 1, height: 32, display: 'block' }} />
                </div>
                <button
                  type="button"
                  aria-label="Choose from job gallery"
                  onClick={startJobGalleryPick}
                  style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', width: 26, height: 26, flexShrink: 0 }}
                >
                  <img alt="" src={A.fabGallery} width={26} height={26} />
                </button>
              </div>
            ) : null}

            {/* Bottom action bar — Add to Album (PRD Flow 2) */}
            {selecting && selectedIds.size > 0 && !pickerOpen ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 56,
                  left: 16,
                  right: 16,
                  zIndex: 45,
                  backgroundColor: T.ink.normal,
                  borderRadius: 14,
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(37, 42, 49, 0.18)',
                }}
              >
                <span style={{ color: T.white, fontSize: 14, fontWeight: 600 }}>{selectedIds.size} selected</span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={exitSelection} style={{ border: 'none', background: 'transparent', color: T.white, fontSize: 14, cursor: 'pointer', opacity: 0.9 }}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    style={{
                      border: 'none',
                      background: T.white,
                      color: T.ink.normal,
                      fontSize: 14,
                      fontWeight: 600,
                      padding: '8px 14px',
                      borderRadius: 10,
                      cursor: 'pointer',
                    }}
                  >
                    Add to Album
                  </button>
                </div>
              </div>
            ) : null}

            <input
              ref={deviceFileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              aria-hidden
              onChange={handleDeviceFiles}
            />

            {jobGalleryPickerOpen && jobGalleryPickerAlbumId ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 66,
                  backgroundColor: T.white,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: 8,
                    paddingRight: 8,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderBottom: `1px solid ${T.cloud.dark}`,
                    minHeight: 52,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setJobGalleryPickerOpen(false);
                      setJobGalleryPickerAlbumId(null);
                      setJobGalleryPickerSelected(new Set());
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontFamily: font,
                      fontSize: 15,
                      fontWeight: 500,
                      color: T.product.normal,
                      padding: '8px 10px',
                      minWidth: 72,
                    }}
                  >
                    Cancel
                  </button>
                  <p style={{ ...TYPE.heading6, fontSize: 16, margin: 0, flex: 1, textAlign: 'center' }}>Job gallery</p>
                  <button
                    type="button"
                    disabled={jobGalleryPickerSelected.size === 0}
                    onClick={confirmJobGalleryToAlbum}
                    style={{
                      border: 'none',
                      background: jobGalleryPickerSelected.size === 0 ? T.cloud.dark : T.product.normal,
                      color: T.white,
                      cursor: jobGalleryPickerSelected.size === 0 ? 'default' : 'pointer',
                      fontFamily: font,
                      fontSize: 15,
                      fontWeight: 600,
                      padding: '8px 14px',
                      borderRadius: 10,
                      minWidth: 72,
                      opacity: jobGalleryPickerSelected.size === 0 ? 0.7 : 1,
                    }}
                  >
                    Add{jobGalleryPickerSelected.size > 0 ? ` (${jobGalleryPickerSelected.size})` : ''}
                  </button>
                </div>
                <div className="zuper-hide-scrollbar" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 16px 28px' }}>
                  <p style={{ fontSize: 13, color: T.ink.light, margin: '0 0 12px 0', lineHeight: 1.45 }}>
                    Tap photos to select, then Add.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, width: '100%' }}>
                    {GALLERY_ITEMS.map((item) => (
                      <GalleryTile
                        key={item.id}
                        src={item.src}
                        tag={item.tag}
                        video={item.video}
                        selected={jobGalleryPickerSelected.has(item.id)}
                        selectionMode
                        onSelectInMode={() => toggleJobGalleryPick(item.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Album picker sheet (PRD §11) */}
            {pickerOpen ? (
              <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <button type="button" aria-label="Close" onClick={() => setPickerOpen(false)} style={{ flex: 1, border: 'none', background: T.overlay.scrim, cursor: 'pointer' }} />
                <div
                  style={{
                    backgroundColor: T.white,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    padding: '16px 16px 28px',
                    maxHeight: '55%',
                    overflowY: 'auto',
                  }}
                  className="zuper-hide-scrollbar"
                >
                  <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: T.cloud.dark, margin: '0 auto 16px' }} />
                  <p style={{ ...TYPE.heading6, fontSize: 16, margin: '0 0 4px 0' }}>Add to album</p>
                  <p style={{ fontSize: 13, color: T.ink.light, margin: '0 0 14px 0', lineHeight: 1.4 }}>
                    Selected photos are added to the album you choose.
                  </p>
                  {albums.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => addToAlbum(a.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px 12px',
                        border: `1px solid ${T.cloud.dark}`,
                        borderRadius: 12,
                        marginBottom: 8,
                        background: T.white,
                        cursor: 'pointer',
                        fontFamily: font,
                        fontSize: 15,
                        fontWeight: 500,
                        color: T.ink.normal,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{a.name}</span>
                      <span style={{ color: T.ink.light, fontSize: 13 }}>{a.photoIds.length}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Manage Shares sheet (Admin) */}
            {manageAlbumId && isAdmin ? (
              <ManageSharesSheet
                album={albums.find((a) => a.id === manageAlbumId)}
                onClose={() => setManageAlbumId(null)}
                onRevoke={() => showToast('Share removed')}
              />
            ) : null}

            {toast ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 88,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 100,
                  backgroundColor: T.overlay.scrimToast,
                  color: T.white,
                  padding: '10px 16px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 500,
                  maxWidth: '90%',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                {toast}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

function ShareAlbumBody({ albumName, zuperConnect, onSubmit }) {
  const font = TYPE.tabLabel.fontFamily;
  const easeOut = 'cubic-bezier(0.33, 1, 0.68, 1)';
  const [method, setMethod] = useState('email');
  const effectiveMethod = zuperConnect ? method : 'email';
  const inputBase = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: `1px solid ${T.cloud.dark}`,
    fontFamily: font,
    fontSize: 15,
    color: T.ink.normal,
    backgroundColor: T.white,
    boxSizing: 'border-box',
  };

  return (
    <>
      <style>{`
        .zuper-share-input:focus-visible,
        .zuper-share-select:focus-visible,
        .zuper-share-textarea:focus-visible,
        .zuper-share-submit:focus-visible {
          outline: 2px solid ${T.product.normal};
          outline-offset: 2px;
        }
      `}</style>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: T.white,
          overflow: 'hidden',
        }}
      >
        <div
          className="zuper-hide-scrollbar"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
        <div style={{ padding: '20px 20px 24px', maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <p
            style={{
              ...TYPE.heading6,
              fontSize: 17,
              margin: '0 0 6px 0',
              color: T.ink.normal,
              letterSpacing: -0.02,
            }}
          >
            {albumName}
          </p>
          <p style={{ fontSize: 13, color: T.ink.light, margin: '0 0 20px 0', lineHeight: 1.4 }}>
            View-only link · Recipients can’t edit this album.
          </p>

          {zuperConnect ? (
            <div
              className="zuper-segment"
              style={{
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: T.cloud.dark,
                borderRadius: 10,
                padding: 4,
                gap: 4,
                marginBottom: 12,
                border: 'none',
                outline: 'none',
              }}
            >
              <button
                type="button"
                className="zuper-segment-pill"
                onClick={() => setMethod('email')}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontFamily: font,
                  fontSize: 14,
                  fontWeight: method === 'email' ? 600 : 500,
                  color: method === 'email' ? T.ink.normal : T.ink.light,
                  backgroundColor: method === 'email' ? T.white : 'transparent',
                  cursor: 'pointer',
                  boxShadow: method === 'email' ? '0 1px 3px rgba(37, 42, 49, 0.08)' : 'none',
                }}
              >
                Email
              </button>
              <button
                type="button"
                className="zuper-segment-pill"
                onClick={() => setMethod('text')}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontFamily: font,
                  fontSize: 14,
                  fontWeight: method === 'text' ? 600 : 500,
                  color: method === 'text' ? T.ink.normal : T.ink.light,
                  backgroundColor: method === 'text' ? T.white : 'transparent',
                  cursor: 'pointer',
                  boxShadow: method === 'text' ? '0 1px 3px rgba(37, 42, 49, 0.08)' : 'none',
                }}
              >
                Text
              </button>
            </div>
          ) : null}

          {effectiveMethod === 'email' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="share-email-to" style={{ fontSize: 12, fontWeight: 600, color: T.ink.light, display: 'block', marginBottom: 6 }}>
                  To
                </label>
                <input
                  id="share-email-to"
                  className="zuper-share-input"
                  type="email"
                  autoComplete="email"
                  placeholder="name@email.com"
                  defaultValue="homeowner@example.com"
                  style={inputBase}
                />
              </div>
              <div>
                <label htmlFor="share-email-subject" style={{ fontSize: 12, fontWeight: 600, color: T.ink.light, display: 'block', marginBottom: 6 }}>
                  Subject
                </label>
                <input id="share-email-subject" className="zuper-share-input" type="text" defaultValue={`Photos: ${albumName}`} style={inputBase} />
              </div>
              <div>
                <label htmlFor="share-email-body" style={{ fontSize: 12, fontWeight: 600, color: T.ink.light, display: 'block', marginBottom: 6 }}>
                  Message
                </label>
                <textarea
                  id="share-email-body"
                  className="zuper-share-textarea"
                  defaultValue="Hi — here’s a link to view the album."
                  rows={4}
                  style={{ ...inputBase, resize: 'none', minHeight: 100, lineHeight: 1.45 }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="share-text-phone" style={{ fontSize: 12, fontWeight: 600, color: T.ink.light, display: 'block', marginBottom: 6 }}>
                  Mobile number
                </label>
                <input
                  id="share-text-phone"
                  className="zuper-share-input"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(555) 555-0100"
                  defaultValue=""
                  style={inputBase}
                />
              </div>
              <div>
                <label htmlFor="share-text-body" style={{ fontSize: 12, fontWeight: 600, color: T.ink.light, display: 'block', marginBottom: 6 }}>
                  Message <span style={{ fontWeight: 500, color: T.ink.light }}>(optional)</span>
                </label>
                <textarea
                  id="share-text-body"
                  className="zuper-share-textarea"
                  defaultValue={`View photos: ${albumName}`}
                  rows={3}
                  style={{ ...inputBase, resize: 'none', minHeight: 76, lineHeight: 1.45 }}
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <label htmlFor="share-expiry" style={{ fontSize: 12, fontWeight: 600, color: T.ink.light, display: 'block', marginBottom: 6 }}>
              Link expires
            </label>
            <select
              id="share-expiry"
              className="zuper-share-select"
              style={{ ...inputBase, cursor: 'pointer', padding: '12px 40px 12px 14px' }}
            >
              <option>7 days</option>
              <option>30 days</option>
              <option>90 days</option>
              <option>Never</option>
            </select>
          </div>
        </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            width: '100%',
            borderTop: `1px solid ${T.cloud.dark}`,
            backgroundColor: T.white,
            paddingTop: 12,
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
            boxShadow: '0 -4px 20px rgba(37, 42, 49, 0.06)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
            <button
              type="button"
              className="zuper-share-submit"
              onClick={onSubmit}
              style={{
                width: '100%',
                minHeight: 48,
                padding: '14px 16px',
                borderRadius: 12,
                border: 'none',
                background: T.product.normal,
                color: T.white,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: font,
                transition: `opacity 0.18s ${easeOut}, transform 0.18s ${easeOut}`,
              }}
            >
              {effectiveMethod === 'email' ? 'Send email' : 'Send text'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ManageSharesSheet({ album, onClose, onRevoke }) {
  if (!album) return null;
  const font = TYPE.tabLabel.fontFamily;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <button type="button" aria-label="Close" onClick={onClose} style={{ flex: 1, border: 'none', background: T.overlay.scrim, cursor: 'pointer' }} />
      <div style={{ background: T.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '50%' }}>
        <p style={{ ...TYPE.heading6, fontSize: 17, margin: '0 0 8px 0' }}>Manage Shares</p>
        <p style={{ fontSize: 13, color: T.ink.light, margin: '0 0 12px 0' }}>{album.name}</p>
        {album.shared ? (
          <div style={{ border: `1px solid ${T.cloud.dark}`, borderRadius: 12, padding: 12, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>homeowner@example.com</div>
              <div style={{ fontSize: 12, color: T.ink.light }}>Email · Expires 30 days</div>
            </div>
            <button
              type="button"
              onClick={() => {
                onRevoke();
                onClose();
              }}
              style={{ border: 'none', background: 'none', color: T.feedback.danger, fontWeight: 600, cursor: 'pointer', fontFamily: font }}
            >
              Revoke
            </button>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: T.ink.light }}>No active shares for this album.</p>
        )}
        <button type="button" onClick={onClose} style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 10, border: `1px solid ${T.cloud.dark}`, background: T.white, cursor: 'pointer', fontFamily: font }}>
          Done
        </button>
      </div>
    </div>
  );
}
