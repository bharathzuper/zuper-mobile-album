import React from 'react';

/**
 * Glassy folder icon — exact back-panel SVG path from Figma community file
 * "Glassy Folder Assets" (node 9:572), with token-aligned colors.
 *
 * Three visual layers:
 *   1. Back body + tab (SVG path, linear gradient, inner-shadow filter)
 *   2. White paper sheet peeking out between back and front
 *   3. Semi-transparent front flap (glass: gradient + backdrop-blur)
 * Plus an optional shared-person knockout badge at bottom-left.
 */
export function GlassyFolderIcon({ empty = false, shared = false, size = 82 }) {
  const uid = React.useId().replace(/:/g, '');
  const scale = size / 213;
  const h = Math.round(213 * scale);
  const r = Math.round(12 * scale);
  const iconSize = Math.max(16, Math.round(size * 0.22));

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: h,
        flexShrink: 0,
      }}
    >
      {/* Layer 1: Back body + tab — exact Figma path */}
      <svg
        width={size}
        height={h}
        viewBox="0 0 212.223 213.224"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, display: 'block' }}
        aria-hidden
      >
        <defs>
          <filter id={`fi-${uid}`} x="-25%" y="-25%" width="150%" height="150%" filterUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="bg" />
            <feBlend mode="normal" in="SourceGraphic" in2="bg" result="shape" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="ha" />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="ha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="shape" result="is" />
          </filter>
          {!empty ? (
            <linearGradient id={`bg-${uid}`} x1="106.13" y1="-30.76" x2="106.13" y2="248.23" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EDB200" />
              <stop offset="1" stopColor="#E98305" />
            </linearGradient>
          ) : (
            <linearGradient id={`bg-${uid}`} x1="106" y1="-30" x2="106" y2="248" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D1DAE3" />
              <stop offset="1" stopColor="#A8B5C1" />
            </linearGradient>
          )}
        </defs>
        <g filter={`url(#fi-${uid})`}>
          <path
            d="M0.00445057 16.2419C-0.204339 7.334 6.95978 0 15.8702 0H63.0237C65.5045 0 67.9508 0.581595 70.1661 1.6981L101.289 17.3834C103.504 18.4999 105.95 19.0815 108.431 19.0815H196.353C205.277 19.0815 212.447 26.4382 212.217 35.36L208.037 197.762C207.815 206.365 200.778 213.224 192.172 213.224H20.1239C11.504 213.224 4.46016 206.343 4.25818 197.726L0.00445057 16.2419Z"
            fill={`url(#bg-${uid})`}
          />
        </g>
      </svg>

      {/* Layer 2: Paper sheet — white for filled, tinted for empty */}
      <div
        style={{
          position: 'absolute',
          top: '16.6%',
          left: '7.3%',
          right: '7.3%',
          bottom: '11.1%',
          borderRadius: Math.round(10 * scale),
          background: empty ? '#F0F4F8' : '#ffffff',
          border: `${Math.max(0.8, scale)}px solid ${empty ? '#D1DAE3' : '#E8EDF1'}`,
          boxShadow: `0 ${Math.round(3 * scale)}px ${Math.round(5 * scale)}px ${Math.round(2 * scale)}px rgba(37, 42, 49, ${empty ? 0.06 : 0.12})`,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Layer 3: Front flap — glass */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          top: '25.2%',
          borderRadius: r,
          background: empty
            ? 'linear-gradient(180deg, rgba(209, 218, 227, 0.6) 0%, rgba(168, 181, 193, 0.82) 100%)'
            : 'linear-gradient(180deg, rgba(255, 216, 140, 0.48) 0%, rgba(238, 162, 52, 0.68) 50%, rgba(218, 138, 30, 0.78) 100%)',
          WebkitBackdropFilter: 'blur(10px)',
          backdropFilter: 'blur(10px)',
          borderTop: `${Math.max(1, Math.round(1.5 * scale))}px solid rgba(255, 255, 255, ${empty ? 0.4 : 0.5})`,
          boxShadow: empty
            ? 'inset 0 1px 0 rgba(255,255,255,0.3)'
            : 'inset 0 2px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(100, 50, 10, 0.06)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Shared: circular knockout person badge — bottom-left of front flap */}
      {shared ? (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          style={{
            position: 'absolute',
            bottom: Math.round(8 * scale),
            left: Math.round(12 * scale),
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <mask id={`pm-${uid}`}>
              <circle cx="12" cy="12" r="12" fill="white" />
              <circle cx="12" cy="9.2" r="3.5" fill="black" />
              <path d="M5 20.5c0-3.2 3.1-5.8 7-5.8s7 2.6 7 5.8H5Z" fill="black" />
            </mask>
          </defs>
          <circle
            cx="12"
            cy="12"
            r="12"
            fill={empty ? 'rgba(45, 55, 70, 0.24)' : 'rgba(120, 50, 5, 0.32)'}
            mask={`url(#pm-${uid})`}
          />
        </svg>
      ) : null}
    </div>
  );
}
