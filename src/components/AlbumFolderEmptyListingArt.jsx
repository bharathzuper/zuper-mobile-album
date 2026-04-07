import React, { useId, useMemo } from 'react';
import './AlbumFolderEmptyListingArt.css';

/**
 * Static illustration for empty album tiles on the folder grid (not Lottie).
 */
export function AlbumFolderEmptyListingArt({ accentColor = '#0172CB' }) {
  const gradId = useId().replace(/:/g, '');
  const soft = useMemo(() => {
    const a = accentColor;
    return {
      back: `${a}26`,
      mid: `${a}40`,
      frontFill: '#FFFFFF',
      frontStroke: `${a}55`,
      glowMid: `${a}18`,
      glowEdge: `${a}05`,
    };
  }, [accentColor]);

  return (
    <div className="afl-root" aria-hidden>
      <svg className="afl-svg" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={gradId} cx="50%" cy="55%" r="65%">
            <stop offset="0%" stopColor={soft.glowMid} />
            <stop offset="100%" stopColor={soft.glowEdge} />
          </radialGradient>
        </defs>

        <ellipse cx="60" cy="56" rx="46" ry="22" fill={`url(#${gradId})`} />

        <path
          d="M22 18l1 2.8 2.8 1-2.8 1L22 25.6l-1-2.8-2.8-1 2.8-1z"
          fill={accentColor}
          opacity={0.45}
        />
        <path
          d="M98 22l0.8 2.2 2.2 0.8-2.2 0.8L98 28l-0.8-2.2-2.2-0.8 2.2-0.8z"
          fill={accentColor}
          opacity={0.38}
        />

        <g>
          <rect x="26" y="28" width="68" height="50" rx="9" fill={soft.back} />
          <rect x="30" y="32" width="68" height="50" rx="9" fill={soft.mid} />
          <rect
            x="34"
            y="36"
            width="68"
            height="50"
            rx="9"
            fill={soft.frontFill}
            stroke={soft.frontStroke}
            strokeWidth="1.25"
          />
          <line
            x1="42"
            y1="44"
            x2="94"
            y2="44"
            stroke={accentColor}
            strokeOpacity="0.08"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
