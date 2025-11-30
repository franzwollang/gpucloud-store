'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

import { cn } from '@/lib/style';

// =============================================================================
// Types
// =============================================================================

interface Vec2 {
  x: number;
  y: number;
}

interface PredatorConfig {
  /** Spring stiffness - higher = snappier return to center */
  springK: number;
  /** Velocity damping - higher = less bouncy (0-1) */
  damping: number;
  /** How much mouse acceleration affects button movement */
  accelScale: number;
  /** Maximum displacement from center in pixels */
  maxDisplacement: number;
  /** Distance from button where it freezes for clicking */
  freezeRadius: number;
  /** Amplitude of vibration when frozen */
  vibrateAmplitude: number;
  /** Whether the effect is enabled */
  enabled: boolean;
}

interface PredatorContextValue {
  /** Ref to the frame container element */
  frameRef: React.RefObject<HTMLDivElement | null>;
  /** Current mouse position relative to frame center */
  mousePos: React.RefObject<Vec2>;
  /** Whether mouse is inside the frame */
  isMouseInFrame: React.RefObject<boolean>;
  /** Configuration options */
  config: PredatorConfig;
  /** Register a target for animation */
  registerTarget: (id: string) => void;
  /** Unregister a target */
  unregisterTarget: (id: string) => void;
}

// =============================================================================
// Constants & Defaults
// =============================================================================

const DEFAULT_CONFIG: PredatorConfig = {
  springK: 2.0,
  damping: 6.0,
  accelScale: 0.4,
  maxDisplacement: 100,
  freezeRadius: 50,
  vibrateAmplitude: 1.5,
  enabled: true
};

// =============================================================================
// Context
// =============================================================================

const PredatorContext = createContext<PredatorContextValue | null>(null);

function usePredatorContext() {
  const context = useContext(PredatorContext);
  if (!context) {
    throw new Error(
      'PredatorTarget must be used within a PredatorFrame component'
    );
  }
  return context;
}

// =============================================================================
// Utility Functions
// =============================================================================

function vec2Zero(): Vec2 {
  return { x: 0, y: 0 };
}

function vec2Add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

function vec2Sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

function vec2Scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

function vec2Magnitude(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function vec2Normalize(v: Vec2): Vec2 {
  const mag = vec2Magnitude(v);
  if (mag === 0) return vec2Zero();
  return { x: v.x / mag, y: v.y / mag };
}

function vec2Clamp(v: Vec2, maxMag: number): Vec2 {
  const mag = vec2Magnitude(v);
  if (mag <= maxMag) return v;
  return vec2Scale(vec2Normalize(v), maxMag);
}

function vec2Distance(a: Vec2, b: Vec2): number {
  return vec2Magnitude(vec2Sub(a, b));
}

// =============================================================================
// PredatorFrame Component
// =============================================================================

interface PredatorFrameProps {
  children: ReactNode;
  className?: string;
  /** Override default configuration */
  config?: Partial<PredatorConfig>;
  /** Called when mouse enters/leaves the frame */
  onMousePresenceChange?: (isInside: boolean) => void;
}

export function PredatorFrame({
  children,
  className,
  config: configOverrides,
  onMousePresenceChange
}: PredatorFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef<Vec2>(vec2Zero());
  const isMouseInFrame = useRef(false);
  const registeredTargets = useRef<Set<string>>(new Set());

  const config: PredatorConfig = {
    ...DEFAULT_CONFIG,
    ...configOverrides
  };

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectiveConfig: PredatorConfig = {
    ...config,
    enabled: config.enabled && !prefersReducedMotion
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!frameRef.current || !effectiveConfig.enabled) return;

      const rect = frameRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Position relative to frame center
      mousePos.current = {
        x: e.clientX - rect.left - centerX,
        y: e.clientY - rect.top - centerY
      };
    },
    [effectiveConfig.enabled]
  );

  const handleMouseEnter = useCallback(() => {
    isMouseInFrame.current = true;
    onMousePresenceChange?.(true);
  }, [onMousePresenceChange]);

  const handleMouseLeave = useCallback(() => {
    isMouseInFrame.current = false;
    onMousePresenceChange?.(false);
  }, [onMousePresenceChange]);

  const registerTarget = useCallback((id: string) => {
    registeredTargets.current.add(id);
  }, []);

  const unregisterTarget = useCallback((id: string) => {
    registeredTargets.current.delete(id);
  }, []);

  const contextValue: PredatorContextValue = {
    frameRef,
    mousePos,
    isMouseInFrame,
    config: effectiveConfig,
    registerTarget,
    unregisterTarget
  };

  return (
    <PredatorContext.Provider value={contextValue}>
      <div
        ref={frameRef}
        className={cn('relative', className)}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </PredatorContext.Provider>
  );
}

// =============================================================================
// PredatorTarget Component
// =============================================================================

interface PredatorTargetProps {
  children: ReactNode;
  className?: string;
  /** Unique identifier for this target (auto-generated if not provided) */
  id?: string;
}

