import { Skeleton } from '@/components/ui/skeleton.tsx';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.tsx';
import React from 'react';

export default function Loading() {
  return (
    <SidebarProvider>
      {/* Sidebar Skeleton */}
      <div className="bg-sidebar hidden h-screen w-72 flex-col border-r md:flex">
        <div className="flex h-12 items-center gap-2 px-4">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {/* Navigation items */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>

          {/* Tags section */}
          <div className="mt-6">
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-1">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User section at bottom */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-1 h-2 w-16" />
            </div>
          </div>
        </div>
      </div>

      <SidebarInset>
        {/* Header Skeleton */}
        <div className="flex h-12 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex flex-1 flex-col p-4">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 md:gap-6">
              {/* Table Header */}
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>

              {/* Table Skeleton */}
              <div className="rounded-md border">
                {/* Table Header */}
                <div className="grid grid-cols-3 gap-4 border-b p-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="ms-auto h-4 w-12" />
                </div>

                {/* Table Rows */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-3 gap-4 border-b p-4 last:border-b-0">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4 opacity-70" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="flex justify-end gap-1">
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Skeleton */}
              <div className="flex justify-end">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
