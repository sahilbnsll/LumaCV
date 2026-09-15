import { toast, ExternalToast } from 'sonner';

/**
 * Standardized Toast Notification System for LumaCV
 * Grounded in Apple Human Interface Guidelines:
 * - Clear, quiet, compact, immediate, contextual, non-intrusive
 * - Short action-oriented title
 * - Optional single-line contextual description (never repeating title)
 * - Automatic deduplication within 1500ms window to prevent pile-up
 */

interface NotifyOptions extends Omit<ExternalToast, 'description'> {
  /** Optional custom identifier for toast deduplication and updates */
  id?: string | number;
}

// In-memory rate limiting map to prevent toast spamming on rapid repetitive clicks
const recentNotifications = new Map<string, number>();
const DEDUPE_WINDOW_MS = 1400;

function getDedupedId(type: string, title: string, description?: string, customId?: string | number): string | number {
  if (customId !== undefined) return customId;

  // Defense in depth: TypeScript's `string` annotations here don't protect
  // against a caller passing through an untyped JSON.parse() result (an
  // API error response's `details` field, say) that isn't actually a
  // string at runtime, .trim() on that throws and takes the whole
  // notification down with it, hiding whatever the notification was
  // trying to report in the first place.
  const safeTitle = typeof title === 'string' ? title : String(title ?? '');
  const safeDescription = typeof description === 'string' ? description : '';
  const key = `${type}::${safeTitle.trim()}::${safeDescription.trim()}`;
  const now = Date.now();
  const lastTime = recentNotifications.get(key);

  if (lastTime && now - lastTime < DEDUPE_WINDOW_MS) {
    // Return deterministic id so Sonner updates existing toast rather than spawning duplicates
    return key;
  }

  recentNotifications.set(key, now);

  // Clean old entries periodically
  if (recentNotifications.size > 50) {
    for (const [k, timestamp] of recentNotifications.entries()) {
      if (now - timestamp > 10000) {
        recentNotifications.delete(k);
      }
    }
  }

  return key;
}

export const notify = {
  /**
   * Success notification - e.g. "Color palette applied", "Resume saved"
   */
  success(title: string, description?: string, options?: NotifyOptions) {
    const id = getDedupedId('success', title, description, options?.id);
    return toast.success(title, {
      id,
      description: description || undefined,
      duration: options?.duration ?? 3200,
      ...options,
    });
  },

  /**
   * Informational notification - e.g. "Appearance updated"
   */
  info(title: string, description?: string, options?: NotifyOptions) {
    const id = getDedupedId('info', title, description, options?.id);
    return toast.info(title, {
      id,
      description: description || undefined,
      duration: options?.duration ?? 3000,
      ...options,
    });
  },

  /**
   * Warning notification - e.g. "Unsaved changes", "Rate limit approaching"
   */
  warning(title: string, description?: string, options?: NotifyOptions) {
    const id = getDedupedId('warning', title, description, options?.id);
    return toast.warning(title, {
      id,
      description: description || undefined,
      duration: options?.duration ?? 4000,
      ...options,
    });
  },

  /**
   * Error notification with optional retry action - e.g. "Couldn't save changes"
   */
  error(title: string, description?: string, options?: NotifyOptions & { retry?: () => void }) {
    const id = getDedupedId('error', title, description, options?.id);
    return toast.error(title, {
      id,
      description: description || undefined,
      duration: options?.duration ?? 4500,
      action: options?.retry
        ? {
            label: 'Retry',
            onClick: options.retry,
          }
        : options?.action,
      ...options,
    });
  },

  /**
   * Long-running promise notification wrapper
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
      description?: string | ((data: T) => string);
    }
  ) {
    return toast.promise(promise, {
      loading: messages.loading,
      success: (data) => {
        const title = typeof messages.success === 'function' ? messages.success(data) : messages.success;
        return title;
      },
      error: (err) => {
        const title = typeof messages.error === 'function' ? messages.error(err) : messages.error;
        return title;
      },
      description: messages.description,
    });
  },

  /**
   * Dismiss a specific toast or all active toasts
   */
  dismiss(id?: string | number) {
    toast.dismiss(id);
  },

  // ---------------------------------------------------------------------------
  // Standardized Preset Actions (Grounded in User Specification)
  // ---------------------------------------------------------------------------

  /**
   * Save status: "Changes saved"
   */
  saved(description?: string) {
    return notify.success('Changes saved', description);
  },

  /**
   * Compilation status: "Resume ready"
   */
  compiled(ms?: number) {
    return notify.success(
      'Resume ready',
      typeof ms === 'number' ? `Compiled vector PDF in ${ms}ms` : undefined
    );
  },

  /**
   * Optimization status: "Optimization complete"
   */
  optimized(score?: number) {
    return notify.success(
      'Optimization complete',
      typeof score === 'number' ? `ATS match score: ${score}/100` : undefined
    );
  },

  /**
   * Template changed: "Template changed"
   */
  templateChanged(templateName: string) {
    return notify.success('Template changed', templateName);
  },

  /**
   * Color palette applied: "Color palette applied"
   */
  paletteApplied(paletteName: string, detail?: string) {
    return notify.success(
      'Color palette applied',
      detail ? `${paletteName} · ${detail}` : paletteName
    );
  },

  /**
   * Section moved: "Section moved"
   */
  sectionMoved(sectionName: string, direction?: 'up' | 'down') {
    return notify.success(
      'Section moved',
      direction ? `${sectionName} moved ${direction}` : sectionName
    );
  },

  /**
   * Project/Entry deleted: "Project deleted" / "[Item] removed"
   */
  deleted(itemLabel: string, detail?: string) {
    return notify.info(`${itemLabel} deleted`, detail);
  },

  /**
   * Project/Entry added: "[Item] added"
   */
  added(itemLabel: string, detail?: string) {
    return notify.success(`${itemLabel} added`, detail);
  },

  /**
   * Clipboard copied feedback
   */
  copied(what?: string) {
    return notify.success('Copied to clipboard', what);
  },

  /**
   * Theme toggled feedback
   */
  themeChanged(theme: 'dark' | 'light' | 'system') {
    return notify.info(
      'Appearance updated',
      theme === 'dark' ? 'Dark mode enabled' : theme === 'light' ? 'Light mode enabled' : 'Following system setting'
    );
  },
};
