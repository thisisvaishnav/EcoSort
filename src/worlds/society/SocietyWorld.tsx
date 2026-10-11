import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SOCIETY_MANIFEST } from './manifest';
import { createSocietyMap, SocietyMapResult } from './map';
import { createSocietyProps, SocietyPropsResult } from './props';
import { Phase1Controller } from './phases/phase1';
import { Phase2Controller } from './phases/phase2';
import { Phase3Controller } from './phases/phase3';
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Play,
  Sliders,
} from 'lucide-react';

export interface SocietyWorldProps {
  onExit?: () => void;
  className?: string;
}

export type SocietyMissionNumber = 1 | 2 | 3;

/**
 * Society World — Complete Interactive Experience
 *
 * Coordinates Three.js 3D scene rendering with Phase 1, Phase 2, and Phase 3 missions.
 */
export const SocietyWorld: React.FC<SocietyWorldProps> = ({ onExit, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'play' | 'inspector'>('play');
  const [activeMission, setActiveMission] = useState<SocietyMissionNumber>(1);
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'overview' | 'anchors' | 'contract'>('overview');

  // Scene references
  const mapResultRef = useRef<SocietyMapResult | null>(null);
  const propsResultRef = useRef<SocietyPropsResult | null>(null);

  // ── Three.js Scene Setup ───────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // dark midnight sky
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    const camera = new THREE.PerspectiveCamera(
      45,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.5,
      200
    );
    camera.position.set(0, 14, 24);
    camera.lookAt(0, 1.5, 4);

    // Build Map & Props
    const mapResult = createSocietyMap();
    const propsResult = createSocietyProps();
    mapResultRef.current = mapResult;
    propsResultRef.current = propsResult;

    scene.add(mapResult.group);
    scene.add(propsResult.group);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animateLoop = () => {
      animationFrameId = requestAnimationFrame(animateLoop);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      mapResult.animate(elapsed, delta);

      // Gentle camera sway
      camera.position.x = Math.sin(elapsed * 0.2) * 1.5;
      camera.lookAt(0, 1.5, 4);

      renderer.render(scene, camera);
    };
    animateLoop();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleAddScore = (points: number) => {
    setScore((prev) => prev + points);
  };

  // ── Mission Transitions ───────────────────────────────────────────────────
  const handleCompleteMission1 = () => {
    setCompletedMissions((prev) => (prev.includes(1) ? prev : [...prev, 1]));
    mapResultRef.current?.setVisualState(1); // State 1: Clean
    setActiveMission(2);
  };

  const handleCompleteMission2 = () => {
    setCompletedMissions((prev) => (prev.includes(2) ? prev : [...prev, 2]));
    mapResultRef.current?.setVisualState(2); // State 2: Revived
    setActiveMission(3);
  };

  const handleCompleteMission3 = () => {
    setCompletedMissions((prev) => (prev.includes(3) ? prev : [...prev, 3]));
  };

  return (
    <div
      data-testid="society-world-root"
      className={`relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden ${className}`}
    >
      {/* ── 3D Scene Viewport Mount ─────────────────────────────────────────── */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-auto" />

      {/* ── Top Bar HUD ────────────────────────────────────────────────────── */}
      <header className="relative h-16 px-6 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-3">
          {onExit && (
            <button
              onClick={onExit}
              data-testid="society-exit-btn"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to Main Menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wide text-emerald-400 font-fun">
                {SOCIETY_MANIFEST.name.toUpperCase()}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                WAVE 2 LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Score: <span className="text-amber-400 font-bold font-mono">+{score} pts</span>
            </p>
          </div>
        </div>

        {/* Mission Navigator & Dev Switcher */}
        <div className="flex items-center gap-2">
          {viewMode === 'play' ? (
            <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 text-xs">
              <button
                onClick={() => setActiveMission(1)}
                data-testid="nav-mission-1"
                className={`px-3 py-1.5 rounded-lg font-fun font-bold transition-all ${
                  activeMission === 1 ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Clean Waste
              </button>
              <button
                onClick={() => setActiveMission(2)}
                data-testid="nav-mission-2"
                className={`px-3 py-1.5 rounded-lg font-fun font-bold transition-all ${
                  activeMission === 2 ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Install Bins
              </button>
              <button
                onClick={() => setActiveMission(3)}
                data-testid="nav-mission-3"
                className={`px-3 py-1.5 rounded-lg font-fun font-bold transition-all ${
                  activeMission === 3 ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Teach Residents
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 text-xs">
              <button
                onClick={() => setActiveInspectorTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeInspectorTab === 'overview' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveInspectorTab('anchors')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeInspectorTab === 'anchors' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Anchors
              </button>
            </div>
          )}

          <button
            onClick={() => setViewMode(viewMode === 'play' ? 'inspector' : 'play')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={viewMode === 'play' ? 'Open Contract Inspector' : 'Return to Game'}
          >
            {viewMode === 'play' ? <Sliders className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Active Gameplay Overlay ─────────────────────────────────────────── */}
      {viewMode === 'play' && (
        <>
          {activeMission === 1 && (
            <Phase1Controller
              onComplete={handleCompleteMission1}
              onAddScore={handleAddScore}
            />
          )}

          {activeMission === 2 && (
            <Phase2Controller
              onComplete={handleCompleteMission2}
              onAddScore={handleAddScore}
              onTriggerRevival={() => mapResultRef.current?.setVisualState(2)}
            />
          )}

          {activeMission === 3 && (
            <Phase3Controller
              score={score}
              onComplete={handleCompleteMission3}
              onAddScore={handleAddScore}
              onHome={onExit}
            />
          )}
        </>
      )}

      {/* ── Developer / QA Inspector Mode ───────────────────────────────────── */}
      {viewMode === 'inspector' && (
        <main className="relative flex-1 p-6 overflow-y-auto flex items-center justify-center z-20 pointer-events-auto">
          {activeInspectorTab === 'overview' && (
            <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900/95 border-2 border-slate-800 text-center space-y-6 shadow-2xl backdrop-blur">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black font-fun tracking-tight text-white">
                Society World Architecture
              </h2>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-xs text-slate-400 font-mono">Completed Missions</span>
                  <p className="text-sm font-bold text-emerald-400 font-mono">
                    {completedMissions.join(', ') || 'None'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <span className="text-xs text-slate-400 font-mono">Total Points</span>
                  <p className="text-sm font-bold text-amber-400 font-mono">+{score}</p>
                </div>
              </div>
            </div>
          )}

          {activeInspectorTab === 'anchors' && (
            <div className="max-w-2xl w-full p-6 rounded-3xl bg-slate-900/95 border border-slate-800 space-y-4 shadow-2xl backdrop-blur">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                World Anchors
              </h3>
              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 max-h-[55vh] overflow-y-auto">
                {JSON.stringify(SOCIETY_MANIFEST, null, 2)}
              </pre>
            </div>
          )}
        </main>
      )}
    </div>
  );
};
