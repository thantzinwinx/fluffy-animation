"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { getSceneTarget, type SceneSection } from "./sceneNavigation";
import { getCharacterLayout, getCrowdLayout, getNextTitleLayout } from "./canvasLayout";
import { shouldRunCanvas } from "./canvasRenderPolicy";
import { resizeCanvasSurface } from "./canvasSurface";

const BUBBLE_LOOP_MS = 7000;
const FRAME_INTERVAL_MS = 1000 / 60;
const BUBBLE_TRACKS = [
  { x: 0, phase: 0 },
  { x: 0.5, phase: 0.34 },
  { x: 1, phase: 0.68 },
] as const;

type CrowdTile = {
  x: number;
  y: number;
  size: number;
  rotation: number;
  bounceLevel: number;
  exitOrder: number;
  layer: "back" | "front";
};

const seeded = (seed: number) => {
  const value = Math.sin(seed * 127.1) * 43758.5453;
  return value - Math.floor(value);
};

function buildCrowd(width: number, height: number): CrowdTile[] {
  const { columns, rows, split, stageHeight, stageWidth, tileSize } = getCrowdLayout(
    width,
    height,
  );
  const tiles: CrowdTile[] = [];
  let index = 0;

  for (let row = -2; row <= rows; row += 1) {
    for (let column = -1; column <= columns; column += 1) {
      const offset = Math.abs(row % 2) === 1 ? 0.5 : 0;
      const x =
        width / 2 +
        ((column + offset + (seeded(index) - 0.5) * 0.16) / columns - 0.5) * stageWidth;
      const y =
        height / 2 +
        (row / rows - 0.5) * stageHeight +
        (seeded(index + 31) - 0.5) * stageHeight * 0.075;
      tiles.push({
        x,
        y,
        size: tileSize * (0.94 + seeded(index + 7) * 0.12),
        rotation: (seeded(index + 13) - 0.5) * 0.14,
        bounceLevel: Math.floor(seeded(index + 59) * 4),
        exitOrder: seeded(index + 83),
        layer: y >= split ? "front" : "back",
      });
      index += 1;
    }
  }

  return tiles.sort((a, b) => a.y - b.y);
}

function drawImageCentered(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (!image.naturalWidth) return;
  context.drawImage(image, x - width / 2, y - height / 2, width, height);
}


type CanvasProps = {
  onSectionChange?: (section: SceneSection) => void;
  onReady?: () => void;
};

