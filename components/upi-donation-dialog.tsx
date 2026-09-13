"use client";

import React, { useState, useId } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  IndianRupee,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUPPORT_CONFIG, buildUpiPaymentUri } from "@/lib/support-config";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

export interface UpiDonationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  initialAmount?: number | null;
}

export function UpiDonationDialog({
  open,
  onOpenChange,
  trigger,
  initialAmount = 99,
}: UpiDonationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  const [amountInput, setAmountInput] = useState<string>(
    initialAmount ? String(initialAmount) : "99"
  );
  const [copied, setCopied] = useState(false);
  const [isQrKey, setIsQrKey] = useState(0);
  const inputId = useId();

  // Validate amount
  const trimmedAmount = amountInput.trim();
  const parsedAmount = trimmedAmount === "" ? null : parseFloat(trimmedAmount);
  const isAmountValid =
    trimmedAmount === "" ||
    (!isNaN(parsedAmount!) && parsedAmount! > 0 && parsedAmount! <= 100000);

  const validationError =
    !isAmountValid && trimmedAmount !== ""
      ? "Please enter a valid amount between ₹1 and ₹1,00,000"
      : null;

  // Active payment URI
  const upiUri = buildUpiPaymentUri(
    isAmountValid && parsedAmount !== null ? parsedAmount : undefined,
    SUPPORT_CONFIG.upi.defaultNote
  );

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_CONFIG.upi.id);
      setCopied(true);
      notify.copied(`UPI ID: ${SUPPORT_CONFIG.upi.id}`);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      notify.error("Could not copy UPI ID", "Please copy it manually.");
    }
  };

  const handlePresetSelect = (preset: number) => {
    setAmountInput(String(preset));
    setIsQrKey((prev) => prev + 1);
  };

  const handleClearAmount = () => {
    setAmountInput("");
    setIsQrKey((prev) => prev + 1);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="liquid-glass sm:max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-xl shadow-black/[0.04] dark:shadow-black/30 focus-visible:outline-none">
        {/* Header with Emerald Accent Badge */}
        <DialogHeader className="text-left space-y-2 pb-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-xs">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="font-display text-lg font-bold tracking-tight text-foreground">
                  Support via UPI
                </DialogTitle>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  0% Fees
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI app
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Amount Selector & Presets */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <IndianRupee className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Contribution Amount</span>
            </label>
            <span className="text-[11px] font-medium text-muted-foreground">
              {parsedAmount !== null && isAmountValid
                ? `₹${parsedAmount.toFixed(2)}`
                : "Custom / Open"}
            </span>
          </div>

          {/* Preset chips */}
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Preset amounts">
            {SUPPORT_CONFIG.upi.defaultPresets.map((preset) => {
              const isSelected = amountInput === String(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    "min-h-touch px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center select-none active:scale-95",
                    isSelected
                      ? "bg-foreground text-background border-foreground shadow-sm ring-1 ring-foreground/20 dark:ring-white/30"
                      : "bg-muted/40 text-muted-foreground border-border/70 hover:border-foreground/30 hover:text-foreground hover:bg-muted/70"
                  )}
                  aria-pressed={isSelected}
                >
                  ₹{preset}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleClearAmount}
              className={cn(
                "min-h-touch px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-center select-none active:scale-95",
                amountInput === ""
                  ? "bg-foreground text-background border-foreground shadow-sm ring-1 ring-foreground/20 dark:ring-white/30"
                  : "bg-muted/40 text-muted-foreground border-border/70 hover:border-foreground/30 hover:text-foreground hover:bg-muted/70"
              )}
              aria-pressed={amountInput === ""}
            >
              Custom
            </button>
          </div>

          {/* Custom Input */}
          <div className="space-y-1">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
                ₹
              </span>
              <Input
                id={inputId}
                type="number"
                min="1"
                step="1"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  setIsQrKey((prev) => prev + 1);
                }}
                placeholder="Enter custom amount (e.g. 150)"
                className={cn(
                  "pl-8 min-h-touch text-sm font-medium rounded-xl border-border/80 dark:border-white/10 bg-muted/20 focus:bg-background transition-colors",
                  validationError && "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={!!validationError}
                aria-describedby={validationError ? "upi-amount-error" : undefined}
              />
            </div>
            {validationError && (
              <p
                id="upi-amount-error"
                className="text-[11px] text-destructive font-medium pl-1 pt-0.5"
              >
                {validationError}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic QR Code Surface */}
        <div className="my-1 p-4 rounded-2xl border border-border/70 dark:border-white/10 bg-muted/30 dark:bg-card/50 flex flex-col items-center gap-3 shadow-xs">
          {/* QR scanner needs a guaranteed pure light quiet-zone */}
          <div className="rounded-2xl border border-border/80 bg-white p-3.5 shadow-md inline-flex items-center justify-center transition-transform hover:scale-[1.01]">
            <QRCodeSVG
              key={isQrKey}
              value={upiUri}
              size={180}
              level="H"
              bgColor="#ffffff"
              fgColor="#0f172a"
              imageSettings={{
                src: "/favicon.ico",
                height: 26,
                width: 26,
                excavate: true,
              }}
            />
          </div>

          {/* Status pill & NPCI label */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {isAmountValid && parsedAmount !== null ? (
                <span>₹{parsedAmount.toFixed(2)} dynamic QR ready</span>
              ) : (
                <span>Open amount QR ready</span>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <span className="font-bold text-[#003399] dark:text-blue-400">UPI</span>
              <span>·</span>
              <span>NPCI Standard</span>
              <span>·</span>
              <span>Google Pay, PhonePe, Paytm, BHIM, CRED</span>
            </p>
          </div>
        </div>

        {/* Payee Details & Copy Action */}
        <div className="p-3 rounded-2xl border border-border/80 dark:border-white/10 bg-card/80 dark:bg-card flex items-center justify-between gap-3 shadow-xs">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Payee UPI ID
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm font-mono font-bold text-foreground truncate select-all">
              {SUPPORT_CONFIG.upi.id}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {SUPPORT_CONFIG.upi.payeeName}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyUpi}
            className="min-h-touch px-3.5 rounded-xl border-border/80 dark:border-white/10 hover:bg-muted text-xs font-semibold gap-1.5 shrink-0 active:scale-95 transition-all shadow-xs"
            aria-label="Copy UPI ID to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Copy ID</span>
              </>
            )}
          </Button>
        </div>

        {/* Security / Verification Micro-copy */}
        <div className="pt-0.5 text-[11px] text-muted-foreground/90 flex items-center justify-center gap-1.5 text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>
            Verify payee displays <strong className="text-foreground">{SUPPORT_CONFIG.upi.payeeName}</strong> before approving in your app.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
