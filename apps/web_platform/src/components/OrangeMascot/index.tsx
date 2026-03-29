import React, { useEffect, useRef, useState } from 'react';
import './OrangeMascot.scss';

// viewBox「120×140」坐标系内瞳孔最大位移；距离增益越大越跟手
const MAX_OFFSET = 10;
const DISTANCE_GAIN = 0.42;

function pupilDeltaInViewBox(
  sx: number,
  sy: number,
  eyeX: number,
  eyeY: number
): { x: number; y: number } {
  const dx = sx - eyeX;
  const dy = sy - eyeY;
  const len = Math.hypot(dx, dy) || 1;
  const mag = Math.min(MAX_OFFSET, len * DISTANCE_GAIN);
  return { x: (dx / len) * mag, y: (dy / len) * mag };
}

interface OrangeMascotProps {
  trackingRef: React.RefObject<HTMLElement | null>;
}

/**
 * 橙子品牌角色：在精细指针且未启用减少动效时，瞳孔随 trackingRef 区域内指针移动。
 */
export function OrangeMascot({ trackingRef }: OrangeMascotProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(pointer: fine)');
    const sync = () => setTrackingEnabled(!reduce.matches && fine.matches);
    sync();
    reduce.addEventListener('change', sync);
    fine.addEventListener('change', sync);
    return () => {
      reduce.removeEventListener('change', sync);
      fine.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (!trackingEnabled) return;
    const root = trackingRef.current;
    if (!root) return;

    const flush = () => {
      rafRef.current = null;
      const svg = svgRef.current;
      if (!svg) return;
      const { x: mx, y: my } = pendingRef.current;
      const rect = svg.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const sx = ((mx - rect.left) / rect.width) * 120;
      const sy = ((my - rect.top) / rect.height) * 140;
      const oL = pupilDeltaInViewBox(sx, sy, 44, 62);
      const oR = pupilDeltaInViewBox(sx, sy, 76, 62);
      setOffset({ x: (oL.x + oR.x) / 2, y: (oL.y + oR.y) / 2 });
    };

    const onMove = (e: MouseEvent) => {
      pendingRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    root.addEventListener('mousemove', onMove);
    return () => {
      root.removeEventListener('mousemove', onMove);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [trackingEnabled, trackingRef]);

  const { x, y } = offset;

  return (
    <div className="orange-mascot" aria-hidden>
      <svg ref={svgRef} viewBox="0 0 120 140" role="img">
        <defs>
          <linearGradient id="oh-orange-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb347" />
            <stop offset="100%" stopColor="#f4841f" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="78" rx="52" ry="48" fill="url(#oh-orange-body)" />
        <path
          d="M 28 52 Q 60 28 92 52 Q 88 40 60 36 Q 32 40 28 52"
          fill="#4a7c23"
          opacity={0.95}
        />
        <ellipse cx="44" cy="62" rx="14" ry="16" fill="#fffdf8" />
        <ellipse cx="76" cy="62" rx="14" ry="16" fill="#fffdf8" />
        <circle cx={44 + x} cy={62 + y} r="6" fill="#2d1810" />
        <circle cx={76 + x} cy={62 + y} r="6" fill="#2d1810" />
        <circle cx={45 + x * 0.4} cy={60 + y * 0.4} r="2" fill="#fff" opacity={0.85} />
        <circle cx={77 + x * 0.4} cy={60 + y * 0.4} r="2" fill="#fff" opacity={0.85} />
      </svg>
    </div>
  );
}

export default OrangeMascot;
