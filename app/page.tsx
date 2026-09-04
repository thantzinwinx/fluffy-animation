
import { Loader } from "./components/Loader";
export default function Home() {
  return (
    <main className="relative bg-white">
      <Loader visible ready={false} />
    </main>
  );
}
