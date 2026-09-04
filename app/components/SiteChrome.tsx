"use client";

import Image from "next/image";

const FOCUS_RING =
  "focus-visible:outline-[3px] focus-visible:outline-coral focus-visible:outline-offset-[5px]";

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
      <footer className="absolute inset-x-0 bottom-0 flex items-end justify-between pl-[clamp(1.4rem,3vw,2.8rem)] max-[47.99rem]:pl-5">
        <nav
          aria-label="Social links"
          className="pointer-events-auto flex gap-3 pb-[clamp(1.5rem,3vw,2.7rem)]"
        >
          {[
            ["Discord", "/assets/discord.svg", "https://discord.com"],
            ["OpenSea", "/assets/opensea.svg", "https://opensea.io"],
            ["X / Twitter", "/assets/twitter.svg", "https://x.com"],
          ].map(([name, src, href]) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={name}
              className="block size-[clamp(2.5rem,3.5vw,3.25rem)] rounded-full focus-visible:outline-3 focus-visible:outline-coral focus-visible:outline-offset-5"
            >
              <Image src={src} alt="" width={52} height={52} className="size-full" />
            </a>
          ))}
        </nav>
        <a
          className={`pointer-events-auto relative block w-[clamp(8.5rem,14vw,13.5rem)] translate-x-[12%] translate-y-[16%] transition-transform duration-350 [transition-timing-function:cubic-bezier(0.2,0.75,0.25,1)] hover:translate-x-[8%] hover:translate-y-[12%] hover:scale-[0.97] motion-reduce:duration-200 motion-reduce:delay-0 max-[47.99rem]:w-[8.8rem] max-[23.4374rem]:w-[37.5467vw] ${FOCUS_RING}`}
          href="#next-section"
        >
          <svg className="block w-full fill-navy" viewBox="0 0 254.73 221.92" aria-hidden="true">
            <path d="m225.68,15.74c-25.47-21.39-54.72-22.72-79.62,6.86-24.91,29.57-40.17,54.92-72.67,49.26-32.5-5.66-62.08,14.2-71.32,44.78-9.24,30.58,13.36,75.03,52.18,90.3,38.81,15.27,72.91,24.12,122.72.19,49.81-23.93,68.79-79.19,75.51-108.95,6.71-29.76-1.32-61.04-26.79-82.44Z" />
          </svg>
          <span className="absolute top-[54%] left-1/2 w-[70%] -translate-x-1/2 -translate-y-1/2 text-center font-body text-[clamp(0.55rem,0.8vw,0.72rem)] font-bold tracking-[0.16em] text-white uppercase max-[23.4374rem]:text-[0.5rem]">
            View collection
          </span>
        </a>
      </footer>
    </div>
  );
}
