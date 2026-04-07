import React, { useEffect, useState } from 'react';
import './EmptyAlbumDetailLottie.css';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let mq;
    try {
      mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    } catch {
      return undefined;
    }
    const fn = () => setReduced(mq.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', fn);
      return () => mq.removeEventListener('change', fn);
    }
    if (typeof mq.addListener === 'function') {
      mq.addListener(fn);
      return () => mq.removeListener(fn);
    }
    return undefined;
  }, []);

  return reduced;
}

/**
 * Lottie “Album Zero” — shown only inside an opened empty album (detail), not on the folder grid.
 */
export function EmptyAlbumDetailLottie() {
  const reducedMotion = usePrefersReducedMotion();
  const [lottie, setLottie] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mod, dataMod] = await Promise.all([
          import('lottie-react'),
          import('../assets/lottie/album-zero.json'),
        ]);
        if (cancelled) return;
        setLottie({ Lottie: mod.default, data: dataMod.default });
      } catch {
        if (!cancelled) setLottie({ error: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (lottie?.error) {
    return (
      <div className="eadl-root" aria-hidden>
        <div className="eadl-fallback" />
      </div>
    );
  }

  if (!lottie?.Lottie || !lottie?.data) {
    return (
      <div className="eadl-root" aria-hidden>
        <div className="eadl-fallback eadl-fallback--loading" />
      </div>
    );
  }

  const { Lottie, data } = lottie;

  return (
    <div className="eadl-root" aria-hidden>
      <Lottie
        animationData={data}
        loop={!reducedMotion}
        autoplay={!reducedMotion}
        className="eadl-lottie"
      />
    </div>
  );
}
