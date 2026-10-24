"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Bookmark, Share2, Edit3, Check } from "lucide-react";

interface ArticleActionsProps {
  postId: string;
  authorId?: string;
  initialLikes: number;
  commentsCount: number;
}

export function ArticleActions({
  postId,
  authorId,
  initialLikes,
  commentsCount,
}: ArticleActionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  React.useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-y border-[#E8E4DA] my-8">
      {/* Left interactive buttons */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleLike}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            hasLiked
              ? "bg-rose-50 text-rose-600 border border-rose-200"
              : "text-slate-600 hover:bg-black/5 hover:text-slate-900"
          }`}
          aria-label={hasLiked ? "Unlike story" : "Like story"}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              hasLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
            }`}
          />
          <span>{likes}</span>
        </button>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={handleBookmark}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            isBookmarked
              ? "bg-amber-50 text-amber-800 border border-amber-200"
              : "text-slate-600 hover:bg-black/5 hover:text-slate-900"
          }`}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark story"}
        >
          <Bookmark
            className={`w-4 h-4 ${
              isBookmarked ? "fill-amber-600 text-amber-600" : ""
            }`}
          />
          <span className="hidden sm:inline">
            {isBookmarked ? "Saved" : "Save"}
          </span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-600 hover:bg-black/5 hover:text-slate-900 transition-all cursor-pointer relative"
          aria-label="Share story"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>
      </div>

      {/* Right Action: Edit Story Layout Link (Only displayed if current user is author or demo post) */}
      {currentUser && (authorId === currentUser.id || !authorId || authorId.startsWith("author-")) && (
        <Link
          href={`/edit/${postId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-black/5 transition-colors border border-[#DCD7CE]"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Post
        </Link>
      )}
    </div>
  );
}

export default ArticleActions;
