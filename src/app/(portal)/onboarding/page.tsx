"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Compass,
  LayoutDashboard,
  MessageSquare,
  ArrowRight,
  Check,
  Terminal,
  UploadCloud,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/src/components/providers/auth-provider";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile } = useUser();
  const [step, setStep] = React.useState<"welcome" | "tour" | "checklist">("welcome");
  const [tourIndex, setTourIndex] = React.useState(0);

  // Checklist states
  const [phone, setPhone] = React.useState("");
  const [timezone, setTimezone] = React.useState("Asia/Kolkata");
  const [proposalAccepted, setProposalAccepted] = React.useState(false);
  const [fileUploaded, setFileUploaded] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setTimezone(user.timezone || "Asia/Kolkata");
    }
  }, [user]);

  const tourSteps = [
    {
      title: "Real-Time Dashboard",
      description:
        "Monitor active project phases, circular progress, and immediate pending task indicators syncing automatically without manual refreshing.",
      icon: <LayoutDashboard className="h-8 w-8 text-accent-primary" />,
    },
    {
      title: "Interactive Project Lifecycle",
      description:
        "A linear progress model of all six development stages. Expand individual milestones to track technical progress, due dates, and completion stamps.",
      icon: <Compass className="h-8 w-8 text-accent-primary" />,
    },
    {
      title: "Secure Communication Thread",
      description:
        "Direct real-time threads connected to Shivam, Digvijay, and Jawad. Shared documents are securely segregated, maintaining strict confidentiality.",
      icon: <MessageSquare className="h-8 w-8 text-accent-primary" />,
    },
  ];

  const handleNextTour = () => {
    if (tourIndex < tourSteps.length - 1) {
      setTourIndex(tourIndex + 1);
    } else {
      setStep("checklist");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileUploaded(true);
      toast.success(`Reference file loaded: ${file.name}`);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (phone.length < 5 || !proposalAccepted || !fileUploaded) return;

    setIsLoading(true);
    try {
      // Complete profile onboarding in Auth Context
      const success = await updateProfile({
        phone,
        timezone,
        // Mark onboarded true as requested
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onboarded: true,
      });

      if (success) {
        toast.success("Welcome aboard!");
        router.replace("/dashboard");
      } else {
        toast.error("Failed to update profile parameters.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Onboarding failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const isChecklistValid = phone.length > 5 && proposalAccepted && fileUploaded;

  return (
    <div className="min-h-screen bg-bg-primary text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background terminal decorations */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#00d4ff 1.5px, transparent 1.5px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <AnimatePresence mode="wait">
        {/* STEP 1: WELCOME BRAND SPLASH */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xl text-center space-y-8 bg-bg-card p-10 border border-border-custom rounded-card shadow-glow"
          >
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-bg-secondary border border-accent-primary/20 flex items-center justify-center shadow-glow animate-pulse">
                <Terminal className="h-8 w-8 text-accent-primary" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="font-sans text-3xl font-bold tracking-tight text-white md:text-4xl">
                BINARY <span className="text-accent-primary">FROSTER</span>
              </h1>
              <p className="text-accent-primary font-mono text-xs tracking-widest uppercase">
                "Precision-Built Technology for Growing Businesses"
              </p>
            </div>

            <div className="h-[1px] bg-border-custom w-1/2 mx-auto" />

            <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
              We design, architect, and deploy high-throughput applications with clinical precision.
              Welcome to your custom command interface.
            </p>

            <button
              onClick={() => setStep("tour")}
              className="px-8 py-3 bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-all inline-flex items-center gap-2 cursor-pointer shadow-glow-strong"
            >
              INITIALIZE PORTAL TOUR
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 2: INTERACTIVE TOUR */}
        {step === "tour" && (
          <motion.div
            key="tour"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg bg-bg-card border border-border-custom p-8 rounded-card shadow-glow relative"
          >
            {/* Steps indicator */}
            <div className="absolute top-8 right-8 font-mono text-xs text-accent-primary">
              [{tourIndex + 1}/{tourSteps.length}]
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Compass
                className="h-5 w-5 text-accent-primary animate-spin"
                style={{ animationDuration: "8s" }}
              />
              <span className="font-mono text-xs text-text-muted uppercase tracking-widest">
                // ARCHITECTURE EXPLORER
              </span>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-input bg-bg-secondary border border-border-custom inline-block">
                {tourSteps[tourIndex].icon}
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                {tourSteps[tourIndex].title}
              </h2>

              <p className="text-text-secondary text-sm leading-relaxed min-h-[80px]">
                {tourSteps[tourIndex].description}
              </p>

              {/* Dot Indicators */}
              <div className="flex gap-1.5 pt-2">
                {tourSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === tourIndex ? "w-6 bg-accent-primary" : "w-1.5 bg-border-custom"
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border-custom">
                <button
                  onClick={() => setStep("checklist")}
                  className="font-mono text-xs text-text-muted hover:text-white transition-colors cursor-pointer"
                >
                  [SKIP_TOUR]
                </button>
                <button
                  onClick={handleNextTour}
                  className="px-6 py-2.5 bg-bg-secondary border border-accent-primary/40 text-accent-primary hover:bg-accent-primary/10 font-mono text-xs uppercase tracking-widest font-bold rounded-input transition-all flex items-center gap-2 cursor-pointer"
                >
                  {tourIndex === tourSteps.length - 1 ? "ENTER COMMAND INTAKE" : "NEXT COMMAND"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: FIRST-TIME CHECKLIST */}
        {step === "checklist" && (
          <motion.div
            key="checklist"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl bg-bg-card border border-border-custom p-8 rounded-card shadow-glow space-y-6"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-accent-primary" />
                <span className="font-mono text-xs text-accent-primary uppercase tracking-widest">
                  // FIRST-TIME INTEGRITY CHECKLIST
                </span>
              </div>
              <h2 className="text-xl font-bold font-sans">Complete Intake Formalities</h2>
              <p className="text-xs text-text-secondary">
                To guarantee secure deployment pipelines, complete the following baseline parameters.
              </p>
            </div>

            <div className="space-y-4">
              {/* Task 1: Complete profile */}
              <div className="p-4 bg-bg-secondary border border-border-custom rounded-input space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                        phone.length > 5
                          ? "border-brand-success bg-brand-success/10 text-brand-success"
                          : "border-border-custom text-text-muted"
                      }`}
                    >
                      {phone.length > 5 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <span className="text-[10px] font-mono">1</span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                      [PARAMETER] Profile Communication Settings
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
                  <div>
                    <label className="block text-[10px] font-mono text-text-secondary mb-1">
                      PHONE COMMAND
                    </label>
                    <input
                      type="text"
                      placeholder="+44 20 7946 0192"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-bg-primary border border-border-custom focus:border-accent-primary text-white px-3 py-1.5 text-xs rounded-input outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-text-secondary mb-1">
                      SYSTEM TIMEZONE
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-bg-primary border border-border-custom focus:border-accent-primary text-white px-2 py-1.5 text-xs rounded-input outline-none font-mono cursor-pointer"
                    >
                      <option value="Europe/London">London (GMT+1)</option>
                      <option value="America/New_York">New York (EST)</option>
                      <option value="Asia/Kolkata">Kolkata (IST)</option>
                      <option value="America/Los_Angeles">Pacific (PST)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Task 2: Accept proposal */}
              <div className="p-4 bg-bg-secondary border border-border-custom rounded-input flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                      proposalAccepted
                        ? "border-brand-success bg-brand-success/10 text-brand-success"
                        : "border-border-custom text-text-muted"
                    }`}
                  >
                    {proposalAccepted ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-[10px] font-mono">2</span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className="block font-mono text-xs font-semibold uppercase tracking-wider text-white">
                      [CONTRACT] Master Project Proposal
                    </span>
                    <span className="block text-[10px] text-text-secondary">
                      Review development cost tables, SLA parameters, and milestones.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setProposalAccepted(!proposalAccepted)}
                  className={`px-4 py-1.5 font-mono text-[11px] rounded-input transition-colors cursor-pointer border ${
                    proposalAccepted
                      ? "bg-brand-success/10 border-brand-success/20 text-brand-success"
                      : "bg-bg-primary border-border-custom text-text-secondary hover:text-white hover:border-accent-primary"
                  }`}
                >
                  {proposalAccepted ? "[ACCEPTED]" : "[ACCEPT_PROPOSAL]"}
                </button>
              </div>

              {/* Task 3: Reference file upload */}
              <div className="p-4 bg-bg-secondary border border-border-custom rounded-input space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                        fileUploaded
                          ? "border-brand-success bg-brand-success/10 text-brand-success"
                          : "border-border-custom text-text-muted"
                      }`}
                    >
                      {fileUploaded ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <span className="text-[10px] font-mono">3</span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <span className="block font-mono text-xs font-semibold uppercase tracking-wider text-white">
                        [INTENSITY] References & Brand assets
                      </span>
                      <span className="block text-[10px] text-text-secondary">
                        Upload brand assets, vector icons, or specifications to references folder.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pl-7">
                  <label className="inline-flex items-center justify-center border border-dashed border-border-custom hover:border-accent-primary w-full p-4 rounded-input bg-bg-primary cursor-pointer text-center text-xs text-text-muted transition-colors font-mono hover:text-white">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.webp,.zip"
                    />
                    {fileUploaded ? (
                      <span className="text-brand-success flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        {fileName} - Upload Secured
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UploadCloud className="h-4 w-4 text-accent-primary" />
                        Click to select brand logo or design assets
                      </span>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleCompleteOnboarding}
              disabled={isLoading || !isChecklistValid}
              className={`w-full py-3.5 font-mono text-xs font-bold uppercase tracking-widest rounded-input border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isChecklistValid
                  ? "bg-accent-primary text-bg-primary border-transparent shadow-glow-strong"
                  : "bg-bg-secondary text-text-muted border-border-custom cursor-not-allowed"
              }`}
            >
              {isLoading ? "SAVING PARAMETERS..." : "INITIALIZE FULL COMMAND SET"}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
