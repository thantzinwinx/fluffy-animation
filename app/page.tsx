
import { Loader } from "./components/Loader";
import { SiteChrome } from "./components/SiteChrome";
export default function Home() {
  return (
    <main className="relative bg-white">
      <SiteChrome revealed/>
      <Loader visible={false} />
    </main>
  );
}
