import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';

export default function BillingLoading() {
    return (
        <div className="min-h-screen bg-background">
            <AppHeader />
            <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-5">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
            </main>
        </div>
    );
}
