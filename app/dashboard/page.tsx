import Image from "next/image";

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0a1128]">
      <Image
        src="/dashboardimage.jpeg"
        alt="BIZ Integration Performance Insights"
        fill
        priority
        className="object-cover object-center"
      />
    </main>
  );
}