// Drop a copy of this file as `app/loading.tsx` (root) or inside any route
// segment, e.g. `app/dashboard/loading.tsx` — Next.js automatically shows it
// while that segment's data is being fetched, and swaps it out once ready.
// No wiring needed beyond placing the file.

import LoadingScreen from "@/components/Loadingscreen";

export default function Loading() {
  return <LoadingScreen />;
}