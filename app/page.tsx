"use client";

import { useState } from "react";
import { Loader } from "./components/Loader";
import { SiteChrome } from "./components/SiteChrome";
import { Canvas } from "./components/Canvas";
import type { SceneSection } from "./components/ScenceNavigation";

export default function Home() {
  const [section, setSection] = useState<SceneSection>("hero");

  return (
    <main className="relative bg-white">
      <Canvas onSectionChange={setSection} />
      <SiteChrome revealed section={section} />
      <Loader visible={false} />
    </main>
  );
}
