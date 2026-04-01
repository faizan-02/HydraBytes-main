'use client';

import { useEffect, useRef } from 'react';

interface OrbProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
}

export default function Orb({
  hue = 282,
  hoverIntensity = 5,
  rotateOnHover = true,
  forceHoverState = false,
}: OrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let gl: WebGLRenderingContext | null = null;

    const canvas = canvasRef.current;
    if (!canvas) return;

    gl = canvas.getContext('webgl', {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uHue;
      uniform float uHoverIntensity;
      uniform float uRotateOnHover;
      uniform float uForceHover;

      #define PI 3.14159265359
      #define TWO_PI 6.28318530718

      vec3 hsl2rgb(float h, float s, float l) {
        vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
      }

      mat2 rotate2d(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float total = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
          total += smoothNoise(p) * amplitude;
          p *= 2.0;
          amplitude *= 0.5;
        }
        return total;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
        vec2 mouse = (uMouse - 0.5 * uResolution) / min(uResolution.x, uResolution.y);

        float t = uTime * 0.3;

        // Rotation based on hover
        float rotAngle = t * 0.2;
        if (uRotateOnHover > 0.5 || uForceHover > 0.5) {
          rotAngle += length(mouse) * uHoverIntensity * 0.1;
        }
        uv *= rotate2d(rotAngle);

        // Distance from center
        float dist = length(uv);

        // Create organic orb shape with FBM
        float angle = atan(uv.y, uv.x);
        float radius = 0.35 + 0.08 * fbm(vec2(angle * 2.0 + t, t * 0.5));
        radius += 0.05 * sin(angle * 3.0 + t * 1.5);
        radius += 0.03 * sin(angle * 5.0 - t * 2.0);

        // Mouse influence on orb shape
        float mouseInfluence = 0.0;
        if (uForceHover > 0.5) {
          mouseInfluence = uHoverIntensity * 0.015;
        } else {
          float mouseDist = length(uv - mouse);
          mouseInfluence = smoothstep(0.5, 0.0, mouseDist) * uHoverIntensity * 0.02;
        }
        radius += mouseInfluence;

        // Orb glow
        float orbEdge = smoothstep(radius + 0.02, radius - 0.02, dist);
        float glow = smoothstep(radius + 0.25, radius, dist);
        float innerGlow = smoothstep(radius, 0.0, dist);

        // Color
        float hueShift = uHue / 360.0;
        float hueVar = sin(angle * 2.0 + t) * 0.05;

        vec3 coreColor = hsl2rgb(hueShift + hueVar, 0.8, 0.55);
        vec3 glowColor = hsl2rgb(hueShift + 0.08 + hueVar, 0.9, 0.4);
        vec3 outerGlow = hsl2rgb(hueShift - 0.05, 0.7, 0.25);

        // Compose
        vec3 color = vec3(0.0);
        color += outerGlow * glow * 0.6;
        color += coreColor * orbEdge;
        color += glowColor * innerGlow * 0.5;

        // Noise texture on surface
        float surfaceNoise = fbm(uv * 8.0 + t * 0.5);
        color += vec3(surfaceNoise * 0.08) * orbEdge;

        // Alpha
        float alpha = max(glow * 0.4, orbEdge);
        alpha = clamp(alpha, 0.0, 1.0);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    const uHueUniform = gl.getUniformLocation(program, 'uHue');
    const uHoverIntensityUniform = gl.getUniformLocation(program, 'uHoverIntensity');
    const uRotateOnHoverUniform = gl.getUniformLocation(program, 'uRotateOnHover');
    const uForceHoverUniform = gl.getUniformLocation(program, 'uForceHover');

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    const startTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = rect.height - (e.clientY - rect.top);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = parent.clientWidth + 'px';
      canvas.style.height = parent.clientHeight + 'px';
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const render = () => {
      if (!gl) return;
      const time = (performance.now() - startTime) / 1000;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTime, time);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseX * (Math.min(window.devicePixelRatio, 2)), mouseY * (Math.min(window.devicePixelRatio, 2)));
      gl.uniform1f(uHueUniform, hue);
      gl.uniform1f(uHoverIntensityUniform, hoverIntensity);
      gl.uniform1f(uRotateOnHoverUniform, rotateOnHover ? 1.0 : 0.0);
      gl.uniform1f(uForceHoverUniform, forceHoverState ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
        }}
      />
    </div>
  );
}
