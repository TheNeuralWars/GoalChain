import React, { useEffect, useRef, useMemo, useState } from 'react';

interface InfinityFlameProps {
  /** Flame intensity 0-1, drives height, particle count, color temperature */
  intensity: number;
  /** Container width */
  width?: number;
  /** Container height */
  height?: number;
  /** Enable canvas particle system (fallback for reduced motion) */
  enableParticles?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Generates a flame path using bezier curves with controlled randomness
 * Seedable for consistent animation frames
 */
function generateFlamePath(
  centerX: number,
  bottomY: number,
  height: number,
  width: number,
  turbulence: number,
  seed: number
): string {
  // Simple pseudo-random for consistent turbulence
  let randSeed = seed;
  const rand = () => {
    randSeed = (randSeed * 16807) % 2147483647;
    return (randSeed - 1) / 2147483646;
  };

  const baseWidth = width * (0.5 + turbulence * 0.3);
  const tipY = bottomY - height;
  
  // Control points for the flame shape
  const leftBase = centerX - baseWidth * 0.5;
  const rightBase = centerX + baseWidth * 0.5;
  
  // Mid-section control points with turbulence
  const mid1Y = bottomY - height * 0.35;
  const mid2Y = bottomY - height * 0.65;
  const tipX = centerX + (rand() - 0.5) * width * 0.15 * turbulence;
  
  const leftMid1 = leftBase + (rand() - 0.5) * width * 0.2 * turbulence;
  const rightMid1 = rightBase + (rand() - 0.5) * width * 0.2 * turbulence;
  const leftMid2 = centerX - width * 0.25 + (rand() - 0.5) * width * 0.15 * turbulence;
  const rightMid2 = centerX + width * 0.25 + (rand() - 0.5) * width * 0.15 * turbulence;

  return [
    `M ${centerX} ${bottomY}`,
    `Q ${leftMid1} ${mid1Y} ${leftMid2} ${mid2Y}`,
    `Q ${tipX - width * 0.1} ${tipY + height * 0.1} ${tipX} ${tipY}`,
    `Q ${tipX + width * 0.1} ${tipY + height * 0.1} ${rightMid2} ${mid2Y}`,
    `Q ${rightMid1} ${mid1Y} ${centerX} ${bottomY}`,
    'Z'
  ].join(' ');
}

/**
 * Generates ember particle positions
 */
interface EmberParticle {
  x: number;
  y: number;
  r: number;
  opacity: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
}

function createEmberParticles(
  count: number,
  centerX: number,
  bottomY: number,
  flameWidth: number,
  flameHeight: number
): EmberParticle[] {
  return Array.from({ length: count }, () => ({
    x: centerX + (Math.random() - 0.5) * flameWidth * 0.6,
    y: bottomY - Math.random() * flameHeight * 0.3,
    r: 2 + Math.random() * 3,
    opacity: 0.6 + Math.random() * 0.4,
    vy: -0.5 - Math.random() * 1.5,
    life: Math.random() * 100,
    maxLife: 80 + Math.random() * 120,
    hue: 15 + Math.random() * 30, // 15-45 (orange to yellow)
  }));
}

export const InfinityFlame: React.FC<InfinityFlameProps> = ({
  intensity = 0.5,
  width = 400,
  height = 280,
  enableParticles = true,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const frameRef = useRef(0);
  const particlesRef = useRef<EmberParticle[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [smilSupported, setSmilSupported] = useState(true);
  const intensityRef = useRef(intensity);
  const lastFrameRef = useRef(performance.now());

  // Sync intensity ref
  intensityRef.current = intensity;

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Check SMIL support
  useEffect(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    setSmilSupported('beginElement' in animate);
  }, []);

  // Initialize particles
  useEffect(() => {
    const centerX = width / 2;
    const bottomY = height;
    const flameHeight = height * 0.85 * (0.5 + intensity * 0.7);
    const flameWidth = width * 0.5 * (0.5 + intensity * 0.5);
    const particleCount = Math.floor(30 + intensity * 30);
    
    particlesRef.current = createEmberParticles(
      particleCount,
      centerX,
      bottomY,
      flameWidth,
      flameHeight
    );
  }, [width, height]);

  // Animation loop (canvas fallback)
  useEffect(() => {
    if (prefersReducedMotion || smilSupported) return;
    if (!enableParticles) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // Cap at 100ms
      lastTime = now;
      frameRef.current++;

      const centerX = width / 2;
      const bottomY = height;
      const flameHeight = height * 0.85 * (0.5 + intensityRef.current * 0.7);
      const flameWidth = width * 0.5 * (0.5 + intensityRef.current * 0.5);
      const targetParticleCount = Math.floor(30 + intensityRef.current * 30);

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Draw ember glow at base
      const glowGradient = ctx.createRadialGradient(
        centerX, bottomY, 0,
        centerX, bottomY, flameWidth * 0.8
      );
      glowGradient.addColorStop(0, `rgba(255, 68, 0, ${0.15 * intensityRef.current})`);
      glowGradient.addColorStop(0.5, `rgba(255, 102, 0, ${0.08 * intensityRef.current})`);
      glowGradient.addColorStop(1, 'rgba(255, 68, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.ellipse(centerX, bottomY, flameWidth * 0.8, flameHeight * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw particles
      const newParticles: EmberParticle[] = [];
      
      for (const p of particlesRef.current) {
        // Update physics
        p.y += p.vy * dt * 60;
        p.x += (Math.random() - 0.5) * 0.5 * dt * 60; // slight horizontal drift
        p.vy *= 0.995; // slight drag
        p.life += dt * 60;
        p.opacity = Math.max(0, 1 - p.life / p.maxLife) * (0.6 + Math.random() * 0.4);
        
        // Flicker
        const flicker = 0.8 + Math.sin(now * 0.01 + p.life * 0.1) * 0.2;
        p.opacity *= flicker;

        // Keep alive particles
        if (p.life < p.maxLife && p.opacity > 0.05) {
          newParticles.push(p);
          
          // Draw particle
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.opacity})`);
          gradient.addColorStop(1, `hsla(${p.hue + 10}, 100%, 50%, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Spawn new particles to maintain count
      while (newParticles.length < targetParticleCount) {
        const spawnX = centerX + (Math.random() - 0.5) * flameWidth * 0.4;
        const spawnY = bottomY - Math.random() * flameHeight * 0.2;
        newParticles.push({
          x: spawnX,
          y: spawnY,
          r: 2 + Math.random() * 3,
          opacity: 0.6 + Math.random() * 0.4,
          vy: -0.5 - Math.random() * 1.5,
          life: 0,
          maxLife: 80 + Math.random() * 120,
          hue: 15 + Math.random() * 30,
        });
      }

      particlesRef.current = newParticles;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [width, height, enableParticles, prefersReducedMotion, smilSupported]);

  // Generate static SVG paths for SMIL animation (multiple keyframes)
  const flamePaths = useMemo(() => {
    const centerX = width / 2;
    const bottomY = height;
    const baseHeight = height * 0.85;
    const baseWidth = width * 0.5;
    
    // Generate 3 keyframe paths for SMIL animation
    return [
      generateFlamePath(centerX, bottomY, baseHeight * 0.9, baseWidth * 0.9, 0.3, 1),
      generateFlamePath(centerX, bottomY, baseHeight, baseWidth, 0.5, 2),
      generateFlamePath(centerX, bottomY, baseHeight * 1.1, baseWidth * 1.1, 0.4, 3),
    ];
  }, [width, height]);

  // Calculate dynamic flame dimensions based on intensity
  const flameHeight = height * 0.85 * (0.5 + intensity * 0.7);
  const flameWidth = width * 0.5 * (0.5 + intensity * 0.5);
  const centerX = width / 2;
  const bottomY = height;

  // Color temperature based on intensity (cooler = more blue/white at tip)
  const getFlameGradient = () => `
    <linearGradient id="flameGrad" x1="50%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="${intensity > 0.7 ? '#ff2200' : '#ff4b4b'}" stop-opacity="0.95" />
      <stop offset="30%" stop-color="${intensity > 0.5 ? '#ff6600' : '#ff8c00'}" stop-opacity="0.9" />
      <stop offset="55%" stop-color="${intensity > 0.3 ? '#ffaa00' : '#ffcc00'}" stop-opacity="0.8" />
      <stop offset="75%" stop-color="#ffd700" stop-opacity="0.6" />
      <stop offset="90%" stop-color="#fff8dc" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
  `;

  const getEmberGradient = () => `
    <radialGradient id="emberGrad" cx="50%" cy="85%" r="60%">
      <stop offset="0%" stop-color="${intensity > 0.6 ? '#ff3300' : '#ff4b4b'}" stop-opacity="${0.25 + intensity * 0.2}" />
      <stop offset="50%" stop-color="#ff6600" stop-opacity="${0.1 + intensity * 0.1}" />
      <stop offset="100%" stop-color="#ff4b4b" stop-opacity="0" />
    </radialGradient>
  `;

  // Hardware acceleration class
  const containerClasses = [
    'infinity-flame-container',
    'gpu-accelerated',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={{ width, height, minHeight: height }}>
      {/* Canvas fallback for reduced motion or no SMIL support */}
      {(prefersReducedMotion || !smilSupported) && enableParticles && (
        <canvas
          ref={canvasRef}
          className="infinity-flame-canvas flame-layer"
          width={width}
          height={height}
          aria-hidden="true"
        />
      )}

      {/* Primary SVG Animation (SMIL) */}
      <svg
        ref={svgRef}
        className="infinity-flame-svg flame-layer"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        role="img"
        aria-label={`Infinity Burn flame visualization, intensity ${Math.round(intensity * 100)}%`}
      >
        <defs>
          {getFlameGradient()}
          {getEmberGradient()}
          
          {/* Inner glow filter for flame core */}
          <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={2 + intensity * 3} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Ember particle definition for SMIL */}
          <radialGradient id="particleGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffd700" stop-opacity="0.9" />
            <stop offset="70%" stop-color="#ff8c00" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#ff4b4b" stop-opacity="0" />
          </radialGradient>
        </defs>

        {/* Base ember glow */}
        <ellipse
          cx={centerX}
          cy={bottomY - flameHeight * 0.05}
          rx={flameWidth * 0.7}
          ry={flameHeight * 0.12}
          fill="url(#emberGrad)"
          className="flame-layer"
        >
          {!prefersReducedMotion && smilSupported && (
            <g>
              <animate
                attributeName="opacity"
                values={`0.2;${0.4 + intensity * 0.3};0.2`}
                dur={`${3 / (0.5 + intensity * 0.5)}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="rx"
                values={`${flameWidth * 0.65};${flameWidth * 0.75};${flameWidth * 0.65}`}
                dur={`${4 / (0.5 + intensity * 0.5)}s`}
                repeatCount="indefinite"
              />
            </g>
          )}
        </ellipse>

        {/* Main flame shape with SMIL morphing */}
        <path
          fill="url(#flameGrad)"
          filter="url(#flameGlow)"
          className="flame-layer"
          d={flamePaths[1]} // Default to middle path
        >
          {!prefersReducedMotion && smilSupported && (
            <g>
              <animate
                attributeName="d"
                values={flamePaths.join(';')}
                dur={`${3.5 / (0.5 + intensity * 0.5)}s`}
                repeatCount="indefinite"
                keyTimes="0;0.5;1"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
              <animate
                attributeName="opacity"
                values={`0.85;1;${0.8 + intensity * 0.1}`}
                dur="0.12s"
                repeatCount="indefinite"
              />
            </g>
          )}
        </path>

        {/* Floating ember particles (SMIL) */}
        {[1, 2, 3, 4, 5, 6].map((_, i) => {
          const startX = centerX - flameWidth * 0.3 + (i * flameWidth * 0.6) / 5;
          const startY = bottomY - flameHeight * 0.2 - i * (flameHeight * 0.12);
          const particleSize = 3 + i * 0.6 + intensity * 2;
          const driftX = (Math.sin(i) - 0.5) * 15 * (0.5 + intensity);
          const driftY = -30 - i * 10 - intensity * 20;
          
          return (
            <circle
              key={i}
              cx={startX}
              cy={startY}
              r={particleSize}
              fill="url(#particleGrad)"
              className="flame-layer"
              opacity={0.7 * intensity + 0.2}
            >
              {!prefersReducedMotion && smilSupported && (
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={`0 0; ${driftX} ${driftY}; 0 0`}
                    dur={`${2 + i * 0.25 + intensity * 0.5}s`}
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.25 0.1 0.25 1"
                  />
                  <animate
                    attributeName="opacity"
                    values={`0.7;0;0.7`}
                    dur={`${2 + i * 0.25 + intensity * 0.5}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    values={`${particleSize};${particleSize * 0.3};${particleSize}`}
                    dur={`${2 + i * 0.25 + intensity * 0.5}s`}
                    repeatCount="indefinite"
                  />
                </g>
              )}
            </circle>
          );
        })}
      </svg>
    </div>
  );
};

export default InfinityFlame;