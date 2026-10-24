"use client";

import React, { useState } from "react";
import { Comment } from "@/types/blog";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import { MessageSquare, Heart, Send } from "lucide-react";

interface CommentSectionProps {
  initialComments?: Comment[];
}

export function CommentSection({ initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      setErrorMessage("Please enter a comment before submitting.");
      return;
    }

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: authorName.trim() || "Thoughtful Reader",
      authorAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      date: "Just now",
      content: commentText.trim(),
      likes: 0,
    };

    setComments([newComment, ...comments]);
    setCommentText("");
    setErrorMessage("");
  };

  const toggleCommentLike = (id: string) => {
    setLikedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="pt-10 border-t border-[#E8E4DA] my-12 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-slate-600" />
          Responses ({comments.length})
        </h3>
        <span className="text-xs text-slate-500 font-sans">
          Editorial discourse
        </span>
      </div>

      {/* Write a Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="commenter-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Your Name (Optional)
            </label>
            <input
              id="commenter-name"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#D8D4CA] focus:outline-none focus:border-slate-800"
            />
          </div>
        </div>

        <Textarea
          id="comment-content"
          label="What are your thoughts?"
          placeholder="Share your perspective or constructive critique on this essay..."
          rows={3}
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          errorMessage={errorMessage}
          required
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            Post Response
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isLiked = likedComments[comment.id];
            const currentLikes = comment.likes + (isLiked ? 1 : 0);

            return (
              <div
                key={comment.id}
                className="bg-white rounded-xl p-5 border border-[#ECE8DF] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900 leading-tight">
                        {comment.authorName}
                      </h5>
                      <span className="text-xs text-slate-400">
                        {comment.date}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCommentLike(comment.id)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                      isLiked
                        ? "bg-rose-50 text-rose-600 border-rose-200"
                        : "text-slate-500 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Heart
                      className={`w-3 h-3 ${
                        isLiked ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                    <span>{currentLikes}</span>
                  </button>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed pl-11">
                  {comment.content}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 bg-[#F6F4EE] rounded-xl border border-dashed border-[#DDD9CE] text-slate-500 text-sm">
            No responses yet. Be the first to start the conversation!
          </div>
        )}
      </div>
    </section>
  );
}

export default CommentSection;
