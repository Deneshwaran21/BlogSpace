import React from "react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { adaptDbPostToBlogPost, DbPostWithAuthor } from "@/lib/postAdapter";
import FeaturedPost from "@/components/blog/FeaturedPost";
import BlogGrid from "@/components/blog/BlogGrid";
import NewsletterSection from "@/components/home/NewsletterSection";
import Button from "@/components/ui/Button";
import { Newspaper, Sparkles, Feather, PenSquare, AlertCircle, BookOpen } from "lucide-react";

export const instant = false;

export default async function HomePage() {
  const session = await getSession();
  const currentUserId = session?.userId || null;

  let dbPosts: DbPostWithAuthor[] = [];
  let totalCount = 0;
  let fetchError = false;

  // Strict requirement:
  // If signed in: only show current user's blogs
  // If not signed in (common page): show every blog
  const whereClause: { authorId?: string } = currentUserId
    ? { authorId: currentUserId }
    : {};

  try {
    const [count, posts] = await Promise.all([
      prisma.post.count({ where: whereClause }),
      prisma.post.findMany({
        where: whereClause,
        take: 6,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
      }),
    ]);
    totalCount = count;
    dbPosts = posts;
  } catch (error) {
    console.error("Error loading home page posts:", error);
    fetchError = true;
  }

  const posts = dbPosts.map((post, index) => adaptDbPostToBlogPost(post, index));
  const featuredPost = posts.length > 0 ? posts[0] : null;

  const initialPagination = {
    page: 1,
    limit: 6,
    totalCount,
    totalPages: Math.ceil(totalCount / 6) || 1,
    hasMore: totalCount > 6,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Editorial Hero Intro Header */}
      {currentUserId ? (
        <section className="relative text-center max-w-3xl mx-auto pt-6 pb-2 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDE9DE] text-slate-800 border border-[#DED9CC]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Personal Dashboard • Your Published Dispatches</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-[1.12]">
            Your Published Stories
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome back. Review, search, and manage your published engineering essays, architectural blueprints, and drafts.
          </p>
        </section>
      ) : (
        <section className="relative text-center max-w-3xl mx-auto pt-6 pb-2 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDE9DE] text-slate-800 border border-[#DED9CC]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Curated Dispatches & Independent Thought</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-[1.12]">
            Where Craft, Code & Modern Culture Converge
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Deep dives into software architecture, tactile design systems, and thoughtful essays on digital craftsmanship.
          </p>
        </section>
      )}

      {/* Database Connection Error State */}
      {fetchError && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-900 flex items-start gap-4 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">Unable to connect to database</h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              We encountered a problem loading dispatches from PostgreSQL. Please ensure the database is running.
            </p>
          </div>
        </div>
      )}

      {/* Empty State when no posts exist */}
      {!fetchError && posts.length === 0 && (
        <section className="bg-white rounded-3xl border border-[#E8E4DA] p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
            <Feather className="w-7 h-7 text-amber-300" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              {currentUserId ? "You haven't published any stories yet" : "No stories published yet"}
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {currentUserId
                ? "Share your first architectural case study, design breakdown, or technical perspective with the community."
                : "Be the first contributor to share an architectural case study, design breakdown, or technical essay."}
            </p>
          </div>
          <div className="pt-3">
            <Button
              href="/create"
              variant="primary"
              size="md"
              leftIcon={<PenSquare className="w-4 h-4" />}
            >
              Draft Your First Story
            </Button>
          </div>
        </section>
      )}

      {/* Featured Cover Story */}
      {!fetchError && featuredPost && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-slate-400" />
              {currentUserId ? "Your Latest Story" : "Editor's Lead Feature"}
            </h2>
            <span className="text-xs text-slate-400">Latest Publication</span>
          </div>
          <FeaturedPost post={featuredPost} />
        </section>
      )}

      {/* Main Content & Interactive Grid */}
      {!fetchError && posts.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E8E4DA] pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
                {currentUserId ? (
                  <>
                    <BookOpen className="w-7 h-7 text-amber-600 inline" />
                    <span>Your Dispatches</span>
                  </>
                ) : (
                  "Latest Dispatches"
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {currentUserId
                  ? "Search, filter, and review all of your published articles."
                  : "Explore essays, architectural blueprints, and design critiques."}
              </p>
            </div>
          </div>

          {/* Client Interactive Filter, Search & Paginated Grid */}
          <BlogGrid
            initialPosts={posts}
            initialPagination={initialPagination}
            currentUserId={currentUserId}
          />
        </section>
      )}

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}
