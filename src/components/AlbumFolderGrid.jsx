import React, { useEffect, useMemo } from 'react';
import { T, TYPE } from '../tokens/figma.js';
import { previewUrlsForAlbum, itemById } from '../data/albumsMock.js';
import { AlbumFolderEmptyListingArt } from './AlbumFolderEmptyListingArt.jsx';

const easeOut = 'cubic-bezier(0.33, 1, 0.68, 1)';
const fontUi = TYPE.tabLabel.fontFamily;
/** Ink-tinted scrim — not pure black (impeccable: tinted neutrals) */
const scrimBottom =
  'linear-gradient(to top, rgba(37, 42, 49, 0.78) 0%, rgba(37, 42, 49, 0.28) 45%, transparent 100%)';

/** Thumbnail fills 100% of card — layouts by photo count */
function AlbumThumb({ urls }) {
  const n = urls.length;
  if (n === 0) return null;
  if (n === 1) {
    return <img alt="" src={urls[0]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  if (n === 2) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
        <img alt="" src={urls[0]} style={{ flex: 1, minWidth: 0, height: '100%', objectFit: 'cover' }} />
        <img alt="" src={urls[1]} style={{ flex: 1, minWidth: 0, height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  const four = [urls[0], urls[1], urls[2], urls[3] ?? null];
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 0,
        width: '100%',
        height: '100%',
      }}
    >
      {four.map((u, i) =>
        u ? (
          <img key={i} alt="" src={u} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div key={i} style={{ backgroundColor: T.cloud.dark, minHeight: 0 }} />
        )
      )}
    </div>
  );
}

function AlbumFolderCard({ album, menuOpen, onOpen, onMenuToggle, onShare, onCopyLink, onManageShares, showManageShares }) {
  const { name, urls } = album;
  const count = urls.length;
  const empty = count === 0;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        className="album-folder-card-btn"
        aria-label={empty ? `${name} album, empty, 0 photos` : `${name} album`}
        title={name}
        onClick={() => onOpen(album.id)}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 160,
          aspectRatio: '1 / 1',
          minHeight: 0,
          borderRadius: 16,
          overflow: 'hidden',
          padding: 0,
          border: 'none',
          cursor: 'pointer',
          display: 'block',
          background: 'transparent',
          transition: `transform 0.2s ${easeOut}`,
        }}
      >
        {empty ? (
          <div
            className="album-folder-empty-shell"
            style={{
              position: 'absolute',
              inset: 0,
              border: `1.5px dashed ${T.album.emptyBorder}`,
              borderRadius: 16,
              boxSizing: 'border-box',
              overflow: 'hidden',
              background: `linear-gradient(165deg, ${T.white} 0%, ${T.album.emptyBg} 100%)`,
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              minHeight: 0,
              /* Buttons default to centered text; match filled album footer (left). */
              textAlign: 'left',
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 8px 0',
              }}
            >
              <AlbumFolderEmptyListingArt accentColor={T.blue.normal} />
            </div>
            <div
              className="album-folder-empty-footer"
              style={{
                flexShrink: 0,
                width: '100%',
                padding: '12px 12px 10px',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: 3,
                textAlign: 'left',
              }}
            >
              <div
                className="album-folder-empty-label"
                style={{
                  fontFamily: fontUi,
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.ink.normal,
                  lineHeight: 1.25,
                }}
              >
                {name}
              </div>
              <div
                className="album-folder-empty-count"
                style={{
                  fontFamily: fontUi,
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: 0.15,
                  color: T.album.emptyMuted,
                  marginTop: 4,
                }}
              >
                0 photos
              </div>
            </div>
          </div>
        ) : (
          <>
            <AlbumThumb urls={urls} />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '58%',
                background: scrimBottom,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 2,
                padding: '12px 12px 10px',
                textAlign: 'left',
                pointerEvents: 'none',
              }}
            >
              <div className="album-folder-card-title">{name}</div>
              <div
                style={{
                  fontFamily: fontUi,
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: 0.15,
                  color: 'rgba(252, 252, 252, 0.92)',
                  marginTop: 4,
                }}
              >
                {count} {count === 1 ? 'photo' : 'photos'}
              </div>
            </div>
          </>
        )}
      </button>

      {/* Share / link actions require photos in this app — empty albums hide overflow menu */}
      {!empty ? (
        <>
          <button
            type="button"
            aria-label={`${name} — more options`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle(album.id);
            }}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              zIndex: 3,
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(37, 42, 49, 0.42)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: T.white,
                fontSize: 16,
                lineHeight: 1,
                transition: `background 0.15s ${easeOut}`,
              }}
              className="album-folder-menu-hit"
              aria-hidden
            >
              <span style={{ transform: 'translateY(-1px)' }}>⋮</span>
            </span>
          </button>

          {menuOpen ? (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 48,
                right: 4,
                zIndex: 4,
                background: T.white,
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(37, 42, 49, 0.1)',
                border: `1px solid ${T.cloud.dark}`,
                minWidth: 160,
                overflow: 'hidden',
              }}
            >
              <button type="button" role="menuitem" onClick={() => onShare(album.id)} className="album-folder-menu-item" style={menuRow}>
                Share album
              </button>
              <button type="button" role="menuitem" onClick={() => onCopyLink(album.id)} className="album-folder-menu-item" style={menuRow}>
                Copy link
              </button>
              {showManageShares ? (
                <button type="button" role="menuitem" onClick={() => onManageShares(album.id)} className="album-folder-menu-item" style={menuRow}>
                  Manage Shares
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

const menuRow = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '12px 14px',
  border: 'none',
  background: T.white,
  fontSize: 15,
  fontWeight: 500,
  color: T.ink.normal,
  cursor: 'pointer',
  fontFamily: fontUi,
};

/**
 * Albums view — 2-column folder grid only (no in-album photo grid).
 * Google Photos / CompanyCam style: image-first cards, text on gradient.
 */
export function AlbumFolderGrid({
  albums = [],
  menuOpenId,
  setMenuOpenId,
  onOpenAlbum,
  onShare,
  onCopyLink,
  onManageShares,
  showManageShares = false,
  resolveGalleryItem = itemById,
}) {
  const rows = useMemo(
    () =>
      albums.map((a) => ({
        id: a.id,
        name: a.name,
        urls: previewUrlsForAlbum(a, resolveGalleryItem),
      })),
    [albums, resolveGalleryItem]
  );

  useEffect(() => {
    if (!menuOpenId) return;
    const row = rows.find((r) => r.id === menuOpenId);
    if (row && row.urls.length === 0) {
      setMenuOpenId(null);
    }
  }, [rows, menuOpenId, setMenuOpenId]);

  useEffect(() => {
    if (!menuOpenId) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpenId, setMenuOpenId]);

  return (
    <>
      <style>{`
        .album-folder-card-title {
          font-family: ${fontUi};
          font-size: 14px;
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: ${T.white};
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-align: left;
        }
        .album-folder-empty-label {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-align: left;
        }
        .album-folder-empty-count {
          text-align: left;
        }
        .album-folder-card-btn:focus-visible {
          outline: 2px solid ${T.product.normal};
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: no-preference) {
          .album-folder-card-btn:active {
            transform: scale(0.98);
          }
        }
        .album-folder-menu-item {
          transition: background-color 0.15s cubic-bezier(0.33, 1, 0.68, 1);
        }
        .album-folder-menu-item:hover {
          background: ${T.surface.light2} !important;
        }
        .album-folder-menu-item:active {
          background: ${T.surface.light2} !important;
        }
        .album-folder-menu-item:focus-visible {
          outline: 2px solid ${T.product.normal};
          outline-offset: -2px;
        }
        .album-folder-menu-hit:hover {
          background: rgba(37, 42, 49, 0.5) !important;
        }
      `}</style>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 160px))',
        gap: 8,
        justifyContent: 'center',
        width: '100%',
        paddingTop: 12,
        boxSizing: 'border-box',
      }}
    >
      {rows.map((album) => (
        <AlbumFolderCard
          key={album.id}
          album={album}
          menuOpen={menuOpenId === album.id}
          onOpen={onOpenAlbum}
          onMenuToggle={(id) => setMenuOpenId(menuOpenId === id ? null : id)}
          onShare={onShare}
          onCopyLink={onCopyLink}
          onManageShares={onManageShares}
          showManageShares={showManageShares}
        />
      ))}
    </div>
    </>
  );
}
