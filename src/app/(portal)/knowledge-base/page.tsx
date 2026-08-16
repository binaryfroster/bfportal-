"use client";

import * as React from "react";
import { MessageCircleQuestion, Search, Book, Terminal, Code, HelpCircle, FileText, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

export default function KnowledgeBasePage() {
  const [search, setSearch] = React.useState("");

  const articles = [
    { title: "How to Approve Deliverables & Request Revisions", category: "Portal Basics", readTime: "3 min" },
    { title: "Stripe & Razorpay Payment Methods Guide", category: "Billing", readTime: "4 min" },
    { title: "Submitting High-Priority SLA Incident Tickets", category: "Support", readTime: "2 min" },
    { title: "API Webhook Authentication & Signature Verification", category: "Developer Docs", readTime: "6 min" },
    { title: "Understanding the 6-Phase Project Lifecycle Stepper", category: "Project Tracking", readTime: "5 min" },
    { title: "Enterprise API Security & Key Management", category: "Security", readTime: "3 min" },
  ];

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Search Input */}
      <Card className="bg-bg-card border-border-custom p-6 space-y-4">
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
          <Card key={index} className="bg-bg-card border-border-custom p-5 space-y-3 hover:border-accent-primary/40 transition-colors cursor-pointer group">
            <div className="flex justify-between items-center">
              <Badge variant="cyan" className="font-mono text-[8px]">
                {item.category}
              </Badge>
              <span className="font-mono text-[9px] text-text-muted">{item.readTime} read</span>
            </div>
            <h4 className="font-sans text-sm font-bold text-white group-hover:text-accent-primary transition-colors flex items-center justify-between">
              <span>{item.title}</span>
              <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-accent-primary" />
            </h4>
          </Card>
        ))}
      </div>
    </div>
  );
}
