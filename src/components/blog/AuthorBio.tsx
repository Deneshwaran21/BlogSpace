import React from "react";
import { Author } from "@/types/blog";
import { CheckCircle2, Globe, ExternalLink } from "lucide-react";

interface AuthorBioProps {
  author: Author;
}

export function AuthorBio({ author }: AuthorBioProps) {
  return (
    <div className="bg-[#F6F4EE] rounded-2xl p-6 sm:p-8 border border-[#E8E4DA] flex flex-col sm:flex-row items-start sm:items-center gap-6 my-10">
      <img
        src={author.avatar}
        alt={author.name}
        className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white shadow-xs shrink-0"
      />
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
            {author.name}
          </h4>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Verified Contributor
          </span>
        </div>
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">
          {author.role}
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">{author.bio}</p>

        {/* Social Links */}
        <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
          {author.twitter && (
            <span className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {author.twitter}
            </span>
          )}
          {author.github && (
            <span className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              {author.github}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthorBio;
