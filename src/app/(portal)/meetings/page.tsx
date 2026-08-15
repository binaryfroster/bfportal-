"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  Video,
  User,
  ShieldAlert,
} from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

interface Meeting {
  id: string;
  agenda: string;
  hostName: string;
  dateTime: string;
  timezone: string;
  meetUrl: string;
}

export default function MeetingSchedulerPage() {
  const { user } = useUser();
  const { loading: dataLoading, meetings, bookMeeting } = usePortalData();
  const [submitting, setSubmitting] = React.useState(false);

  // Booking states
  const [host, setHost] = React.useState<"Shivam Dube" | "Digvijay Kadam" | "Jawad Khan Hakim">("Shivam Dube");
  const [meetingDate, setMeetingDate] = React.useState("");
  const [meetingTime, setMeetingTime] = React.useState("");
  const [agenda, setAgenda] = React.useState("");

  const loading = dataLoading;

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingDate || !meetingTime || !agenda) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newMeet: Meeting = {
      id: `meet-${Date.now()}`,
      agenda,
      hostName: host,
      dateTime: `${meetingDate}T${meetingTime}`,
      timezone: "Europe/London",
      meetUrl: "https://meet.google.com/abc-defg-hij",
    };

    bookMeeting(newMeet);
    setMeetingDate("");
    setMeetingTime("");
    setAgenda("");
    setSubmitting(false);

    toast.success("Sync Session Scheduled successfully");
  };

  if (loading) {
    return <Skeleton className="h-[400px] bg-bg-card border border-border-custom w-full" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* LEFT: Booking Form */}
      <Card className="lg:col-span-2 bg-bg-card border-border-custom relative overflow-hidden self-start">
        <div className="absolute top-0 right-0 h-24 w-24 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none" />

        <CardHeader className="flex flex-row items-center space-y-0 pb-2 border-b border-border-custom/50">
          <Calendar className="h-4 w-4 text-accent-primary mr-2 animate-pulse" />
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            // CAL.COM SYNCHRONIZER
          </span>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleBookMeeting} className="space-y-4">
            <div>
              <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                Select Coordinator
              </label>
              <select
                value={host}
                onChange={(e: any) => setHost(e.target.value)}
                className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono cursor-pointer"
              >
                <option value="Shivam Dube">Shivam Dube (Founder & AI Engineer)</option>
                <option value="Digvijay Kadam">Digvijay Kadam (UI/UX Designer)</option>
                <option value="Jawad Khan Hakim">Jawad Khan Hakim (Backend Architect)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  Target Date
                </label>
                <input
                  required
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                  Time (Local)
                </label>
                <input
                  required
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-custom text-white px-3 py-2 text-xs rounded-input outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[9px] text-text-muted uppercase mb-1">
                Discussion Agenda
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Discussing automated clearing settlement logic..."
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-white p-3 text-xs rounded-input outline-none font-sans"
              />
            </div>

            {/* Timezone sync indicator */}
            <div className="p-3 bg-bg-secondary border border-border-custom/60 rounded-input flex gap-2 font-mono text-[9px] text-text-muted leading-relaxed">
              <ShieldAlert className="h-4 w-4 text-accent-primary shrink-0" />
              <div>
                SYSTEM AUTOMATIC TIMEZONE OFFSET MATCHED:
                <br />
                <span className="text-white font-bold">[Europe/London]</span> ZERO MARGIN OF OFFSET
                ERROR.
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              className="w-full font-mono text-xs uppercase font-bold py-3 cursor-pointer"
              isLoading={submitting}
              disabled={!meetingDate || !meetingTime || !agenda}
            >
              BOOK COORDINATION Sync
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* RIGHT: Scheduled Appointments */}
      <div className="lg:col-span-3 space-y-4">
        <span className="block font-mono text-[9px] text-text-muted uppercase tracking-wider">
          // SCHEDULED APPOINTMENTS
        </span>

        {meetings.length === 0 ? (
          <div className="border border-dashed border-border-custom bg-bg-card/40 rounded-card p-12 text-center text-text-secondary h-[400px] flex flex-col justify-center items-center">
            <Video className="h-8 w-8 text-text-muted mb-3" />
            <p className="font-sans text-xs font-semibold text-white">No sessions planned.</p>
            <p className="font-mono text-[10px] text-text-muted uppercase mt-0.5">
              // SUBMIT COORDINATION SLOT ON LEFT PANEL
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {meetings.map((meet) => {
              const dateObj = new Date(meet.dateTime);
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const formattedTime = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Card
                  key={meet.id}
                  className="bg-bg-card border-border-custom p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 card-glowing-hover text-white"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded bg-bg-secondary border border-border-custom flex flex-col items-center justify-center text-center p-1 shrink-0">
                      <span className="font-mono text-[8px] uppercase text-text-muted">
                        {formattedDate.split(" ")[0]}
                      </span>
                      <span className="font-sans text-sm font-extrabold text-accent-primary leading-none">
                        {formattedDate.split(" ")[2]}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-sans text-xs font-bold leading-tight">
                        Binary Froster Sync Session
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

                  <a
                    href={meet.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-bg-secondary hover:bg-accent-primary hover:text-bg-primary border border-accent-primary/20 hover:border-transparent text-accent-primary font-mono text-[10px] font-bold uppercase rounded-input transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap self-start md:self-center"
                  >
                    <Video className="h-3.5 w-3.5" />
                    [JOIN_MEET]
                  </a>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
