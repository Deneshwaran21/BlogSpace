import React from "react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";
import Badge from "../ui/Badge";
import { Clock, Calendar, ArrowUpRight } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-[#E8E4DA] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#D8D4CA] transition-all duration-300">
      {/* Thumbnail */}
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-16/10 overflow-hidden bg-slate-100"
      >
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="editorial" size="sm">
            {post.category}
          </Badge>
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {post.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {post.readingTime}
            </span>
          </div>

          <Link href={`/blog/${post.slug}`} className="block">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
          </Link>

          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Author Footer */}
        <div className="mt-5 pt-4 border-t border-[#F0ECE2] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
            />
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-semibold text-slate-800 leading-tight truncate">
                {post.author.name}
              </span>
              <span className="text-[10px] text-slate-500 font-sans leading-tight truncate">
                {post.author.role}
              </span>
            </div>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="text-slate-400 group-hover:text-slate-900 p-1 rounded-md transition-colors"
            aria-label={`Read ${post.title}`}
          >
            <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
