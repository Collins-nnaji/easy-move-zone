"use client"

import { Skeleton } from "@/components/ui/Skeleton"

export function MatchesSkeleton() {
  return (
    <div className="move-page-inner">
      <div className="move-page-screen">
        <Skeleton className="h-3 w-32 bg-[#ddd8cf]" />
        <Skeleton className="mt-3 h-8 w-4/5 max-w-md bg-[#ddd8cf]" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-9 w-40 rounded-full bg-[#ddd8cf]" />
          <Skeleton className="h-9 w-36 rounded-full bg-[#ddd8cf]" />
        </div>
        <div className="move-card-grid mt-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-[22px] border border-[#e4dfd5] bg-white">
              <Skeleton className="h-[152px] w-full rounded-none bg-[#ece6da]" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-2/3 bg-[#ece6da]" />
                <Skeleton className="h-3 w-full bg-[#ece6da]" />
                <Skeleton className="h-3 w-5/6 bg-[#ece6da]" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-7 w-20 rounded-full bg-[#ece6da]" />
                  <Skeleton className="h-7 w-24 rounded-full bg-[#ece6da]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
