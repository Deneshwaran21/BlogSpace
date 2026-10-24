import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { adaptDbPostToBlogPost } from "@/lib/postAdapter";
import { getPostBySlug, getPostById, getRelatedPosts, mockPosts } from "@/data/mockBlogs";
import { BlogPost } from "@/types/blog";
import Badge from "@/components/ui/Badge";
import BlogCard from "@/components/blog/BlogCard";
import AuthorBio from "@/components/blog/AuthorBio";
import ArticleActions from "@/components/blog/ArticleActions";
import CommentSection from "@/components/blog/CommentSection";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ChevronRight,
  Tag,
} from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  let post: BlogPost | undefined;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  // 1. Try loading from real PostgreSQL database if slug is a UUID
  if (isUuid) {
    try {
      const dbPost = await prisma.post.findUnique({
        where: { id: slug },
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
      }
    } catch (err) {
      console.error("Error loading post from database:", err);
    }
  }

  // 2. Fallback to mock data if not found in database (preserves existing mock links)
  if (!post) {
    post = getPostBySlug(slug) || getPostById(slug);
  }

  // 3. 404 if not found in either source
  if (!post) {
    notFound();
  }

  // 4. Retrieve related dispatches
  let relatedPosts: BlogPost[] = [];
  try {
    const relatedDb = await prisma.post.findMany({
      where: { id: { not: post.id } },
      take: 3,
      orderBy: { createdAt: "desc" },
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

    if (relatedDb.length > 0) {
      relatedPosts = relatedDb.map((p, idx) => adaptDbPostToBlogPost(p, idx + 1));
    }
  } catch {
    // Silent fallback to mock related posts if DB query fails
  }

  if (relatedPosts.length === 0) {
    relatedPosts = getRelatedPosts(post.slug, post.category, 3);
  }

  // Simple clean markdown/prose renderer for editorial content
  const renderFormattedContent = (content: string) => {
    const sections = content.trim().split("\n\n");

    return sections.map((sec, idx) => {
      const trimmed = sec.trim();

      // Heading 3
      if (trimmed.startsWith("### ")) {
        return (
          <h3
            key={idx}
            className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-10 mb-4 pt-4 border-t border-[#EFECE4]"
          >
            {trimmed.replace("### ", "")}
          </h3>
        );
      }

      // Heading 2
      if (trimmed.startsWith("## ")) {
        return (
          <h2
            key={idx}
            className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-10 mb-4"
          >
            {trimmed.replace("## ", "")}
          </h2>
        );
      }

      // Blockquote
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote
            key={idx}
            className="my-8 pl-6 border-l-4 border-amber-500 italic text-slate-800 text-lg sm:text-xl font-serif leading-relaxed bg-[#F7F5EE] py-4 pr-6 rounded-r-2xl"
          >
            {trimmed.replace(/^>\s*/, "").replace(/^"/, "").replace(/"$/, "")}
          </blockquote>
        );
      }

      // Code Block
      if (trimmed.startsWith("```")) {
        const lines = trimmed.split("\n");
        const lang = lines[0].replace("```", "").trim();
        const code = lines.slice(1, -1).join("\n");

        return (
          <div
            key={idx}
            className="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-[#141820] text-slate-200 shadow-lg"
          >
            {lang && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <span>{lang}</span>
                <span>snippet</span>
              </div>
            )}
            <pre className="p-5 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-slate-300">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Numbered or bullet list items
      if (trimmed.includes("\n1. ") || trimmed.startsWith("1. ")) {
        const items = trimmed.split("\n").filter((l) => l.trim().length > 0);
        return (
          <ol
            key={idx}
            className="my-6 space-y-2.5 list-decimal list-inside text-slate-700 text-base leading-relaxed pl-2"
          >
            {items.map((it, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed">
                {it.replace(/^\d+\.\s*/, "")}
              </li>
            ))}
          </ol>
        );
      }

      if (trimmed.includes("\n- ") || trimmed.startsWith("- ")) {
        const items = trimmed.split("\n").filter((l) => l.trim().length > 0);
        return (
          <ul
            key={idx}
            className="my-6 space-y-2 list-disc list-inside text-slate-700 text-base leading-relaxed pl-2"
          >
            {items.map((it, itemIdx) => (
              <li key={itemIdx}>{it.replace(/^-\s*/, "")}</li>
            ))}
          </ul>
        );
      }

      // Standard paragraph
      return (
        <p
          key={idx}
          className="text-slate-800 text-base sm:text-lg leading-[1.8] font-sans my-5"
        >
          {trimmed}
        </p>
      );
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto scrollbar-none pb-1"
      >
        <Link
          href="/"
          className="hover:text-slate-900 transition-colors flex items-center gap-1 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-slate-600 shrink-0">{post.category}</span>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-medium truncate max-w-[240px]">
          {post.title}
        </span>
      </nav>

      {/* Article Header */}
      <header className="space-y-6 text-left">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="editorial">{post.category}</Badge>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {post.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime}
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-5xl font-serif font-bold text-slate-900 leading-[1.18] tracking-tight">
          {post.title}
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-serif italic border-l-2 border-slate-300 pl-4 py-1">
          {post.excerpt}
        </p>

        {/* Author Header Row */}
        <div className="flex items-center justify-between pt-4 pb-2 border-t border-[#E8E4DA]">
          <div className="flex items-center gap-3.5">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#EDE9E0]"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {post.author.name}
              </p>
              <p className="text-xs text-slate-500">{post.author.role}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Cover Image */}
      <figure className="my-10 space-y-2">
        <div className="relative aspect-16/9 sm:aspect-21/9 rounded-3xl overflow-hidden bg-slate-100 shadow-sm border border-[#E8E4DA]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
        <figcaption className="text-xs text-slate-400 text-center font-sans italic">
          Visual documentation and editorial imagery for {post.title}
        </figcaption>
      </figure>

      {/* Article Body Prose */}
      <div className="editorial-prose max-w-none">
        {renderFormattedContent(post.content)}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-8 mt-10 border-t border-[#E8E4DA] flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5" /> Filed under:
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-lg bg-[#EFECE4] text-slate-700 font-medium hover:bg-[#E5E0D4] transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Interactive Actions (Like, Bookmark, Share, Edit shortcut) */}
      <ArticleActions
        postId={post.id}
        authorId={post.author.id}
        initialLikes={post.likesCount}
        commentsCount={post.commentsCount}
      />

      {/* Author Bio Box */}
      <AuthorBio author={post.author} />

      {/* Comment Section with Responses */}
      <CommentSection initialComments={post.comments || []} />

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="pt-12 mt-16 border-t border-[#E8E4DA] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
              Related Dispatches
            </h3>
            <Link
              href="/"
              className="text-xs font-semibold text-amber-900 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <BlogCard key={related.id} post={related} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
