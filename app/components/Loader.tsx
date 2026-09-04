"use client";

import Image from "next/image";

type LoaderProps = {
  visible: boolean;
};

export function Loader({ visible }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={"Loading Fluffy Hugs"}
      className={`fixed inset-0 z-50 grid place-items-center bg-white opacity-100 transition-[opacity,visibility] duration-700 [transition-delay:0s,0s] [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] motion-reduce:duration-200 ${
        visible
          ? "visible"
          : "pointer-events-none invisible opacity-0 [transition-delay:0s,0.7s]"
      }`}
    >
      <div className="flex w-[min(70vw,18rem)] flex-col items-center gap-5">
        <Image
          src="/assets/loading.webp"
          alt=""
          width={300}
          height={300}
          fetchPriority="high"
          loading="eager"
          unoptimized
          className="h-auto w-[min(58vw,16rem)] animate-[loader-breathe_1s_ease-in-out_infinite_alternate] motion-reduce:animate-none"
        />
      </div>
    </div>
  );
}
