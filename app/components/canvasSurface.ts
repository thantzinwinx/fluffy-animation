export type CanvasSurface = {
  width: number;
  height: number;
  style: {
    width: string;
    height: string;
  };
};

export type CanvasSurfaceSize = {
  width: number;
  height: number;
  dpr: number;
};

export function resizeCanvasSurface(
  canvas: CanvasSurface,
  { width, height, dpr }: CanvasSurfaceSize,
  paint: () => void,
) {
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  paint();
}
