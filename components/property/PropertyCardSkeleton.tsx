import { Skeleton } from "@/components/ui/Skeleton"
import { Card } from "@/components/ui/Card"

export function PropertyCardSkeleton() {
    return (
        <div className="rounded-2xl overflow-hidden border border-border bg-card flex flex-col h-full shadow-sm">
            <div className="aspect-[4/3] bg-muted relative">
                <Skeleton className="h-full w-full" />
            </div>

            <div className="p-5 flex flex-col flex-1 gap-3">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                </div>
                <Skeleton className="h-4 w-1/2 rounded-md mb-2" />

                <div className="grid grid-cols-3 gap-2 mb-2">
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-8 w-full rounded-md" />
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                    <Skeleton className="h-8 w-1/3 rounded-md" />
                    <Skeleton className="h-9 w-20 rounded-md" />
                </div>
            </div>
        </div>
    )
}
