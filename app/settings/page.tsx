"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SettingsRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      router.replace(`/profile?tab=${encodeURIComponent(tab)}`);
    } else {
      router.replace("/profile");
    }
  }, [router, searchParams]);

  return null;
}

export default function SettingsRedirect() {
  return (
    <Suspense fallback={null}>
      <SettingsRedirectContent />
    </Suspense>
  );
}
