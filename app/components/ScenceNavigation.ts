export type SceneSection = "hero" | "next";

export function getSceneTarget(current: SceneSection): SceneSection {
  return current === "hero" ? "next" : "hero";
}
