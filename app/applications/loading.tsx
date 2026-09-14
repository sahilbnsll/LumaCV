import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';

export default function ApplicationsLoading() {
    return (
        <div className="min-h-screen bg-background">
            <AppHeader />
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="flex items-center justify-between mb-8">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-9 w-32 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border/60 p-3 space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
