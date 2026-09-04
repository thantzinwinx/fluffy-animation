"use client";

import { useState } from "react";
import { Loader } from "./components/Loader";
import { SiteChrome } from "./components/SiteChrome";
import { Canvas } from "./components/Canvas";
import type { SceneSection } from "./components/sceneNavigation";

export default function Home() {
  const [section, setSection] = useState<SceneSection>("hero");
  const [ready, setReady] = useState(false);

  return (
    <main className="relative bg-white">
      <Canvas onSectionChange={setSection} onReady={() => setReady(true)} />
      <SiteChrome revealed={ready} section={section} />
      <Loader visible={!ready} />
    </main>
  );
}
