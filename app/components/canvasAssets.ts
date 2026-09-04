export type CanvasAssets = {
  human: HTMLImageElement;
  crew: HTMLImageElement;
  bubbles: HTMLImageElement;
  logo: HTMLImageElement;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(image);
    image.src = src;
  });
}

export function loadCanvasAssets(): Promise<CanvasAssets> {
  return Promise.all([
    loadImage("/assets/human.webp"),
    loadImage("/assets/crew.webp"),
    loadImage("/assets/bubbles.webp"),
    loadImage("/assets/logo.webp"),
  ]).then(([human, crew, bubbles, logo]) => ({ human, crew, bubbles, logo }));
}
