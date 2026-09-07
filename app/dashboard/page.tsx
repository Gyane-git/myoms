import Image from "next/image";
import { Fraunces } from "next/font/google";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export default function Home() {
  return (
    <main
      className={`${display.variable} relative w-full`}
      style={{
        background:
          "linear-gradient(180deg, #EEF3FC 0%, #F7F9FE 55%, #FFFFFF 100%)",
      }}
    >
      {/* top hairline, spans both brand palettes */}
      <div
        className="h-[5px] w-full"
        style={{
          background:
            "linear-gradient(90deg, #16233F 0%, #2EA8F0 35%, #7B3FE4 65%, #C9973B 100%)",
        }}
      />

      <section className="relative mx-auto flex h-[560px] w-full max-w-[1600px] flex-col justify-between px-10 py-10 md:px-16">
        {/* ribbon, top right — echoes the BIZ navy/gold pairing */}
        <div className="flex justify-end">
          <div className="flex flex-col items-end">
            <div className="bg-[#16233F] px-8 py-3">
              <p
                className="text-2xl text-white"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                Built with <span className="italic">Purpose</span>
              </p>
            </div>
            <div className="bg-[#C9973B] px-8 py-2.5">
              <p
                className="text-xl italic text-[#16233F]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Driven by Results&hellip;
              </p>
            </div>
          </div>
        </div>

        {/* center: the real DevMind logo, given room to breathe */}
        <div className="flex flex-1 items-center">
          <Image
            src="/devmind-logo.png"
            alt="DevMind Solutions"
            width={620}
            height={410}
            className="h-auto w-[320px] md:w-[420px]"
            priority
          />
        </div>

        {/* bottom row: links (left) + real BIZ logo as the product badge (right) */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <a href="https://devmind.com.np" className="text-lg text-[#C9973B] hover:underline">
              devmind.com.np
            </a>
            <a href="https://getbiz.app" className="text-lg text-[#C9973B] hover:underline">
              getbiz.app
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Image
              src="/biz-logo.png"
              alt="BIZ — Business Integration System"
              width={220}
              height={220}
              className="h-16 w-16 object-contain md:h-20 md:w-20"
            />
          </div>
        </div>
      </section>

      <div className="border-t border-[#E3E7F3] px-10 py-4 md:px-16">
        <p className="text-xs text-[#8B90B3]">
          © 2020 - 2026 - DevMind Solutions Pvt. Ltd.
        </p>
      </div>
    </main>
  );
}