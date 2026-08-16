"use client";

import * as React from "react";
import { MessageCircleQuestion, Search, ChevronRight, Bookmark, X } from "lucide-react";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import toast from "react-hot-toast";

type Article = {
  title: string;
  category: string;
  readTime: string;
};

const CATEGORIES = ["All", "Portal Basics", "Billing", "Support", "Developer Docs", "Project Tracking", "Security"];

export default function KnowledgeBasePage() {
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null);
  const [bookmarks, setBookmarks] = React.useState<string[]>([]);

  const articles: Article[] = [
    { title: "How to Approve Deliverables & Request Revisions", category: "Portal Basics", readTime: "3 min" },
    { title: "Stripe & Razorpay Payment Methods Guide", category: "Billing", readTime: "4 min" },
    { title: "Submitting High-Priority SLA Incident Tickets", category: "Support", readTime: "2 min" },
    { title: "API Webhook Authentication & Signature Verification", category: "Developer Docs", readTime: "6 min" },
    { title: "Understanding the 6-Phase Project Lifecycle Stepper", category: "Project Tracking", readTime: "5 min" },
    { title: "Enterprise API Security & Key Management", category: "Security", readTime: "3 min" },
  ];

  const filtered = articles.filter(
    (a) =>
      (selectedCategory === "All" || a.category === selectedCategory) &&
      (a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleBookmark = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const isBookmarked = prev.includes(title);
      if (isBookmarked) {
        toast.success("Removed from bookmarks", { icon: "🔖" });
        return prev.filter((t) => t !== title);
      } else {
        toast.success("Article bookmarked!", { icon: "🔖" });
        return [...prev, title];
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // KNOWLEDGE BASE & DOCUMENTATION CENTER
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="bg-bg-card border-border-custom p-6 space-y-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
                  : "bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search articles, developer docs, billing guides, or SLA rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white pl-10 pr-4 py-2.5 text-xs rounded-input outline-none font-sans"
          />
        </div>
      </Card>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, index) => (
          <Card 
            key={index} 
            onClick={() => setSelectedArticle(item)}
            className="bg-bg-card border-border-custom p-5 space-y-3 hover:border-accent-primary/40 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-center">
              <Badge variant="cyan" className="font-mono text-[8px]">
                {item.category}
              </Badge>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] text-text-muted">{item.readTime} read</span>
                <button
                  onClick={(e) => toggleBookmark(e, item.title)}
                  className={`p-1.5 rounded transition-colors flex items-center justify-center ${
                    bookmarks.includes(item.title)
                      ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/30"
                      : "bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" fill={bookmarks.includes(item.title) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            <h4 className="font-sans text-sm font-bold text-white group-hover:text-accent-primary transition-colors flex items-center justify-between">
              <span>{item.title}</span>
              <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-accent-primary" />
            </h4>
          </Card>
        ))}
      </div>

      {/* Read Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border-custom rounded-card p-6 shadow-glow w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Badge variant="cyan" className="font-mono text-[10px]">
                  {selectedArticle.category}
                </Badge>
                <span className="font-mono text-[10px] text-text-muted">{selectedArticle.readTime} read</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-text-muted hover:text-white p-1 rounded transition-colors bg-bg-secondary hover:bg-slate-800 border border-border-custom"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-6 font-sans">{selectedArticle.title}</h2>
            
            <div className="space-y-4 text-text-secondary text-sm font-sans leading-relaxed">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.
              </p>
              <p>
                Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi.
              </p>
              <p>
                Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi.
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border-custom/40 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom text-[9px] font-mono font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
