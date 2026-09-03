"use client";

import * as React from "react";
import {
  MessageCircleQuestion,
  Search,
  ChevronRight,
  Bookmark,
  X,
  Plus,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Tag,
  Clock,
  User,
  Share2,
} from "lucide-react";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { useUser } from "@/src/components/providers/auth-provider";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { KnowledgeArticle } from "@/src/types";
import toast from "react-hot-toast";

const CATEGORIES = [
  "All",
  "Portal Basics",
  "Billing",
  "Support",
  "Developer Docs",
  "Project Tracking",
  "Security",
];

export default function KnowledgeBasePage() {
  const { knowledgeArticles, addKnowledgeArticle } = usePortalData();
  const { user } = useUser();

  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [selectedArticle, setSelectedArticle] = React.useState<KnowledgeArticle | null>(null);
  const [bookmarks, setBookmarks] = React.useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = React.useState(false);
  const [isNewArticleOpen, setIsNewArticleOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // New Article Form
  const [newTitle, setNewTitle] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("Portal Basics");
  const [newReadTime, setNewReadTime] = React.useState("3 min");
  const [newSummary, setNewSummary] = React.useState("");
  const [newContent, setNewContent] = React.useState("");
  const [newTags, setNewTags] = React.useState("Guides, Documentation");

  const filtered = (knowledgeArticles || []).filter((a) => {
    const matchesCategory = selectedCategory === "All" || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesBookmark = !showBookmarksOnly || bookmarks.includes(a.id);

    return matchesCategory && matchesSearch && matchesBookmark;
  });

  const toggleBookmark = (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const isBookmarked = prev.includes(articleId);
      if (isBookmarked) {
        toast.success("Removed from bookmarks", { icon: "🔖" });
        return prev.filter((id) => id !== articleId);
      } else {
        toast.success("Article saved to bookmarks!", { icon: "🔖" });
        return [...prev, articleId];
      }
    });
  };

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Please fill in article title and content");
      return;
    }

    addKnowledgeArticle({
      title: newTitle.trim(),
      category: newCategory,
      readTime: newReadTime,
      summary: newSummary || newTitle,
      content: newContent,
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
      author: user?.name || "Binary Froster Team",
    });

    toast.success("Knowledge base article published!");
    setIsNewArticleOpen(false);
    setNewTitle("");
    setNewSummary("");
    setNewContent("");
  };

  const copyArticleLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Article link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion className="h-4.5 w-4.5 text-accent-primary" />
          <h1 className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // KNOWLEDGE BASE & DOCUMENTATION REPOSITORY
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className={`text-xs font-mono px-3 py-1.5 rounded-input border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showBookmarksOnly
                ? "bg-accent-primary/20 text-accent-primary border-accent-primary/40 font-bold"
                : "bg-bg-secondary text-text-muted hover:text-white border-border-custom"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            BOOKMARKS ({bookmarks.length})
          </button>
          <Button
            size="sm"
            onClick={() => setIsNewArticleOpen(true)}
            className="flex items-center gap-1.5 text-xs font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            CREATE ARTICLE
          </Button>
        </div>
      </div>

      {/* Search & Filter Matrix */}
      <Card className="bg-bg-card border-border-custom p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-mono px-3 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-accent-primary/15 text-accent-primary border border-accent-primary/40 font-bold"
                  : "bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search knowledge base by keywords, API parameters, SLA rules, or guide titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white pl-10 pr-4 py-2.5 text-xs rounded-input outline-none font-sans"
          />
        </div>
      </Card>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-muted font-mono text-xs">
            // NO ARTICLES MATCH YOUR SEARCH QUERY
          </div>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              onClick={() => setSelectedArticle(item)}
              className="bg-bg-card border-border-custom p-5 space-y-3 hover:border-accent-primary/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="cyan" className="font-mono text-[8px]">
                    {item.category}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3 text-text-muted" /> {item.readTime}
                    </span>
                    <button
                      onClick={(e) => toggleBookmark(e, item.id)}
                      className={`p-1.5 rounded transition-colors flex items-center justify-center ${
                        bookmarks.includes(item.id)
                          ? "bg-accent-primary/15 text-accent-primary border border-accent-primary/40"
                          : "bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                      }`}
                    >
                      <Bookmark
                        className="h-3.5 w-3.5"
                        fill={bookmarks.includes(item.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                </div>

                <h3 className="font-sans text-sm font-bold text-white group-hover:text-accent-primary transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-border-custom/40 flex items-center justify-between text-[10px] font-mono text-text-muted">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-text-muted" />
                  <span>{item.author}</span>
                </div>
                <div className="flex items-center gap-1 text-accent-primary font-bold">
                  <span>READ SPEC</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Read Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border-custom rounded-card p-6 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-border-custom/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="cyan" className="font-mono text-[9px]">
                    {selectedArticle.category}
                  </Badge>
                  <span className="font-mono text-[10px] text-text-muted">
                    {selectedArticle.readTime} read • Updated {selectedArticle.lastUpdated}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-sans">
                  {selectedArticle.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyArticleLink}
                  className="p-1.5 rounded text-text-muted hover:text-white bg-bg-secondary border border-border-custom"
                  title="Share link"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-text-muted hover:text-white p-1.5 rounded transition-colors bg-bg-secondary hover:bg-slate-800 border border-border-custom"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Article Body */}
            <div className="space-y-4 text-text-secondary text-sm font-sans leading-relaxed whitespace-pre-line bg-bg-secondary/40 p-5 rounded-input border border-border-custom/40">
              {selectedArticle.content}
            </div>

            {/* Tags */}
            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-text-muted" />
                {selectedArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-mono bg-bg-secondary text-text-muted px-2 py-0.5 rounded border border-border-custom"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Feedback footer */}
            <div className="pt-4 border-t border-border-custom/40 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 text-xs font-mono text-text-muted">
                <span>Was this guide helpful?</span>
                <button
                  onClick={() => toast.success("Thank you for your feedback!", { icon: "👍" })}
                  className="p-1.5 rounded hover:bg-emerald-500/10 hover:text-emerald-400 border border-border-custom transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toast.success("Feedback recorded for documentation revision.", { icon: "📝" })}
                  className="p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-400 border border-border-custom transition-colors"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedArticle(null)}
                className="font-mono text-xs"
              >
                [CLOSE VIEWER]
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Article Modal */}
      {isNewArticleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border-custom rounded-card p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border-custom/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent-primary" />
                <h2 className="font-mono text-xs text-white uppercase tracking-wider">
                  // CREATE NEW KNOWLEDGE ARTICLE
                </h2>
              </div>
              <button
                onClick={() => setIsNewArticleOpen(false)}
                className="text-text-muted hover:text-white p-1 rounded bg-bg-secondary border border-border-custom"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deploying Next.js 15 SSR with Cloudflare Workers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white text-xs px-3 py-2 rounded-input outline-none focus:border-accent-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom text-white text-xs px-3 py-2 rounded-input outline-none font-mono"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">
                    Estimated Read Time
                  </label>
                  <input
                    type="text"
                    value={newReadTime}
                    onChange={(e) => setNewReadTime(e.target.value)}
                    placeholder="e.g. 4 min"
                    className="w-full bg-bg-secondary border border-border-custom text-white text-xs px-3 py-2 rounded-input outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">
                  Brief Summary
                </label>
                <input
                  type="text"
                  placeholder="One sentence summary of this documentation guide..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white text-xs px-3 py-2 rounded-input outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">
                  Article Content (Markdown Supported)
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write documentation content, code examples, API parameters..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white text-xs p-3 rounded-input outline-none font-mono focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white text-xs px-3 py-2 rounded-input outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-border-custom/50 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewArticleOpen(false)}
                  className="font-mono text-xs"
                >
                  CANCEL
                </Button>
                <Button type="submit" size="sm" className="font-mono text-xs">
                  PUBLISH ARTICLE
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
