import { useEffect, type RefObject } from "react";
import { getCharacterLayout, getCrowdLayout, getNextTitleLayout } from "./canvasLayout";
import { shouldRunCanvas } from "./canvasRenderPolicy";
import { resizeCanvasSurface } from "./canvasSurface";
import type { CanvasAssets } from "./canvasAssets";
import type { CanvasState } from "./canvasState";

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

type UseCanvasDrawArgs = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  rootRef: RefObject<HTMLElement | null>;
  assets: CanvasAssets | null;
  stateRef: RefObject<CanvasState>;
  onReady?: () => void;
  reducedMotion: boolean;
};

export function useCanvasDraw({
  canvasRef,
  rootRef,
  assets,
  stateRef,
  onReady,
  reducedMotion,
}: UseCanvasDrawArgs) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    let crowd: CrowdTile[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let compact = false;
    let frame = 0;

    const drawCrowdTile = (tile: CrowdTile, elapsed: number, dropProgress: number) => {
      if (!assets) return;
      const bounceAngle = (elapsed / 800) * Math.PI * 2 + tile.bounceLevel * (Math.PI / 2);
      const bounce = reducedMotion ? 0 : (Math.cos(bounceAngle) - 1) * 10;
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
      drawImageCentered(context, assets.crew, 0, 0, tile.size, tile.size);
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

      if (!assets) return;
      const { human, bubbles, logo } = assets;

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
          const bubbleY = reducedMotion
            ? -phaseOffset
            : -(((elapsed / BUBBLE_LOOP_MS) * bubbleHeight + phaseOffset) % bubbleHeight);
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
        context.restore();
      }

      drawCrowd("back", elapsed);

      if (human.naturalWidth) {
        const progress = stateRef.current.characterProgress;
        const characterLayout = getCharacterLayout({ width, height, compact, progress });
        const imageHeight = characterLayout.height;
        const imageWidth = imageHeight * (human.naturalWidth / human.naturalHeight);
        const bounceAngle = (elapsed / 800) * Math.PI * 2;
        const bounceTravel = Math.max(28, Math.min(height * 0.035, 42));
        const bounce = reducedMotion ? 0 : (Math.cos(bounceAngle) - 1) * (bounceTravel / 2);

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

    const onVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        return;
      }
      startDrawing();
    };

    resize();
    if (assets) onReady?.();
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
  }, [assets, canvasRef, onReady, reducedMotion, rootRef, stateRef]);
}
