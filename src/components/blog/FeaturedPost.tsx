import React from "react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";
import Badge from "../ui/Badge";
import { Clock, Calendar, ArrowRight, Sparkles } from "lucide-react";

interface FeaturedPostProps {
  post: BlogPost;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <article className="relative bg-white rounded-3xl border border-[#E8E4DA] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Cover Image Container */}
        <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto min-h-[340px] overflow-hidden bg-slate-100 group">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
          />
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Cover Story
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <Badge variant="editorial">{post.category}</Badge>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                {post.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}
              </span>
            </div>

            <Link href={`/blog/${post.slug}`} className="block group">
              <h2 className="text-2xl sm:text-3xl lg:text-3xl font-serif font-bold text-slate-900 group-hover:text-amber-800 transition-colors leading-tight">
                {post.title}
              </h2>
            </Link>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          </div>

          {/* Author & CTA */}
          <div className="pt-8 mt-6 border-t border-[#F0ECE2] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#EDE9E0]"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {post.author.name}
                </p>
                <p className="text-xs text-slate-500 leading-tight">
                  {post.author.role}
                </p>
              </div>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-amber-800 group px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Read Story
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default FeaturedPost;
