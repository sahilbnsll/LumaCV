/**
 * A fixed, curated set of predefined profile avatars ("Notionists" style,
 * https://www.dicebear.com, MIT licensed). Generated once and bundled as
 * static SVGs in public/avatars/ rather than fetched from DiceBear's API at
 * render time, so displaying a user's avatar never depends on a third-party
 * network call, matching the rest of the app's privacy-first, self-hosted
 * conventions (bundled fonts, bundled Typst binary).
 *
 * A user's choice is stored as one of these ids (`avatar_id`) in both
 * `auth.users.user_metadata` and `public.profiles`, never as a full URL, so
 * the underlying asset can be regenerated/moved without a data migration.
 */
export interface AvatarOption {
    id: string;
    url: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = Array.from({ length: 56 }, (_, i) => {
    const id = `avatar-${String(i + 1).padStart(2, '0')}`;
    return { id, url: `/avatars/${id}.svg` };
});

export function getAvatarUrl(avatarId?: string | null): string | null {
    if (!avatarId) return null;
    return AVATAR_OPTIONS.find((a) => a.id === avatarId)?.url ?? null;
}
