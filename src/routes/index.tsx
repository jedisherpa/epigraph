import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Record } from "@/components/record";
import { Studio } from "@/components/studio";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [view, setView] = useState<"record" | "studio">("record");
  if (view === "studio") return <Studio onPlay={() => setView("record")} />;
  return <Record onBrowse={() => setView("studio")} />;
}
