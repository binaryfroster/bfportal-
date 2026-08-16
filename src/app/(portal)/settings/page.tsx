"use client";

import * as React from "react";
import {
  UserCheck,
  Shield,
  Key,
  Bell,
  Check,
  Lock,
  SaveAll,
  LogOut,
  Download,
} from "lucide-react";
import { useUser } from "@/src/components/providers/auth-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, updateProfile } = useUser();
  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [phone, setPhone] = React.useState(user?.phone || "");
  const [timezone, setTimezone] = React.useState(user?.timezone || "Asia/Kolkata");
  const [companyName, setCompanyName] = React.useState(user?.companyName || "");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  // Security password update state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setTimezone(user.timezone || "Asia/Kolkata");
      setCompanyName(user.companyName || "");
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Simulate API update
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (user) {
      await updateProfile({
        name,
        email,
        phone,
        timezone,
        companyName,
      });
    }

    setSuccess(true);
    setLoading(false);
    toast.success("Profile updated successfully");
    setTimeout(() => setSuccess(false), 3000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;

    setPasswordLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setPasswordLoading(false);
    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password updated successfully");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: Profile Form */}
      <Card className="lg:col-span-2 bg-[#0F172A] border-slate-800 relative overflow-hidden">
        <CardHeader className="flex flex-row items-center space-y-0 pb-3 border-b border-slate-800">
          <UserCheck className="h-4.5 w-4.5 text-cyan-400 mr-2" />
          <span className="font-mono text-xs text-slate-300 uppercase tracking-widest">
            // USER PROFILE & ORGANIZATION DETAILS
          </span>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  FULL NAME / OFFICER NAME
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-sans"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  SECURE CONTACT EMAIL
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  CONTACT PHONE NUMBER
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                  TIMEZONE
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-mono cursor-pointer"
                >
                  <option value="Asia/Kolkata">India (IST - GMT+5:30)</option>
                  <option value="Europe/London">London (GMT+1)</option>
                  <option value="America/New_York">New York (EST)</option>
                  <option value="America/Los_Angeles">Pacific (PST)</option>
                  <option value="Asia/Dubai">Dubai (GST - GMT+4)</option>
                  <option value="Asia/Singapore">Singapore (SGT - GMT+8)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-slate-400 uppercase mb-1">
                COMPANY / ORGANIZATION NAME
              </label>
              <input
                required
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 text-xs rounded-xl outline-none font-sans font-semibold"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              {success ? (
                <span className="font-mono text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="h-4 w-4" /> // PROFILE SYNCED: OK
                </span>
              ) : (
                <span />
              )}

              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs uppercase font-bold py-2.5 px-4 rounded-xl cursor-pointer"
                isLoading={loading}
              >
                SAVE PROFILE
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* RIGHT: Security & Telemetry */}
      <div className="space-y-6">
        {/* Security / Password update */}
        <Card className="bg-[#0F172A] border-slate-800">
          <CardHeader className="flex flex-row items-center space-y-0 pb-3 border-b border-slate-800">
            <Lock className="h-4.5 w-4.5 text-cyan-400 mr-2" />
            <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest">
              // SECURITY CREDENTIALS
            </span>
          </CardHeader>
          <CardContent className="pt-4 text-white space-y-4">
            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              <div>
                <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3 py-1.5 text-xs rounded-lg outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3 py-1.5 text-xs rounded-lg outline-none font-mono"
                />
              </div>

              <Button
                type="submit"
                disabled={!newPassword || passwordLoading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs uppercase rounded-lg py-2 cursor-pointer"
              >
                {passwordLoading ? "UPDATING..." : "UPDATE PASSWORD"}
              </Button>
            </form>
            <div className="pt-2 mt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => toast.success("All active sessions have been revoked")}
                className="w-full text-[9px] font-mono font-bold px-2.5 py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                REVOKE ALL SESSIONS
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications preferences */}
        <Card className="bg-[#0F172A] border-slate-800">
          <CardHeader className="flex flex-row items-center space-y-0 pb-3 border-b border-slate-800">
            <Bell className="h-4.5 w-4.5 text-cyan-400 mr-2 animate-pulse" />
            <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest">
              // TELEMETRY & EMAIL ALERTS
            </span>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs text-slate-300">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="accent-cyan-400 h-4 w-4 bg-[#0A0D14] border-slate-700 rounded cursor-pointer"
              />
              <span>Deliverable approval reviews & notices</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="accent-cyan-400 h-4 w-4 bg-[#0A0D14] border-slate-700 rounded cursor-pointer"
              />
              <span>Invoice & payment receipt notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="accent-cyan-400 h-4 w-4 bg-[#0A0D14] border-slate-700 rounded cursor-pointer"
              />
              <span>Urgent support ticket reply notifications</span>
            </label>
            <div className="pt-3 mt-1">
              <button
                type="button"
                onClick={() => toast.success("Notification preferences saved")}
                className="w-full text-[9px] font-mono font-bold px-2.5 py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer bg-accent-primary/10 hover:bg-accent-primary/25 text-accent-primary border border-accent-primary/30"
              >
                <SaveAll className="w-3.5 h-3.5" />
                SAVE NOTIFICATION PREFERENCES
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-[#0F172A] border-slate-800">
          <CardHeader className="flex flex-row items-center space-y-0 pb-3 border-b border-slate-800">
            <Shield className="h-4.5 w-4.5 text-cyan-400 mr-2" />
            <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest">
              // DATA MANAGEMENT
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <button
              type="button"
              onClick={() => toast.success("Personal data export requested. You will receive a download link via email")}
              className="w-full text-[9px] font-mono font-bold px-2.5 py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT PERSONAL DATA
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
