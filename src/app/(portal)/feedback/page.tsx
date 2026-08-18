"use client";

import * as React from "react";
import { MessageSquare, Star, Send, Award, ThumbsUp, Edit, Trash2, Eye, EyeOff, X } from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function FeedbackPage() {
  const { user } = useUser();
  const { npsFeedback, submitFeedback, updateFeedback, deleteFeedback } = usePortalData();

  const [npsScore, setNpsScore] = React.useState<number>(10);
  const [csatRating, setCsatRating] = React.useState<number>(5);
  const [category, setCategory] = React.useState("Delivery & Engineering Speed");
  const [comments, setComments] = React.useState("");
  const [testimonialGranted, setTestimonialGranted] = React.useState(true);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editNps, setEditNps] = React.useState<number>(10);
  const [editCsat, setEditCsat] = React.useState<number>(5);
  const [editComments, setEditComments] = React.useState("");

  const isAdmin = user?.role === "admin";

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

  const handleEditClick = (fb: any) => {
    setEditingId(fb.id);
    setEditNps(fb.npsScore);
    setEditCsat(fb.csatRating);
    setEditComments(fb.comments);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    updateFeedback(editingId, { npsScore: editNps, csatRating: editCsat, comments: editComments });
    setEditingId(null);
    toast.success("Feedback updated successfully.");
  };

  const handleDelete = (id: string) => {
    deleteFeedback(id);
    toast.success("Feedback record deleted.");
  };

  const handleToggleTestimonial = (id: string, currentVal: boolean) => {
    updateFeedback(id, { testimonialGranted: !currentVal });
    toast.success(`Testimonial visibility ${!currentVal ? "enabled" : "disabled"}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border-custom/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4.5 w-4.5 text-accent-primary" />
          <h1 className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // CLIENT FEEDBACK & NPS REQUISITION
          </h1>
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
            <div key={fb.id} className="p-4 bg-bg-secondary/40 border border-border-custom/50 rounded-input space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div>
                  <span className="text-accent-primary font-bold block mb-1">{fb.userName}</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="success" className="font-mono text-[8px]">
                      NPS: {fb.npsScore}/10 • CSAT: {fb.csatRating}/5 ⭐
                    </Badge>
                    {isAdmin && (
                      <span className="text-[9px] text-text-muted">
                        Testimonial: {fb.testimonialGranted ? "Yes" : "No"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {isAdmin && (
                    <button
                      onClick={() => handleToggleTestimonial(fb.id, fb.testimonialGranted ?? false)}
                      className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                        fb.testimonialGranted
                          ? "bg-brand-success/10 hover:bg-brand-success/25 text-brand-success border border-brand-success/30"
                          : "bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                      }`}
                    >
                      {fb.testimonialGranted ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {fb.testimonialGranted ? "Public" : "Hidden"}
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClick(fb)}
                    className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(fb.id)}
                    className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
              <p className="font-sans text-xs text-text-secondary">{fb.comments}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="bg-bg-card border border-border-custom rounded-card p-6 shadow-glow w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold">Edit Feedback Record</h3>
              <button onClick={() => setEditingId(null)} className="text-text-muted hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-6 font-mono text-xs">
              <div className="space-y-2">
                <label className="block text-[9px] text-text-muted uppercase">// NPS SCORE (0 - 10)</label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditNps(i)}
                      className={`w-9 h-9 rounded font-mono font-bold text-xs transition-all cursor-pointer ${
                        editNps === i
                          ? "bg-accent-primary text-bg-primary shadow-glow scale-105"
                          : "bg-bg-secondary text-text-secondary hover:text-white border border-border-custom"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] text-text-muted uppercase">// CSAT QUALITY RATING</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditCsat(star)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= editCsat ? "text-amber-400 fill-amber-400" : "text-text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[9px] text-text-muted uppercase mb-1">// COMMENTS</label>
                <textarea
                  required
                  rows={4}
                  value={editComments}
                  onChange={(e) => setEditComments(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border-custom/40">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-[9px] font-mono font-bold px-3 py-2 text-text-muted hover:text-white cursor-pointer"
                >
                  [CANCEL]
                </button>
                <button
                  type="submit"
                  className="bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase font-bold rounded-input shadow-glow px-4 py-2 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
