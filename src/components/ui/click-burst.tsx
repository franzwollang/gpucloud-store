'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';

import { cn } from '@/lib/style';

// =============================================================================
// Types
// =============================================================================

interface BurstParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  delay: number;
  color: string;
  distance: number;
  size: number;
}

interface BurstRing {
  id: number;
  x: number;
  y: number;
}

interface ClickBurstConfig {
  /** Number of particle PAIRS in the burst */
  pairCount: number;
  /** Angular spacing between particles in a pair (degrees) */
  pairSpacing: number;
  /** Duration of the burst animation in ms */
  duration: number;
  /** Base distance particles travel in px */
  distance: number;
  /** Random variance in distance (0-1, e.g. 0.3 = ±30%) */
  distanceVariance: number;
  /** Base size of each particle in px */
  particleSize: number;
  /** Random variance in particle size (0-1) */
  sizeVariance: number;
  /** Array of colors for particles (cycles through) */
  colors: string[];
  /** Whether particles should fade out */
  fade: boolean;
  /** Whether particles should scale down as they travel */
  shrink: boolean;
  /** Spread angle in degrees (360 = full circle) */
  spread: number;
  /** Starting angle offset in degrees */
  startAngle: number;
  /** Whether the effect is enabled */
  enabled: boolean;
  /** Show expanding filled circle effect */
  showRing: boolean;
  /** Ring size (diameter) in px */
  ringSize: number;
  /** Ring style: 'filled' or 'outline' */
  ringStyle: 'filled' | 'outline';
}

interface ClickBurstContextValue {
  triggerBurst: (x: number, y: number) => void;
  config: ClickBurstConfig;
}

// =============================================================================
// Constants & Defaults
// =============================================================================

const DEFAULT_CONFIG: ClickBurstConfig = {
  pairCount: 7,
  pairSpacing: 8,
  duration: 600,
  distance: 70,
  distanceVariance: 0.25,
  particleSize: 5,
  sizeVariance: 0.4,
  colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'],
  fade: true,
  shrink: true,
  spread: 360,
  startAngle: 0,
  enabled: true,
  showRing: true,
  ringSize: 50,
  ringStyle: 'filled'
};

// =============================================================================
// Context
// =============================================================================

const ClickBurstContext = createContext<ClickBurstContextValue | null>(null);

function useClickBurstContext() {
  const context = useContext(ClickBurstContext);
  if (!context) {
    throw new Error(
      'ClickBurstTarget must be used within a ClickBurstFrame component'
    );
  }
  return context;
}

// =============================================================================
// ClickBurstFrame Component
// =============================================================================

interface ClickBurstFrameProps {
  children: ReactNode;
  className?: string;
  /** Override default configuration */
  config?: Partial<ClickBurstConfig>;
}

export function ClickBurstFrame({
  children,
  className,
  config: configOverrides
}: ClickBurstFrameProps) {
  const [particles, setParticles] = useState<BurstParticle[]>([]);
  const [rings, setRings] = useState<BurstRing[]>([]);
  const frameRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const config = useMemo<ClickBurstConfig>(
    () => ({
      ...DEFAULT_CONFIG,
      ...configOverrides
    }),
    [configOverrides]
  );

  const triggerBurst = useCallback(
    (clientX: number, clientY: number) => {
      if (!config.enabled || !frameRef.current) return;

      const rect = frameRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const burstId = idRef.current++;

      // Generate particles in PAIRS
      const newParticles: BurstParticle[] = [];
      const angleStep = config.spread / config.pairCount;
      const baseAngle = config.startAngle - config.spread / 2;
      const halfPairSpacing = config.pairSpacing / 2;

      for (let i = 0; i < config.pairCount; i++) {
        const pairCenterAngle = baseAngle + angleStep * i + angleStep / 2;
        const colorIndex = i % config.colors.length;
        const color = config.colors[colorIndex];

        // Create two particles per pair, slightly offset from each other
        for (let j = 0; j < 2; j++) {
          const angleOffset = j === 0 ? -halfPairSpacing : halfPairSpacing;
          const angle = pairCenterAngle + angleOffset;

          // Add variance to distance and size
          const distanceMultiplier =
            1 + (Math.random() - 0.5) * 2 * config.distanceVariance;
          const sizeMultiplier =
            1 + (Math.random() - 0.5) * 2 * config.sizeVariance;

          newParticles.push({
            id: burstId * 1000 + i * 2 + j,
            x,
            y,
            angle,
            delay: Math.random() * 30,
            color,
            distance: config.distance * distanceMultiplier,
            size: Math.max(2, config.particleSize * sizeMultiplier)
          });
        }
      }

      setParticles(prev => [...prev, ...newParticles]);

      // Add ring if enabled
      if (config.showRing) {
        const newRing: BurstRing = { id: burstId, x, y };
        setRings(prev => [...prev, newRing]);

        // Clean up ring after animation
        setTimeout(() => {
          setRings(prev => prev.filter(r => r.id !== newRing.id));
        }, config.duration + 100);
      }

      // Clean up particles after animation
      setTimeout(() => {
        setParticles(prev =>
          prev.filter(p => !newParticles.find(np => np.id === p.id))
        );
      }, config.duration + 100);
    },
    [config]
  );

  const contextValue: ClickBurstContextValue = {
    triggerBurst,
    config
  };

  return (
    <ClickBurstContext.Provider value={contextValue}>
      <div ref={frameRef} className={cn('relative', className)}>
        {children}

        {/* Effect container */}
        <div
          className="pointer-events-none absolute inset-0 overflow-visible"
          aria-hidden="true"
        >
          {/* Rings */}
          {rings.map(ring => (
            <BurstRingElement key={ring.id} ring={ring} config={config} />
          ))}

          {/* Particles */}
          {particles.map(particle => (
            <BurstParticleElement
              key={particle.id}
              particle={particle}
              config={config}
            />
          ))}
        </div>

        {/* Local keyframes for the burst effect */}
        <style jsx global>{`
          @keyframes click-burst-particle {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) translate(0, 0) scale(1);
            }
            100% {
              opacity: var(--burst-fade, 0);
              transform: translate(-50%, -50%)
                translate(var(--burst-x), var(--burst-y))
                scale(var(--burst-scale, 0));
            }
          }

          @keyframes click-burst-ring-outline {
            0% {
              opacity: 0.8;
              transform: translate(-50%, -50%) scale(0);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1);
            }
          }

          @keyframes click-burst-ring-filled {
            0% {
              opacity: 0.6;
              transform: translate(-50%, -50%) scale(0);
            }
            50% {
              opacity: 0.3;
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.2);
            }
          }
        `}</style>
      </div>
    </ClickBurstContext.Provider>
  );
}

