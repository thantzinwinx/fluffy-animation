"use client";

import { useRef } from "react";
import { createCanvasState } from "./canvasState";
import type { SceneSection } from "./sceneNavigation";
import { useCanvasInput } from "./useCanvasInput";
import { useCanvasDraw } from "./useCanvasDraw";
import { useCanvasAssets } from "@/lib/useCanvasAssets";
import { useReducedMotion } from "@/lib/useReducedMotion";

type CanvasProps = {
  onSectionChange?: (section: SceneSection) => void;
  onReady?: () => void;
};

export function Canvas({ onSectionChange, onReady }: CanvasProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(createCanvasState());
  const assets = useCanvasAssets();
  const reducedMotion = useReducedMotion();

  useCanvasInput({ stateRef, onSectionChange, reducedMotion });
  useCanvasDraw({ canvasRef, rootRef, assets, stateRef, onReady, reducedMotion });

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
