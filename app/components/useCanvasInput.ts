import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { getSceneTarget, type SceneSection } from "./sceneNavigation";
import type { CanvasState } from "./canvasState";

type UseCanvasInputArgs = {
  stateRef: RefObject<CanvasState>;
  onSectionChange?: (section: SceneSection) => void;
};

export function useCanvasInput({ stateRef, onSectionChange }: UseCanvasInputArgs) {
  const sectionRef = useRef<SceneSection>("hero");
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

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
  }, [onSectionChange, stateRef]);
}
