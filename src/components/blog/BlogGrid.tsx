"use client";

import React, { useState, useEffect, useRef } from "react";
import { BlogPost, PaginationMetadata } from "@/types/blog";
import { mockCategories } from "@/data/mockBlogs";
import { adaptDbPostToBlogPost, DbPostWithAuthor } from "@/lib/postAdapter";
import BlogCard from "./BlogCard";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

const PAGE_LIMIT = 6;

interface BlogGridProps {
  initialPosts?: BlogPost[];
  initialPagination?: PaginationMetadata;
  posts?: BlogPost[];
  currentUserId?: string | null;
}

export function BlogGrid({
  initialPosts,
  initialPagination,
  posts: legacyPosts,
  currentUserId,
}: BlogGridProps) {
  const basePosts = initialPosts || legacyPosts || [];

  const [posts, setPosts] = useState<BlogPost[]>(basePosts);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("search")?.trim() || "";
    }
    return "";
  });
  const [debouncedQuery, setDebouncedQuery] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("search")?.trim() || "";
    }
    return "";
  });
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const p = parseInt(new URLSearchParams(window.location.search).get("page") || "1", 10);
      return !isNaN(p) && p > 1 ? p : (initialPagination?.page || 1);
    }
    return initialPagination?.page || 1;
  });
  const [pagination, setPagination] = useState<PaginationMetadata>(
    initialPagination || {
      page: 1,
      limit: PAGE_LIMIT,
      totalCount: basePosts.length,
      totalPages: Math.ceil(basePosts.length / PAGE_LIMIT) || 1,
      hasMore: false,
    }
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const gridRef = useRef<HTMLElement>(null);
  const isFirstMount = useRef<boolean>(true);
  const activeFetchAbort = useRef<AbortController | null>(null);

  // Fetch posts from GET /api/posts
  const fetchPosts = async (
    pageToFetch: number,
    searchToFetch: string,
    categoryToFetch = selectedCategory
  ) => {
    if (activeFetchAbort.current) {
      activeFetchAbort.current.abort();
    }
    const controller = new AbortController();
    activeFetchAbort.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(pageToFetch));
      queryParams.set("limit", String(PAGE_LIMIT));

      const cleanSearch = searchToFetch.trim();
      if (cleanSearch) {
        queryParams.set("search", cleanSearch);
      }

      if (categoryToFetch && categoryToFetch !== "All") {
        queryParams.set("category", categoryToFetch);
      }

      if (currentUserId) {
        queryParams.set("authorId", currentUserId);
      }

      const res = await fetch(`/api/posts?${queryParams.toString()}`, {
        signal: controller.signal,
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load articles from server.");
      }

      const data: {
        posts: DbPostWithAuthor[];
        pagination: PaginationMetadata;
      } = await res.json();

      const adapted = data.posts.map((p, idx) =>
        adaptDbPostToBlogPost(p, (pageToFetch - 1) * PAGE_LIMIT + idx)
      );
      setPosts(adapted);
      setPagination(data.pagination);
      setCurrentPage(data.pagination.page);

      // Update URL query parameters without full-page reload
      if (typeof window !== "undefined") {
        const currentUrl = new URL(window.location.href);
        if (cleanSearch) {
          currentUrl.searchParams.set("search", cleanSearch);
        } else {
          currentUrl.searchParams.delete("search");
        }
        if (data.pagination.page > 1) {
          currentUrl.searchParams.set("page", String(data.pagination.page));
        } else {
          currentUrl.searchParams.delete("page");
        }
        window.history.replaceState({}, "", currentUrl.toString());
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      console.error("Fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while fetching stories."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Read URL query parameters on initial mount and fetch if URL specifies search or deep page
  useEffect(() => {
    let ignore = false;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get("search")?.trim() || "";
      const urlPage = parseInt(params.get("page") || "1", 10);

      if (urlSearch || (!isNaN(urlPage) && urlPage > 1)) {
        void Promise.resolve().then(() => {
          if (!ignore) {
            void fetchPosts(urlPage > 1 ? urlPage : 1, urlSearch, selectedCategory);
          }
        });
      }
    }
    return () => {
      ignore = true;
    };
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    void fetchPosts(1, debouncedQuery, selectedCategory);
  }, [debouncedQuery]);

  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim() && selectedCategory !== "All") {
      setSelectedCategory("All");
    }
  };

  // Handle category pill clicks
  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    void fetchPosts(1, debouncedQuery, cat);
  };

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === currentPage ||
      isLoading
    ) {
      return;
    }

    setCurrentPage(newPage);
    void fetchPosts(newPage, debouncedQuery, selectedCategory);

    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Immediate clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setCurrentPage(1);
    void fetchPosts(1, "", selectedCategory);
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setDebouncedQuery("");
    setCurrentPage(1);
    void fetchPosts(1, "", "All");
  };

  // Client-side category filtering on the active page
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === "All") return true;
    return (
      post.category.toLowerCase() === selectedCategory.toLowerCase() ||
      post.tags.some((t) => t.toLowerCase() === selectedCategory.toLowerCase())
    );
  });

  // Calculate pagination pill numbers
  const getPageNumbers = (): (number | "...")[] => {
    const total = pagination.totalPages;
    const current = pagination.page;

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, "...", total];
    }
    if (current >= total - 2) {
      return [1, "...", total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const pageNumbers = getPageNumbers();

  return (
    <section ref={gridRef} className="space-y-8 scroll-mt-24">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-[#E8E4DA]">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {mockCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs font-semibold"
                    : "bg-[#EFECE4] text-slate-700 hover:bg-[#E5E1D7]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px] sm:min-w-[320px] max-w-md w-full sm:w-auto">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-amber-700 animate-spin absolute left-3.5 top-1/2 -translate-y-1/2" />
          ) : (
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <input
            id="homepage-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder="Search articles by title or content..."
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-full border border-[#D8D4CA] bg-white focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 placeholder:text-slate-400 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              id="clear-search-button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Showing <strong className="text-slate-900 font-semibold">{filteredPosts.length}</strong>{" "}
            {filteredPosts.length === 1 ? "article" : "articles"}
            {pagination.totalCount > 0 && (
              <>
                {" "}
                (Page {pagination.page} of {pagination.totalPages} •{" "}
                {pagination.totalCount} total)
              </>
            )}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
            {debouncedQuery.trim() && ` matching "${debouncedQuery.trim()}"`}
          </span>
          {isLoading && (
            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px] font-medium">
              <Loader2 className="w-2.5 h-2.5 animate-spin" /> Searching...
            </span>
          )}
        </div>
        {(selectedCategory !== "All" || searchQuery) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-amber-800 hover:underline font-medium cursor-pointer self-start sm:self-auto"
          >
            Clear {searchQuery ? "search & filters" : "filters"}
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Failed to retrieve articles</h4>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPosts(currentPage, debouncedQuery)}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Grid or Empty State */}
      {!error && (
        <>
          {filteredPosts.length > 0 ? (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-opacity duration-200 ${
                isLoading ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
            >
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                debouncedQuery.trim()
                  ? "No articles match your search"
                  : selectedCategory !== "All"
                  ? `No stories in ${selectedCategory}`
                  : "No articles found"
              }
              description={
                debouncedQuery.trim()
                  ? `We couldn't find any articles matching "${debouncedQuery.trim()}". Try searching for different keywords or clear your search to browse all dispatches.`
                  : selectedCategory !== "All"
                  ? `There are currently no articles categorized under "${selectedCategory}".`
                  : "No published dispatches are available at this time."
              }
              actionText={
                debouncedQuery.trim() || selectedCategory !== "All"
                  ? "Clear search & filters"
                  : "Draft a Story"
              }
              onAction={
                debouncedQuery.trim() || selectedCategory !== "All"
                  ? handleResetFilters
                  : undefined
              }
              actionHref={
                !debouncedQuery.trim() && selectedCategory === "All"
                  ? "/create"
                  : undefined
              }
            />
          )}

          {/* Pagination Toolbar */}
          {pagination.totalPages > 1 && (
            <nav
              aria-label="Blog pagination navigation"
              className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#E8E4DA]"
            >
              <div className="text-xs text-slate-500 font-sans order-2 sm:order-1">
                Showing page{" "}
                <strong className="text-slate-900 font-semibold">
                  {pagination.page}
                </strong>{" "}
                of{" "}
                <strong className="text-slate-900 font-semibold">
                  {pagination.totalPages}
                </strong>{" "}
                ({pagination.totalCount}{" "}
                {pagination.totalCount === 1 ? "article" : "articles"} total)
              </div>

              <div className="flex items-center gap-1.5 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
                {/* Previous Button */}
                <Button
                  id="pagination-prev-button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isLoading}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  aria-label="Previous page"
                >
                  Previous
                </Button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {pageNumbers.map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-xs text-slate-400 select-none"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePageChange(p as number)}
                        disabled={isLoading || p === pagination.page}
                        className={`min-w-8 h-8 px-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                          p === pagination.page
                            ? "bg-slate-900 text-white font-semibold shadow-xs pointer-events-none"
                            : "text-slate-700 hover:bg-black/5 hover:text-slate-900"
                        }`}
                        aria-label={`Page ${p}`}
                        aria-current={p === pagination.page ? "page" : undefined}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                {/* Next Button */}
                <Button
                  id="pagination-next-button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={
                    pagination.page >= pagination.totalPages || isLoading
                  }
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

export default BlogGrid;
