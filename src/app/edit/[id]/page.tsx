import React from "react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { adaptDbPostToBlogPost } from "@/lib/postAdapter";
import { getPostById, getPostBySlug } from "@/data/mockBlogs";
import { BlogPost } from "@/types/blog";
import BlogForm from "@/components/forms/BlogForm";
import EmptyState from "@/components/ui/EmptyState";
import { FileQuestion, Lock, ShieldAlert } from "lucide-react";

export const instant = false;

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Story — BlogSpace",
  description: "Update the editorial prose, metadata, or analysis of your BlogSpace story.",
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  let post: BlogPost | undefined;
  let isDbPost = false;

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // 1. Attempt to fetch real post from PostgreSQL
  if (isUuid) {
    try {
      const dbPost = await prisma.post.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
      });

      if (dbPost) {
        post = adaptDbPostToBlogPost(dbPost);
        isDbPost = true;
      }
    } catch (err) {
      console.error("Error loading post for editing:", err);
    }
  }

  // 2. Fallback to mock data if not found in database (preserves legacy demo links)
  if (!post) {
    post = getPostById(id) || getPostBySlug(id);
  }

  // 3. Not found state
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={<FileQuestion className="w-8 h-8 text-amber-700" />}
          title="Story Not Found for Editing"
          description={`We could not locate an article with the identifier "${id}". It may have been removed or the link is invalid.`}
          actionText="Return to Home"
          actionHref="/"
        />
      </div>
    );
  }

  // 4. Session check for real database posts
  const session = await getSession();

  if (isDbPost) {
    if (!session) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-16">
          <EmptyState
            icon={<Lock className="w-8 h-8 text-amber-700" />}
            title="Sign In Required"
            description="You must be signed in with your author account to edit this story."
            actionText="Sign In"
            actionHref="/login"
          />
        </div>
      );
    }

    if (session.userId !== post.author.id) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-16">
          <EmptyState
            icon={<ShieldAlert className="w-8 h-8 text-rose-700" />}
            title="Unauthorized Editor"
            description="You do not have permission to modify this story. Only the original author can edit or delete it."
            actionText="View Story"
            actionHref={`/blog/${post.id}`}
          />
        </div>
      );
    }
  }

  const initialFormData = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content.trim(),
    category: post.category,
    authorRole: post.author.role,
    coverImage: post.coverImage,
    tags: post.tags.join(", "),
    readingTime: post.readingTime,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <BlogForm
        isEditing={true}
        postId={post.id}
        initialData={initialFormData}
      />
    </div>
  );
}
