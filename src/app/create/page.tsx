import React from "react";
import { getSession } from "@/lib/auth";
import BlogForm from "@/components/forms/BlogForm";
import EmptyState from "@/components/ui/EmptyState";
import { Lock } from "lucide-react";

export const instant = false;

export const metadata = {
  title: "Draft New Story — BlogSpace",
  description: "Compose and publish a thoughtful essay or architectural analysis on BlogSpace.",
};

export default async function CreateBlogPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Lock className="w-8 h-8 text-amber-700" />}
          title="Sign In to Write a Story"
          description="You must be signed in with your BlogSpace author account to compose and publish new stories."
          actionText="Sign In to Continue"
          actionHref="/login?redirect=/create"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BlogForm isEditing={false} />
    </div>
  );
}
