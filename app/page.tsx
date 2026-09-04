
import { Loader } from "./components/Loader";
import { SiteChrome } from "./components/SiteChrome";
import { Canvas } from "./components/Canvas";
export default function Home() {
  return (
    <main className="relative bg-white">
      <Canvas/>
      <SiteChrome revealed/>
      <Loader visible={false} />
    </main>
  );
}
