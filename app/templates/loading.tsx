import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';

export default function TemplatesLoading() {
    return (
        <div className="min-h-screen bg-background">
            <AppHeader />
            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <Skeleton className="h-9 w-72 mx-auto mb-3" />
                <Skeleton className="h-4 w-96 mx-auto mb-8" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[1/1.414] w-full rounded-xl" />
                    ))}
                </div>
            </main>
        </div>
    );
}