export function PredatorTarget({
  children,
  className,
  id: providedId
}: PredatorTargetProps) {
  const {
    frameRef,
    mousePos,
    isMouseInFrame,
    config,
    registerTarget,
    unregisterTarget
  } = usePredatorContext();

  // Generate stable ID
  const idRef = useRef(
    providedId ?? `predator-target-${Math.random().toString(36).slice(2, 9)}`
  );

  // Physics state (refs to avoid re-renders)
  const buttonPos = useRef<Vec2>(vec2Zero());
  const buttonVel = useRef<Vec2>(vec2Zero());
  const prevMousePos = useRef<Vec2>(vec2Zero());
  const mouseVel = useRef<Vec2>(vec2Zero());
  const prevMouseVel = useRef<Vec2>(vec2Zero());
  const lastTime = useRef<number>(0);

  // Render state
  const [transform, setTransform] = useState<Vec2>(vec2Zero());
  const [frozenDisplay, setFrozenDisplay] = useState(false);

  // Frozen state tracking for hysteresis (ref for animation loop, state for display)
  const isFrozen = useRef(false);

  // Register/unregister with frame
  useEffect(() => {
    const id = idRef.current;
    registerTarget(id);
    return () => unregisterTarget(id);
  }, [registerTarget, unregisterTarget]);

  // Animation loop
  useEffect(() => {
    if (!config.enabled) {
      setTransform(vec2Zero());
      return;
    }

    let rafId: number;
    lastTime.current = performance.now();

    function animate(currentTime: number) {
      // Calculate delta time, cap at 50ms to prevent huge jumps
      const dt = Math.min((currentTime - lastTime.current) / 1000, 0.05);
      lastTime.current = currentTime;

      // Skip if dt is too small (prevents division issues)
      if (dt < 0.001) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      const currentMousePos = mousePos.current;
      const mouseInFrame = isMouseInFrame.current;

      // Calculate mouse velocity
      if (mouseInFrame) {
        mouseVel.current = vec2Scale(
          vec2Sub(currentMousePos, prevMousePos.current),
          1 / dt
        );
      } else {
        // Reset mouse velocity when outside frame
        mouseVel.current = vec2Zero();
      }

      // Calculate mouse acceleration
      const mouseAcc = vec2Scale(
        vec2Sub(mouseVel.current, prevMouseVel.current),
        1 / dt
      );

      // Store for next frame
      prevMousePos.current = { ...currentMousePos };
      prevMouseVel.current = { ...mouseVel.current };

      // Check freeze zone - distance from SCREEN position of button to mouse
      // Both positions are relative to frame center, so distance calc is correct
      const distToMouse = vec2Distance(currentMousePos, buttonPos.current);

      // Hysteresis for stable freeze detection (30% band)
      const enterFreezeThreshold = config.freezeRadius;
      const exitFreezeThreshold = config.freezeRadius * 1.3;

      // Determine frozen state with hysteresis
      const wasFrozen = isFrozen.current;
      let frozen = wasFrozen;

      if (mouseInFrame) {
        if (!wasFrozen && distToMouse < enterFreezeThreshold) {
          // Enter freeze zone
          frozen = true;
        } else if (wasFrozen && distToMouse > exitFreezeThreshold) {
          // Exit freeze zone
          frozen = false;
        }
        // Otherwise maintain current state (hysteresis)
      } else {
        // Mouse left frame entirely - unfreeze
        frozen = false;
      }

      isFrozen.current = frozen;

      // Update display state for data attribute (throttled)
      if (frozen !== frozenDisplay) {
        setFrozenDisplay(frozen);
      }

      let finalPos: Vec2;

      if (frozen) {
        // ========== FROZEN STATE ==========
        // Stop all physics - kill velocity completely
        buttonVel.current = vec2Zero();

        // Add subtle vibration effect
        const vibration: Vec2 = {
          x: (Math.random() - 0.5) * 2 * config.vibrateAmplitude,
          y: (Math.random() - 0.5) * 2 * config.vibrateAmplitude
        };

        // Keep button at current position, just add vibration for display
        finalPos = vec2Add(buttonPos.current, vibration);
      } else {
        // ========== ACTIVE STATE ==========
        // Calculate direction from button to cursor
        const dirToCursor = vec2Normalize(
          vec2Sub(currentMousePos, buttonPos.current)
        );

        // Chase force: apply mouse acceleration magnitude toward cursor
        const accMagnitude = Math.min(vec2Magnitude(mouseAcc), 5000);
        const chaseForce = mouseInFrame
          ? vec2Scale(dirToCursor, accMagnitude * config.accelScale)
          : vec2Zero();

        // Spring force: only active when NOT chasing (allows free movement when chasing)
        const isActivelyChasing = accMagnitude > 50;
        const springForce = isActivelyChasing
          ? vec2Zero()
          : vec2Scale(buttonPos.current, -config.springK);

        // Damping force: opposes velocity
        const dampingForce = vec2Scale(buttonVel.current, -config.damping);

        // Total force
        const totalForce = vec2Add(
          vec2Add(chaseForce, springForce),
          dampingForce
        );

        // Update velocity
        buttonVel.current = vec2Add(
          buttonVel.current,
          vec2Scale(totalForce, dt)
        );

        // Update position
        buttonPos.current = vec2Add(
          buttonPos.current,
          vec2Scale(buttonVel.current, dt)
        );

        // Clamp displacement
        buttonPos.current = vec2Clamp(
          buttonPos.current,
          config.maxDisplacement
        );

        finalPos = buttonPos.current;
      }

      setTransform(finalPos);
      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [config, mousePos, isMouseInFrame, frameRef, frozenDisplay]);

  // Handle visibility change (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastTime.current = 0;
      } else {
        lastTime.current = performance.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className={cn('inline-block', className)}
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        willChange: config.enabled ? 'transform' : 'auto'
      }}
      data-predator-frozen={frozenDisplay}
    >
      {children}
    </div>
  );
}

// =============================================================================
// Convenience Exports
// =============================================================================

export { DEFAULT_CONFIG as PREDATOR_DEFAULT_CONFIG };
export type { PredatorConfig, PredatorFrameProps, PredatorTargetProps };
