"use client";

import { useEffect, useRef } from "react";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const human = new Image();
    human.src = "/assets/human.webp";

    let width = 0;
    let height = 0;
    let dpr = 1;

    const paint = (elapsed: number) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);

      if (!human.naturalWidth) return;
      const imageHeight = Math.min(height * 1.72, width * 1.34);
      const imageWidth = imageHeight * (human.naturalWidth / human.naturalHeight);
      const bounceAngle = (elapsed / 800) * Math.PI * 2;
      const bounceTravel = Math.max(28, Math.min(height * 0.035, 42));
      const bounce = (Math.cos(bounceAngle) - 1) * (bounceTravel / 2);
      context.drawImage(
        human,
        (width - imageWidth) / 2,
        height * 1.02 - imageHeight / 2 + bounce,
        imageWidth,
        imageHeight,
      );
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      paint(performance.now());
    };

    let frame = 0;
    const draw = (elapsed: number) => {
      paint(elapsed);
      frame = window.requestAnimationFrame(draw);
    };

    human.onload = () => {
      resize();
      frame = window.requestAnimationFrame(draw);
    };
    window.addEventListener("resize", resize);
    resize();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main id="hero" className="relative h-svh min-h-0 bg-white">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-pan-y"
        role="img"
        aria-label="A Fluffy Hugs character"
      />
    </main>
  );
}
