import { Skeleton } from '@/components/ui/skeleton';

export default function EditorLoading() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="h-14 sm:h-16 border-b border-border/60 flex items-center px-4 sm:px-6">
                <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="p-4 sm:p-6 space-y-4 border-r border-border/60">
                    <Skeleton className="h-9 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-9 w-full rounded-xl" />
                    <Skeleton className="h-9 w-2/3 rounded-xl" />
                </div>
                <div className="hidden lg:flex items-center justify-center p-8 bg-muted/30">
                    <Skeleton className="aspect-[1/1.414] w-full max-w-md rounded-lg" />
                </div>
            </div>
        </div>
    );
}
