"use client";

import * as React from "react";
import { MessageSquare, Star, Send, Award, ThumbsUp } from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function FeedbackPage() {
  const { user } = useUser();
  const { npsFeedback, submitFeedback } = usePortalData();

  const [npsScore, setNpsScore] = React.useState<number>(10);
  const [csatRating, setCsatRating] = React.useState<number>(5);
  const [category, setCategory] = React.useState("Delivery & Engineering Speed");
  const [comments, setComments] = React.useState("");
  const [testimonialGranted, setTestimonialGranted] = React.useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments) return;

    submitFeedback({
      userName: user?.name || "John Sterling",
      npsScore,
      csatRating,
      category,
      comments,
      testimonialGranted,
    });

    setComments("");
    toast.success("Thank you! Your feedback score has been recorded.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4.5 w-4.5 text-accent-primary" />
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // CLIENT FEEDBACK & NPS REQUISITION
          </span>
        </div>
      </div>

      {/* Feedback Form Card */}
      <Card className="bg-bg-card border-border-custom p-6 space-y-6">
        <div className="space-y-1">
          <span className="block font-mono text-[9px] text-text-muted uppercase">// NET PROMOTER SCORE (NPS)</span>
          <h3 className="font-sans text-base font-bold text-white">
            How likely are you to recommend Binary Froster to an enterprise peer?
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
          {/* NPS Scale 0-10 */}
          <div className="space-y-2">
            <label className="block text-[9px] text-text-muted uppercase">// NPS SCORE (0 - 10)</label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNpsScore(i)}
                  className={`w-9 h-9 rounded font-mono font-bold text-xs transition-all cursor-pointer ${
                    npsScore === i
                      ? "bg-accent-primary text-bg-primary shadow-glow scale-105"
                      : "bg-bg-secondary text-text-secondary hover:text-white border border-border-custom"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* CSAT Star Rating 1-5 */}
          <div className="space-y-2">
            <label className="block text-[9px] text-text-muted uppercase">// CSAT QUALITY RATING (1 - 5 STARS)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCsatRating(star)}
                  className="cursor-pointer"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= csatRating ? "text-amber-400 fill-amber-400" : "text-text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-text-muted uppercase mb-1">// QUALITATIVE FEEDBACK & REVIEWS</label>
            <textarea
              required
              rows={4}
              placeholder="State explicit feedback regarding engineering delivery, communication, or code quality..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full bg-bg-secondary border border-border-custom text-white p-3 text-xs rounded-input outline-none font-sans"
            />
          </div>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={testimonialGranted}
              onChange={(e) => setTestimonialGranted(e.target.checked)}
            />
            <span className="text-text-secondary">Authorize Binary Froster to publish this feedback as an enterprise testimonial.</span>
          </label>

          <Button type="submit" variant="accent" className="font-mono text-xs uppercase font-bold cursor-pointer">
            <Send className="h-4 w-4 mr-1.5" />
            SUBMIT FEEDBACK RECORD
          </Button>
        </form>
      </Card>

      {/* Historical Feedback Log */}
      <Card className="bg-bg-card border-border-custom p-6 space-y-4">
        <span className="block font-mono text-[9px] text-text-muted uppercase">// PREVIOUS SUBMITTED REVIEWS</span>
        <div className="space-y-3 font-mono text-xs">
          {npsFeedback.map((fb) => (
            <div key={fb.id} className="p-4 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-accent-primary font-bold">{fb.userName}</span>
                <Badge variant="success" className="font-mono text-[8px]">
                  NPS: {fb.npsScore}/10 • CSAT: {fb.csatRating}/5 ⭐
                </Badge>
              </div>
              <p className="font-sans text-xs text-text-secondary">{fb.comments}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
