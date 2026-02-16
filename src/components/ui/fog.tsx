/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import { motion } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';

type FogProps = {
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
  enableShaderLayer?: boolean;
  shaderFpsCap?: number;
  shaderSpeed?: number;
  shaderIterations?: number;
  shaderResolutionScale?: number;
  mode?: 'light' | 'dark';
  fogColor?: [number, number, number];
  paused?: boolean;
};

export const Fog = ({
  gradientFirst:
    _gradientFirst = 'radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .02) 50%, hsla(210, 100%, 45%, 0) 80%)',
  gradientSecond:
    _gradientSecond = 'radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .06) 0, hsla(210, 100%, 55%, .02) 80%, transparent 100%)',
  gradientThird:
    _gradientThird = 'radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .04) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)',
  translateY: _translateY = -350,
  width: _width = 560,
  height: _height = 1380,
  smallWidth: _smallWidth = 240,
  duration: _duration = 7,
  xOffset: _xOffset = 100,
  enableShaderLayer = true,
  shaderFpsCap = 15,
  shaderSpeed = 0.1,
  shaderIterations = 100,
  shaderResolutionScale = 1.0,
  mode = 'light',
  fogColor,
  paused = false
}: FogProps = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightningCanvasRef = useRef<HTMLCanvasElement>(null);
  const [shaderReady, setShaderReady] = useState(false);
  const shaderReadySetRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const pauseStartRef = useRef<number | null>(null);
  const pausedAccumRef = useRef(0);
  const resolvedFogColor =
    fogColor ?? (mode === 'light' ? [0.9, 0.92, 0.95] : [0.08, 0.09, 0.12]);
  const fogColorGlsl = resolvedFogColor.map(v => v.toFixed(3)).join(', ');
  const fogBlendMode = mode === 'light' ? 'screen' : 'multiply';

  useEffect(() => {
    if (pausedRef.current === paused) return;
    if (paused) {
      pauseStartRef.current = performance.now();
    } else if (pauseStartRef.current != null) {
      pausedAccumRef.current += performance.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const computed = window.getComputedStyle(parent);
    const shouldReset = computed.position === 'static';
    if (shouldReset) {
      parent.style.position = 'relative';
    }
    return () => {
      if (shouldReset) {
        parent.style.position = '';
      }
    };
  }, []);

  // Volumetric lightning layer rendered behind the existing mist.
  useEffect(() => {
    if (!enableShaderLayer) return;
    const canvas = lightningCanvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;

      float hash(float n) {
        return fract(sin(n) * 43758.5453123);
      }

      float getGlow(float dist, float radius, float intensity){
        dist = max(dist, 1e-5);
        return pow(radius / dist, intensity);
      }

      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        float n = dot(i, vec3(1.0, 57.0, 113.0));
        float res =
          mix(
            mix(mix(hash(n + 0.0),   hash(n + 1.0),   f.x),
                mix(hash(n + 57.0),  hash(n + 58.0),  f.x), f.y),
            mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y),
            f.z
          );
        return res;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;

        // Simple camera into a fog volume.
        vec3 ro = vec3(0.0, 0.0, -4.0);
        vec3 rd = normalize(vec3(uv, 1.5));

        // Global time.
        float t = iTime;

        // Clustered lightning in time: random cluster times and sizes.
        // Period/jitter are expressed in shader time; account for JS-side shaderSpeed
        // so the real-world spacing stays in a reasonable range.
        // Target ≈15s gaps on average ⇒ 15 * shaderSpeed in shader-time units.
        float basePeriod = ${(15 * shaderSpeed).toFixed(2)};
        float jitterRange = ${(3 * shaderSpeed).toFixed(2)};

        int baseIndex = int(floor(t / basePeriod));
        bool inCluster = false;
        float clusterStart = 0.0;
        float clusterEnd = 0.0;
        float clusterIndex = 0.0;

        for (int oi = -1; oi <= 1; oi++) {
          int ci = baseIndex + oi;
          float c = float(ci);
          float jitter = (hash(c * 13.1) - 0.5) * jitterRange;
          float start = c * basePeriod + jitter;
          float duration = 0.7 + hash(c * 17.3) * 0.4; // 0.7 - 1.2s cluster length
          float end = start + duration;
          if (t >= start && t <= end) {
            inCluster = true;
            clusterStart = start;
            clusterEnd = end;
            clusterIndex = c;
          }
        }

        if (!inCluster) {
          // No active lightning cluster: output black.
          gl_FragColor = vec4(0.0);
          return;
        }

        float clusterDuration = clusterEnd - clusterStart;
        float clusterLocalTime = t - clusterStart;

        // Random burst count per cluster: 1–3.
        int burstCount = 1 + int(floor(hash(clusterIndex * 23.7) * 3.0));
        if (burstCount < 1) burstCount = 1;
        if (burstCount > 3) burstCount = 3;
        float burstCountF = float(burstCount);

        float burstDuration = clusterDuration / burstCountF;
        int burstIndex = int(floor(clusterLocalTime / burstDuration));
        if (burstIndex < 0) burstIndex = 0;
        if (burstIndex > burstCount - 1) burstIndex = burstCount - 1;

        float subStartTime = float(burstIndex) * burstDuration;
        float subLocalTime = clusterLocalTime - subStartTime;
        float normTime = clamp(subLocalTime / burstDuration, 0.0, 1.0);

        // Sharp envelope and fast internal substructure.
        float envelope = exp(-18.0 * normTime);
        float subFlash = pow(abs(sin(normTime * 40.0)), 3.0);
        float intensityMask = envelope * (0.4 + 0.6 * subFlash);

        // Per-burst lightning base position.
        float bi = float(burstIndex);
        vec3 baseSeed = vec3(
          hash(clusterIndex * 17.0 + bi * 3.1) - 0.5,
          hash(clusterIndex * 19.0 + bi * 2.7) - 0.5,
          hash(clusterIndex * 23.0 + bi * 4.3) - 0.5
        );
        vec3 basePos = vec3(
          baseSeed.x * 1.5,
          0.2 + abs(baseSeed.y) * 1.3,
          baseSeed.z * 1.5
        );

        // Within a single burst, make the bolt "jump" between a few nearby spots
        // instead of staying perfectly fixed.
        int subSteps = 4;
        int subIndex = int(floor(normTime * float(subSteps)));
        if (subIndex < 0) subIndex = 0;
        if (subIndex > subSteps - 1) subIndex = subSteps - 1;
        float sj = float(subIndex);

        vec3 jumpSeed = vec3(
          hash(clusterIndex * 31.0 + bi * 7.1 + sj * 1.7) - 0.5,
          hash(clusterIndex * 37.0 + bi * 5.3 + sj * 2.3) - 0.5,
          hash(clusterIndex * 41.0 + bi * 9.7 + sj * 3.1) - 0.5
        );
        vec3 jumpOffset = vec3(
          jumpSeed.x * 0.6,
          jumpSeed.y * 0.4,
          jumpSeed.z * 0.6
        );

        vec3 lightningCenter = basePos + jumpOffset;

        float glowAccum = 0.0;
        float maxDistance = 10.0;
        int steps = 48;
        float stepSize = maxDistance / float(steps);

        vec3 pos = ro;
        for (int i = 0; i < 48; i++) {
          float travel = float(i) * stepSize;
          pos = ro + rd * travel;

          // Soft fog volume using noise.
          float d = length(pos) * 0.4;
          float fogBase = exp(-d * d * 1.5);
          float n = noise(pos * 1.2 + t * 0.3);
          float density = fogBase * (0.4 + 0.6 * n);

          // Distance-based glow from lightning center, weighted by density.
          float distToBolt = length(pos - lightningCenter);
          float localGlow = getGlow(distToBolt, 0.6, 2.5) * density;
          glowAccum += localGlow * stepSize;
        }

        glowAccum *= intensityMask;

        vec3 boltColour = vec3(0.3, 0.6, 1.0);
        vec3 col = boltColour * glowAccum * 3.0;

        // Slight tone mapping for stability.
        col = col / (1.0 + col);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const createProgram = (
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader
    ) => {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!vertexShader || !fragmentShader) {
      console.error('Lightning shader compilation failed');
      return;
    }
    const program = createProgram(vertexShader, fragmentShader);
    if (!program) {
      console.error('Lightning program linking failed');
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const timeLocation = gl.getUniformLocation(program, 'iTime');

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      const scale = Math.max(Math.min(shaderResolutionScale, 1), 0.1);
      canvas.width = rect.width * pixelRatio * scale;
      canvas.height = rect.height * pixelRatio * scale;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    const start = performance.now();
    let lastFrame = 0;
    let rafId: number;
    const render = (now: number) => {
      const time = (now - start) / 1000;
      const scaledTime = time * shaderSpeed;
      if (now - lastFrame > 1000 / shaderFpsCap) {
        lastFrame = now;
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, scaledTime);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [enableShaderLayer, shaderFpsCap, shaderSpeed, shaderResolutionScale]);

  useEffect(() => {
    if (!enableShaderLayer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;

      vec4 tanhVec(vec4 x) {
        vec4 e2x = exp(2.0 * x);
        return (e2x - 1.0) / (e2x + 1.0);
      }

      void mainImage(out vec4 o, vec2 fragCoord) {
        float d = 0.0;
        float t = iTime;
        vec3 p = vec3(iResolution, 0.0);
        mat2 r = mat2(cos(0.75 + vec4(0.0, 33.0, 11.0, 0.0)));
        vec2 u = fragCoord;
        u = (u - iResolution.xy * 0.5) / iResolution.y;

        vec4 accum = vec4(0.0);

        for (float iter = 0.0; iter < ${shaderIterations.toFixed(1)}; iter += 1.0) {
          p = vec3(u * d, d - 32.0);
          p.yz *= r;
          p.y += t * 0.01;

          float swirl = 0.01;
          for (int j = 0; j < 10; j++) {
            if (swirl >= 6.0) break;
            p.yz += cos(t + p.zx * 0.02);
            p.yz -= abs(dot(
              sin(0.02 * p.z * swirl + 0.03 * p.x + 1.4 * t + 0.32 * p / swirl),
              vec3(swirl)
            ));
            swirl += swirl;
          }

          p *= vec3(0.3, 0.6, 1.0);
          float density = 0.3 + 0.27 * abs(4.0 - length(p.xy));
          d += density;
          accum += vec4(10.0 / density);
        }

        o = tanhVec(accum / 1000.0);
      }

      void main() {
        vec4 density;
        mainImage(density, gl_FragCoord.xy);
        
        float fogAmount = density.r;
        
        vec3 fogColor = vec3(${fogColorGlsl});
        gl_FragColor = vec4(fogColor * fogAmount, fogAmount);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const createProgram = (
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader
    ) => {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!vertexShader || !fragmentShader) {
      console.error('Shader compilation failed');
      return;
    }
    const program = createProgram(vertexShader, fragmentShader);
    if (!program) {
      console.error('Program linking failed');
      return;
    }
    console.log('Fog shader initialized successfully');

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const timeLocation = gl.getUniformLocation(program, 'iTime');

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      const scale = Math.max(Math.min(shaderResolutionScale, 1), 0.1);
      canvas.width = rect.width * pixelRatio * scale;
      canvas.height = rect.height * pixelRatio * scale;
      gl.viewport(0, 0, canvas.width, canvas.height);
      console.log(
        'Canvas resized:',
        canvas.width,
        canvas.height,
        'parent:',
        rect.width,
        rect.height
      );
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    const start = performance.now();
    let lastFrame = 0;
    let rafId: number;
    const render = (now: number) => {
      if (!pausedRef.current) {
        const adjustedTime =
          (now - start - pausedAccumRef.current) / 1000;
        const scaledTime = adjustedTime * shaderSpeed;
        if (now - lastFrame > 1000 / shaderFpsCap) {
          lastFrame = now;
          gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
          gl.uniform1f(timeLocation, scaledTime);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          if (!shaderReadySetRef.current) {
            shaderReadySetRef.current = true;
            setShaderReady(true);
            console.log(
              'Fog shader first frame rendered, opacity should fade in'
            );
          }
        }
      }
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [
    enableShaderLayer,
    shaderFpsCap,
    shaderSpeed,
    shaderIterations,
    shaderResolutionScale,
    fogColorGlsl
  ]);

  return (
    <motion.div
      ref={rootRef}
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      transition={{
        duration: 1.5
      }}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    >
      {enableShaderLayer && (
        <canvas
          ref={lightningCanvasRef}
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            mixBlendMode: 'screen',
            opacity: 0.4,
            imageRendering: 'auto',
            width: '100%',
            height: '100%'
          }}
        />
      )}
      <motion.div
        animate={{
          x: [0, _xOffset, 0]
        }}
        transition={{
          duration: _duration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
        className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full"
      >
        <div
          style={{
            transform: `translateY(${_translateY}px) rotate(-45deg)`,
            background: _gradientFirst,
            width: `${_width}px`,
            height: `${_height}px`
          }}
          className={`absolute top-0 left-0`}
        />

        <div
          style={{
            transform: 'rotate(-45deg) translate(5%, -50%)',
            background: _gradientSecond,
            width: `${_smallWidth}px`,
            height: `${_height}px`
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />

        <div
          style={{
            transform: 'rotate(-45deg) translate(-180%, -70%)',
            background: _gradientThird,
            width: `${_smallWidth}px`,
            height: `${_height}px`
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />
      </motion.div>

      <motion.div
        animate={{
          x: [0, -_xOffset, 0]
        }}
        transition={{
          duration: _duration,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
        className="pointer-events-none absolute top-0 right-0 z-0 h-full w-full"
      >
        <div
          style={{
            transform: `translateY(${_translateY}px) rotate(45deg)`,
            background: _gradientFirst,
            width: `${_width}px`,
            height: `${_height}px`
          }}
          className={`absolute top-0 right-0`}
        />

        <div
          style={{
            transform: 'rotate(45deg) translate(-5%, -50%)',
            background: _gradientSecond,
            width: `${_smallWidth}px`,
            height: `${_height}px`
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />

        <div
          style={{
            transform: 'rotate(45deg) translate(180%, -70%)',
            background: _gradientThird,
            width: `${_smallWidth}px`,
            height: `${_height}px`
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />
      </motion.div>

      {enableShaderLayer && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-700"
          style={{
            mixBlendMode: fogBlendMode,
            opacity: shaderReady ? 0.15 : 0,
            imageRendering: 'auto',
            width: '100%',
            height: '100%'
          }}
        />
      )}
    </motion.div>
  );
};
