import React from 'react';

// Common shimmering base style helper
const Shimmer = ({ className }) => (
  <div className={`skeleton-loading ${className}`} />
);

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-1">
      {/* Page Header */}
      <div>
        <Shimmer className="h-8 w-72 rounded-xl" />
        <Shimmer className="h-3 w-48 rounded-md mt-2" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card border border-[#1c3554] h-28 flex flex-col justify-between">
            <div className="flex justify-between">
              <Shimmer className="h-3.5 w-24 rounded" />
              <Shimmer className="h-8 w-8 rounded-xl" />
            </div>
            <Shimmer className="h-7 w-36 rounded-lg mt-2" />
          </div>
        ))}
      </div>

      {/* Accounts List Section */}
      <div className="glass-card border border-[#1c3554] p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shimmer className="h-5 w-5 rounded-md" />
          <Shimmer className="h-6 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-[#1c3554] rounded-3xl p-5 bg-white/[0.01] h-44 flex flex-col justify-between">
              <div>
                <div className="flex justify-between">
                  <Shimmer className="h-4 w-28 rounded" />
                  <Shimmer className="h-4 w-12 rounded-full" />
                </div>
                <Shimmer className="h-3.5 w-32 rounded mt-2" />
              </div>
              <div className="border-t border-[#1c3554] pt-4 mt-6 flex justify-between items-end">
                <div>
                  <Shimmer className="h-3 w-20 rounded" />
                  <Shimmer className="h-6 w-28 rounded mt-1.5" />
                </div>
                <Shimmer className="h-4 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card border border-[#1c3554] h-72">
          <Shimmer className="h-5 w-36 rounded-md mb-6" />
          <Shimmer className="h-full w-full rounded-2xl" />
        </div>
        <div className="glass-card border border-[#1c3554] h-72 flex flex-col">
          <Shimmer className="h-5 w-40 rounded-md mb-6" />
          <div className="flex-1 flex items-center justify-center">
            <Shimmer className="h-36 w-36 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-1">
      <div className="flex justify-between items-center">
        <div>
          <Shimmer className="h-8 w-44 rounded-xl" />
          <Shimmer className="h-3 w-64 rounded-md mt-2" />
        </div>
        <Shimmer className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card border border-[#1c3554] p-6 h-[22rem] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <Shimmer className="h-3 w-24 rounded" />
                  <Shimmer className="h-4.5 w-36 rounded mt-1" />
                </div>
                <Shimmer className="h-4 w-12 rounded-full" />
              </div>
              <div className="rounded-2xl p-5 h-24 bg-[#13263e]/50 border border-[#1c3554] flex flex-col justify-between">
                <Shimmer className="h-3 w-20 rounded" />
                <Shimmer className="h-8 w-40 rounded-lg" />
              </div>
              <div className="space-y-2 border-t border-[#1c3554] pt-4">
                <div className="flex justify-between"><Shimmer className="h-3 w-16 rounded" /><Shimmer className="h-3 w-20 rounded" /></div>
                <div className="flex justify-between"><Shimmer className="h-3 w-16 rounded" /><Shimmer className="h-3 w-24 rounded" /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-[#1c3554] pt-4 mt-4">
              {[1, 2, 3, 4].map(j => <Shimmer key={j} className="h-8 rounded-xl" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="space-y-6 animate-pulse p-1">
      <div className="flex justify-between items-center">
        <div>
          <Shimmer className="h-8 w-60 rounded-xl" />
          <Shimmer className="h-3.5 w-80 rounded-md mt-2" />
        </div>
        <Shimmer className="h-10 w-24 rounded-xl" />
      </div>

      <div className="glass-card border border-[#1c3554] p-0 overflow-hidden">
        <div className="p-4 border-b border-[#1c3554] flex gap-4">
          <Shimmer className="h-9 w-64 rounded-xl" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1c3554] bg-[#0c192c]/50">
                {Array.from({ length: cols }).map((_, i) => (
                  <th key={i} className="px-5 py-4 text-left">
                    <Shimmer className="h-3.5 w-20 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c3554]">
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="bg-white/[0.01]">
                  {Array.from({ length: cols }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <Shimmer className={`h-4.5 rounded ${j === 0 ? 'w-24 font-mono' : j === 2 ? 'w-28' : 'w-16'}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-1">
      <div className="flex justify-between items-center">
        <div>
          <Shimmer className="h-8 w-32 rounded-xl" />
          <Shimmer className="h-3 w-72 rounded-md mt-2" />
        </div>
        <Shimmer className="h-10 w-32 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2].map(i => (
          <div key={i} className="space-y-4">
            <div className="rounded-3xl p-6 border border-[#1c3554] bg-gradient-to-br from-[#102238] to-[#1c3554] h-52 flex flex-col justify-between">
              <div className="flex justify-between">
                <Shimmer className="h-3 w-16 rounded" />
                <Shimmer className="h-4 w-12 rounded-full" />
              </div>
              <Shimmer className="h-6 w-44 rounded-lg my-auto" />
              <div className="flex justify-between">
                <div className="space-y-1"><Shimmer className="h-2 w-12 rounded" /><Shimmer className="h-3 w-20 rounded" /></div>
                <div className="space-y-1"><Shimmer className="h-2 w-8 rounded" /><Shimmer className="h-3 w-12 rounded" /></div>
              </div>
            </div>
            <div className="glass-card border border-[#1c3554] p-4 flex gap-3">
              <Shimmer className="h-9 flex-1 rounded-xl" />
              <Shimmer className="h-9 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UpiSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-1">
      <div>
        <Shimmer className="h-8 w-64 rounded-xl" />
        <Shimmer className="h-3 w-80 rounded-md mt-2" />
      </div>

      <div className="flex rounded-2xl bg-white/5 border border-white/5 p-1 h-12">
        {[1, 2, 3].map(i => <Shimmer key={i} className="flex-1 m-1 rounded-xl" />)}
      </div>

      <div className="space-y-4">
        <Shimmer className="h-10 w-36 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="glass-card border border-[#1c3554] p-6 h-24 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Shimmer className="h-10 w-10 rounded-xl" />
                <div>
                  <Shimmer className="h-4 w-40 rounded" />
                  <Shimmer className="h-3 w-28 rounded mt-1.5" />
                </div>
              </div>
              <Shimmer className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
