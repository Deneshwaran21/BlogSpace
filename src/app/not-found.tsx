import React from "react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <EmptyState
        icon={<Compass className="w-8 h-8 text-amber-700" />}
        title="Page Not Found"
        description="The story or dispatch you are looking for has been moved, unlisted, or does not exist."
        actionText="Back to Dispatches"
        actionHref="/"
      />
    </div>
  );
}