// =============================================================================
// BurstRing Element
// =============================================================================

interface BurstRingElementProps {
  ring: BurstRing;
  config: ClickBurstConfig;
}

function BurstRingElement({ ring, config }: BurstRingElementProps) {
  const isFilled = config.ringStyle === 'filled';
  // Use the first color or a default for the ring
  const ringColor = config.colors[0] || 'currentColor';

  return (
    <div
      className="absolute rounded-full"
      style={{
        left: ring.x,
        top: ring.y,
        width: config.ringSize,
        height: config.ringSize,
        borderWidth: isFilled ? 0 : 2,
        borderStyle: 'solid',
        borderColor: isFilled ? 'transparent' : ringColor,
        backgroundColor: isFilled ? ringColor : 'transparent',
        transform: 'translate(-50%, -50%) scale(0)',
        animation: `click-burst-ring-${isFilled ? 'filled' : 'outline'} ${config.duration * 0.6}ms ease-out forwards`
      }}
    />
  );
}

// =============================================================================
// BurstParticle Element
// =============================================================================

interface BurstParticleElementProps {
  particle: BurstParticle;
  config: ClickBurstConfig;
}

function BurstParticleElement({ particle, config }: BurstParticleElementProps) {
  const angleRad = (particle.angle * Math.PI) / 180;
  const translateX = Math.cos(angleRad) * particle.distance;
  const translateY = Math.sin(angleRad) * particle.distance;

  return (
    <div
      className="absolute rounded-full"
      style={{
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.color,
        transform: 'translate(-50%, -50%)',
        animation: `click-burst-particle ${config.duration}ms ease-out forwards`,
        animationDelay: `${particle.delay}ms`,
        ['--burst-x' as string]: `${translateX}px`,
        ['--burst-y' as string]: `${translateY}px`,
        ['--burst-fade' as string]: config.fade ? '0' : '1',
        ['--burst-scale' as string]: config.shrink ? '0' : '1'
      }}
    />
  );
}

// =============================================================================
// ClickBurstTarget Component
// =============================================================================

interface ClickBurstTargetProps {
  children: ReactNode;
  className?: string;
  /** Additional click handler (burst triggers automatically) */
  onClick?: (e: React.MouseEvent) => void;
  /** Disable the burst effect for this target */
  disabled?: boolean;
}

export function ClickBurstTarget({
  children,
  className,
  onClick,
  disabled = false
}: ClickBurstTargetProps) {
  const { triggerBurst, config } = useClickBurstContext();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!disabled && config.enabled) {
        triggerBurst(e.clientX, e.clientY);
      }
      onClick?.(e);
    },
    [triggerBurst, onClick, disabled, config.enabled]
  );

  return (
    <div className={cn('inline-block', className)} onClick={handleClick}>
      {children}
    </div>
  );
}

// =============================================================================
// Standalone Hook for manual triggering
// =============================================================================

export function useClickBurst() {
  const context = useContext(ClickBurstContext);
  return context?.triggerBurst ?? null;
}

// =============================================================================
// Note: Requires CSS keyframes in globals.css
// =============================================================================
// @keyframes click-burst-particle and @keyframes click-burst-ring
// are defined in src/styles/globals.css

// =============================================================================
// Convenience Exports
// =============================================================================

export { DEFAULT_CONFIG as CLICK_BURST_DEFAULT_CONFIG };
export type { ClickBurstConfig, ClickBurstFrameProps, ClickBurstTargetProps };
