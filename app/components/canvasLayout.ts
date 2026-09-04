export type CharacterLayoutInput = {
  width: number;
  height: number;
  compact: boolean;
  progress: number;
};

export type CharacterLayout = {
  height: number;
  x: number;
  y: number;
};

export type CrowdLayout = {
  columns: number;
  rows: number;
  split: number;
  stageHeight: number;
  stageWidth: number;
  tileSize: number;
};

const HERO_HUMAN_Y = { compact: 0.99, desktop: 1.02 } as const;
const NEXT_HUMAN_Y = { compact: 0.6, desktop: 0.58 } as const;
const TABLET_LAYOUT_WIDTH = 768;
const DESKTOP_LAYOUT_WIDTH = 1280;

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

function getCompactBlend(width: number, compact: boolean) {
  if (compact) return 1;
  const linear = Math.max(
    0,
    Math.min(
      1,
      (DESKTOP_LAYOUT_WIDTH - width) / (DESKTOP_LAYOUT_WIDTH - TABLET_LAYOUT_WIDTH),
    ),
  );
  return linear * linear * (3 - 2 * linear);
}

export function getCrowdLayout(width: number, height: number): CrowdLayout {
  const compact = width < 720 || height > width * 1.25;
  const stageWidth = Math.max(width, Math.min(width * 1.75, 1440));
  const stageHeight = Math.max(height, Math.min(height * 1.65, 900));
  const columns = compact ? 4 : 5;
  const rows = 3;

  return {
    columns,
    rows,
    split: height * (compact ? 0.58 : 0.72),
    stageHeight,
    stageWidth,
    tileSize: (stageWidth / columns) * (compact ? 2.42 : 2.34),
  };
}

export function getCharacterLayout({
  width,
  height,
  compact,
  progress,
}: CharacterLayoutInput): CharacterLayout {
  const compactBlend = getCompactBlend(width, compact);
  const compactHeroHeight = Math.min(height * 1.48, width * 2.95);
  const desktopHeroHeight = Math.min(height * 1.72, width * 1.34);
  const heroHeight = mix(desktopHeroHeight, compactHeroHeight, compactBlend);
  const compactNextHeight = Math.min(height * 0.76, Math.max(width * 1.05, 432));
  const desktopNextHeight = Math.min(height * 0.88, width * 0.86);
  const nextHeight = mix(desktopNextHeight, compactNextHeight, compactBlend);
  const heroY = mix(HERO_HUMAN_Y.desktop, HERO_HUMAN_Y.compact, compactBlend);
  const nextY = mix(NEXT_HUMAN_Y.desktop, NEXT_HUMAN_Y.compact, compactBlend);

  return {
    height: mix(heroHeight, nextHeight, progress),
    x: width / 2,
    y: height * mix(heroY, nextY, progress),
  };
}
