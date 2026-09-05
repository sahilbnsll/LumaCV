"use client";

import { CreditCard, FileText, LogOut, Settings, User, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Gemini from "./gemini";

export interface Profile {
  name: string;
  email: string;
  avatar?: string;
  subscription?: string;
  model?: string;
}

export interface MenuItem {
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  external?: boolean;
}

const SAMPLE_PROFILE_DATA: Profile = {
  name: "Sahil Bansal",
  email: "sahilbansal.sb24@gmail.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
  subscription: "Free & Open Source",
  model: "Typst + AI v2.4",
};

export interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: Profile;
  onSignOut?: () => void;
  menuItems?: MenuItem[];
  compact?: boolean;
}

export default function ProfileDropdown({
  data = SAMPLE_PROFILE_DATA,
  onSignOut,
  menuItems: customMenuItems,
  compact = false,
  className,
  ...props
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const defaultMenuItems: MenuItem[] = [
    {
      label: "My Resumes",
      value: "Studio",
      href: "/dashboard",
      icon: <FileText className="h-4 w-4 text-primary" />,
    },
    {
      label: "Resume Builder",
      value: "48 Presets",
      href: "/builder",
      icon: <Sparkles className="h-4 w-4 text-primary" />,
    },
    {
      label: "Engine",
      value: data.model || "Typst Engine",
      href: "#",
      icon: <Gemini className="h-4 w-4" />,
    },
    {
      label: "Status",
      value: data.subscription || "Open Source",
      href: "/support",
      icon: <CreditCard className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: "Account Settings",
      href: "/profile",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const items = customMenuItems || defaultMenuItems;

  const initials = (data.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("relative inline-block", className)} {...props}>
      <DropdownMenu onOpenChange={setIsOpen}>
        <div className="group relative">
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center rounded-2xl border border-zinc-200/70 bg-white dark:bg-zinc-900/90 dark:border-zinc-800/80 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/60 hover:shadow-sm focus:outline-none cursor-pointer",
                compact ? "gap-2.5 px-3 py-1.5" : "gap-4 sm:gap-6 px-3.5 py-2"
              )}
              type="button"
            >
              <div className="flex-1 text-left">
                <div className="font-semibold text-xs sm:text-sm text-zinc-900 leading-tight tracking-tight dark:text-zinc-100">
                  {data.name}
                </div>
                <div className="text-[11px] text-zinc-500 leading-tight tracking-tight dark:text-zinc-400 truncate max-w-[140px] sm:max-w-[180px]">
                  {data.email}
                </div>
              </div>

              {/* Gradient Ring Avatar */}
              <div className="relative shrink-0">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-sm">
                  <div className="h-full w-full overflow-hidden rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
                    {data.avatar && !imageError ? (
                      <Image
                        alt={data.name}
                        className="h-full w-full rounded-full object-cover"
                        height={36}
                        src={data.avatar}
                        width={36}
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="font-bold text-xs text-primary">{initials}</span>
                    )}
                  </div>
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500" />
              </div>
            </button>
          </DropdownMenuTrigger>

          {/* Kokonut Bending line indicator on the right */}
          <div
            className={cn(
              "absolute top-1/2 -right-3 -translate-y-1/2 transition-all duration-200 pointer-events-none hidden sm:block",
              isOpen ? "opacity-100" : "opacity-40 group-hover:opacity-100"
            )}
          >
            <svg
              aria-hidden="true"
              className={cn(
                "transition-all duration-200",
                isOpen
                  ? "scale-110 text-primary"
                  : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
              )}
              fill="none"
              height="24"
              viewBox="0 0 12 24"
              width="12"
            >
              <path
                d="M2 4C6 8 6 16 2 20"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <DropdownMenuContent
            align="end"
            className="w-72 origin-top-right rounded-2xl border border-zinc-200/70 bg-white/95 p-2 shadow-2xl shadow-zinc-900/10 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-900/95 dark:shadow-black/40 z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            sideOffset={8}
          >
            {/* Header with pill badge */}
            <div className="px-3 py-2.5 mb-1 rounded-xl bg-muted/40 border border-border/40">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground truncate">{data.name}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-medium border border-emerald-500/20">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                  Active
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{data.email}</p>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {items.map((item) => {
                const content = (
                  <div className="flex flex-1 items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-foreground">
                        {item.label}
                      </span>
                    </div>
                    {item.value && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 font-medium text-[10px] tracking-tight",
                          item.label === "Engine"
                            ? "border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : item.label === "Status"
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        )}
                      >
                        {item.value}
                      </span>
                    )}
                  </div>
                );

                return (
                  <DropdownMenuItem asChild key={item.label}>
                    {item.href ? (
                      <Link
                        className="group flex cursor-pointer items-center rounded-xl border border-transparent px-3 py-2.5 transition-all duration-150 hover:border-zinc-200/70 hover:bg-zinc-100/90 dark:hover:border-zinc-700/50 dark:hover:bg-zinc-800/60"
                        href={item.href}
                        onClick={item.onClick}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="group flex w-full cursor-pointer items-center rounded-xl border border-transparent px-3 py-2.5 transition-all duration-150 hover:border-zinc-200/70 hover:bg-zinc-100/90 dark:hover:border-zinc-700/50 dark:hover:bg-zinc-800/60 text-left"
                        onClick={item.onClick}
                      >
                        {content}
                      </button>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>

            <DropdownMenuSeparator className="my-2 bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />

            {/* Sign Out */}
            {onSignOut && (
              <DropdownMenuItem asChild>
                <button
                  className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-transparent bg-red-500/10 dark:bg-red-500/15 px-3 py-2 text-xs font-medium text-red-500 transition-all duration-150 hover:border-red-500/30 hover:bg-red-500/20"
                  type="button"
                  onClick={onSignOut}
                >
                  <LogOut className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  <span>Sign Out</span>
                </button>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </div>
  );
}
