export type CanvasState = {
  crowdDrop: number;
  characterProgress: number;
  nextAlpha: number;
  logoAlpha: number;
};

export function createCanvasState(): CanvasState {
  return {
    crowdDrop: 0,
    characterProgress: 0,
    nextAlpha: 0,
    logoAlpha: 0,
  };
}
