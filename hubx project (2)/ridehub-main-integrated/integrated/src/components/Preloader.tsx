import React, { useEffect, useRef, useState } from 'react';

interface PreloaderProps {
  onComplete?: () => void;
  minDisplayTimeMs?: number;
}

const FRAME_COUNT = 118;
const SOURCE_FPS = 24;
const ANIMATION_DURATION = Math.round((FRAME_COUNT / SOURCE_FPS) * 1000); // 4917ms
const FADE_DURATION = 400; // 400ms fadeout
const CANVAS_BG_COLOR = '#FAF8F4'; // Brand Canvas color

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  // Store loaded images
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastRenderedIndexRef = useRef<number>(-1);
  const animationFrameIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const contentReadyRef = useRef<boolean>(false);

  useEffect(() => {
    // Check for user's reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let loadedCount = 0;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);

    // Preload all 118 frames asynchronously into memory
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, '0');
      img.src = `/preloader/frames/ezgif-frame-${paddedIndex}.jpg`;

      img.onload = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          imagesRef.current = images;
          setIsLoaded(true);
          contentReadyRef.current = true;
          
          if (prefersReducedMotion) {
            // Draw static last frame and trigger fadeout early
            renderStaticFrame(images[FRAME_COUNT - 1]);
            setTimeout(() => triggerFadeOut(), 600);
          } else {
            startPlayback();
          }
        }
      };

      img.onerror = () => {
        // Tolerant fallback: count even on error to prevent hanging
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          imagesRef.current = images;
          setIsLoaded(true);
          contentReadyRef.current = true;
          startPlayback();
        }
      };

      images[i - 1] = img;
    }

    const handleResize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      // Force redraw current frame on resize
      if (lastRenderedIndexRef.current >= 0 && imagesRef.current[lastRenderedIndexRef.current]) {
        drawFrame(imagesRef.current[lastRenderedIndexRef.current]);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      imagesRef.current = [];
    };
  }, []);

  const triggerFadeOut = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsRemoved(true);
      if (onComplete) onComplete();
    }, FADE_DURATION);
  };

  const drawFrame = (image: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !image.complete || image.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.width;
    const ch = canvas.height;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear with canvas color
    ctx.fillStyle = CANVAS_BG_COLOR;
    ctx.fillRect(0, 0, cw, ch);

    // Calculate aspect ratio fit (contain, never stretch or crop)
    const imgAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = cw / ch;

    let renderW = cw;
    let renderH = ch;
    let offsetX = 0;
    let offsetY = 0;

    // Scale down to fit gracefully inside viewport
    const maxScale = 0.85; // Keeps safe margins around the brand logo
    if (canvasAspect > imgAspect) {
      renderH = ch * maxScale;
      renderW = renderH * imgAspect;
    } else {
      renderW = cw * maxScale;
      renderH = renderW / imgAspect;
    }

    offsetX = (cw - renderW) / 2;
    offsetY = (ch - renderH) / 2;

    ctx.drawImage(image, offsetX, offsetY, renderW, renderH);
  };

  const renderStaticFrame = (image: HTMLImageElement) => {
    if (!image) return;
    drawFrame(image);
  };

  const startPlayback = () => {
    startTimeRef.current = performance.now();

    const loop = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      // Elapsed time drives exact frame index (seamless 24fps looping)
      const progress = (elapsed % ANIMATION_DURATION) / ANIMATION_DURATION;
      const frameIndex = Math.min(Math.floor(progress * FRAME_COUNT), FRAME_COUNT - 1);

      // Only redraw if frame changed
      if (frameIndex !== lastRenderedIndexRef.current) {
        lastRenderedIndexRef.current = frameIndex;
        const currentImg = imagesRef.current[frameIndex];
        if (currentImg) {
          drawFrame(currentImg);
        }
      }

      // Check if animation has completed at least one full cycle (or reached settled frame)
      // and content is ready to be revealed
      if (elapsed >= ANIMATION_DURATION && contentReadyRef.current && !isFadingOut) {
        triggerFadeOut();
        return;
      }

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);
  };

  if (isRemoved) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: CANVAS_BG_COLOR,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFadingOut ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms var(--ease-editorial)`,
        pointerEvents: isFadingOut ? 'none' : 'auto'
      }}
      aria-label="RideHub Loading Screen"
      role="status"
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100vw',
          height: '100vh',
          backgroundColor: CANVAS_BG_COLOR
        }}
      />
    </div>
  );
};
