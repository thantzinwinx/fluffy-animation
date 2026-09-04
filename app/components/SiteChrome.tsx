"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import type { SceneSection } from "./sceneNavigation";

const FOCUS_RING =
  "focus-visible:outline-[3px] focus-visible:outline-coral focus-visible:outline-offset-[5px]";
const SOCIAL_LINK_STYLES =
  "block cursor-pointer size-[clamp(2.5rem,3.5vw,3.25rem)] rounded-full shadow-[0_8px_24px_rgba(11,63,150,0.1)] max-[23.4374rem]:size-[10.6667vw] focus-visible:outline-3 focus-visible:outline-coral focus-visible:outline-offset-5";

const SOCIALS = [
  { name: "Discord", src: "/assets/discord.svg" },
  { name: "OpenSea", src: "/assets/opensea.svg" },
  { name: "X / Twitter", src: "/assets/twitter.svg" },
] as const;

type SiteChromeProps = {
  revealed: boolean;
  section: SceneSection;
};

function SocialLink({ social }: { social: (typeof SOCIALS)[number] }) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const scaleTo = (scale: number) => {
    gsap.to(linkRef.current, {
      scale,
      y: scale < 1 ? 2 : 0,
      duration: 0.28,
      ease: "power2.out",
      overwrite: true,
    });
  };

  return (
    <a
      ref={linkRef}
      tabIndex={0}
      aria-label={social.name}
      className={`${SOCIAL_LINK_STYLES} ${FOCUS_RING}`}
      onMouseEnter={() => scaleTo(0.9)}
      onMouseLeave={() => scaleTo(1)}
      onFocus={() => scaleTo(0.9)}
      onBlur={() => scaleTo(1)}
    >
      <Image src={social.src} alt="" width={52} height={52} className="size-full" />
    </a>
  );
}

export function SiteChrome({ revealed, section }: SiteChromeProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-30 transition-opacity duration-700 ${
        revealed ? "opacity-100" : "opacity-0"
      }`}
    >
      <header className="absolute inset-x-0 top-0 flex items-start justify-between p-[clamp(1.4rem,3vw,2.8rem)] max-[47.99rem]:p-5 max-[23.4374rem]:p-[5.3333vw]">
        <a
          href="#hero"
          aria-label="Fluffy Hugs, back to top"
          className={`block w-[clamp(12rem,24vw,23rem)] transition-[opacity,transform] duration-[450ms] [transition-timing-function:ease] motion-reduce:duration-200 motion-reduce:delay-0 max-[47.99rem]:w-[min(54vw,13rem)] max-[23.4374rem]:w-[54vw] ${
            section === "next"
              ? "pointer-events-none -translate-y-3.5 opacity-0"
              : "pointer-events-auto"
          } focus-visible:outline-3 focus-visible:outline-coral focus-visible:outline-offset-5`}
        >
          <Image
            src="/assets/logo.webp"
            alt="Fluffy Hugs"
            width={2048}
            height={401}
            priority
            className="block h-auto w-full"
          />
        </a>
      </header>
      <footer className="absolute inset-x-0 bottom-0 flex items-end justify-between pl-[clamp(1.4rem,3vw,2.8rem)] max-[47.99rem]:pl-5 max-[23.4374rem]:pl-[5.3333vw]">
        <nav
          aria-label="Social links"
          className="pointer-events-auto flex gap-[clamp(0.6rem,1.2vw,1rem)] pb-[clamp(1.5rem,3vw,2.7rem)] max-[47.99rem]:pb-[1.35rem] max-[23.4374rem]:gap-[2.56vw] max-[23.4374rem]:pb-[5.76vw]"
        >
          {SOCIALS.map((social) => (
            <SocialLink key={social.name} social={social} />
          ))}
        </nav>
        <a
          tabIndex={0}
          className={`pointer-events-auto relative block cursor-pointer w-[clamp(8.5rem,14vw,13.5rem)] translate-x-[12%] translate-y-[16%] transition-transform duration-350 [transition-timing-function:cubic-bezier(0.2,0.75,0.25,1)] hover:translate-x-[8%] hover:translate-y-[12%] hover:scale-[0.97] motion-reduce:duration-200 motion-reduce:delay-0 max-[47.99rem]:w-[8.8rem] max-[23.4374rem]:w-[37.5467vw] ${FOCUS_RING}`}
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
