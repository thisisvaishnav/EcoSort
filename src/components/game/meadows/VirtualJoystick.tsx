import React, { useRef, useState } from 'react';
import { JOYSTICK_DEAD_ZONE } from '../../world/locomotion';

export interface VirtualJoystickProps {
  /** Emits a clamped vector: x = right+, y = down+. Centered = (0, 0). */
  onMove: (x: number, y: number) => void;
  /** When true, pulses with a glowing ring to attract player attention during tutorials */
  pulsing?: boolean;
}

const BASE_SIZE = 128;
const KNOB_SIZE = 52;
const MAX_TRAVEL = (BASE_SIZE - KNOB_SIZE) / 2;

interface KnobPos {
  x: number;
  y: number;
}

/**
 * VirtualJoystick — touch-only movement stick (bottom-left).
 * Uses pointer capture so a drag stays alive when the finger leaves the base,
 * and stops propagation so the canvas never sees tap-to-move from this gesture.
 */
export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, pulsing = false }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [knob, setKnob] = useState<KnobPos>({ x: 0, y: 0 });

  const emit = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX_TRAVEL) {
      dx = (dx / dist) * MAX_TRAVEL;
      dy = (dy / dist) * MAX_TRAVEL;
    }
    setKnob({ x: dx, y: dy });
    onMove(dx / MAX_TRAVEL, dy / MAX_TRAVEL);
  };

  const release = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;
    pointerIdRef.current = null;
    setKnob({ x: 0, y: 0 });
    onMove(0, 0);
    if (baseRef.current?.hasPointerCapture(e.pointerId)) {
      baseRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const isCentered = Math.hypot(knob.x, knob.y) / MAX_TRAVEL < JOYSTICK_DEAD_ZONE;

  return (
    <div
      ref={baseRef}
      data-testid="virtual-joystick"
      className={`pointer-events-auto relative touch-none select-none rounded-full border border-white/25 bg-slate-950/45 backdrop-blur-md shadow-lg transition-all duration-300 ${
        pulsing
          ? 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-950 shadow-[0_0_24px_rgba(52,211,153,0.75)] animate-pulse'
          : ''
      }`}
      style={{ width: BASE_SIZE, height: BASE_SIZE }}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (pointerIdRef.current !== null) return;
        pointerIdRef.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        emit(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (pointerIdRef.current !== e.pointerId) return;
        e.stopPropagation();
        emit(e.clientX, e.clientY);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      role="button"
      aria-label="Move joystick"
      tabIndex={-1}
    >
      {/* Track ring */}
      <div className="absolute inset-3 rounded-full border border-white/15" />
      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300/70" />
      {/* Knob */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full border border-teal-300/70 bg-teal-400/80 shadow-[0_0_14px_rgba(45,212,191,0.55)] transition-[background-color] duration-150"
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          marginLeft: -KNOB_SIZE / 2,
          marginTop: -KNOB_SIZE / 2,
          transform: `translate(${knob.x}px, ${knob.y}px)`,
          backgroundColor: isCentered ? undefined : 'rgba(45, 212, 191, 0.95)',
        }}
      />
    </div>
  );
};
