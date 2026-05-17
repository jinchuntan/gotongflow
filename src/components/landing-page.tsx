"use client";

import Link from "next/link";
import { ArrowRight, Fingerprint, Network, Sparkles } from "lucide-react";

import { LandingMapPreview } from "@/components/landing-map-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const proofSignals = ["AI Tasks", "Fair Proof", "Chutes Ready"];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#120f0c] text-[#fff8ed]">
      <section className="relative min-h-[88svh] overflow-hidden">
        <LandingMapPreview className="opacity-95" />
        <div className="absolute inset-0 bg-linear-to-b from-[#120f0c]/35 via-[#120f0c]/16 to-[#120f0c]" />

        <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#f6b84b] text-[#1d140c] shadow-lg shadow-[#f6b84b]/20">
              GF
            </span>
            <span>GotongFlow</span>
          </Link>
          <Button
            asChild
            className="border-[#fff0d4]/25 bg-[#fff8ed]/10 text-[#fff8ed] backdrop-blur hover:bg-[#fff8ed]/18"
            size="sm"
            variant="outline"
          >
            <Link href="/workspace">
              <Fingerprint />
              Sign in with Chutes
            </Link>
          </Button>
        </nav>

        <div className="relative z-10 mx-auto grid min-h-[70svh] max-w-7xl items-center px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(360px,0.52fr)]">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap gap-2">
              {proofSignals.map((signal) => (
                <Badge
                  className="border-[#fff0d4]/20 bg-[#fff8ed]/10 px-3 py-1 text-[#fff8ed] backdrop-blur"
                  key={signal}
                  variant="outline"
                >
                  {signal}
                </Badge>
              ))}
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] text-[#fffaf1] sm:text-6xl lg:text-7xl">
              Turn messy teamwork into fair, visible contribution.
            </h1>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-11 bg-[#f6b84b] px-4 text-[#1b130c] shadow-xl shadow-[#f6b84b]/20 hover:bg-[#ffd37c]"
                size="lg"
              >
                <Link href="/workspace">
                  <Network />
                  Open Gotong Map
                </Link>
              </Button>
              <Button
                asChild
                className="h-11 border-[#fff0d4]/25 bg-[#fff8ed]/8 px-4 text-[#fff8ed] backdrop-blur hover:bg-[#fff8ed]/15"
                size="lg"
                variant="outline"
              >
                <Link href="/workspace">
                  <Sparkles />
                  Analyze Notes
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 hidden justify-self-end lg:block">
            <div className="w-[360px] rounded-lg border border-[#fff0d4]/15 bg-[#120f0c]/35 p-4 shadow-2xl shadow-black/30 backdrop-blur-md">
              <div className="flex items-center justify-between text-sm text-[#fff0d4]/78">
                <span>Live demo map</span>
                <span className="rounded-full bg-[#35c7b3]/18 px-2 py-1 text-[#9ff6ea]">
                  Pulsing
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ["4", "people"],
                  ["4", "tasks"],
                  ["1", "blocker"],
                ].map(([value, label]) => (
                  <div
                    className="rounded-lg border border-[#fff0d4]/12 bg-[#fff8ed]/8 p-3"
                    key={label}
                  >
                    <div className="text-2xl font-semibold text-[#fffaf1]">{value}</div>
                    <div className="text-xs text-[#fff0d4]/66">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-[#ff6b6b]/25 bg-[#ff6b6b]/12 p-3 text-sm text-[#ffd7d7]">
                Next: freeze Chutes JSON
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#fff0d4]/10 bg-[#fff8ed] px-5 py-8 text-[#1d1711] sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            ["Messy notes", "Paste raw team chaos."],
            ["Gotong Map", "See owners, blockers, proof."],
            ["Proof hash", "Anchor fairness on-chain."],
          ].map(([title, label]) => (
            <div
              className="rounded-lg border border-[#1d1711]/10 bg-white/75 p-5 shadow-sm"
              key={title}
            >
              <div className="text-lg font-semibold">{title}</div>
              <div className="mt-1 text-sm text-[#5f5143]">{label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
