"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Angry, Check, Frown, Laugh, Loader2, Smile, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const feedback = [
  { happiness: 4, emoji: Laugh, color: 'text-emerald-500 dark:text-emerald-400', label: 'Loved it' },
  { happiness: 3, emoji: Smile, color: 'text-green-500 dark:text-green-400', label: 'Good' },
  { happiness: 2, emoji: Frown, color: 'text-amber-500 dark:text-amber-400', label: 'Could be better' },
  { happiness: 1, emoji: Angry, color: 'text-rose-500 dark:text-rose-400', label: 'Needs work' },
];

export interface FeedbackCardProps {
  className?: string;
  questionText?: string;
  placeholder?: string;
  onSuccess?: () => void;
  direction?: 'up' | 'down';
  showClose?: boolean;
  onClose?: () => void;
}

export const FeedbackCard = ({
  className,
  questionText = 'How is your experience?',
  placeholder = 'What did you like or what can we improve?',
  onSuccess,
  direction = 'down',
  showClose = false,
  onClose,
}: FeedbackCardProps) => {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [happiness, setHappiness] = useState<null | number>(null);
  const [isSubmitted, setSubmissionState] = useState(false);
  const { submitFeedback, isLoading, isSent } = useSubmitFeedback();

  useEffect(() => {
    if (!happiness && textRef.current) {
      textRef.current.value = '';
    }
    if (happiness && textRef.current) {
      setTimeout(() => textRef.current?.focus(), 150);
    }
  }, [happiness]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    let submissionStateTimeout: NodeJS.Timeout | null = null;

    if (isSent) {
      setSubmissionState(true);
      if (onSuccess) onSuccess();

      timeout = setTimeout(() => {
        setHappiness(null);
        if (textRef.current) textRef.current.value = '';
      }, 2200);

      submissionStateTimeout = setTimeout(() => {
        setSubmissionState(false);
      }, 2500);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
      if (submissionStateTimeout) clearTimeout(submissionStateTimeout);
    };
  }, [isSent, onSuccess]);

  return (
    <motion.div
      layout
      initial={{ borderRadius: '2rem' }}
      animate={happiness ? { borderRadius: '1rem' } : { borderRadius: '2rem' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'w-fit overflow-hidden border border-border/80 bg-card/95 p-1.5 shadow-lg backdrop-blur-md transition-colors dark:border-white/10 dark:bg-[#111317]/95',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 pl-3.5 pr-2 py-0.5">
        <div className="text-xs font-medium text-foreground select-none">
          {questionText}
        </div>

        <div className="flex items-center gap-0.5 text-muted-foreground">
          {feedback.map((e) => {
            const EmojiIcon = e.emoji;
            const isSelected = happiness === e.happiness;
            return (
              <button
                type="button"
                onClick={() => setHappiness((prev) => (e.happiness === prev ? null : e.happiness))}
                aria-label={e.label}
                title={e.label}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:scale-115 active:scale-95 cursor-pointer',
                  isSelected
                    ? cn(e.color, 'bg-muted/80 dark:bg-white/[0.08] shadow-2xs scale-110 font-bold')
                    : 'text-muted-foreground/70 hover:text-foreground hover:bg-muted/40'
                )}
                key={e.happiness}
              >
                <EmojiIcon size={17} className={isSelected ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
              </button>
            );
          })}

          {showClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-1 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <motion.div
        aria-hidden={!happiness}
        initial={{ height: 0, opacity: 0 }}
        className="px-2 overflow-hidden"
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
        animate={
          happiness
            ? { height: '185px', width: '320px', opacity: 1 }
            : { height: 0, width: 'auto', opacity: 0 }
        }
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
              <motion.div
              key="form"
              exit={{ opacity: 0, y: direction === 'up' ? 6 : -6 }}
              initial={{ opacity: 0, y: direction === 'up' ? -6 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2 pb-1 flex flex-col justify-between h-full"
            >
              <textarea
                ref={textRef}
                placeholder={
                  happiness === 4
                    ? "Tell us what you loved most!"
                    : happiness === 3
                    ? "What went well, and what could be even better?"
                    : happiness === 2
                    ? "What frustrated you or felt confusing?"
                    : (placeholder || "Tell us what went wrong so we can fix it ASAP...")
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-border/80 bg-muted/25 dark:bg-white/[0.03] p-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary/25 transition-all leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground">
                  Logged directly to roadmap
                </span>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => submitFeedback(happiness!, textRef.current?.value || '')}
                  className={cn(
                    'inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer gap-1.5',
                    {
                      'opacity-70 cursor-not-allowed': isLoading,
                    }
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    'Send Feedback'
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              variants={container}
              initial="hidden"
              animate="show"
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-xs font-normal"
            >
              <motion.div
                variants={item}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500"
              >
                <Check strokeWidth={2.5} size={18} />
              </motion.div>
              <motion.div variants={item} className="font-semibold text-foreground text-sm">
                Feedback Received!
              </motion.div>
              <motion.div variants={item} className="text-muted-foreground text-[11px] max-w-[220px]">
                Thank you for helping us make LumaCV better.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Aliased export for compatibility with snippet
export const Component = FeedbackCard;

const container = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const useSubmitFeedback = () => {
  const [isLoading, setLoadingState] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [isSent, setRequestState] = useState(false);

  const submitFeedback = async (happiness: number, message: string) => {
    setLoadingState(true);
    setRequestState(false);
    setError(null);

    // Map happiness (1..4) to 5-star rating (1..5)
    const ratingMap: Record<number, number> = {
      4: 5,
      3: 4,
      2: 3,
      1: 1,
    };

    const typeMap: Record<number, 'review' | 'general' | 'bug'> = {
      4: 'review',
      3: 'general',
      2: 'general',
      1: 'bug',
    };

    try {
      const res = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: ratingMap[happiness] || 5,
          type: typeMap[happiness] || 'general',
          message: message.trim() || `User selected sentiment rating ${happiness}/4`,
          name: 'Feedback Card User',
        }),
      });

      if (!res.ok) throw new Error('Submission failed');

      setRequestState(true);
      toast.success('Thank you! Your feedback has been received.');
    } catch (err) {
      setError(err);
      toast.error('Could not submit feedback. Please try again.');
      setRequestState(false);
    } finally {
      setLoadingState(false);
    }
  };

  return {
    submitFeedback,
    isLoading,
    error,
    isSent,
  };
};

export default FeedbackCard;
