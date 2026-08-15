import React, { useState, useEffect } from "react";
import { Meeting, Project } from "../types";
import { api } from "../lib/api";
import { Calendar, Clock, Video, User, Plus, ExternalLink, ShieldAlert, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MeetingSchedulerProps {
  project: Project;
  user: any;
}

export default function MeetingScheduler({ project, user }: MeetingSchedulerProps) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Custom booking inputs
  const [host, setHost] = useState<"Shivam Dube" | "Digvijay Kadam">("Shivam Dube");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [agenda, setAgenda] = useState("");

  const loadMeetings = async () => {
    if (!project?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMeetings(project.id);
      const transformed = (data || []).map((m: any) => ({
        ...m,
        dateTime: `${m.date}T${m.timeSlot}:00`,
        agenda: m.type || m.title || "Project Sync Call",
        timezone: user?.timezone || "Europe/London",
        meetUrl: m.calendarInviteUrl || "https://meet.google.com"
      }));
      setMeetings(transformed);
    } catch (err) {
      console.error("Failed loading schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
    const interval = setInterval(loadMeetings, 15000);
    return () => clearInterval(interval);
  }, [project]);

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingDate || !meetingTime || !agenda) return;

    setSubmitting(true);
    try {
      await api.bookMeeting(project.id, {
        type: host === "Shivam Dube" ? "Discovery Call" : "Project Review",
        date: meetingDate,
        timeSlot: meetingTime
      });
      setMeetingDate("");
      setMeetingTime("");
      setAgenda("");
      await loadMeetings();
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-bg-card border border-border-custom p-6 rounded-card animate-pulse h-[400px]"></div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* LEFT 2 COLS: Schedule Scheduler form */}
      <div className="lg:col-span-2 bg-bg-card border border-border-custom p-6 rounded-card space-y-6 relative overflow-hidden card-glowing-hover">
        <div className="absolute top-0 right-0 h-24 w-24 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-text-secondary">
            <Calendar className="h-4 w-4 text-accent-primary animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest">// CAL.COM SYNCHRONIZER</span>
          </div>
          <h3 className="font-sans text-base font-bold text-text-primary">Schedule Coordination Sync</h3>
          <p className="text-xs text-text-secondary">
            Secure matching consultation slot with our leading engineering division.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleBookMeeting} className="space-y-4">
          <div>
            <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Select Coordinator</label>
            <select
              value={host}
              onChange={(e: any) => setHost(e.target.value)}
              className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono"
            >
              <option value="Shivam Dube">Shivam Dube (Lead Core Architect)</option>
              <option value="Digvijay Kadam">Digvijay Kadam (Lead Interface Engineer)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Target Date</label>
              <input
                required
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Time (Local)</label>
              <input
                required
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="w-full bg-bg-secondary border border-border-custom text-text-primary px-3 py-2 text-xs rounded-input outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">Discussion Agenda</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Discussing automated clearing settlement logic..."
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary p-3 text-xs rounded-input outline-none font-sans"
            ></textarea>
          </div>

          {/* Timezone compliance indicator */}
          <div className="p-3 bg-bg-secondary border border-border-custom/60 rounded-input flex gap-2 font-mono text-[9px] text-text-muted">
            <ShieldAlert className="h-4 w-4 text-accent-primary flex-shrink-0" />
            <div>
              SYSTEM AUTOMATIC TIMEZONE OFFSET MATCHED:<br />
              <span className="text-text-primary font-bold">[{user.timezone || "Europe/London"}]</span> ZERO MARGIN OF OFFSET ERROR.
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !meetingDate || !meetingTime || !agenda}
            className="w-full py-3 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-glow-strong"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "BOOK COORDINATION Sync"
            )}
          </button>
        </form>
      </div>

      {/* RIGHT 3 COLS: Scheduled lists with Join countdown buttons */}
      <div className="lg:col-span-3 space-y-4">
        <span className="block font-mono text-[9px] text-text-muted uppercase tracking-wider">// SCHEDULED APPOINTMENTS</span>

        {meetings.length === 0 ? (
          <div className="border border-dashed border-border-custom bg-bg-card/40 rounded-card p-12 text-center text-text-secondary h-[400px] flex flex-col justify-center items-center">
            <Video className="h-8 w-8 text-text-muted mb-3" />
            <p className="font-sans text-xs font-semibold text-text-primary">No sessions planned.</p>
            <p className="font-mono text-[10px] text-text-muted uppercase mt-0.5">// SUBMIT CO-ORDINATION SLOT ON LEFT PANEL</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {meetings.map((meet) => {
              const dateObj = new Date(meet.dateTime);
              const formattedDate = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
              const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div 
                  key={meet.id}
                  className="bg-bg-card border border-border-custom p-4 rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4 card-glowing-hover"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded bg-bg-secondary border border-border-custom flex flex-col items-center justify-center text-center p-1 flex-shrink-0">
                      <span className="font-mono text-[8px] uppercase text-text-muted">{formattedDate.split(" ")[0]}</span>
                      <span className="font-sans text-sm font-extrabold text-accent-primary leading-none">{formattedDate.split(" ")[2]}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-sans text-xs font-bold text-text-primary leading-tight">
                        Binary Froster / {project.name} Sync
                      </h4>
                      <p className="text-[11px] text-text-secondary leading-normal">
                        Agenda: {meet.agenda}
                      </p>
                      <div className="flex flex-wrap gap-2.5 font-mono text-[9px] text-text-muted uppercase mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> Host: {meet.hostName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Time: {formattedTime} ({meet.timezone})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Join Link */}
                  <a
                    href={meet.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-bg-secondary hover:bg-accent-primary hover:text-bg-primary border border-accent-primary/20 hover:border-transparent text-accent-primary font-mono text-[10px] font-bold uppercase rounded-input transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap self-start md:self-center"
                  >
                    <Video className="h-3.5 w-3.5" />
                    [JOIN_MEET]
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
