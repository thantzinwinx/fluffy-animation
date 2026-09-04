"use client";

import Image from "next/image";

type SiteChromeProps = {
  revealed: boolean;
};

export function SiteChrome({ revealed }: SiteChromeProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-30 transition-opacity duration-700 ${
        revealed ? "opacity-100" : "opacity-0"
      }`}
    >
      <header className="absolute inset-x-0 top-0 flex items-start justify-between p-[clamp(1.4rem,3vw,2.8rem)] max-[47.99rem]:p-5">
        <a
          href="#hero"
          aria-label="Fluffy Hugs"
          className="pointer-events-auto block w-[clamp(12rem,24vw,23rem)] focus-visible:outline-3 focus-visible:outline-coral focus-visible:outline-offset-5 max-[47.99rem]:w-[min(54vw,13rem)]"
        >
          <Image
            src="/assets/logo.webp"
            alt="Fluffy Hugs"
            width={2048}
            height={401}
            preload
            className="block h-auto w-full"
          />
        </a>
      </header>
    </div>
  );
}
