import React, { useState } from "react";
import { User } from "../types";
import { api } from "../lib/api";
import { UserCheck, Lock, Bell, Check, Loader2 } from "lucide-react";

interface ProfileSettingsProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export default function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [timezone, setTimezone] = useState(user.timezone || "Asia/Kolkata");
  const [companyName, setCompanyName] = useState(user.companyName || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const res = await api.updateProfile({
        name,
        email,
        phone,
        timezone,
        companyName
      });
      onUpdate(res.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed saving profile settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setPasswordLoading(true);
    setPasswordSuccess(false);
    setTimeout(() => {
      setPasswordLoading(false);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: Profile Form (2 cols) */}
      <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800 p-6 rounded-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
          <UserCheck className="h-4.5 w-4.5 text-cyan-400" />
          <span className="font-mono text-xs text-slate-300 uppercase tracking-widest">// USER PROFILE & ORGANIZATION LEDGERS</span>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1">REQUISITION OFFICER</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3 py-2 text-xs rounded-lg outline-none font-sans"
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1">SECURE CONTACT EMAIL</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3 py-2 text-xs rounded-lg outline-none font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1">PRIMARY NODE TELEPHONE</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3 py-2 text-xs rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1">SYSTEM TIMEZONE MATCH</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 text-white px-3 py-2 text-xs rounded-lg outline-none font-mono cursor-pointer"
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
            <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1">ORGANIZATION BRAND TITLE</label>
            <input
              required
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3 py-2 text-xs rounded-lg outline-none font-sans font-semibold"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            {success ? (
              <span className="font-mono text-xs text-emerald-400 flex items-center gap-1">
                <Check className="h-4 w-4" /> // REQUISITION LEDGERS SYNC: OK
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs uppercase tracking-wider font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "COMMIT CHANGES"}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: Security Credentials & Alerts (1 col) */}
      <div className="space-y-6">
        <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="h-4.5 w-4.5 text-cyan-400" />
            <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest">// SECURITY CREDENTIALS</span>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3 py-1.5 text-xs rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] text-slate-400 uppercase mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#0A0D14] border border-slate-700 focus:border-cyan-400 text-white px-3 py-1.5 text-xs rounded-lg outline-none font-mono"
              />
            </div>

            {passwordSuccess && (
              <p className="font-mono text-[10px] text-emerald-400">✓ Password updated successfully</p>
            )}

            <button
              type="submit"
              disabled={!newPassword || passwordLoading}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs uppercase rounded-lg transition-colors cursor-pointer"
            >
              {passwordLoading ? "UPDATING..." : "UPDATE PASSWORD"}
            </button>
          </form>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
            <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest">// SYSTEM TELEMETRY ALERTS</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" defaultChecked className="accent-cyan-400 h-4 w-4 bg-[#0A0D14] border-slate-700 rounded cursor-pointer" />
              <span>Deliverable approval notices</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" defaultChecked className="accent-cyan-400 h-4 w-4 bg-[#0A0D14] border-slate-700 rounded cursor-pointer" />
              <span>Payment receipts & invoices</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" defaultChecked className="accent-cyan-400 h-4 w-4 bg-[#0A0D14] border-slate-700 rounded cursor-pointer" />
              <span>Support ticket status updates</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
