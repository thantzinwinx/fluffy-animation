import { useEffect, useState } from "react";
import { loadCanvasAssets, type CanvasAssets } from "@/app/components/canvasAssets";

export function useCanvasAssets() {
  const [assets, setAssets] = useState<CanvasAssets | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadCanvasAssets().then((loaded) => {
      if (!cancelled) setAssets(loaded);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return assets;
}
