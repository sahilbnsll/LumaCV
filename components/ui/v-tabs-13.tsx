"use client";

import React, { useState, useEffect } from "react";
import {
  UserIcon,
  KeyRound,
  SlidersHorizontal,
  LockIcon,
  MessageSquareQuote,
  Check,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  Lock,
  Laptop,
  FileCode2,
  Send,
  Star,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/v-tabs-13-utils/separator";
import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/v-tabs-13-utils/tabs";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import {
  UserApiKeys,
  getUserApiKeys,
  saveUserApiKeys,
  clearUserApiKeys,
  countConfiguredKeys,
  PROVIDER_AVAILABLE_MODELS,
} from "@/lib/ai-keys";
import { motion } from "framer-motion";

export interface PatternProps {
  onClose?: () => void;
}

export function Pattern({ onClose }: PatternProps) {
  const { user, supabase, signOut } = useAuth();

  // 1. Profile State
  const initialName = user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0].replace(".", " ") : "Sahil Bansal");
  const [fullName, setFullName] = useState(initialName);
  const [updatingName, setUpdatingName] = useState(false);

  // 2. AI Keys State (BYOK)
  const [userApiKeys, setUserApiKeys] = useState<UserApiKeys>({});

  useEffect(() => {
    setUserApiKeys(getUserApiKeys());
  }, []);

  // 3. Typst Studio Preferences State
  const [autoCompile, setAutoCompile] = useState(true);
  const [atsSafeMode, setAtsSafeMode] = useState(true);
  const [exportFormat, setExportFormat] = useState<"pdf" | "png">("pdf");

  useEffect(() => {
    try {
      const savedAuto = localStorage.getItem("lumacv_pref_autocompile");
      if (savedAuto !== null) setAutoCompile(savedAuto === "true");
      const savedAts = localStorage.getItem("lumacv_pref_atssafe");
      if (savedAts !== null) setAtsSafeMode(savedAts === "true");
      const savedFmt = localStorage.getItem("lumacv_pref_exportformat");
      if (savedFmt === "pdf" || savedFmt === "png") setExportFormat(savedFmt);
    } catch {}
  }, []);

  const handleSavePreferences = () => {
    try {
      localStorage.setItem("lumacv_pref_autocompile", String(autoCompile));
      localStorage.setItem("lumacv_pref_atssafe", String(atsSafeMode));
      localStorage.setItem("lumacv_pref_exportformat", exportFormat);
      toast.success("Studio compilation preferences saved!");
    } catch {
      toast.error("Failed to save preferences to browser storage.");
    }
  };

  // 4. Security State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // 5. Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState<"review" | "feature" | "bug" | "general">("feature");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Handlers
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) {
      toast.info("Name updated locally for this session.");
      return;
    }
    setUpdatingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });
      if (error) throw error;
      toast.success("Profile name updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setUpdatingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!supabase || !user) {
      toast.error("Authentication required to update password.");
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
      toast.error("Please enter a feedback message.");
      return;
    }
    setFeedbackSubmitting(true);
    try {
      const res = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName || "Anonymous User",
          email: user?.email || "",
          company: "LumaCV User",
          rating: feedbackRating,
          type: feedbackType,
          message: feedbackMessage,
        }),
      });
      if (!res.ok) throw new Error("Feedback submission failed");
      setFeedbackSubmitted(true);
      toast.success("Thank you! Your feedback has been recorded.");
      setFeedbackMessage("");
    } catch {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const initials = (fullName || "User")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full">
      <Tabs className="gap-6 sm:gap-8 w-full" defaultValue="profile" orientation="vertical">
        {/* Left Vertical Tabs List */}
        <TabsList className="sm:w-44 shrink-0" variant="underline">
          <TabsTab className="justify-start gap-2.5" value="profile">
            <UserIcon className="size-4 text-muted-foreground" />
            <span>Profile</span>
          </TabsTab>

          <TabsTab className="justify-start gap-2.5" value="ai-keys">
            <KeyRound className="size-4 text-muted-foreground" />
            <div className="flex items-center justify-between w-full">
              <span>AI Keys</span>
              {countConfiguredKeys(userApiKeys) > 0 && (
                <span className="rounded-full bg-muted text-muted-foreground border border-border/50 px-1.5 py-0.2 text-[9px] font-semibold">
                  {countConfiguredKeys(userApiKeys)}
                </span>
              )}
            </div>
          </TabsTab>

          <TabsTab className="justify-start gap-2.5" value="typst">
            <FileCode2 className="size-4 text-muted-foreground" />
            <span>Typst Studio</span>
          </TabsTab>

          <TabsTab className="justify-start gap-2.5" value="security">
            <LockIcon className="size-4 text-muted-foreground" />
            <span>Security</span>
          </TabsTab>

          <TabsTab className="justify-start gap-2.5" value="feedback">
            <MessageSquareQuote className="size-4 text-muted-foreground" />
            <span>Feedback</span>
          </TabsTab>
        </TabsList>

        {/* ------------------------------------------------------------- */}
        {/* 1. Profile & Identity Panel                                   */}
        {/* ------------------------------------------------------------- */}
        <TabsPanel value="profile">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-foreground">Profile & Identity</p>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  Your authenticated account and workspace credentials.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/60">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                Verified User
              </span>
            </div>

            <Separator />

            {/* Avatar & Plan Header (Clean neutral styling, no neon) */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="h-12 w-12 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-sm text-foreground shadow-xs shrink-0">
                {initials}
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-semibold text-sm text-foreground whitespace-nowrap">{fullName}</span>
                  <span className="rounded-full bg-muted border border-border/60 text-muted-foreground px-2.5 py-0.5 text-[10px] font-medium whitespace-nowrap">
                    Launch Pioneer
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "sahilbansal.sb24@gmail.com"}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-3.5">
              <div>
                <label className="mb-1 block font-medium text-xs text-foreground">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-xs text-foreground">Email Address</label>
                <input
                  type="email"
                  value={user?.email || "sahilbansal.sb24@gmail.com"}
                  disabled
                  className="w-full rounded-lg border border-input bg-muted/40 px-3 py-2 text-xs text-muted-foreground cursor-not-allowed"
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Managed via Supabase Auth.
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingName}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{updatingName ? "Saving..." : "Save Name"}</span>
                </button>
              </div>
            </form>
          </div>
        </TabsPanel>

        {/* ------------------------------------------------------------- */}
        {/* 2. AI Provider Keys (BYOK) Panel                              */}
        {/* ------------------------------------------------------------- */}
        <TabsPanel value="ai-keys">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-foreground">AI Provider Keys (BYOK)</p>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  Bring Your Own Key to use custom models and personal quotas.
                </p>
              </div>
            </div>

            {/* Zero Server Storage Notice */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 text-xs text-muted-foreground flex items-start gap-2.5">
              <Shield className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block text-[11px]">Zero Server Storage Privacy Guarantee</span>
                <span className="text-[10px]">
                  Keys are stored exclusively in your local browser and sent via encrypted headers directly to LLM endpoints.
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {/* Google Gemini */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground text-[11px]">Google Gemini Key</span>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5">
                    Get Key <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={userApiKeys.gemini || ""}
                  onChange={(e) => setUserApiKeys((prev) => ({ ...prev, gemini: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 font-mono text-[11px] text-foreground focus:border-primary focus:outline-none"
                />
                {userApiKeys.gemini?.trim() ? (
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-muted-foreground">Model:</span>
                    <select
                      value={userApiKeys.geminiModel || PROVIDER_AVAILABLE_MODELS.gemini[0]}
                      onChange={(e) => setUserApiKeys((prev) => ({ ...prev, geminiModel: e.target.value }))}
                      className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-foreground"
                    >
                      {PROVIDER_AVAILABLE_MODELS.gemini.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Default: <strong>gemini-2.5-flash</strong>
                  </p>
                )}
              </div>

              {/* OpenAI */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground text-[11px]">OpenAI Key</span>
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5">
                    Get Key <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="sk-proj-..."
                  value={userApiKeys.openai || ""}
                  onChange={(e) => setUserApiKeys((prev) => ({ ...prev, openai: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 font-mono text-[11px] text-foreground focus:border-primary focus:outline-none"
                />
                {userApiKeys.openai?.trim() ? (
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-muted-foreground">Model:</span>
                    <select
                      value={userApiKeys.openaiModel || PROVIDER_AVAILABLE_MODELS.openai[0]}
                      onChange={(e) => setUserApiKeys((prev) => ({ ...prev, openaiModel: e.target.value }))}
                      className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-foreground"
                    >
                      {PROVIDER_AVAILABLE_MODELS.openai.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Enter key for <strong>gpt-4o</strong>, <strong>o3-mini</strong>
                  </p>
                )}
              </div>

              {/* Anthropic Claude */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground text-[11px]">Anthropic Claude Key</span>
                  <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5">
                    Get Key <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={userApiKeys.anthropic || ""}
                  onChange={(e) => setUserApiKeys((prev) => ({ ...prev, anthropic: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 font-mono text-[11px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Groq Cloud */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground text-[11px]">Groq Cloud Key</span>
                  <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5">
                    Get Key <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={userApiKeys.groq || ""}
                  onChange={(e) => setUserApiKeys((prev) => ({ ...prev, groq: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 font-mono text-[11px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border/50">
              <button
                type="button"
                onClick={() => {
                  clearUserApiKeys();
                  setUserApiKeys({});
                  toast.info("Cleared custom AI keys");
                }}
                className="text-xs text-rose-500 hover:underline cursor-pointer"
              >
                Clear All Keys
              </button>
              <button
                type="button"
                onClick={() => {
                  saveUserApiKeys(userApiKeys);
                  const count = countConfiguredKeys(userApiKeys);
                  toast.success(count > 0 ? `Saved ${count} AI key${count > 1 ? "s" : ""} to local storage!` : "Using default system quota.");
                }}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Save AI Keys
              </button>
            </div>
          </div>
        </TabsPanel>

        {/* ------------------------------------------------------------- */}
        {/* 3. Typst Studio Preferences Panel                             */}
        {/* ------------------------------------------------------------- */}
        <TabsPanel value="typst">
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-semibold text-sm text-foreground">Typst Studio Preferences</p>
              <p className="mt-0.5 text-muted-foreground text-xs">
                Fine-tune the real-time Typst compiler, layout rendering, and export presets.
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              {/* Live Compile Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                <div className="space-y-0.5 pr-2">
                  <p className="font-medium text-xs text-foreground">Instant Typst Compilation</p>
                  <p className="text-[10px] text-muted-foreground">
                    Automatically recompile PDF preview on every keystroke in builder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoCompile(!autoCompile)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    autoCompile ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md ${
                      autoCompile ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* ATS Safe Layout Mode */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                <div className="space-y-0.5 pr-2">
                  <p className="font-medium text-xs text-foreground">ATS Compliance Guard</p>
                  <p className="text-[10px] text-muted-foreground">
                    Prioritize single-column text extraction flow for automated parsers (Workday, Greenhouse).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAtsSafeMode(!atsSafeMode)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    atsSafeMode ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md ${
                      atsSafeMode ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Default Export Format */}
              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <p className="font-medium text-xs text-foreground">Default Download Engine</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat("pdf")}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      exportFormat === "pdf"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border/60 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-xs">Vector PDF</p>
                    <p className="text-[10px] opacity-75">300 DPI Native Typst Document</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat("png")}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      exportFormat === "png"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border/60 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-xs">High-Res PNG</p>
                    <p className="text-[10px] opacity-75">Visual Image Presentation</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </TabsPanel>

        {/* ------------------------------------------------------------- */}
        {/* 4. Security & Password Panel                                  */}
        {/* ------------------------------------------------------------- */}
        <TabsPanel value="security">
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-semibold text-sm text-foreground">Security & Credentials</p>
              <p className="mt-0.5 text-muted-foreground text-xs">
                Update your login password and manage your active authenticated session.
              </p>
            </div>

            <Separator />

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="mb-1 block font-medium text-xs text-foreground">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-9 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-xs text-foreground">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Active Session Info */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-[11px]">Active Session</p>
                    <p className="text-[10px] text-muted-foreground">Supabase Auth • Windows</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingPassword || !newPassword}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {updatingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </TabsPanel>

        {/* ------------------------------------------------------------- */}
        {/* 5. Feedback & Community Panel                                 */}
        {/* ------------------------------------------------------------- */}
        <TabsPanel value="feedback">
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-semibold text-sm text-foreground">Feedback & Suggestions</p>
              <p className="mt-0.5 text-muted-foreground text-xs">
                Leave a review, report bugs, or request Typst templates directly for the roadmap.
              </p>
            </div>

            <Separator />

            {feedbackSubmitted ? (
              <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-3">
                <CheckCircle2 className="h-7 w-7 text-emerald-500 mx-auto" />
                <h3 className="font-semibold text-sm text-foreground">Feedback Logged!</h3>
                <p className="text-xs text-muted-foreground">
                  Thank you for helping improve LumaCV! Your feedback has been sent directly to the core team.
                </p>
                <button
                  type="button"
                  onClick={() => setFeedbackSubmitted(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted"
                >
                  Submit Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                {/* Category Selector */}
                <div className="grid grid-cols-4 gap-1 p-1 rounded-lg border border-border/70 bg-muted/20">
                  {[
                    { id: "review", label: "Review" },
                    { id: "feature", label: "Feature" },
                    { id: "bug", label: "Bug" },
                    { id: "general", label: "General" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFeedbackType(cat.id as "review" | "feature" | "bug" | "general")}
                      className={`h-6 rounded-md text-[10px] font-medium transition-all ${
                        feedbackType === cat.id
                          ? "bg-background text-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/70 bg-muted/20 text-xs">
                  <span className="text-[11px] text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-0.5 text-muted-foreground hover:text-amber-400 cursor-pointer"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            star <= feedbackRating
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-1 text-[10px] font-mono font-semibold text-amber-500">
                      {feedbackRating}/5
                    </span>
                  </div>
                </div>

                {/* Feedback Message */}
                <textarea
                  rows={3}
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Share your experience, suggest template ideas, or report any issues..."
                  required
                  className="w-full resize-none rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                />

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-3 w-3" />
                    <span>{feedbackSubmitting ? "Sending..." : "Submit Feedback"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </TabsPanel>
      </Tabs>
    </div>
  );
}

export default Pattern;
