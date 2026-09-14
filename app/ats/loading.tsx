import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';

export default function AtsLoading() {
    return (
        <div className="min-h-screen bg-background">
            <AppHeader />
            <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
                <Skeleton className="h-8 w-64 mx-auto" />
                <Skeleton className="h-4 w-80 mx-auto" />
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-10 w-40 mx-auto rounded-xl" />
            </main>
        </div>
    );
}