export function Canvas({ onSectionChange, onReady }: CanvasProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<SceneSection>("hero");
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const stateRef = useRef({ crowdDrop: 0, characterProgress: 0, nextAlpha: 0, logoAlpha: 0 });

  useEffect(() => {
    const state = stateRef.current;

    const navigate = () => {
      if (timelineRef.current?.isActive()) return;
      const target = getSceneTarget(sectionRef.current);
      sectionRef.current = target;
      onSectionChange?.(target);

      if (target === "next") {
        timelineRef.current = gsap
          .timeline()
          .to(state, { crowdDrop: 1, duration: 1.2, ease: "power3.inOut" }, 0)
          .to(state, { characterProgress: 1, duration: 1.05, ease: "power2.inOut" }, 0.12)
          .to(state, { nextAlpha: 1, duration: 0.32 }, 0.38)
          .to(state, { logoAlpha: 1, duration: 0.34, ease: "power2.out" }, 0.6);
        return;
      }

      timelineRef.current = gsap
        .timeline()
        .to(state, { crowdDrop: 0, duration: 1.2, ease: "power3.inOut" }, 0)
        .to(state, { characterProgress: 0, duration: 1.05, ease: "power2.inOut" }, 0.05)
        .to(state, { logoAlpha: 0, duration: 0.3, ease: "power1.out" }, 0)
        .to(state, { nextAlpha: 0, duration: 0.35 }, 0.28);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 8) return;
      navigate();
    };

    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const nextY = event.touches[0]?.clientY ?? touchY;
      if (Math.abs(touchY - nextY) < 28) return;
      touchY = nextY;
      navigate();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const keys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      navigate();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, [onSectionChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const human = new Image();
    const crewImage = new Image();
    const bubbles = new Image();
    const logo = new Image();
    const bodyFontFamily =
      getComputedStyle(document.documentElement).getPropertyValue("--font-body").trim() ||
      "sans-serif";

    let crowd: CrowdTile[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let compact = false;
    let frame = 0;
    let readyImages = 0;

    const drawCrowdTile = (tile: CrowdTile, elapsed: number, dropProgress: number) => {
      if (!crewImage.naturalWidth) return;
      const bounceAngle = (elapsed / 800) * Math.PI * 2 + tile.bounceLevel * (Math.PI / 2);
      const bounce = (Math.cos(bounceAngle) - 1) * 10;
      const staggerWindow = 0.1;
      const localDrop = Math.max(
        0,
        Math.min(1, (dropProgress - tile.exitOrder * staggerWindow) / (1 - staggerWindow)),
      );
      const easedDrop = localDrop * localDrop * (3 - 2 * localDrop);
      const exitX = width - tile.x + tile.size * (0.72 + tile.exitOrder * 0.2);
      const exitY = height - tile.y + tile.size * (0.72 + tile.exitOrder * 0.2);

      context.save();
      context.translate(tile.x + exitX * easedDrop, tile.y + bounce + exitY * easedDrop);
      context.rotate(tile.rotation + easedDrop * (tile.exitOrder - 0.5) * 0.18);
      drawImageCentered(context, crewImage, 0, 0, tile.size, tile.size);
      context.restore();
    };

    const drawCrowd = (layer: CrowdTile["layer"], elapsed: number) => {
      const drop = stateRef.current.crowdDrop;
      crowd
        .filter((tile) => tile.layer === layer)
        .forEach((tile) => drawCrowdTile(tile, elapsed, drop));
    };

    const paint = (elapsed: number) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);

      if (bubbles.naturalWidth && stateRef.current.nextAlpha > 0.001) {
        const bubbleWidth = compact
          ? Math.max(width * 1.05, Math.min(height * 0.58, 620))
          : Math.max(680, Math.min(width * 0.5, 980));
        const bubbleHeight = bubbleWidth * (bubbles.naturalHeight / bubbles.naturalWidth);

        context.save();
        context.globalAlpha = stateRef.current.nextAlpha;
        BUBBLE_TRACKS.forEach((track) => {
          const bubbleX = width * track.x - bubbleWidth / 2;
          const phaseOffset = track.phase * bubbleHeight;
          const bubbleY = -(
            ((elapsed / BUBBLE_LOOP_MS) * bubbleHeight + phaseOffset) %
            bubbleHeight
          );
          context.drawImage(bubbles, bubbleX, bubbleY, bubbleWidth, bubbleHeight);
          context.drawImage(bubbles, bubbleX, bubbleY + bubbleHeight, bubbleWidth, bubbleHeight);
        });
        context.restore();
      }

      if (stateRef.current.logoAlpha > 0.001 && logo.naturalWidth) {
        const titleLayout = getNextTitleLayout(width, height, compact);
        const logoWidth = titleLayout.logoWidth;
        const logoHeight = logoWidth * (logo.naturalHeight / logo.naturalWidth);
        context.save();
        context.globalAlpha = stateRef.current.logoAlpha * stateRef.current.nextAlpha;
        drawImageCentered(context, logo, width / 2, titleLayout.logoY, logoWidth, logoHeight);
        context.font = `700 ${compact ? 10 : 12}px ${bodyFontFamily}, sans-serif`;
        context.fillStyle = "#0b3f96";
        context.textAlign = "center";
        context.letterSpacing = compact ? "3px" : "5px";
        context.restore();
      }

      drawCrowd("back", elapsed);

      if (human.naturalWidth) {
        const progress = stateRef.current.characterProgress;
        const characterLayout = getCharacterLayout({ width, height, compact, progress });
        const imageHeight = characterLayout.height;
        const imageWidth =
          imageHeight * (human.naturalWidth / human.naturalHeight);
        const bounceAngle = (elapsed / 800) * Math.PI * 2;
        const bounceTravel = Math.max(28, Math.min(height * 0.035, 42));
        const bounce =
          (Math.cos(bounceAngle) - 1) * (bounceTravel / 2);

        context.save();
        context.translate(characterLayout.x, characterLayout.y + bounce);
        context.rotate((-Math.PI / 2) * progress);
        context.drawImage(human, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
        context.restore();
      }

      drawCrowd("front", elapsed);
    };

    let lastDrawAt = 0;
    const draw = (elapsed: number) => {
      frame = 0;
      if (!shouldRunCanvas({ documentHidden: document.hidden, revealed: true })) return;
      if (window.innerWidth !== width || window.innerHeight !== height) {
        resize();
      }
      if (elapsed - lastDrawAt < FRAME_INTERVAL_MS - 1) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      lastDrawAt = elapsed;
      paint(elapsed);
      frame = window.requestAnimationFrame(draw);
    };

    const startDrawing = () => {
      if (!shouldRunCanvas({ documentHidden: document.hidden, revealed: true }) || frame) {
        return;
      }
      lastDrawAt = 0;
      frame = window.requestAnimationFrame(draw);
    };

    const resize = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      const nextCompact = nextWidth < 768;
      const nextDpr = Math.min(window.devicePixelRatio || 1, nextCompact ? 1.35 : 1.75);
      if (
        width === nextWidth &&
        height === nextHeight &&
        dpr === nextDpr &&
        compact === nextCompact
      ) {
        return;
      }
      width = nextWidth;
      height = nextHeight;
      compact = nextCompact;
      dpr = nextDpr;
      crowd = buildCrowd(width, height);
      resizeCanvasSurface(canvas, { width, height, dpr }, () => paint(performance.now()));
    };

    let onReadyCalled = false;
    const startWhenReady = () => {
      readyImages += 1;
      if (readyImages !== 4 || onReadyCalled) return;
      onReadyCalled = true;
      onReady?.();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        return;
      }
      startDrawing();
    };

    human.onload = startWhenReady;
    human.onerror = startWhenReady;
    crewImage.onload = startWhenReady;
    crewImage.onerror = startWhenReady;
    bubbles.onload = startWhenReady;
    bubbles.onerror = startWhenReady;
    logo.onload = startWhenReady;
    logo.onerror = startWhenReady;
    human.src = "/assets/human.webp";
    crewImage.src = "/assets/crew.webp";
    bubbles.src = "/assets/bubbles.webp";
    logo.src = "/assets/logo.webp";

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    document.addEventListener("visibilitychange", onVisibilityChange);
    startDrawing();

    return () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
    };
  }, [onReady]);

  return (
    <main ref={rootRef} id="hero" className="relative h-svh min-h-0 bg-white">
      <div className="relative isolate h-svh w-full overflow-hidden [contain:strict]">
        <canvas
          ref={canvasRef}
          className="block h-full w-full touch-pan-y"
          role="img"
          aria-label="A lively crowd of Fluffy Hugs characters"
        />
      </div>
      <section
        id="next-section"
        className="pointer-events-none absolute inset-0"
        aria-label="Floating Human"
      >
        <h2 className="sr-only">Fluffy Hugs float together</h2>
      </section>
    </main>
  );
}
